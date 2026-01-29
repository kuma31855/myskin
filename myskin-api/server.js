const express = require("express");
const cors = require("cors");
const pool = require("./db");
const path = require("path");
const multer = require("multer");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ユーザーIDとWebSocket接続をマッピング
const clients = new Map(); // Map<userId, WebSocket>

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // ユーザーIDをこの接続に紐付ける
      if (data.type === 'register' && data.userId) {
        clients.set(data.userId.toString(), ws);
        console.log(`WebSocket registered for user: ${data.userId}`);
        // 確認メッセージをクライアントに送信
        ws.send(JSON.stringify({ type: 'registered', message: 'WebSocket connection registered.' }));
      }
    } catch (e) {
      console.error('Failed to parse message or invalid message format:', message);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // マップから切断されたクライアントを削除
    for (let [userId, clientWs] of clients.entries()) {
      if (clientWs === ws) {
        clients.delete(userId);
        console.log(`WebSocket unregistered for user: ${userId}`);
        break;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3000;

// CORS設定（本番では ALLOWED_ORIGINS でカンマ区切り指定）
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ellen-subfastigiated-freda.ngrok-free.dev'
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : defaultOrigins;
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

// JSONパーサーと静的ファイル配信
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer設定（ファイルアップロード）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // ファイル名の重複を防ぐ
  }
});
const upload = multer({ storage: storage });

// 商品一覧取得 API
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// ユーザー登録 API
app.post("/api/register", async (req, res) => {
  console.log(req.body);
  const { name, email, password, phone_number } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "名前、メール、パスワードは必須です" });
  }

  try {
    // メールアドレスの重複チェック
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "このメールアドレスは既に登録されています" });
    }

    // ユーザー登録 (注意: 本番環境ではパスワードをハッシュ化すること)
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, phone_number) VALUES (?, ?, ?, ?)",
      [name, email, password, phone_number || null]
    );

    res.status(201).json({ message: "ユーザー登録完了", userId: result.insertId });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

// ★★★ 新規注文作成 API ★★★
app.post("/api/orders", async (req, res) => {
  const { userId, items, total, shippingAddress } = req.body;

  // バリデーション
  if (!userId || !items || items.length === 0 || !total || !shippingAddress) {
    return res.status(400).json({ message: "不正なリクエストです。必須項目を確認してください。" });
  }

  let connection;
  try {
    // トランザクション開始
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. orders テーブルに挿入
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)",
      [userId, total, shippingAddress]
    );
    const orderId = orderResult.insertId;

    // 2. order_items テーブルに挿入
    const orderItemsQueries = items.map(item => {
      return connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price]
      );
    });
    await Promise.all(orderItemsQueries);
    
    // 3. 在庫を減らす
    const stockUpdateQueries = items.map(item => {
      return connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.id]
      );
    });
    await Promise.all(stockUpdateQueries);


    // トランザクションをコミット
    await connection.commit();

    res.status(201).json({ message: "注文が正常に作成されました", orderId: orderId });

  } catch (err) {
    // エラーがあればロールバック
    if (connection) {
      await connection.rollback();
    }
    console.error("Order creation error:", err);
    res.status(500).json({ message: "注文処理中にエラーが発生しました。" });
  } finally {
    // 接続を解放
    if (connection) {
      connection.release();
    }
  }
});

// ログイン API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "メールアドレスとパスワードは必須です" });
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
    if (users.length === 0) {
      return res.status(401).json({ message: "メールアドレスまたはパスワードが正しくありません" });
    }

    const user = users[0];
    // ログイン時刻を更新
    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user.id]);

    res.json({ message: "ログイン成功", user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

// ユーザーの注文履歴取得 API
app.get("/api/users/:userId/orders", async (req, res) => {
  const { userId } = req.params;
  console.log(`Fetching orders for userId: ${userId}`);

  try {
    const [orders] = await pool.query(
      "SELECT id, total_amount, status, created_at, shipping_address FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    if (orders.length === 0) {
      return res.json([]); // 注文がない場合は空の配列を返す
    }
    
    res.json(orders);
  } catch (err) {
    console.error("Order history fetch error:", err);
    res.status(500).json({ message: "注文履歴の取得中にエラーが発生しました。" });
  }
});

// --- 管理者用 API ---

// 全ユーザー取得
app.get("/api/admin/users", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, phone_number, created_at, last_login FROM users ORDER BY created_at DESC");
    res.json(users);
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// 全注文取得
app.get("/api/admin/orders", async (req, res) => {
  try {
    const query = `
      SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    const [orders] = await pool.query(query);
    res.json(orders);
  } catch (err) {
    console.error("Admin orders error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// 全商品取得（在庫含む）
app.get("/api/admin/products", async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(products);
  } catch (err) {
    console.error("Admin products error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// 在庫数更新
app.put("/api/admin/products/:id/stock", async (req, res) => {
  const productId = req.params.id;
  const { stock } = req.body;

  if (stock === undefined) {
    return res.status(400).json({ message: "在庫数は必須です" });
  }

  try {
    await pool.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [stock, productId]);
    res.json({ message: "在庫更新完了" });
  } catch (err) {
    console.error("Stock update error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// 注文ステータス更新
app.put("/api/admin/orders/:id/status", async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "ステータスは必須です" });
  }

  try {
    // 1. ステータスを更新
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

    // 2. もし 'shipped' なら通知を送信
    if (status === 'shipped') {
      // 注文からユーザーIDを取得
      const [rows] = await pool.query("SELECT user_id FROM orders WHERE id = ?", [orderId]);
      if (rows.length > 0) {
        const userId = rows[0].user_id.toString();
        
        // 対応するクライアントのWebSocket接続を探す
        const clientWs = clients.get(userId);
        if (clientWs && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: 'order_shipped',
            message: `注文 #${orderId} の商品が発送されました。`,
            orderId: orderId,
          }));
          console.log(`Sent 'order_shipped' notification to user ${userId} for order ${orderId}`);
        } else {
          console.log(`User ${userId} is not connected, notification for order ${orderId} not sent.`);
        }
      }
    }

    res.json({ message: "注文ステータス更新完了" });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// 商品登録 (画像アップロード対応)
app.post("/api/admin/products", upload.single('image'), async (req, res) => {
  const { name, brand, price, stock_quantity, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !brand || price === undefined || stock_quantity === undefined) {
    return res.status(400).json({ message: "すべての項目は必須です" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, brand, price, stock_quantity, image, description) VALUES (?, ?, ?, ?, ?, ?)",
      [name, brand, price, stock_quantity, image, description || null]
    );
    res.status(201).json({ message: "商品登録完了", productId: result.insertId });
  } catch (err) {
    console.error("Product insert error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// 商品削除
app.delete("/api/admin/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [productId]);
    res.json({ message: "商品を削除しました" });
  } catch (err) {
    console.error("Product delete error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

// 商品更新
app.put("/api/admin/products/:id", async (req, res) => {
  const productId = req.params.id;
  const { name, brand, price } = req.body;

  if (!name || !brand || price === undefined) {
    return res.status(400).json({ message: "商品名、ブランド、価格は必須です" });
  }

  try {
    await pool.query(
      "UPDATE products SET name = ?, brand = ?, price = ? WHERE id = ?",
      [name, brand, price, productId]
    );
    res.json({ message: "商品を更新しました" });
  } catch (err) {
    console.error("Product update error:", err);
    res.status(500).json({ message: "DBエラー" });
  }
});

server.listen(PORT, () => {
  console.log(`API サーバー起動中: http://localhost:${PORT}`);
});

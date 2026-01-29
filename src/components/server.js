// server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());           // フロント(3000) ↔ API(3001) 間のCORSを許可
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "myskin",
});

// 接続チェック（任意）
db.connect((err) => {
  if (err) {
    console.error("DB接続エラー:", err);
  } else {
    console.log("MySQL connected");
  }
});

// GET /products : 全件取得
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// （任意）ID指定取得: GET /products/:id
app.get("/products/:id", (req, res) => {
  db.query("SELECT * FROM products WHERE id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));

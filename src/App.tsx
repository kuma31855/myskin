import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { ProductCard } from './components/ProductCard';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { LoginDialog } from './components/LoginDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { AddressEditDialog } from './components/AddressEditDialog';
import { SubscriptionManageDialog } from './components/SubscriptionManageDialog';
import { Footer } from './components/Footer';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderCompletePage } from './components/OrderCompletePage';
import { AdminPage } from './components/AdminPage'; // ★追加
import { OrderHistoryPage } from './components/OrderHistoryPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';


// ==============================
// 型定義
// ==============================

export type Page = 'home' | 'cart' | 'checkout' | 'complete' | 'admin' | 'order_history'; // ★ 'admin' 追加

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  tag?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CheckoutFormData {
  email: string;
  total: number;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
}

export interface OrderData {
  orderNumber: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  shippingAddress: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}


// ==============================
// 初期表示用のダミー商品（API 失敗時のフォールバック）
// ==============================

const initialProducts: Product[] = [
  
];

// ==============================
// メインコンポーネント
// ==============================

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  // 初回読み込み時にlocalStorageからログイン情報を復元
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);

  // WebSocket接続管理
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      // サーバーにユーザーIDを登録
      ws.send(JSON.stringify({ type: 'register', userId: currentUser.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        // 発送通知を受け取ったらトーストを表示
        if (data.type === 'order_shipped') {
          toast.info(data.message || 'ご注文の商品が発送されました！', {
            action: {
              label: 'OK',
              onClick: () => console.log('Notification acknowledged'),
            },
          });
        }
      } catch (e) {
        console.error('Failed to parse message from server', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // コンポーネントのクリーンアップ時またはユーザーがログアウトした時に接続を閉じる
    return () => {
      ws.close();
    };
  }, [currentUser]); // currentUserが変わった時（ログイン・ログアウト時）に実行

  useEffect(() => {
    if (window.location.hash === '#admin') {
      setCurrentPage('admin');
    }
  }, []);

    // API から products を取得（DB 連携）

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`); // ★ここ

  

        if (!res.ok) {

          throw new Error(`HTTP error: ${res.status}`);

        }

  

        const data: Product[] = await res.json();

        setProducts(data); // ★ DB のデータ（10件）をセット

      } catch (error) {

        console.error('商品取得に失敗しました。ダミーデータを使用します。', error);

        // ここでは何もしないので、通信失敗時だけ initialProducts(8件)が表示される

      }

    };

  

    fetchProducts();

  }, []); // 依存配列は空のまま

  

  

  

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  

    const handleLoginSuccess = (user: User) => {
      setIsLoggedIn(true);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user)); // 保存
      setLoginOpen(false);
    };

  

    const handleLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem('user'); // 削除
    };

  

    const handleAddToCart = (productId: number) => {

      const product = products.find((p) => p.id === productId);

      if (!product) return;

  

      setCartItems((prev) => {

        const existingItem = prev.find((item) => item.id === productId);

        if (existingItem) {

          return prev.map((item) =>

            item.id === productId

              ? { ...item, quantity: item.quantity + 1 }

              : item,

          );

        }

        return [...prev, { ...product, quantity: 1 }];

      });

  

      toast.success(`${product.name}をカートに追加しました`);

    };

  

    const handleUpdateQuantity = (id: number, quantity: number) => {

      setCartItems((prev) =>

        prev.map((item) => (item.id === id ? { ...item, quantity } : item)),

      );

    };

  

    const handleRemoveItem = (id: number) => {

      const item = cartItems.find((item) => item.id === id);

      setCartItems((prev) => prev.filter((item) => item.id !== id));

      if (item) {

        toast.success(`${item.name}をカートから削除しました`);

      }

    };

  

    const handleCheckout = async (formData: CheckoutFormData) => {

      if (!isLoggedIn || !currentUser) {

        toast.error("ログインしてください。");

        setLoginOpen(true);

        return;

      }

  

      const shippingAddress = `〒${formData.postalCode} ${formData.prefecture}${formData.city}${formData.address}${formData.building ? ' ' + formData.building : ''}`;

  

      const orderPayload = {

        userId: currentUser.id,

        items: cartItems,

        total: formData.total,

        shippingAddress,

      };

  

      try {

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

  
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '注文処理に失敗しました。');
      }

      const resData = await res.json();
      const orderNumber = 'MYSKIN-' + resData.orderId.toString().padStart(6, '0');

      setOrderData({
        orderNumber,
        customerEmail: formData.email,
        items: cartItems,
        total: formData.total,
        shippingAddress,
      });

      setCurrentPage('complete');

    } catch (error: any) {
      toast.error(error.message || 'サーバーとの通信中にエラーが発生しました。');
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setCartItems([]);
    setOrderData(null);
  };

  // ==============================
  // ページごとの描画
  // ==============================

  if (currentPage === 'cart') {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          cartCount={cartCount}
          onCartClick={() => setCurrentPage('cart')}
          onSettingsClick={() => setSettingsOpen(true)}
          onAddressClick={() => setAddressOpen(true)}
          onSubscriptionClick={() => setSubscriptionOpen(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        <CartPage
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onContinueShopping={() => setCurrentPage('home')}
          onCheckout={() => setCurrentPage('checkout')}
        />
        <Footer />
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLoginSuccess={handleLoginSuccess}
        />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <AddressEditDialog open={addressOpen} onOpenChange={setAddressOpen} />
        <SubscriptionManageDialog
          open={subscriptionOpen}
          onOpenChange={setSubscriptionOpen}
        />
        <Toaster />
      </div>
    );
  }

  if (currentPage === 'checkout') {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          cartCount={cartCount}
          onCartClick={() => setCurrentPage('cart')}
          onSettingsClick={() => setSettingsOpen(true)}
          onAddressClick={() => setAddressOpen(true)}
          onSubscriptionClick={() => setSubscriptionOpen(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        <CheckoutPage
          items={cartItems}
          onBack={() => setCurrentPage('cart')}
          onConfirm={handleCheckout}
        />
        <Footer />
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLoginSuccess={handleLoginSuccess}
        />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <AddressEditDialog open={addressOpen} onOpenChange={setAddressOpen} />
        <SubscriptionManageDialog
          open={subscriptionOpen}
          onOpenChange={setSubscriptionOpen}
        />
        <Toaster />
      </div>
    );
  }

  if (currentPage === 'complete' && orderData) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          cartCount={0}
          onCartClick={() => setCurrentPage('cart')}
          onSettingsClick={() => setSettingsOpen(true)}
          onAddressClick={() => setAddressOpen(true)}
          onSubscriptionClick={() => setSubscriptionOpen(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        <OrderCompletePage
          orderNumber={orderData.orderNumber}
          customerEmail={orderData.customerEmail}
          items={orderData.items}
          total={orderData.total}
          shippingAddress={orderData.shippingAddress}
          onBackToHome={handleBackToHome}
        />
        <Footer />
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLoginSuccess={handleLoginSuccess}
        />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <AddressEditDialog open={addressOpen} onOpenChange={setAddressOpen} />
        <SubscriptionManageDialog
          open={subscriptionOpen}
          onOpenChange={setSubscriptionOpen}
        />
        <Toaster />
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          cartCount={0}
          onCartClick={() => setCurrentPage('cart')}
          onSettingsClick={() => setSettingsOpen(true)}
          onAddressClick={() => setAddressOpen(true)}
          onSubscriptionClick={() => setSubscriptionOpen(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        <AdminPage />
        <Toaster />
      </div>
    );
  }
  
  if (currentPage === 'order_history') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          cartCount={cartCount}
          onCartClick={() => setCurrentPage('cart')}
          onHistoryClick={() => setCurrentPage('order_history')}
          onSettingsClick={() => setSettingsOpen(true)}
          onAddressClick={() => setAddressOpen(true)}
          onSubscriptionClick={() => setSubscriptionOpen(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        <OrderHistoryPage currentUser={currentUser} onBackToHome={handleBackToHome} />
        <Footer />
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLoginSuccess={handleLoginSuccess}
        />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <AddressEditDialog open={addressOpen} onOpenChange={setAddressOpen} />
        <SubscriptionManageDialog
          open={subscriptionOpen}
          onOpenChange={setSubscriptionOpen}
        />
        <Toaster />
      </div>
    );
  }

  // ==============================
  // Home ページ
  // ==============================

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setLoginOpen(true)}
        cartCount={cartCount}
        onCartClick={() => setCurrentPage('cart')}
        onSettingsClick={() => setSettingsOpen(true)}
        onAddressClick={() => setAddressOpen(true)}
        onSubscriptionClick={() => setSubscriptionOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <main>
        <Hero />
        <Features />

        <section id="products" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl mb-4">人気の商品</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                厳選されたスキンケア商品をご覧ください。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={handleAddToCart}
                />
              ))} 
            </div>
          </div>
        </section>

        <SubscriptionPlans />

        <section
          id="about"
          className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl mb-6">MYSKINについて</h2>
              <p className="text-xl text-gray-700 mb-6">
                MYSKINは、あなたの肌に最適なスキンケア商品を提供することを使命としています。
                私たちの専門家チームが世界中から厳選した商品を、定期的にお届けします。
              </p>
              <p className="text-xl text-gray-700">
                すべての商品は、安全性と効果が確認された高品質なものばかり。
                あなたの美しさを引き出すために、私たちは最高のものだけを選びます。
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoginSuccess={handleLoginSuccess}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AddressEditDialog open={addressOpen} onOpenChange={setAddressOpen} />
      <SubscriptionManageDialog
        open={subscriptionOpen}
        onOpenChange={setSubscriptionOpen}
      />
      <Toaster />
    </div>
  );
}

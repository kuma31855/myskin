import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export function CartPage({ items, onUpdateQuantity, onRemoveItem, onContinueShopping, onCheckout }: CartPageProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 500 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={onContinueShopping}
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              買い物を続ける
            </Button>

            <Card className="p-16 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl mb-4">カートは空です</h2>
              <p className="text-gray-600 mb-8">
                お気に入りの商品をカートに追加してください
              </p>
              <Button
                onClick={onContinueShopping}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                商品を見る
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={onContinueShopping}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            買い物を続ける
          </Button>

          <h1 className="text-4xl mb-8">ショッピングカート</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg mx-auto sm:mx-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                          <h3 className="text-lg font-medium">{item.name}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-lg font-semibold">¥{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl mb-6">注文サマリー</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">小計</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">配送料</span>
                    <span>¥{shipping.toLocaleString()}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between mb-6">
                  <span className="text-lg">合計</span>
                  <span className="text-2xl">¥{total.toLocaleString()}</span>
                </div>

                <Button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  size="lg"
                >
                  レジに進む
                </Button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  税込価格で表示しています
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

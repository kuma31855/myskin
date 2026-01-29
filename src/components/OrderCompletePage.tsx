import { CheckCircle, Package, Mail, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

interface OrderCompletePageProps {
  orderNumber: string;
  customerEmail: string;
  items: any[];
  total: number;
  shippingAddress: string;
  onBackToHome: () => void;
}

export function OrderCompletePage({
  orderNumber,
  customerEmail,
  items,
  total,
  shippingAddress,
  onBackToHome,
}: OrderCompletePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-3xl md:text-4xl mb-4">ご注文ありがとうございます！</h1>
            <p className="text-xl text-gray-600 mb-8">
              ご注文を承りました。商品の準備が整い次第、発送いたします。
            </p>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">注文番号</p>
              <p className="text-2xl tracking-wider">{orderNumber}</p>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6 text-left">
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="mb-2">確認メールを送信しました</h3>
                  <p className="text-sm text-gray-600">
                    {customerEmail} に注文確認メールをお送りしました。
                    メールが届かない場合は、迷惑メールフォルダをご確認ください。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Package className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="mb-2">配送について</h3>
                  <p className="text-sm text-gray-600">
                    商品は以下の住所に発送されます：
                  </p>
                  <p className="text-sm text-gray-800 mt-2">{shippingAddress}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    発送が完了しましたら、追跡番号をメールでお知らせします。
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="text-left mb-8">
              <h3 className="mb-4">注文内容</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm">¥{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <span>合計金額</span>
                <span className="text-xl">¥{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onBackToHome}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                トップページに戻る
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
              >
                注文履歴を見る
              </Button>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ご不明な点がございましたら、
              <a href="mailto:support@myskin.com" className="text-pink-500 hover:underline ml-1">
                サポートチーム
              </a>
              までお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

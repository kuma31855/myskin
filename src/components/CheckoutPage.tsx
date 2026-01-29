import { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, MapPin, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

interface CheckoutPageProps {
  items: CartItem[];
  onBack: () => void;
  onConfirm: (formData: any) => void;
}

export function CheckoutPage({ items, onBack, onConfirm }: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    shippingMethod: 'standard',
    paymentMethod: 'card',
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostalCodeChange = async (value: string) => {
    // ハイフンを削除
    const cleanedValue = value.replace(/-/g, '');
    
    // フォーマット付きで表示（3桁-4桁）
    let formattedValue = value;
    if (cleanedValue.length > 3) {
      formattedValue = cleanedValue.slice(0, 3) + '-' + cleanedValue.slice(3, 7);
    }
    
    setFormData((prev) => ({ ...prev, postalCode: formattedValue }));

    // 7桁入力されたら住所検索
    if (cleanedValue.length === 7) {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedValue}`);
        const data = await response.json();

        if (data.status === 200 && data.results && data.results.length > 0) {
          const result = data.results[0];
          setFormData((prev) => ({
            ...prev,
            prefecture: result.address1,
            city: result.address2 + result.address3,
          }));
          toast.success('住所を自動入力しました');
        } else {
          toast.error('郵便番号に対応する住所が見つかりませんでした');
        }
      } catch (error) {
        console.error('郵便番号検索エラー:', error);
        toast.error('住所の取得に失敗しました');
      } finally {
        setIsLoadingAddress(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ ...formData, total });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            カートに戻る
          </Button>

          <h1 className="text-3xl sm:text-4xl mb-8 font-semibold">お支払い・配送先情報</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-pink-500" />
                    <h2 className="text-xl font-semibold">配送先情報</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastName">姓 *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName">名 *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">メールアドレス *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="phone">電話番号 *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">郵便番号 *</Label>
                      <div className="flex items-center">
                        <Input
                          id="postalCode"
                          required
                          placeholder="123-4567"
                          value={formData.postalCode}
                          onChange={(e) => handlePostalCodeChange(e.target.value)}
                        />
                        {isLoadingAddress && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="prefecture">都道府県 *</Label>
                      <Input
                        id="prefecture"
                        required
                        value={formData.prefecture}
                        onChange={(e) => handleInputChange('prefecture', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="city">市区町村 *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">番地 *</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="building">建物名・部屋番号</Label>
                      <Input
                        id="building"
                        value={formData.building}
                        onChange={(e) => handleInputChange('building', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-5 h-5 text-pink-500" />
                    <h2 className="text-xl font-semibold">配送方法</h2>
                  </div>

                  <RadioGroup
                    value={formData.shippingMethod}
                    onValueChange={(value:string) => handleInputChange('shippingMethod', value)}
                    className="space-y-3"
                  >
                    <Label className="flex items-center justify-between p-4 border rounded-lg hover:border-pink-300 cursor-pointer has-[[data-state=checked]]:border-pink-500">
                       <div className="flex items-center space-x-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <div>
                          <div>通常配送（3-5営業日）</div>
                          <div className="text-sm text-gray-500">送料無料</div>
                        </div>
                      </div>
                    </Label>
                    <Label className="flex items-center justify-between p-4 border rounded-lg hover:border-pink-300 cursor-pointer has-[[data-state=checked]]:border-pink-500">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="express" id="express" />
                        <div>
                          <div>お急ぎ便（1-2営業日）</div>
                          <div className="text-sm text-gray-500">送料無料</div>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                </Card>

                <Card className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-pink-500" />
                    <h2 className="text-xl font-semibold">お支払い方法</h2>
                  </div>

                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value: string) => handleInputChange('paymentMethod', value)}
                    className="space-y-3"
                  >
                    <Label className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:border-pink-500 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <span>クレジットカード</span>
                    </Label>
                     <Label className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:border-pink-500 cursor-pointer">
                      <RadioGroupItem value="cod" id="cod" />
                      <span>代金引換</span>
                    </Label>
                     <Label className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:border-pink-500 cursor-pointer">
                      <RadioGroupItem value="bank" id="bank" />
                      <span>銀行振込</span>
                    </Label>
                  </RadioGroup>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="p-6 lg:sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">注文内容</h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            ¥{item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                         <p className="text-sm font-medium">¥{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">小計</span>
                      <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-lg font-semibold">合計</span>
                    <span className="text-2xl font-bold">¥{total.toLocaleString()}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    size="lg"
                  >
                    注文を確定する
                  </Button>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
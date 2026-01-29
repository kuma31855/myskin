import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const plans = [
  {
    id: 1,
    name: 'ベーシック',
    price: 2980,
    description: '月に1回、厳選された2つの商品',
    features: [
      '月2商品のスキンケアアイテム',
      '送料無料',
      '限定商品へのアクセス',
      'いつでもキャンセル可能',
    ],
    popular: false,
  },
  {
    id: 2,
    name: 'プレミアム',
    price: 4980,
    description: '月に1回、厳選された4つの商品',
    features: [
      '月4商品のスキンケアアイテム',
      '送料無料',
      '限定商品へのアクセス',
      'いつでもキャンセル可能',
      '専門家による肌診断',
      '20%オフクーポン',
    ],
    popular: true,
  },
  {
    id: 3,
    name: 'ラグジュアリー',
    price: 8980,
    description: '月に1回、厳選された6つの商品',
    features: [
      '月6商品のスキンケアアイテム',
      '送料無料',
      '限定商品へのアクセス',
      'いつでもキャンセル可能',
      '専門家による肌診断',
      '30%オフクーポン',
      'VIP限定イベント',
      '優先カスタマーサポート',
    ],
    popular: false,
  },
];

export function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <section id="subscription" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">あなたに合ったプランを選択</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            定期的なスキンケアで美しい肌を保ちましょう。すべてのプランは、いつでもキャンセル可能です。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 max-w-7xl mx-auto space-y-8 md:space-y-0">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-8 flex flex-col ${ 
                plan.popular
                  ? 'border-2 border-pink-500 shadow-2xl md:scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  人気No.1
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold">¥{plan.price.toLocaleString()}</span>
                  <span className="text-gray-500">/ 月</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-pink-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-pink-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                onClick={() => handlePlanSelect(plan)}
              >
                プランを選択
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl mb-2">
              選択完了
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              {selectedPlan && (
                <div className="mt-4">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-2">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl text-gray-900 mb-2">
                      {selectedPlan.name}プラン
                    </h3>
                    <div className="flex items-baseline justify-center gap-2 mb-3">
                      <span className="text-3xl text-gray-900">
                        ¥{selectedPlan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600">/ 月</span>
                    </div>
                    <p className="text-gray-700">{selectedPlan.description}</p>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-3">プラン内容：</p>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-gray-600 mb-4">
                    ご選択いただきありがとうございます！
                    <br />
                    このプランでお申し込みを続けますか？
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setModalOpen(false)}
                    >
                      キャンセル
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      onClick={() => {
                        setModalOpen(false);
                        // ここに実際のサブスクリプション登録処理を追加
                      }}
                    >
                      申し込む
                    </Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
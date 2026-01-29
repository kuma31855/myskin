import { Sparkles, Package, Award, Clock } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: '厳選された商品',
    description: '専門家が選んだプレミアムなスキンケア商品のみをお届けします。',
  },
  {
    icon: Package,
    title: '毎月お届け',
    description: '定期的なケアで、健康的で美しい肌を維持できます。',
  },
  {
    icon: Award,
    title: '品質保証',
    description: 'すべての商品は厳格な品質基準をクリアしています。',
  },
  {
    icon: Clock,
    title: 'いつでもキャンセル',
    description: 'サブスクリプションはいつでも簡単にキャンセルできます。',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">MYSKINを選ぶ理由</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            私たちは、あなたの肌に最適なケアを提供することに情熱を注いでいます。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl">
                  <Icon className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

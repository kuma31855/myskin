import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              毎月お届けするスキンケア
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              あなたの肌に<br />
              最適なケアを
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto md:mx-0">
              専門家が厳選したスキンケア商品を、毎月あなたのドアまでお届けします。
              定期的なケアで、輝く素肌を手に入れましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                サブスクリプションを始める
              </Button>
              <Button size="lg" variant="outline">
                商品を見る
              </Button>
            </div>
            <div className="flex gap-8 pt-4 justify-center md:justify-start">
              <div>
                <div className="text-2xl sm:text-3xl font-bold">10,000+</div>
                <div className="text-gray-600 text-sm">満足した顧客</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">4.8★</div>
                <div className="text-gray-600 text-sm">平均評価</div>
              </div>
            </div>
          </div>
          <div className="relative order-first md:order-last">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300 rounded-3xl blur-3xl opacity-30" />
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1618480066690-8457ab2b766e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGNvc21ldGljc3xlbnwxfHx8fDE3NjEwMzY5MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Skincare products"
              className="relative rounded-3xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

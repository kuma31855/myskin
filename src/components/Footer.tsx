// src/components/Footer.tsx
import { Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-center sm:text-left">
          <div className="space-y-4 flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2">
              <img src="/Vector.png" alt="MYSKIN" className="w-8 h-8 object-contain" />
              <span className="text-xl text-white font-semibold">MYSKIN</span>
            </div>

            <p className="text-sm max-w-xs">
              専門家が厳選したスキンケア商品を、毎月あなたのドアまでお届けします。
            </p>

            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/myskin_0909?igsh=MTR3aGF2Z2pzNWE2cg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-pink-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-pink-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">商品</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-pink-400 transition-colors">すべての商品</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">新着商品</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">ベストセラー</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">限定商品</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-pink-400 transition-colors">よくある質問</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">配送について</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">返品・交換</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">お問い合わせ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">会社情報</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-pink-400 transition-colors">会社概要</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">採用情報</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">利用規約</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">プライバシーポリシー</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MYSKIN. All rights reserved.</p>
          <div className="mt-2 text-xs text-gray-500">
            <button
               className="hover:text-gray-400 cursor-pointer bg-transparent border-none text-gray-500 underline"
               onClick={() => {
                   window.location.hash = 'admin';
                   window.location.reload();
               }}
            >
               管理者画面へ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

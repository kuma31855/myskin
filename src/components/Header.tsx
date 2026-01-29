// src/components/Header.tsx
import { ShoppingCart, User, Search, Settings, MapPin, CreditCard, LogOut, Menu, Archive } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { useState } from 'react';
import { toast } from 'sonner';

interface HeaderProps {
  onLoginClick: () => void;
  cartCount?: number;
  onCartClick?: () => void;
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
  onAddressClick?: () => void;
  onSubscriptionClick?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export function Header({
  onLoginClick,
  cartCount = 0,
  onCartClick,
  onHistoryClick,
  onSettingsClick,
  onAddressClick,
  onSubscriptionClick,
  isLoggedIn = false,
  onLogout,
}: HeaderProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    onLogout?.();
    toast.success('ログアウトしました');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-2">
                {/* 画像は public/Vector.png に配置 */}
                <img src="/Vector.png" alt="MYSKIN" className="w-8 h-8 object-contain" />
                <span className="text-xl font-semibold">MYSKIN</span>
              </a>
              <nav className="hidden md:flex gap-6 text-sm font-medium">
                <a href="#products" className="hover:text-pink-500 transition-colors">
                  商品
                </a>
                <a href="#subscription" className="hover:text-pink-500 transition-colors">
                  サブスクリプション
                </a>
                <a href="#about" className="hover:text-pink-500 transition-colors">
                  ブランドについて
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 max-w-xs">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="商品を検索..."
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
              </div>

              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onHistoryClick}>
                      <Archive className="w-4 h-4 mr-2" />
                      注文履歴
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSettingsClick}>
                      <Settings className="w-4 h-4 mr-2" />
                      設定
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAddressClick}>
                      <MapPin className="w-4 h-4 mr-2" />
                      配送先住所の変更
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSubscriptionClick}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      サブスクリプション管理
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowLogoutDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" onClick={onLoginClick}>
                  <User className="w-5 h-5" />
                </Button>
              )}

              <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* --- Mobile Menu --- */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>メニュー</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-6 mt-8">
                    <div className="sm:hidden flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="商品を検索..."
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                        />
                    </div>
                    <nav className="flex flex-col space-y-4 text-lg">
                      <a href="#products" onClick={() => setIsMenuOpen(false)} className="hover:text-pink-500 transition-colors">
                        商品
                      </a>
                      <a href="#subscription" onClick={() => setIsMenuOpen(false)} className="hover:text-pink-500 transition-colors">
                        サブスクリプション
                      </a>
                      <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-pink-500 transition-colors">
                        ブランドについて
                      </a>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

            </div>
          </div>
        </div>
      </header>

      {/* ログアウト確認ダイアログ */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
            <AlertDialogDescription>ログアウトすると、再度ログインが必要になります。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>ログアウト</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


















































// // src/components/Header.tsx
// import { ShoppingCart, User, Search, Settings, MapPin, CreditCard, LogOut } from 'lucide-react';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from './ui/alert-dialog';
// import { useState } from 'react';
// import { toast } from 'sonner'; // ← バージョン指定を外す

// interface HeaderProps {
//   onLoginClick: () => void;
//   cartCount?: number;
//   onCartClick?: () => void;
//   onSettingsClick?: () => void;
//   onAddressClick?: () => void;
//   onSubscriptionClick?: () => void;
//   isLoggedIn?: boolean;
//   onLogout?: () => void;
// }

// export function Header({
//   onLoginClick,
//   cartCount = 0,
//   onCartClick,
//   onSettingsClick,
//   onAddressClick,
//   onSubscriptionClick,
//   isLoggedIn = false,
//   onLogout,
// }: HeaderProps) {
//   const [showLogoutDialog, setShowLogoutDialog] = useState(false);

//   const handleLogout = () => {
//     setShowLogoutDialog(false);
//     onLogout?.();
//     toast.success('ログアウトしました');
//   };

//   return (
//     <>
//       <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex h-16 items-center justify-between">
//             <div className="flex items-center gap-8">
//               <a href="/" className="flex items-center gap-2">
//                 {/* 画像は public/myskinLogo.png に配置 */}
//                 <img src="../Vector.png" alt="MYSKIN" className="w-8 h-8 object-contain" />
//                 <span className="text-xl">MYSKIN</span>
//               </a>
//               <nav className="hidden md:flex gap-6">
//                 <a href="#products" className="hover:text-pink-500 transition-colors">
//                   商品
//                 </a>
//                 <a href="#subscription" className="hover:text-pink-500 transition-colors">
//                   サブスクリプション
//                 </a>
//                 <a href="#about" className="hover:text-pink-500 transition-colors">
//                   ブランドについて
//                 </a>
//               </nav>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 max-w-md">
//                 <Search className="w-4 h-4 text-gray-400" />
//                 <Input
//                   type="search"
//                   placeholder="商品を検索..."
//                   className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
//                 />
//               </div>

//               {isLoggedIn ? (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 relative">
//                       <User className="w-5 h-5" />
//                     </button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="w-56">
//                     <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={onSettingsClick}>
//                       <Settings className="w-4 h-4 mr-2" />
//                       設定
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={onAddressClick}>
//                       <MapPin className="w-4 h-4 mr-2" />
//                       配送先住所の変更
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={onSubscriptionClick}>
//                       <CreditCard className="w-4 h-4 mr-2" />
//                       サブスクリプション管理
//                     </DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem
//                       onClick={() => setShowLogoutDialog(true)}
//                       className="text-red-600 focus:text-red-600"
//                     >
//                       <LogOut className="w-4 h-4 mr-2" />
//                       ログアウト
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               ) : (
//                 <Button variant="ghost" size="icon" onClick={onLoginClick}>
//                   <User className="w-5 h-5" />
//                 </Button>
//               )}

//               <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
//                 <ShoppingCart className="w-5 h-5" />
//                 {cartCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {cartCount}
//                   </span>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* ログアウト確認ダイアログ */}
//       <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
//             <AlertDialogDescription>ログアウトすると、再度ログインが必要になります。</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>キャンセル</AlertDialogCancel>
//             <AlertDialogAction onClick={handleLogout}>ログアウト</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }



































// // import { ShoppingCart, User, Search, Settings, MapPin, CreditCard, LogOut, ChevronDown } from 'lucide-react';
// // import { Button } from './ui/button';
// // import { Input } from './ui/input';
// // import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
// // import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
// // import { useState } from 'react';
// // import { toast } from 'sonner@2.0.3';
// // import myskinLogo from 'figma:asset/d732d5e70297d6b155bb7a5cce4ad350c0dd8025.png';

// // interface HeaderProps {
// //   onLoginClick: () => void;
// //   cartCount?: number;
// //   onCartClick?: () => void;
// //   onSettingsClick?: () => void;
// //   onAddressClick?: () => void;
// //   onSubscriptionClick?: () => void;
// //   isLoggedIn?: boolean;
// //   onLogout?: () => void;
// // }

// // export function Header({ 
// //   onLoginClick, 
// //   cartCount = 0, 
// //   onCartClick,
// //   onSettingsClick,
// //   onAddressClick,
// //   onSubscriptionClick,
// //   isLoggedIn = false,
// //   onLogout,
// // }: HeaderProps) {
// //   const [showLogoutDialog, setShowLogoutDialog] = useState(false);

// //   const handleLogout = () => {
// //     console.log('Logging out');
// //     setShowLogoutDialog(false);
// //     if (onLogout) {
// //       onLogout();
// //     }
// //     toast.success('ログアウトしました');
// //   };

// //   return (
// //     <>
// //       <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
// //         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="flex h-16 items-center justify-between">
// //             <div className="flex items-center gap-8">
// //               <a href="/" className="flex items-center gap-2">
// //                 <img src={myskinLogo} alt="MYSKIN" className="w-8 h-8 object-contain" />
// //                 <span className="text-xl">MYSKIN</span>
// //               </a>
// //               <nav className="hidden md:flex gap-6">
// //                 <a href="#products" className="hover:text-pink-500 transition-colors">商品</a>
// //                 <a href="#subscription" className="hover:text-pink-500 transition-colors">サブスクリプション</a>
// //                 <a href="#about" className="hover:text-pink-500 transition-colors">ブランドについて</a>
// //               </nav>
// //             </div>
            
// //             <div className="flex items-center gap-4">
// //               <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 max-w-md">
// //                 <Search className="w-4 h-4 text-gray-400" />
// //                 <Input 
// //                   type="search" 
// //                   placeholder="商品を検索..." 
// //                   className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
// //                 />
// //               </div>

// //               {isLoggedIn ? (
// //                 <DropdownMenu>
// //                   <DropdownMenuTrigger asChild>
// //                     <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 relative">
// //                       <User className="w-5 h-5" />
// //                     </button>
// //                   </DropdownMenuTrigger>
// //                   <DropdownMenuContent align="end" className="w-56">
// //                     <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
// //                     <DropdownMenuSeparator />
// //                     <DropdownMenuItem onClick={onSettingsClick}>
// //                       <Settings className="w-4 h-4 mr-2" />
// //                       設定
// //                     </DropdownMenuItem>
// //                     <DropdownMenuItem onClick={onAddressClick}>
// //                       <MapPin className="w-4 h-4 mr-2" />
// //                       配送先住所の変更
// //                     </DropdownMenuItem>
// //                     <DropdownMenuItem onClick={onSubscriptionClick}>
// //                       <CreditCard className="w-4 h-4 mr-2" />
// //                       サブスクリプション管理
// //                     </DropdownMenuItem>
// //                     <DropdownMenuSeparator />
// //                     <DropdownMenuItem 
// //                       onClick={() => setShowLogoutDialog(true)}
// //                       className="text-red-600 focus:text-red-600"
// //                     >
// //                       <LogOut className="w-4 h-4 mr-2" />
// //                       ログアウト
// //                     </DropdownMenuItem>
// //                   </DropdownMenuContent>
// //                 </DropdownMenu>
// //               ) : (
// //                 <Button variant="ghost" size="icon" onClick={onLoginClick}>
// //                   <User className="w-5 h-5" />
// //                 </Button>
// //               )}

// //               <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
// //                 <ShoppingCart className="w-5 h-5" />
// //                 {cartCount > 0 && (
// //                   <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
// //                     {cartCount}
// //                   </span>
// //                 )}
// //               </Button>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* ログアウト確認ダイアログ */}
// //       <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               ログアウトすると、再度ログインが必要になります。
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel>キャンセル</AlertDialogCancel>
// //             <AlertDialogAction onClick={handleLogout}>
// //               ログアウト
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </>
// //   );
// // }
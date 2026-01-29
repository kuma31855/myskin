// src/components/LoginDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner'; // ← バージョン指定を撤去

import { User } from '../App';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: (user: User) => void;
}

type AuthStep = 'auth' | 'verify-otp';

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authStep, setAuthStep] = useState<AuthStep>('auth');
  const [otp, setOtp] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ログインに失敗しました');
      }

      console.log('Login successful:', data.user);
      toast.success(`${data.user.name}さん、こんにちは！`);
      onLoginSuccess?.(data.user);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !userEmail || !signupPassword) {
      toast.error('全ての項目を入力してください');
      return;
    }

    console.log('Signup:', { name: signupName, email: userEmail });
    setAuthStep('verify-otp');
    toast.success('認証コードをメールに送信しました');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('6桁の認証コードを入力してください');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupName,
          email: userEmail,
          password: signupPassword,
          phone_number: signupPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登録エラーが発生しました');
      }

      console.log('Verifying OTP:', otp);
      toast.success('アカウントが作成されました！');
      
      const newUser: User = { id: data.userId, name: signupName, email: userEmail };
      onLoginSuccess?.(newUser);

      setAuthStep('auth');
      setOtp('');
      setUserEmail('');
      setSignupName('');
      setSignupPhone('');
      setSignupPassword('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleResendOtp = () => {
    toast.success('認証コードを再送信しました');
  };

  const handleBackToSignup = () => {
    setAuthStep('auth');
    setOtp('');
  };

  // OTP入力画面
  if (authStep === 'verify-otp') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">二段階認証</DialogTitle>
            <DialogDescription className="text-center">
              {userEmail} に送信された6桁の認証コードを入力してください
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyOtp} className="space-y-6 mt-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                <Mail className="w-4 h-4" />
                <span>メールをご確認ください</span>
              </div>

              <InputOTP maxLength={6} value={otp} onChange={(value: string) => setOtp(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <p className="text-sm text-gray-500">コードの有効期限は10分間です</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              size="lg"
            >
              認証して登録を完了
            </Button>

            <div className="space-y-2">
              <Button type="button" variant="outline" className="w-full" onClick={handleResendOtp}>
                コードを再送信
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={handleBackToSignup}>
                登録画面に戻る
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // 通常のログイン/新規登録画面
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {/* 画像は public/myskinLogo.png に配置 */}
            <img src="/myskinLogo.png" alt="MYSKIN Logo" className="w-12 h-12 rounded-full" />
          </div>
          <DialogTitle className="text-center text-2xl">MYSKIN</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="signup">新規登録</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">メールアドレス</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">パスワード</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                ログイン
              </Button>
            </form>

            <div className="text-center">
              <a href="#" className="text-sm text-pink-600 hover:underline">
                パスワードをお忘れですか？
              </a>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">または</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">お名前</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="山田 太郎"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">電話番号</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="09012345678"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">メールアドレス</Label>
                <Input
                  id="signup-email"
                  name="signup-email"
                  type="email"
                  placeholder="email@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">パスワード</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                アカウント作成
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center">
              アカウントを作成することで、
              <a href="#" className="text-pink-600 hover:underline">利用規約</a>
              と
              <a href="#" className="text-pink-600 hover:underline">プライバシーポリシー</a>
              に同意したものとみなされます。
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


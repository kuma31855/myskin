import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [formData, setFormData] = useState({
    lastName: '山田',
    firstName: '太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving profile:', formData);
    toast.success('プロフィールを更新しました');
    onOpenChange(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('パスワードは8文字以上で設定してください');
      return;
    }

    console.log('Changing password');
    toast.success('パスワードを変更しました');
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">設定</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* プロフィール設定 */}
          <div>
            <h3 className="text-lg mb-4">プロフィール情報</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="settings-lastName">姓</Label>
                  <Input
                    id="settings-lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="settings-firstName">名</Label>
                  <Input
                    id="settings-firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="settings-email">メールアドレス</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="settings-phone">電話番号</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                プロフィールを保存
              </Button>
            </form>
          </div>

          <Separator />

          {/* パスワード変更 */}
          <div>
            <h3 className="text-lg mb-4">パスワード変更</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">現在のパスワード</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword">新しいパスワード</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">8文字以上で入力してください</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="outline"
              >
                パスワードを変更
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

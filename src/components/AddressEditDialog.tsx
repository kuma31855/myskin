import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddressEditDialog({ open, onOpenChange }: AddressEditDialogProps) {
  const [formData, setFormData] = useState({
    postalCode: '150-0001',
    prefecture: '東京都',
    city: '渋谷区神宮前',
    address: '1-2-3',
    building: 'サンプルマンション101',
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostalCodeChange = async (value: string) => {
    const cleanedValue = value.replace(/-/g, '');
    
    let formattedValue = value;
    if (cleanedValue.length > 3) {
      formattedValue = cleanedValue.slice(0, 3) + '-' + cleanedValue.slice(3, 7);
    }
    
    setFormData((prev) => ({ ...prev, postalCode: formattedValue }));

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
    console.log('Updating address:', formData);
    toast.success('配送先住所を更新しました');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-500" />
            <DialogTitle className="text-2xl">配送先住所の変更</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="postalCode">郵便番号</Label>
            <div className="relative">
              <Input
                id="postalCode"
                placeholder="123-4567"
                value={formData.postalCode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                required
              />
              {isLoadingAddress && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              郵便番号を入力すると住所が自動入力されます
            </p>
          </div>

          <div>
            <Label htmlFor="prefecture">都道府県</Label>
            <Input
              id="prefecture"
              value={formData.prefecture}
              onChange={(e) => handleInputChange('prefecture', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="city">市区町村</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">番地</Label>
            <Input
              id="address"
              placeholder="1-2-3"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="building">建物名・部屋番号（任意）</Label>
            <Input
              id="building"
              placeholder="サンプルマンション101"
              value={formData.building}
              onChange={(e) => handleInputChange('building', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              住所を保存
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

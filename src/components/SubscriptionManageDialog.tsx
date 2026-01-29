import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Check, AlertTriangle } from 'lucide-react';

interface SubscriptionManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    id: 'basic',
    name: 'ベーシック',
    price: 2980,
    description: '基本的なスキンケアアイテム3点',
  },
  {
    id: 'premium',
    name: 'プレミアム',
    price: 4980,
    description: '高品質なスキンケアアイテム5点',
  },
  {
    id: 'luxury',
    name: 'ラグジュアリー',
    price: 7980,
    description: '最高級スキンケアアイテム7点',
  },
];

export function SubscriptionManageDialog({ open, onOpenChange }: SubscriptionManageDialogProps) {
  const [currentPlan, setCurrentPlan] = useState('premium');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleChangePlan = () => {
    if (selectedPlan === currentPlan) {
      toast.error('同じプランが選択されています');
      return;
    }

    setCurrentPlan(selectedPlan);
    toast.success('サブスクリプションプランを変更しました');
    onOpenChange(false);
  };

  const handleCancelSubscription = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelSubscription = () => {
    console.log('Canceling subscription');
    toast.success('サブスクリプションを解約しました');
    setShowCancelDialog(false);
    onOpenChange(false);
  };

  const currentPlanData = plans.find((p) => p.id === currentPlan);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">サブスクリプション管理</DialogTitle>
            <DialogDescription>
              現在のプランを変更または解約することができます
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* 現在のプラン */}
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
              <h3 className="text-lg mb-4">現在のプラン</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl">{currentPlanData?.name}</p>
                  <p className="text-gray-600 mt-1">{currentPlanData?.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl">¥{currentPlanData?.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">/ 月</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">次回更新日: 2025年11月27日</p>
              </div>
            </Card>

            {/* プラン変更 */}
            <div>
              <h3 className="text-lg mb-4">プランを変更</h3>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'hover:border-pink-300'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <RadioGroupItem value={plan.id} id={plan.id} />
                          <Label htmlFor={plan.id} className="cursor-pointer flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{plan.name}</span>
                              {plan.id === currentPlan && (
                                <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full">
                                  現在のプラン
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </Label>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl">¥{plan.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">/ 月</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button
                onClick={handleChangePlan}
                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                disabled={selectedPlan === currentPlan}
              >
                プランを変更
              </Button>
            </div>

            {/* 解約 */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleCancelSubscription}
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                サブスクリプションを解約
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                解約後も次回更新日まではサービスをご利用いただけます
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 解約確認ダイアログ */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              サブスクリプションを解約しますか？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              解約後も2025年11月27日までサービスをご利用いただけます。
              <br />
              この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col gap-2">
            <AlertDialogCancel className="w-full sm:w-full m-0">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelSubscription}
              className="w-full sm:w-full m-0 bg-red-600 hover:bg-red-700"
            >
              解約する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

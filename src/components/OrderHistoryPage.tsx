// src/components/OrderHistoryPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { User } from '../App';
import { ShoppingBag } from 'lucide-react';

interface OrderHistoryPageProps {
  currentUser: User | null;
  onBackToHome: () => void;
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  shipping_address: string;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function OrderHistoryPage({ currentUser, onBackToHome }: OrderHistoryPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('OrderHistoryPage currentUser:', currentUser);
    if (!currentUser) {
      toast.error('ログインが必要です。');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/users/${currentUser.id}/orders`);
        if (!res.ok) {
          throw new Error('注文履歴の取得に失敗しました。');
        }
        const data = await res.json();
        console.log('Fetched order data:', data);
        setOrders(data);
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'shipped':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'delivered':
        return 'outline'; // Success variant might not exist, using outline
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
        case 'pending': return '処理中';
        case 'shipped': return '発送済み';
        case 'delivered': return '配達完了';
        case 'cancelled': return 'キャンセル済み';
        default: return status;
    }
  }


  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">注文履歴</CardTitle>
          <CardDescription>これまでのご注文内容を確認できます。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">読込中...</div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>注文ID</TableHead>
                    <TableHead>注文日</TableHead>
                    <TableHead>合計金額</TableHead>
                    <TableHead className="min-w-[250px]">配送先住所</TableHead>
                    <TableHead>配達状況</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>¥{order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{order.shipping_address}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">注文履歴はありません</h3>
              <p className="mt-1 text-sm text-gray-500">まだ何も注文していません。</p>
              <div className="mt-6">
                <Button onClick={onBackToHome}>お買い物を続ける</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

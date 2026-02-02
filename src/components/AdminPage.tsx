import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  Package,
  Users,
  ShoppingCart,
  RefreshCw,
  Save,
  Trash2,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Textarea } from './ui/textarea';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  last_login: string | null;
}

interface Order {
  id: number;
  user_name: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string | null;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  stock_quantity: number;
  price: number;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', price: 0, stock_quantity: 0, description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingStock, setEditingStock] = useState<{ [key: number]: number }>({});
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (user.phone_number && user.phone_number.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const fetchData = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/users`),
        fetch(`${apiUrl}/api/admin/orders`),
        fetch(`${apiUrl}/api/admin/products`)
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());

    } catch (error) {
      console.error("Failed to fetch admin data", error);
      if (!isBackground) {
        toast.error("データの取得に失敗しました");
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    // 30秒ごとにデータを自動更新
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleStockChange = (id: number, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setEditingStock(prev => ({ ...prev, [id]: num }));
    }
  };

  const saveStock = async (id: number) => {
    const newStock = editingStock[id];
    if (newStock === undefined) return;

    try {
        const res = await fetch(`${apiUrl}/api/admin/products/${id}/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock })
        });

        if (res.ok) {
            toast.success("在庫を更新しました");
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: newStock } : p));
            setEditingStock(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } else {
            throw new Error("Update failed");
        }
    } catch (error) {
        toast.error("在庫更新に失敗しました");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.brand || newProduct.price <= 0 || newProduct.stock_quantity < 0 || !imageFile) {
        toast.error("画像を含め、すべての項目を正しく入力してください。");
        return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('brand', newProduct.brand);
    formData.append('price', newProduct.price.toString());
    formData.append('stock_quantity', newProduct.stock_quantity.toString());
    formData.append('description', newProduct.description);
    formData.append('image', imageFile);

    try {
        const res = await fetch(`${apiUrl}/api/admin/products`, {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            toast.success("新商品を追加しました");
            fetchData();
            setNewProduct({ name: '', brand: '', price: 0, stock_quantity: 0, description: '' });
            setImageFile(null);
            (e.target as HTMLFormElement).reset();
        } else {
            const errorData = await res.json();
            throw new Error(errorData.message || "Add failed");
        }
    } catch (error: any) {
        toast.error(error.message || "商品追加に失敗しました");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("この商品を本当に削除しますか？")) return;

    try {
      const res = await fetch(`${apiUrl}/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("商品を削除しました");
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      toast.error("商品削除に失敗しました");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`${apiUrl}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          brand: editingProduct.brand,
          price: editingProduct.price,
        }),
      });

      if (res.ok) {
        toast.success("商品を更新しました");
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
        setIsEditDialogOpen(false);
        setEditingProduct(null);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast.error("商品更新に失敗しました");
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
        const res = await fetch(`${apiUrl}/api/admin/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            toast.success("注文ステータスを更新しました");
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } else {
            throw new Error("Update failed");
        }
    } catch (error) {
        toast.error("ステータス更新に失敗しました");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("このユーザーを本当に削除しますか？")) return;

    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("ユーザーを削除しました");
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        const errorData = await res.json();
        // 409 Conflict: 注文履歴がある場合
        if (res.status === 409 && errorData.canForceDelete) {
            if (window.confirm("このユーザーには注文履歴があります。履歴ごと完全に削除しますか？\n（この操作は取り消せません）")) {
                // 強制削除を実行
                const forceRes = await fetch(`${apiUrl}/api/admin/users/${id}?force=true`, {
                    method: 'DELETE',
                });
                
                if (forceRes.ok) {
                    toast.success("ユーザーと関連データを完全に削除しました");
                    setUsers(prev => prev.filter(u => u.id !== id));
                } else {
                    const forceError = await forceRes.json();
                    throw new Error(forceError.message || "Force delete failed");
                }
            }
        } else {
            throw new Error(errorData.message || "Delete failed");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "ユーザー削除に失敗しました");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">管理者ダッシュボード</h1>
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          更新
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex-nowrap w-max">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              注文管理
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              ユーザー管理
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              在庫管理
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 注文管理タブ */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>注文履歴</CardTitle>
              <CardDescription>最新の注文状況を確認できます。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>注文ID</TableHead>
                      <TableHead>顧客名</TableHead>
                      <TableHead className="min-w-[250px]">住所</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>注文日時</TableHead>
                      <TableHead className="min-w-[150px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>
                          <div>{order.user_name}</div>
                          <div className="text-xs text-gray-500 truncate">{order.user_email}</div>
                        </TableCell>
                        <TableCell>{order.shipping_address || '住所未登録'}</TableCell>
                        <TableCell>¥{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'shipped' ? 'default' : 'outline'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {order.status === 'pending' && (
                            <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}>
                              発送済みにする
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {orders.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              注文データがありません
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ユーザー管理タブ */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>登録ユーザー</CardTitle>
              <CardDescription>現在登録されているユーザーの一覧です。</CardDescription>
              <div className="mt-4">
                <Input
                  type="search"
                  placeholder="ユーザーを検索 (名前, メール, 電話番号)"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>名前</TableHead>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>電話番号</TableHead>
                      <TableHead className="min-w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone_number || '未登録'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            削除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                     {filteredUsers.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              ユーザーデータがありません
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 在庫管理タブ */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>新規商品登録</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNewProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="productName" className="text-sm font-medium">商品名</label>
                    <Input id="productName" placeholder="商品名" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                  </div>
                  <div>
                    <label htmlFor="brand" className="text-sm font-medium">ブランド</label>
                    <Input id="brand" placeholder="ブランド" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} required />
                  </div>
                  <div>
                    <label htmlFor="price" className="text-sm font-medium">価格</label>
                    <Input id="price" type="number" placeholder="価格" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value, 10) || 0 })} required />
                  </div>
                  <div>
                    <label htmlFor="stock" className="text-sm font-medium">在庫数</label>
                    <Input id="stock" type="number" placeholder="在庫数" value={newProduct.stock_quantity} onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value, 10) || 0 })} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="text-sm font-medium">商品説明</label>
                    <Textarea id="description" placeholder="商品の説明を入力..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                  </div>
                   <div className="sm:col-span-2">
                    <label htmlFor="image" className="text-sm font-medium">商品画像</label>
                    <Input id="image" type="file" onChange={handleFileChange} required />
                  </div>
                </div>
                <Button type="submit" className="w-full sm:w-auto">商品を登録</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>商品在庫</CardTitle>
              <CardDescription>商品の在庫数を確認・更新できます。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead>ブランド</TableHead>
                      <TableHead>価格</TableHead>
                      <TableHead>在庫数</TableHead>
                      <TableHead className="min-w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>¥{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                              <Input
                                  type="number"
                                  className="w-24 h-8"
                                  value={editingStock[product.id] !== undefined ? editingStock[product.id] : product.stock_quantity}
                                  onChange={(e) => handleStockChange(product.id, e.target.value)}
                              />
                              {editingStock[product.id] !== undefined && editingStock[product.id] !== product.stock_quantity && (
                                  <Button size="sm" onClick={() => saveStock(product.id)}>
                                      <Save className="h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>商品を編集</DialogTitle>
              <DialogDescription>
                商品情報を更新します。
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label htmlFor="editProductName" className="text-sm font-medium">商品名</label>
                <Input id="editProductName" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="editBrand" className="text-sm font-medium">ブランド</label>
                <Input id="editBrand" value={editingProduct.brand} onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })} />
              </div>
              <div>
                <label htmlFor="editPrice" className="text-sm font-medium">価格</label>
                <Input id="editPrice" type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })} />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">キャンセル</Button>
                </DialogClose>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

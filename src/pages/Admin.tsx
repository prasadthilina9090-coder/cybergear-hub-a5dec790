import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Package, ShoppingCart, Users, AlertTriangle, Plus, Pencil, Trash2, 
  Loader2, Search, ArrowLeft, Check, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Product, Order, ProductCategory, PcPartType, OrderStatus } from '@/types/database';

const categories: ProductCategory[] = ['pc', 'pc_parts', 'mobile', 'mobile_accessories'];
const pcPartTypes: PcPartType[] = ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'case', 'cooling'];
const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Admin() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setProducts((data || []) as unknown as Product[]);
    }
    setIsLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    setOrders((data || []) as unknown as Order[]);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setIsSaving(true);

    const productData = {
      name: editingProduct.name || '',
      description: editingProduct.description || null,
      price: editingProduct.price || 0,
      sale_price: editingProduct.sale_price || null,
      category: editingProduct.category || 'pc',
      pc_part_type: editingProduct.pc_part_type || null,
      brand: editingProduct.brand || null,
      model: editingProduct.model || null,
      image_url: editingProduct.image_url || null,
      stock_quantity: editingProduct.stock_quantity || 0,
      low_stock_threshold: editingProduct.low_stock_threshold || 10,
      specs: editingProduct.specs || {},
      compatibility_notes: editingProduct.compatibility_notes || null,
      is_featured: editingProduct.is_featured || false,
      is_active: editingProduct.is_active ?? true,
    };

    let error;
    if (editingProduct.id) {
      const result = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('products')
        .insert(productData);
      error = result.error;
    }

    if (error) {
      toast.error('Failed to save product');
      console.error(error);
    } else {
      toast.success(editingProduct.id ? 'Product updated' : 'Product created');
      setProductDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    }

    setIsSaving(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success('Order updated');
      fetchOrders();
    }
  };

  const lowStockProducts = products.filter(
    p => p.stock_quantity <= (p.low_stock_threshold || 10) && p.stock_quantity > 0 && p.category === 'pc_parts'
  );

  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    processing: 'bg-blue-500/20 text-blue-500',
    shipped: 'bg-purple-500/20 text-purple-500',
    delivered: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage your store</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/30">Administrator</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-500/10">
                <ShoppingCart className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert - PC Parts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map(p => (
                  <Badge key={p.id} variant="outline" className="border-yellow-500/50">
                    {p.name} ({p.stock_quantity} left)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>Add, edit, or remove products</CardDescription>
                  </div>
                  <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setEditingProduct({
                          is_active: true,
                          is_featured: false,
                          category: 'pc',
                          stock_quantity: 0,
                          price: 0,
                        })}
                        className="bg-primary text-primary-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle className="font-display">
                          {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[70vh] pr-4">
                        {editingProduct && (
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <Label>Name *</Label>
                                <Input
                                  value={editingProduct.name || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Category *</Label>
                                <Select
                                  value={editingProduct.category}
                                  onValueChange={(v) => setEditingProduct({ ...editingProduct, category: v as ProductCategory })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map(c => (
                                      <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {editingProduct.category === 'pc_parts' && (
                                <div>
                                  <Label>Part Type</Label>
                                  <Select
                                    value={editingProduct.pc_part_type || ''}
                                    onValueChange={(v) => setEditingProduct({ ...editingProduct, pc_part_type: v as PcPartType })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {pcPartTypes.map(t => (
                                        <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div>
                                <Label>Brand</Label>
                                <Input
                                  value={editingProduct.brand || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Model</Label>
                                <Input
                                  value={editingProduct.model || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Price *</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editingProduct.price || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Sale Price</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editingProduct.sale_price || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: parseFloat(e.target.value) || null })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Stock Quantity *</Label>
                                <Input
                                  type="number"
                                  value={editingProduct.stock_quantity || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Low Stock Threshold</Label>
                                <Input
                                  type="number"
                                  value={editingProduct.low_stock_threshold || 10}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, low_stock_threshold: parseInt(e.target.value) })}
                                  className="mt-1"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label>Image URL</Label>
                                <Input
                                  value={editingProduct.image_url || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={editingProduct.description || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label>Compatibility Notes</Label>
                                <Textarea
                                  value={editingProduct.compatibility_notes || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, compatibility_notes: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={editingProduct.is_featured || false}
                                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_featured: checked })}
                                  />
                                  <Label>Featured</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={editingProduct.is_active ?? true}
                                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_active: checked })}
                                  />
                                  <Label>Active</Label>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveProduct} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {editingProduct.id ? 'Update' : 'Create'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-secondary overflow-hidden">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{product.name}</p>
                                  {product.brand && (
                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {product.category.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <span className="font-medium">${(product.sale_price || product.price).toFixed(2)}</span>
                                {product.sale_price && (
                                  <span className="text-xs text-muted-foreground line-through ml-2">
                                    ${product.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`font-mono ${
                                product.stock_quantity === 0 
                                  ? 'text-destructive' 
                                  : product.stock_quantity <= (product.low_stock_threshold || 10)
                                  ? 'text-yellow-500'
                                  : 'text-foreground'
                              }`}>
                                {product.stock_quantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {product.is_active ? (
                                  <Badge className="bg-green-500/20 text-green-500 text-xs">Active</Badge>
                                ) : (
                                  <Badge className="bg-red-500/20 text-red-500 text-xs">Inactive</Badge>
                                )}
                                {product.is_featured && (
                                  <Badge className="bg-primary/20 text-primary text-xs">Featured</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Track and update order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              ${order.total_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[order.status]}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={order.status}
                                onValueChange={(v) => handleUpdateOrderStatus(order.id, v as OrderStatus)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatuses.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

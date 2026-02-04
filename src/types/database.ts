export type ProductCategory = 'pc' | 'pc_parts' | 'mobile' | 'mobile_accessories';
export type PcPartType = 'cpu' | 'gpu' | 'ram' | 'storage' | 'motherboard' | 'psu' | 'case' | 'cooling';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type AppRole = 'admin' | 'user';

export interface ProductSpecs {
  ram?: string;
  cpu?: string;
  storage?: string;
  gpu?: string;
  display?: string;
  battery?: string;
  socket?: string;
  chipset?: string;
  wattage?: string;
  formFactor?: string;
  speed?: string;
  capacity?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: ProductCategory;
  pc_part_type: PcPartType | null;
  brand: string | null;
  model: string | null;
  image_url: string | null;
  images: string[];
  stock_quantity: number;
  low_stock_threshold: number | null;
  specs: ProductSpecs;
  compatibility_notes: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

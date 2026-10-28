export interface Product {
  id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  promoType?: 'none' | 'percentage' | '2x1' | '3x2';
  stock: number;
  imageUrl: string;
  imageUrls?: string[];
  expirationDate?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  deliveryOption: 'pickup' | 'delivery';
  address?: string;
  paymentMethod: 'cash' | 'transfer';
}
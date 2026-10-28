export interface Product {
  id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  stock: number;
  imageUrl: string;
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
'use client';

import { useState } from 'react';
import { ShoppingCart, Search, Phone, MapPin } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { StickyCartBar } from '@/components/StickyCartBar';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

// Datos de ejemplo
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Shampoo TRESemmé 400ml',
    originalPrice: 15000,
    discountPrice: 10500,
    discountPercentage: 30,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Crema Hidratante Dermaglós 200ml',
    originalPrice: 12000,
    discountPrice: 6000,
    discountPercentage: 50,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Alcohol en Gel 500ml',
    originalPrice: 3000,
    discountPrice: 2100,
    discountPercentage: 30,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
  },
];

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { totalItems } = useCart();

  const filteredProducts = MOCK_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pb-24">
      {/* Header de la Farmacia */}
      <header className="bg-emerald-700 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-extrabold tracking-wide">FARMACIA SAN JOSÉ</h1>
          
          {/* Botón Carrito con Badge */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2 bg-emerald-800 rounded-full text-white active:scale-95 transition"
            aria-label="Ver Carrito"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-700">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <p className="text-xs text-emerald-100 flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3" /> Av. Principal 1234 • Ofertas del Canastito
        </p>

        {/* Buscador */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Buscar en oferta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 text-gray-900 bg-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-400"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>
      </header>

      {/* Banner Explicativo para Adultos Mayores */}
      <section className="bg-amber-50 border-b border-amber-200 p-3 text-amber-900 text-sm font-medium flex items-center justify-between">
        <span>🛒 Reservá tus productos y retirá por el local o pedí envío.</span>
      </section>

      {/* Grilla de Productos */}
      <section className="p-4 grid grid-cols-2 gap-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-2 text-center py-10 text-gray-500 font-medium">
            No encontramos ofertas con ese nombre.
          </div>
        )}
      </section>

      {/* Botón Flotante de Reserva */}
      <StickyCartBar onOpenDrawer={() => setIsDrawerOpen(true)} />

      {/* Drawer / Slider del Carrito */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </main>
  );
}
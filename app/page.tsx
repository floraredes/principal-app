'use client';

import { useState } from 'react';
import { ShoppingCart, Search, MapPin, Store } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { StickyCartBar } from '@/components/StickyCartBar';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Shampoo TRESemmé 400ml',
    originalPrice: 15000,
    discountPrice: 10500,
    discountPercentage: 30,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Crema Hidratante Dermaglós 200ml',
    originalPrice: 12000,
    discountPrice: 6000,
    discountPercentage: 50,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Alcohol en Gel 500ml',
    originalPrice: 3000,
    discountPrice: 2100,
    discountPercentage: 30,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
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
    <main className="min-h-screen pb-28 md:pb-16">
      {/* Header Responsive */}
      <header className="bg-emerald-800 text-white p-4 md:p-6 sticky top-0 z-30 shadow-md backdrop-blur-md bg-emerald-800/95">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Store className="w-7 h-7 text-amber-400 hidden sm:block" />
              <div>
                <h1 className="text-lg sm:text-2xl font-black tracking-wide">FARMACIA PRINCIPAL</h1>
                <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" /> Esteban Echeverría 394 • Canastito de Ofertas
                </p>
              </div>
            </div>

            {/* Botón Carrito Header */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-3 bg-emerald-900/80 hover:bg-emerald-900 rounded-2xl text-white transition active:scale-95 shadow-inner"
              aria-label="Ver Carrito"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-emerald-800 animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Buscador de Ancho Dinámico */}
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Buscar en el canastito de ofertas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-11 pr-4 text-slate-900 bg-white rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-amber-400/50 shadow-sm placeholder:text-slate-400 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </header>

      {/* Banner Informativo */}
      <section className="bg-amber-50/80 border-b border-amber-200/60 p-3.5 text-amber-950 text-sm font-semibold text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span>🛒 Reservá tus productos online y retirá por el local o pedí envío.</span>
        </div>
      </section>

      {/* Grilla Adaptativa: 2 cols en celular -> 5 cols en monitor PC */}
      <section className="p-4 sm:p-6 max-w-6xl mx-auto">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 font-semibold bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            No encontramos ofertas con ese nombre.
          </div>
        )}
      </section>

      {/* Botón Flotante */}
      <StickyCartBar onOpenDrawer={() => setIsDrawerOpen(true)} />

      {/* Slider Carrito */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </main>
  );
}
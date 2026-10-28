'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, MapPin, Store, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { StickyCartBar } from '@/components/StickyCartBar';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { totalItems } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando catálogo:', error);
      } else if (data) {
        const mappedProducts: Product[] = data.map((item) => {
          // Validación estricta para arreglos en JavaScript
          const hasMultipleImages = Array.isArray(item.image_urls) && item.image_urls.length > 0;
          
          return {
            id: item.id,
            name: item.name,
            originalPrice: item.original_price,
            discountPrice: item.discount_price,
            discountPercentage: item.discount_percentage,
            promoType: item.promo_type || 'percentage',
            stock: item.stock,
            imageUrl: item.image_url,
            imageUrls: hasMultipleImages ? item.image_urls : [item.image_url],
            expirationDate: item.expiration_date,
          };
        });
        setProducts(mappedProducts);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pb-28 md:pb-16">
      <header className="bg-emerald-800 text-white p-4 md:p-6 sticky top-0 z-30 shadow-md backdrop-blur-md bg-emerald-800/95">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Store className="w-7 h-7 text-amber-400 hidden sm:block" />
              <div>
                <h1 className="text-lg sm:text-2xl font-black tracking-wide">FARMACIA SAN JOSÉ</h1>
                <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" /> Av. Principal 1234 • Canastito de Ofertas
                </p>
              </div>
            </div>

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

      <section className="bg-amber-50/80 border-b border-amber-200/60 p-3.5 text-amber-950 text-sm font-semibold text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span>🛒 Reservá tus productos online y retirá por el local o pedí envío.</span>
        </div>
      </section>

      <section className="p-4 sm:p-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="font-semibold text-sm">Cargando ofertas del canastito...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filteredProducts.map((product, index) => (
              <ProductCard 
              key={product.id} 
              product={product}
              priority={index < 2}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 font-semibold bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            No hay ofertas disponibles en este momento.
          </div>
        )}
      </section>

      <StickyCartBar onOpenDrawer={() => setIsDrawerOpen(true)} />
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </main>
  );
}
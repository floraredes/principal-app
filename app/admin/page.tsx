'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Trash2, CheckSquare, Square, LogOut, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial de productos declarada internamente en useEffect
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error('Error cargando stock admin:', error);
      } else if (data) {
        const mappedProducts: Product[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          originalPrice: item.original_price,
          discountPrice: item.discount_price,
          discountPercentage: item.discount_percentage,
          stock: item.stock,
          imageUrl: item.image_url,
        }));
        setProducts(mappedProducts);
      }
      setLoading(false);
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Actualización rápida de stock con estado optimista
  const handleStockChange = async (id: string, delta: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const newStock = Math.max(0, target.stock + delta);

    // Actualización visual inmediata
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );

    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando stock:', error);
      // Revertir en caso de fallo de red
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: target.stock } : p))
      );
    }
  };

  // Eliminación múltiple con estado optimista
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.length} producto(s) seleccionado(s)?`)) return;

    const idsToDelete = [...selectedIds];

    // Remover visualmente de inmediato
    setProducts((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
    setSelectedIds([]);
    setIsSelectionMode(false);

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', idsToDelete);

    if (error) {
      alert('Error eliminando productos: ' + error.message);
      // Restaurar datos si la base de datos rechaza la operación
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            originalPrice: item.original_price,
            discountPrice: item.discount_price,
            discountPercentage: item.discount_percentage,
            stock: item.stock,
            imageUrl: item.image_url,
          }))
        );
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100/70 pb-20">
      <header className="bg-emerald-900 text-white p-4 sm:p-5 sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-black text-lg sm:text-xl">Principal SALE Admin</h1>
            <p className="text-xs text-emerald-200">Panel del Canastito</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
        <Link
          href="/admin/nuevo"
          className="w-full sm:w-auto sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 text-base transition active:scale-95"
        >
          <Plus className="w-5 h-5" /> Cargar Producto
        </Link>

        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds([]);
            }}
            className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition"
          >
            {isSelectionMode ? 'Cancelar' : 'Seleccionar'}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="font-semibold text-sm">Cargando productos de Supabase...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filtered.map((product, index) => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl p-3 border relative shadow-xs flex flex-col justify-between transition-all ${
                    isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40' : 'border-slate-200'
                  }`}
                >
                  {isSelectionMode && (
                    <button
                      onClick={() =>
                        setSelectedIds((prev) =>
                          prev.includes(product.id)
                            ? prev.filter((i) => i !== product.id)
                            : [...prev, product.id]
                        )
                      }
                      className="absolute top-2 right-2 z-10 bg-white rounded-lg p-1 shadow-xs"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  )}

                  <div>
                    <div className="bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-md w-fit mb-2">
                      {product.discountPercentage}% OFF
                    </div>

                    <div className="relative w-full h-28 sm:h-36 mb-2 rounded-xl overflow-hidden bg-slate-100">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        priority = {index < 2 }
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1">
                      ${product.discountPrice}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-xl px-2 py-1">
                    <button
                      onClick={() => handleStockChange(product.id, -1)}
                      className="w-8 h-8 flex items-center justify-center font-black text-red-600 text-lg hover:bg-red-50 rounded-lg active:scale-90"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-slate-800">
                      Stock: {product.stock}
                    </span>
                    <button
                      onClick={() => handleStockChange(product.id, 1)}
                      className="w-8 h-8 flex items-center justify-center font-black text-emerald-600 text-lg hover:bg-emerald-50 rounded-lg active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 font-semibold bg-white rounded-3xl border border-dashed border-slate-200">
            No hay productos cargados en el canastito.
          </div>
        )}
      </div>

      {isSelectionMode && selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30 animate-fadeIn">
          <button
            onClick={handleDeleteSelected}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-base transition active:scale-95"
          >
            <Trash2 className="w-5 h-5" /> Eliminar seleccionados ({selectedIds.length})
          </button>
        </div>
      )}
    </main>
  );
}
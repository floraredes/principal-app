'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Trash2, CheckSquare, Square, LogOut } from 'lucide-react';
import { Product } from '@/types';

const INITIAL_PRODUCTS: Product[] = [
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
    name: 'Crema Hidratante Dermaglós',
    originalPrice: 12000,
    discountPrice: 6000,
    discountPercentage: 50,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
  },
];

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleStockChange = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (confirm(`¿Eliminar ${selectedIds.length} productos seleccionados?`)) {
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100/70 pb-20">
      {/* TopBar Admin */}
      <header className="bg-emerald-900 text-white p-4 sm:p-5 sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-black text-lg sm:text-xl">Principal SALE Admin</h1>
            <p className="text-xs text-emerald-200">Panel del Canastito</p>
          </div>
          <Link
            href="/admin/login"
            className="p-2.5 bg-emerald-800 hover:bg-emerald-700 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Botón Cargar Nuevo */}
        <Link
          href="/admin/nuevo"
          className="w-full sm:w-auto sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 text-base transition active:scale-95"
        >
          <Plus className="w-5 h-5" /> Cargar Producto
        </Link>

        {/* Barra de Búsqueda y Selección */}
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

        {/* Grilla de Tarjetas Admin */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {filtered.map((product) => {
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
                    onClick={() => toggleSelectProduct(product.id)}
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

                {/* Controles de Stock Directos */}
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
      </div>

      {/* Botón Flotante de Eliminación */}
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
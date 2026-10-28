'use client';

import { useState } from 'react';
import useRouter from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Trash2, Edit, CheckSquare, Square, LogOut } from 'lucide-react';
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
    <main className="min-h-screen bg-gray-100 pb-20">
      {/* TopBar */}
      <header className="bg-emerald-800 text-white p-4 sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Principal SALE Admin</h1>
          <p className="text-xs text-emerald-200">Panel del Canastito</p>
        </div>
        <Link href="/admin/login" className="p-2 hover:bg-emerald-700 rounded-lg">
          <LogOut className="w-5 h-5" />
        </Link>
      </header>

      <div className="p-4 space-y-4">
        {/* Botón Cargar Nuevo */}
        <Link
          href="/admin/nuevo"
          className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-base active:scale-95 transition"
        >
          <Plus className="w-5 h-5" /> Cargar Producto
        </Link>

        {/* Barra de Filtros y Selección Múltiple */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-9 pr-3 text-sm bg-white border rounded-xl"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds([]);
            }}
            className="py-2 px-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700"
          >
            {isSelectionMode ? 'Cancelar' : 'Seleccionar'}
          </button>
        </div>

        {/* Lista de Tarjetas de Modificación Directa */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl p-3 border relative shadow-sm flex flex-col justify-between ${
                  isSelected ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'
                }`}
              >
                {/* Selector Múltiple Checkbox */}
                {isSelectionMode && (
                  <button
                    onClick={() => toggleSelectProduct(product.id)}
                    className="absolute top-2 right-2 z-10 bg-white rounded-md p-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                )}

                <div>
                  <div className="bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded w-fit mb-1">
                    {product.discountPercentage}% OFF
                  </div>

                  <div className="relative w-full h-24 mb-2 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h3 className="font-semibold text-xs text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-emerald-700 mt-1">
                    ${product.discountPrice}
                  </p>
                </div>

                {/* Controles Directos de Stock + / - */}
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-xl px-2 py-1">
                  <button
                    onClick={() => handleStockChange(product.id, -1)}
                    className="w-7 h-7 flex items-center justify-center font-bold text-red-600 text-base"
                  >
                    -
                  </button>
                  <span className="text-xs font-extrabold">
                    Stock: {product.stock}
                  </span>
                  <button
                    onClick={() => handleStockChange(product.id, 1)}
                    className="w-7 h-7 flex items-center justify-center font-bold text-emerald-600 text-base"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de Eliminación Múltiple Flotante */}
      {isSelectionMode && selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={handleDeleteSelected}
            className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-base active:scale-95 transition"
          >
            <Trash2 className="w-5 h-5" /> Eliminar seleccionados ({selectedIds.length})
          </button>
        </div>
      )}
    </main>
  );
}
'use client';

import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, removeItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <div className="border border-slate-200/80 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div>
        {/* Banner de Descuento con degradado */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg w-fit mb-2 shadow-xs group-hover:scale-105 transition-transform">
          {product.discountPercentage}% OFF
        </div>

        {/* Contenedor de la Imagen */}
        <div className="relative w-full h-32 sm:h-40 md:h-44 mb-3 rounded-xl overflow-hidden bg-slate-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Nombre y Precio */}
        <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xs sm:text-sm text-slate-400 line-through">
            ${product.originalPrice}
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-600">
            ${product.discountPrice}
          </span>
        </div>
      </div>

      {/* Controles de Cantidad */}
      <div className="mt-4">
        {quantity === 0 ? (
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {product.stock > 0 ? 'Agregar' : 'Agotado'}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-500/80 rounded-xl px-2 py-1 shadow-xs animate-fadeIn">
            <button
              onClick={() => removeItem(product.id)}
              className="w-9 h-9 flex items-center justify-center font-black text-emerald-800 text-lg hover:bg-emerald-100 rounded-lg active:scale-90 transition"
              aria-label="Restar unidad"
            >
              -
            </button>
            <span className="font-black text-emerald-950 text-base sm:text-lg">
              {quantity}
            </span>
            <button
              onClick={() => addItem(product)}
              disabled={quantity >= product.stock}
              className="w-9 h-9 flex items-center justify-center font-black text-emerald-800 text-lg hover:bg-emerald-100 rounded-lg active:scale-90 disabled:opacity-30 transition"
              aria-label="Sumar unidad"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
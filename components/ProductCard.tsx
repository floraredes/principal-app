'use client';

import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, removeItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <div className="border border-gray-200 rounded-2xl p-3 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition">
      <div>
        {/* Banner de Descuento */}
        <div className="bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-md w-fit mb-2">
          {product.discountPercentage}% OFF
        </div>

        {/* Contenedor con altura definida (h-32) e Imagen */}
        <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
          />
        </div>

        {/* Nombre y Precio */}
        <h3 className="font-semibold text-gray-800 text-base line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-1">
          <span className="text-xs text-gray-400 line-through mr-2">
            ${product.originalPrice}
          </span>
          <span className="text-lg font-bold text-emerald-600">
            ${product.discountPrice}
          </span>
        </div>
      </div>

      {/* Selector + / - o Botón Agregar */}
      <div className="mt-3">
        {quantity === 0 ? (
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm active:scale-95 transition disabled:bg-gray-300"
          >
            {product.stock > 0 ? 'Agregar' : 'Agotado'}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-500 rounded-xl px-2 py-1">
            <button
              onClick={() => removeItem(product.id)}
              className="w-8 h-8 flex items-center justify-center font-bold text-emerald-700 text-lg active:scale-90"
            >
              -
            </button>
            <span className="font-bold text-emerald-900 text-base">
              {quantity}
            </span>
            <button
              onClick={() => addItem(product)}
              disabled={quantity >= product.stock}
              className="w-8 h-8 flex items-center justify-center font-bold text-emerald-700 text-lg active:scale-90 disabled:opacity-30"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { cart, addItem, removeItem, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fondo semitransparente */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel Deslizante (Drawer) */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10">
        
        {/* Header del Carrito */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
            aria-label="Cerrar carrito"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
              <p className="text-lg font-semibold text-gray-700">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500">
                Agregá ofertas del canastito para comenzar tu reserva.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 items-center pb-3 border-b border-gray-100">
                {/* Imagen */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                />
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {item.product.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-bold text-emerald-700">
                      ${item.product.discountPrice * item.quantity}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-gray-400">
                        (${item.product.discountPrice} c/u)
                      </span>
                    )}
                  </div>

                  {/* Selector + / - */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center border border-emerald-500 rounded-lg bg-emerald-50 px-2 py-0.5">
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-7 h-7 flex items-center justify-center text-emerald-800 font-bold text-base active:scale-90"
                      >
                        -
                      </button>
                      <span className="font-bold text-emerald-950 text-sm px-2">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addItem(item.product)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 flex items-center justify-center text-emerald-800 font-bold text-base active:scale-90 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subtotal y Botón "Hacer pedido" */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white space-y-3 shadow-lg">
            <div className="flex justify-between items-center text-gray-700">
              <span className="text-base font-semibold">Subtotal</span>
              <span className="text-xl font-extrabold text-emerald-800">
                ${totalPrice}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-5 rounded-2xl shadow-md flex items-center justify-between text-base active:scale-[0.98] transition"
            >
              <span>Hacer pedido</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
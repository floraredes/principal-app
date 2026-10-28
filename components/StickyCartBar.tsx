'use client';

import { useCart } from '@/context/CartContext';

interface StickyCartBarProps {
  onOpenDrawer: () => void;
}

export function StickyCartBar({ onOpenDrawer }: StickyCartBarProps) {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40">
      <button
        onClick={onOpenDrawer}
        className="w-full bg-emerald-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg flex items-center justify-between active:scale-[0.98] transition"
      >
        <div className="flex items-center gap-2">
          <span className="bg-emerald-800 text-white text-xs px-2.5 py-1 rounded-full">
            {totalItems}
          </span>
          <span className="text-base">Reservar ahora</span>
        </div>
        <span className="text-lg">${totalPrice}</span>
      </button>
    </div>
  );
}
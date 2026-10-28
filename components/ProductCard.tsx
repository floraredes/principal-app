'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { Product } from '@/types';
import { useCart, getCartItemSubtotal } from '@/context/CartContext';

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { addItem, removeItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const images =
    Array.isArray(product.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDoubleZoom, setIsDoubleZoom] = useState(false);

  const handleOpenZoom = () => {
    setActiveImageIndex(0);
    setIsDoubleZoom(false);
    setIsZoomOpen(true);
  };

  const handleCloseZoom = () => {
    setIsZoomOpen(false);
    setIsDoubleZoom(false);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDoubleZoom(false);
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDoubleZoom(false);
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const is2x1 = product.promoType === '2x1';
  const is3x2 = product.promoType === '3x2';

  return (
    <>
      <div className="border border-slate-200/80 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div>
          {/* Badge de Promoción */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg w-fit mb-2 shadow-xs group-hover:scale-105 transition-transform">
            {is2x1 ? 'PROMO 2x1' : is3x2 ? 'PROMO 3x2' : `${product.discountPercentage}% OFF`}
          </div>

          {/* Contenedor de Imagen */}
          <div
            onClick={handleOpenZoom}
            className="relative w-full h-32 sm:h-40 md:h-44 mb-3 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group/img"
            title="Toca para ver las fotos y ampliar"
          >
            <Image
              src={images[0] || product.imageUrl}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
              className="object-cover group-hover/img:scale-105 transition-transform duration-500"
            />
            {images.length > 1 && (
              <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
                1/{images.length} fotos
              </span>
            )}
            <div className="absolute bottom-2 right-2 bg-slate-900/60 text-white p-1.5 rounded-lg opacity-80 sm:opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-xs">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>

          {/* Nombre */}
          <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Visualización de Precios Adaptativo */}
          <div className="mt-2">
            {is2x1 ? (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-600">
                    ${product.originalPrice}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">c/u</span>
                </div>
                <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 rounded-md px-1.5 py-0.5 mt-1 w-fit">
                  Llevá 2 por ${product.originalPrice}
                </p>
              </div>
            ) : is3x2 ? (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-600">
                    ${product.originalPrice}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">c/u</span>
                </div>
                <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 rounded-md px-1.5 py-0.5 mt-1 w-fit">
                  Llevá 3 por ${product.originalPrice * 2}
                </p>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xs sm:text-sm text-slate-400 line-through">
                  ${product.originalPrice}
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-600">
                  ${product.discountPrice}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controles de Carrito */}
        <div className="mt-4">
          {quantity === 0 ? (
            <button
              onClick={() => addItem(product)}
              disabled={product.stock === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400"
            >
              {product.stock > 0 ? (is2x1 ? 'Agregar 2x1' : is3x2 ? 'Agregar 3x2' : 'Agregar') : 'Agotado'}
            </button>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-500/80 rounded-xl px-2 py-1 shadow-xs animate-fadeIn">
                <button
                  onClick={() => removeItem(product.id)}
                  className="w-9 h-9 flex items-center justify-center font-black text-emerald-800 text-lg hover:bg-emerald-100 rounded-lg active:scale-90 transition"
                  aria-label="Restar unidad"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="font-black text-emerald-950 text-base sm:text-lg block leading-none">
                    {quantity}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Subtotal: ${getCartItemSubtotal({ product, quantity })}
                  </span>
                </div>
                <button
                  onClick={() => addItem(product)}
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 flex items-center justify-center font-black text-emerald-800 text-lg hover:bg-emerald-100 rounded-lg active:scale-90 disabled:opacity-30 transition"
                  aria-label="Sumar unidad"
                >
                  +
                </button>
              </div>

              {/* Sugerencia cuando falta 1 unidad para completar la oferta */}
              {is2x1 && quantity % 2 !== 0 && quantity < product.stock && (
                <p className="text-[11px] font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 rounded-lg px-2 py-1 text-center animate-pulse flex items-center justify-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-700 shrink-0" /> ¡Sumá 1 más y va GRATIS!
                </p>
              )}
              {is3x2 && quantity % 3 !== 0 && quantity < product.stock && (
                <p className="text-[11px] font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 rounded-lg px-2 py-1 text-center animate-pulse flex items-center justify-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-700 shrink-0" /> Sumá {3 - (quantity % 3)} para la promo 3x2
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visor Modal de Fotos Ampliadas */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-all"
          onClick={handleCloseZoom}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseZoom();
            }}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all active:scale-90 z-30 shadow-lg cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>

          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-3 sm:left-6 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full z-30 backdrop-blur-md transition active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              onClick={() => setIsDoubleZoom(!isDoubleZoom)}
              className={`relative transition-transform duration-300 select-none ${
                isDoubleZoom ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
              }`}
            >
              <img
                src={images[activeImageIndex]}
                alt={`${product.name} - Foto ${activeImageIndex + 1}`}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-3 sm:right-6 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full z-30 backdrop-blur-md transition active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          <div className="absolute bottom-6 flex flex-col items-center gap-1 pointer-events-none z-20">
            {images.length > 1 && (
              <div className="bg-slate-900/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md border border-white/10 font-bold mb-1">
                Foto {activeImageIndex + 1} de {images.length}
              </div>
            )}
            <div className="bg-slate-900/80 text-white/90 text-xs sm:text-sm px-4 py-1.5 rounded-full backdrop-blur-md font-medium border border-white/10">
              Toca la foto para {isDoubleZoom ? 'alejar' : 'ampliar más'} • Toca fuera o [X] para salir
            </div>
          </div>
        </div>
      )}
    </>
  );
}
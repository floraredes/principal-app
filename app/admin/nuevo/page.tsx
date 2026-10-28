'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Check } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [stock, setStock] = useState<number>(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Cálculo automático del Precio Final
  const finalPrice =
    originalPrice && discountPercent
      ? Math.round(Number(originalPrice) * (1 - Number(discountPercent) / 100))
      : originalPrice || 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !originalPrice) {
      alert('Por favor completa el nombre y el precio.');
      return;
    }
    alert('¡Producto publicado con éxito en el canastito!');
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-white pb-8">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Cargar Producto</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* 1. Nombre */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            1. Nombre del producto *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Shampoo TRESemmé 400ml"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3.5 border rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* 2. Foto del producto */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            2. Foto del producto
          </label>
          <label className="border-2 border-dashed border-gray-300 rounded-2xl h-36 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 gap-1">
                <Camera className="w-8 h-8" />
                <span className="text-xs font-semibold">Tomar foto o subir de galería</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* 3 y 4. Precio y Descuento */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              3. Precio Lista ($) *
            </label>
            <input
              type="number"
              required
              placeholder="15000"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
              className="w-full p-3.5 border rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              4. Descuento (%)
            </label>
            <input
              type="number"
              placeholder="30"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full p-3.5 border rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Visualización Precio Final Calculado */}
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl flex justify-between items-center">
          <span className="text-sm font-bold text-emerald-900">Precio Final Calculado:</span>
          <span className="text-xl font-black text-emerald-700">${finalPrice}</span>
        </div>

        {/* 5. Cantidad Stock Inicial */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            5. Cantidad en Canastito
          </label>
          <div className="flex items-center justify-between border rounded-xl p-2 w-full max-w-[200px]">
            <button
              type="button"
              onClick={() => setStock(Math.max(1, stock - 1))}
              className="w-10 h-10 bg-gray-100 rounded-lg text-xl font-bold active:scale-90"
            >
              -
            </button>
            <span className="text-xl font-bold">{stock}</span>
            <button
              type="button"
              onClick={() => setStock(stock + 1)}
              className="w-10 h-10 bg-gray-100 rounded-lg text-xl font-bold active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        {/* Botón Publicar */}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg active:scale-98 transition pt-3"
        >
          <Check className="w-6 h-6" /> Publicar en Canastito
        </button>
      </form>
    </main>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [stock, setStock] = useState<number>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finalPrice =
    originalPrice && discountPercent
      ? Math.round(Number(originalPrice) * (1 - Number(discountPercent) / 100))
      : Number(originalPrice) || 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !originalPrice || !imageFile) {
      alert('Por favor completa el nombre, precio lista y selecciona una foto del producto.');
      return;
    }

    setLoading(true);

    try {
      // 1. Subir la imagen a Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública de la imagen subida
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Insertar el registro en la tabla products
      const { error: insertError } = await supabase.from('products').insert([
        {
          name,
          original_price: Number(originalPrice),
          discount_price: finalPrice,
          discount_percentage: Number(discountPercent) || 0,
          stock: Number(stock),
          image_url: imageUrl,
          is_active: true,
        },
      ]);

      if (insertError) throw insertError;

      alert('¡Producto publicado con éxito en el canastito!');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      alert('Error al guardar el producto: ' + (err as Error).message || 'Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-8">
      <header className="bg-white border-b border-slate-200/80 p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Cargar Producto</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1">
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

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1">
            2. Foto del producto *
          </label>
          <label className="border-2 border-dashed border-slate-300 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 overflow-hidden relative transition">
            {imagePreview ? (
              <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-slate-400 gap-1">
                <Camera className="w-8 h-8" />
                <span className="text-xs font-semibold">Tomar foto o elegir de la galería</span>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
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
            <label className="block text-sm font-bold text-slate-800 mb-1">
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

        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl flex justify-between items-center">
          <span className="text-sm font-bold text-emerald-900">Precio Final Calculado:</span>
          <span className="text-xl font-black text-emerald-700">${finalPrice}</span>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1">
            5. Cantidad en Canastito
          </label>
          <div className="flex items-center justify-between border rounded-xl p-2 w-full max-w-[200px]">
            <button
              type="button"
              onClick={() => setStock(Math.max(1, stock - 1))}
              className="w-10 h-10 bg-slate-100 rounded-lg text-xl font-bold active:scale-90"
            >
              -
            </button>
            <span className="text-xl font-bold">{stock}</span>
            <button
              type="button"
              onClick={() => setStock(stock + 1)}
              className="w-10 h-10 bg-slate-100 rounded-lg text-xl font-bold active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg active:scale-98 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> Guardando en Supabase...
            </>
          ) : (
            <>
              <Check className="w-6 h-6" /> Publicar en Canastito
            </>
          )}
        </button>
      </form>
    </main>
  );
}
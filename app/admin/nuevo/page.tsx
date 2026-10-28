'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Trash2, UploadCloud, Copy, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [promoType, setPromoType] = useState<'percentage' | '2x1' | '3x2'>('percentage');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [stock, setStock] = useState<number>(1);

  // Estados para múltiples archivos e imágenes
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cálculo de precio final o valor efectivo según el tipo de promoción
  const calculatedDiscountPercent =
    promoType === '2x1'
      ? 50
      : promoType === '3x2'
      ? 33
      : Number(discountPercent) || 0;

  const finalPrice =
    promoType === 'percentage' && originalPrice && discountPercent
      ? Math.round(Number(originalPrice) * (1 - Number(discountPercent) / 100))
      : Number(originalPrice) || 0;

  // Agregar archivos limitados a un máximo de 3
  const addFiles = useCallback((filesToAdd: File[]) => {
    const validImages = filesToAdd.filter((file) => file.type.startsWith('image/'));
    if (validImages.length === 0) return;

    setImageFiles((prevFiles) => {
      const combined = [...prevFiles, ...validImages].slice(0, 3);
      setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
      return combined;
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles((prev) => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      setImagePreviews(updated.map((f) => URL.createObjectURL(f)));
      return updated;
    });
  };

  // Handlers para Drag & Drop (Arrastrar y Soltar)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Evento global para Pegar imágenes (Ctrl + V / Cmd + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        addFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !originalPrice || imageFiles.length === 0) {
      alert('Por favor completa el nombre, precio y al menos 1 foto del producto.');
      return;
    }

    if (promoType === 'percentage' && !discountPercent) {
      alert('Por favor ingresa un porcentaje de descuento válido.');
      return;
    }

    setLoading(true);

    try {
      // 1. Subir todas las fotos en paralelo a Supabase Storage
      const uploadPromises = imageFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // 2. Insertar en la tabla products
      const { error: insertError } = await supabase.from('products').insert([
        {
          name,
          original_price: Number(originalPrice),
          discount_price: finalPrice,
          discount_percentage: calculatedDiscountPercent,
          promo_type: promoType,
          stock: Number(stock),
          image_url: uploadedUrls[0], // Foto principal
          image_urls: uploadedUrls,   // Lista de hasta 3 fotos
          is_active: true,
        },
      ]);

      if (insertError) throw insertError;

      alert('¡Producto publicado con éxito en el canastito!');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Intente nuevamente.';
      alert('Error al guardar el producto: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-12">
      <header className="bg-white border-b border-slate-200/80 p-4 flex items-center gap-3 sticky top-0 z-10 shadow-xs">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Cargar Producto</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-6">
        {/* 1. Nombre */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <label className="block text-sm font-bold text-slate-800">
            1. Nombre del producto *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Shampoo TRESemmé 400ml"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3.5 border border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
          />
        </div>

        {/* 2. Carga de Fotos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-800">
              2. Fotos del producto ({imageFiles.length}/3) *
            </label>
            <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1 font-medium">
              <Copy className="w-3.5 h-3.5" /> Pegá con Ctrl + V
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/80 hover:bg-slate-100/80'
            }`}
          >
            {imageFiles.length < 3 ? (
              <label className="w-full flex flex-col items-center justify-center cursor-pointer py-4">
                <UploadCloud className="w-10 h-10 text-slate-400 mb-2 animate-pulse" />
                <span className="text-sm font-bold text-slate-700 text-center">
                  Arrastrá fotos acá, pegá con Ctrl + V o hacé click
                </span>
                <span className="text-xs text-slate-400 mt-1 font-medium">
                  Máximo 3 fotos por producto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <p className="text-xs font-bold text-emerald-700 py-2">
                ¡Llegaste al límite de 3 fotos para este producto!
              </p>
            )}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 w-full mt-3 pt-3 border-t border-slate-200">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden h-24 bg-slate-200 border border-slate-300">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 transition"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Precios y Promociones */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" /> 3. Precio y Tipo de Oferta
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Precio Lista ($) *
              </label>
              <input
                type="number"
                required
                placeholder="15000"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-3.5 border border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Tipo de Promoción
              </label>
              <select
                value={promoType}
                onChange={(e) => {
                  const val = e.target.value as 'percentage' | '2x1' | '3x2';
                  setPromoType(val);
                  if (val !== 'percentage') {
                    setDiscountPercent('');
                  }
                }}
                className="w-full p-3.5 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800 text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              >
                <option value="percentage">Descuento Porcentual (% OFF)</option>
                <option value="2x1">Llevá 2, Pagá 1 (2x1)</option>
                <option value="3x2">Llevá 3, Pagá 2 (3x2)</option>
              </select>
            </div>
          </div>

          {promoType === 'percentage' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Descuento (%) *
              </label>
              <input
                type="number"
                required
                placeholder="30"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-3.5 border border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>
          )}

          {/* Resumen Calculado */}
          <div className="bg-emerald-50/80 border border-emerald-300/80 p-4 rounded-2xl flex justify-between items-center">
            <span className="text-sm font-bold text-emerald-900">
              {promoType === '2x1' && 'Promoción Llevá 2, Pagá 1'}
              {promoType === '3x2' && 'Promoción Llevá 3, Pagá 2'}
              {promoType === 'percentage' && 'Precio Final Calculado:'}
            </span>
            <span className="text-xl font-black text-emerald-700">
              {promoType === 'percentage' ? `$${finalPrice}` : 'Activa'}
            </span>
          </div>
        </div>

        {/* 4. Stock */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <label className="block text-sm font-bold text-slate-800">
            4. Cantidad en Canastito
          </label>
          <div className="flex items-center justify-between border border-slate-300 rounded-2xl p-2 w-full max-w-[200px] bg-slate-50">
            <button
              type="button"
              onClick={() => setStock(Math.max(1, stock - 1))}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl text-xl font-black active:scale-90 shadow-xs transition"
            >
              -
            </button>
            <span className="text-xl font-black text-slate-900">{stock}</span>
            <button
              type="button"
              onClick={() => setStock(stock + 1)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl text-xl font-black active:scale-90 shadow-xs transition"
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
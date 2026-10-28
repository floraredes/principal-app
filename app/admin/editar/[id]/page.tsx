'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Trash2, UploadCloud, Copy, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [promoType, setPromoType] = useState<'percentage' | '2x1' | '3x2'>('percentage');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [stock, setStock] = useState<number>(1);
  const [expirationDate, setExpirationDate] = useState<string>('');

  // Manejo de fotos (Existentes + Nuevas)
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  // Carga inicial de datos del producto
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!isMounted) return;

      if (error || !data) {
        alert('No se encontró el producto a editar.');
        router.push('/admin');
        return;
      }

      setName(data.name || '');
      setOriginalPrice(data.original_price || '');
      setPromoType(data.promo_type || 'percentage');
      setDiscountPercent(data.discount_percentage || '');
      setStock(data.stock ?? 1);
      setExpirationDate(data.expiration_date || '');

      const urls = Array.isArray(data.image_urls) && data.image_urls.length > 0
        ? data.image_urls
        : data.image_url ? [data.image_url] : [];

      setExistingUrls(urls);
      setLoadingFetch(false);
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  // Cálculos de descuento
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

  const totalPhotosCount = existingUrls.length + newImageFiles.length;

  const addFiles = useCallback((filesToAdd: File[]) => {
    const validImages = filesToAdd.filter((file) => file.type.startsWith('image/'));
    if (validImages.length === 0) return;

    const availableSlots = 3 - existingUrls.length;
    if (availableSlots <= 0) {
      alert('Ya alcanzaste el límite de 3 fotos. Elimina una existente para agregar otra.');
      return;
    }

    setNewImageFiles((prevFiles) => {
      const combined = [...prevFiles, ...validImages].slice(0, availableSlots);
      setNewImagePreviews(combined.map((f) => URL.createObjectURL(f)));
      return combined;
    });
  }, [existingUrls.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles((prev) => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      setNewImagePreviews(updated.map((f) => URL.createObjectURL(f)));
      return updated;
    });
  };

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
    if (!name || !originalPrice || totalPhotosCount === 0) {
      alert('Por favor completa el nombre, precio y al menos 1 foto del producto.');
      return;
    }

    if (promoType === 'percentage' && !discountPercent) {
      alert('Por favor ingresa un porcentaje de descuento válido.');
      return;
    }

    setLoadingSave(true);

    try {
      // 1. Subir las fotos nuevas a Supabase Storage
      const uploadPromises = newImageFiles.map(async (file) => {
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

      const uploadedNewUrls = await Promise.all(uploadPromises);
      const allImageUrls = [...existingUrls, ...uploadedNewUrls];

      // 2. Actualizar el registro en Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          original_price: Number(originalPrice),
          discount_price: finalPrice,
          discount_percentage: calculatedDiscountPercent,
          promo_type: promoType,
          stock: Number(stock),
          image_url: allImageUrls[0],
          image_urls: allImageUrls,
          expiration_date: expirationDate || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert('¡Producto actualizado con éxito!');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Intente nuevamente.';
      alert('Error al actualizar el producto: ' + message);
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="font-semibold text-slate-600">Cargando datos del producto...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 pb-12">
      <header className="bg-white border-b border-slate-200/80 p-4 flex items-center gap-3 sticky top-0 z-10 shadow-xs">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Editar Producto</h1>
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

        {/* 2. Fotos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-800">
              2. Fotos del producto ({totalPhotosCount}/3) *
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
            {totalPhotosCount < 3 ? (
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

            {/* Galería de Fotos Existentes y Nuevas */}
            {(existingUrls.length > 0 || newImagePreviews.length > 0) && (
              <div className="grid grid-cols-3 gap-3 w-full mt-3 pt-3 border-t border-slate-200">
                {/* Fotos Guardadas en Supabase */}
                {existingUrls.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group rounded-xl overflow-hidden h-24 bg-slate-200 border border-slate-300">
                    <img src={url} alt={`Existente ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
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

                {/* Fotos Nuevas Seleccionadas */}
                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group rounded-xl overflow-hidden h-24 bg-emerald-50 border border-emerald-400">
                    <img src={preview} alt={`Nueva ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 transition"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                      Nueva
                    </span>
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

        {/* 4. Stock y Fecha de Vencimiento */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                4. Stock en Canastito
              </label>
              <div className="flex items-center justify-between border border-slate-300 rounded-2xl p-2 w-full bg-slate-50">
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

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Fecha de Vencimiento (Opcional)
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition bg-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loadingSave}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg active:scale-98 transition disabled:opacity-50"
        >
          {loadingSave ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> Guardando Cambios...
            </>
          ) : (
            <>
              <Check className="w-6 h-6" /> Guardar Cambios
            </>
          )}
        </button>
      </form>
    </main>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CheckoutFormData } from '@/types';
import { generateWhatsAppLink } from '@/lib/whatsapp';

const PHARMACY_WHATSAPP_NUMBER = '5493816853413';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    deliveryOption: 'pickup',
    address: '',
    paymentMethod: 'cash',
  });

  if (cart.length === 0) {
    return (
      <div className="p-6 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-slate-600 mb-4 font-bold">El carrito está vacío</p>
        <button
          onClick={() => router.push('/')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Por favor completá tu nombre y teléfono.');
      return;
    }
    if (formData.deliveryOption === 'delivery' && !formData.address) {
      alert('Por favor ingresá tu dirección de envío.');
      return;
    }

    const whatsappUrl = generateWhatsAppLink(
      PHARMACY_WHATSAPP_NUMBER,
      cart,
      totalPrice,
      formData
    );

    window.open(whatsappUrl, '_blank');
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Finalizar Reserva</h1>
        </div>
      </header>

      {/* Formulario en Layout Adaptativo */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 sm:p-6 lg:grid lg:grid-cols-3 lg:gap-8 items-start space-y-6 lg:space-y-0">
        
        {/* Columna Izquierda (Pasos) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Datos Personales */}
          <section className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 1. Tus Datos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3.5 border rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 3814123456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3.5 border rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>
          </section>

          {/* 2. Entrega */}
          <section className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 2. Forma de Entrega
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryOption: 'pickup' })}
                className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition ${
                  formData.deliveryOption === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Retiro en Local
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryOption: 'delivery' })}
                className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition ${
                  formData.deliveryOption === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Envío a Domicilio
              </button>
            </div>

            {formData.deliveryOption === 'delivery' && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Dirección de Envío *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Calle, número y barrio"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3.5 border rounded-2xl text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
            )}
          </section>

          {/* 3. Pago */}
          <section className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 3. Forma de Pago
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition ${
                  formData.paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
                className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition ${
                  formData.paymentMethod === 'transfer'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Transferencia
              </button>
            </div>
          </section>
        </div>

        {/* Columna Derecha (Resumen Fijo en Escritorio) */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <section className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
            <h2 className="text-base font-black text-slate-900 border-b pb-2">Resumen del Pedido</h2>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    ${item.product.discountPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between text-xl font-black text-emerald-800">
              <span>Total:</span>
              <span>${totalPrice}</span>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg active:scale-98 transition-all"
            >
              <Send className="w-5 h-5" />
              Pedir por WhatsApp
            </button>
          </section>
        </div>
      </form>
    </main>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CheckoutFormData } from '@/types';
import { generateWhatsAppLink } from '@/lib/whatsapp';

const PHARMACY_WHATSAPP_NUMBER = '5493810000000'; // Reemplazar por el número real

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
        <p className="text-lg text-gray-600 mb-4 font-semibold">El carrito está vacío</p>
        <button
          onClick={() => router.push('/')}
          className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl"
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
      alert('Por favor ingresá tu dirección para el envío.');
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
    <main className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Finalizar Reserva</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Datos Personales */}
        <section className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-800 border-b pb-2">1. Tus Datos</h2>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nombre y Apellido *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-3 border rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              required
              placeholder="Ej. 3814123456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </section>

        {/* Forma de Entrega */}
        <section className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-800 border-b pb-2">2. Forma de Entrega</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryOption: 'pickup' })}
              className={`p-3 rounded-xl border-2 font-bold text-sm transition ${
                formData.deliveryOption === 'pickup'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              Lo retiro en el local
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliveryOption: 'delivery' })}
              className={`p-3 rounded-xl border-2 font-bold text-sm transition ${
                formData.deliveryOption === 'delivery'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              Envío a Domicilio
            </button>
          </div>

          {/* Campo Condicional de Dirección */}
          {formData.deliveryOption === 'delivery' && (
            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Dirección Completa *
              </label>
              <input
                type="text"
                required
                placeholder="Calle, número y barrio"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}
        </section>

        {/* Forma de Pago */}
        <section className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-800 border-b pb-2">3. Forma de Pago</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
              className={`p-3 rounded-xl border-2 font-bold text-sm transition ${
                formData.paymentMethod === 'cash'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
              className={`p-3 rounded-xl border-2 font-bold text-sm transition ${
                formData.paymentMethod === 'transfer'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              Transferencia
            </button>
          </div>
        </section>

        {/* Resumen del Pedido */}
        <section className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <h2 className="text-base font-bold text-gray-800 border-b pb-2">Resumen</h2>
          {cart.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-700">
                {item.quantity}x {item.product.name}
              </span>
              <span className="font-bold">
                ${item.product.discountPrice * item.quantity}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between text-lg font-extrabold text-emerald-800">
            <span>Total a pagar:</span>
            <span>${totalPrice}</span>
          </div>
        </section>

        {/* Botón Acción Principal */}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg active:scale-98 transition"
        >
          <Send className="w-5 h-5" />
          Pedir por WhatsApp
        </button>
      </form>
    </main>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function WhatsAppFloatingButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  // Muestra el globo de texto unos segundos al entrar a la página (opcional, para captar atención)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2000); // Aparece a los 2 segundos

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 7000); // Se oculta a los 7 segundos automáticamente

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Tooltip / Globo de texto */}
      <div 
        className={`bg-white text-slate-800 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-2xl shadow-xl border border-emerald-100 transition-all duration-500 transform origin-bottom-right pointer-events-auto ${
          showTooltip ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-4'
        }`}
      >
        <div className="relative">
          ¡Hola! ¿Buscás algo especial? Escribinos. 👇
          {/* Triángulo inferior del globo de texto */}
          <div className="absolute -bottom-4 right-4 w-3 h-3 bg-white border-b border-r border-emerald-100 transform rotate-45"></div>
        </div>
      </div>

      {/* Botón Circular Flotante */}
      <a
        href="https://wa.me/5493816853413?"
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(34,197,94,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 pointer-events-auto group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Contactar por WhatsApp"
      >
        {/* Usamos un SVG genérico de WhatsApp para evitar cargar una imagen externa */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-white fill-white"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>

        {/* Efecto de pulso en verde alrededor del botón */}
        <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20"></div>
      </a>
    </div>
  );
}
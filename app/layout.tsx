import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Farmacia Principal - Canastito de Ofertas',
  description: 'Reservá tus productos de farmacia con descuento al mejor precio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen antialiased bg-slate-100 text-slate-900`}>
        <CartProvider>
          {/* Contenedor adaptativo: en pantallas grandes se expande suavemente y se centra */}
          <div className="w-full max-w-7xl mx-auto min-h-screen bg-white shadow-xl relative pb-20 md:pb-12 transition-all">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
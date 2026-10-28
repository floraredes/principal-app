import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Farmacia - Canastito de Ofertas',
  description: 'Reservá tus productos de farmacia con descuento al mejor precio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen antialiased bg-gray-50 text-gray-900`}>
        <CartProvider>
          <div className="max-w-md mx-auto min-h-screen bg-white shadow-md relative pb-20">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
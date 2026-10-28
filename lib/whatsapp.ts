import { CartItem, CheckoutFormData } from '@/types';

export function generateWhatsAppLink(
  phoneNumber: string,
  cart: CartItem[],
  total: number,
  formData: CheckoutFormData
): string {
  let message = `*NUEVA RESERVA - FARMACIA*\n\n`;
  message += `👤 *Cliente:* ${formData.fullName}\n`;
  message += `📞 *Teléfono:* ${formData.phone}\n`;
  message += `🚚 *Modo:* ${
    formData.deliveryOption === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'
  }\n`;

  if (formData.deliveryOption === 'delivery' && formData.address) {
    message += `📍 *Dirección:* ${formData.address}\n`;
  }

  message += `💳 *Pago:* ${
    formData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'
  }\n\n`;

  message += `*DETALLE DEL PEDIDO:*\n`;
  cart.forEach((item) => {
    message += `• ${item.quantity}x ${item.product.name} - $${
      item.product.discountPrice * item.quantity
    }\n`;
  });

  message += `\n*TOTAL: $${total}*`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
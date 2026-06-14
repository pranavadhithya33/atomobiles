// lib/utils.js

/**
 * Format a number as Indian currency (₹)
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount percentage between two prices
 */
export function calcDiscountPct(originalPrice, ourPrice) {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - ourPrice) / originalPrice) * 100);
}

/**
 * Calculate savings amount
 */
export function calcSavings(originalPrice, ourPrice) {
  return Math.max(0, originalPrice - ourPrice);
}

/**
 * Calculate payment details for given option
 * Options: 'full_prepaid' (2000 off), 'half_cod' (1000 off), 'token_advance' (500 off)
 */
export function calcPaymentDetails(ourPrice, option) {
  let discount = 0;
  if (option === 'full_prepaid') discount = 2000;
  else if (option === 'half_cod') discount = 1000;
  else if (option === 'token_advance') discount = 500;

  const finalPrice = Math.max(0, ourPrice - discount);
  let advance = 0;

  if (option === 'full_prepaid') {
    advance = finalPrice;
  } else if (option === 'half_cod') {
    advance = Math.round(finalPrice / 2);
  } else if (option === 'token_advance') {
    advance = Math.round(finalPrice * 0.3);
  }

  return {
    discount,
    finalPrice,
    advance,
    remaining: finalPrice - advance
  };
}

/**
 * Validate Indian phone number
 */
export function validatePhone(phone) {
  const cleaned = phone.replace(/\s+/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validate Indian pincode
 */
export function validatePincode(pin) {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/**
 * Build a WhatsApp message URL for an order
 */
export function buildWhatsAppUrl(waNumber, orderData) {
  const { name, phone, address, pincode, productName, paymentOption, finalPrice, advanceAmount, orderId } = orderData;

  let paymentText = '';
  if (paymentOption === 'full_prepaid') {
    paymentText = `Full Prepaid ✅ | Final Price: ₹${finalPrice}`;
  } else if (paymentOption === 'token_advance') {
    paymentText = `30% Token Advance | Advance: ₹${advanceAmount} | Remaining on Delivery: ₹${finalPrice - advanceAmount}`;
  } else {
    paymentText = `Half COD | Advance: ₹${advanceAmount} | Remaining on Delivery: ₹${finalPrice - advanceAmount}`;
  }

  const msg = `🛒 *New Order - ATOMOBILES*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📍 *Address:* ${address}, ${pincode}

📦 *Product:* ${productName}
💳 *Payment:* ${paymentText}
💰 *Total:* ₹${finalPrice}

🔗 *Track Order Live:*
https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || 'atomobiles.in'}/track/${orderId}`;

  return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
}

/**
 * Slugify a string
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

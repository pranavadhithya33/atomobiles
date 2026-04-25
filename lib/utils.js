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
 * Calculate prepaid price with discount
 */
export function calcPrepaidPrice(ourPrice, discountPct) {
  const pct = discountPct || Number(process.env.NEXT_PUBLIC_PREPAID_DISCOUNT_PCT) || 3;
  return Math.round(ourPrice * (1 - pct / 100));
}

/**
 * Calculate half payment amount
 */
export function calcHalfPayment(ourPrice) {
  return Math.round(ourPrice / 2);
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
  const { name, phone, address, pincode, productName, paymentOption, finalPrice, advanceAmount } = orderData;

  const paymentText =
    paymentOption === 'full_prepaid'
      ? `Full Prepaid ✅ | Final Price: ₹${finalPrice}`
      : `Half COD | Advance: ₹${advanceAmount} | Remaining on Delivery: ₹${finalPrice - advanceAmount}`;

  const msg = `🛒 *New Order - ONLY GADJETS*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📍 *Address:* ${address}, ${pincode}

📦 *Product:* ${productName}
💳 *Payment:* ${paymentText}
💰 *Total:* ₹${finalPrice}`;

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

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

// Helper function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount: number, currency: string = 'try'): number => {
  // Turkish Lira uses minor units (kuruş), so multiply by 100
  return Math.round(amount * 100);
};

// Helper function to format amount for display (convert from cents)
export const formatAmountFromStripe = (amount: number, currency: string = 'try'): number => {
  return amount / 100;
};

// Calculate service fee (12% of subtotal)
export const calculateServiceFee = (subtotal: number): number => {
  return Math.round(subtotal * 0.12);
};

// Calculate total price including service fee
export const calculateTotalPrice = (subtotal: number): number => {
  const serviceFee = calculateServiceFee(subtotal);
  return subtotal + serviceFee;
}; 
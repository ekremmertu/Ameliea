/**
 * Iyzico Payment Gateway Integration
 * Handles payment initialization, status checks, and callbacks
 */

import { env } from './env';

// Dynamic import for CommonJS module (server-side only)
let Iyzipay: any;

// Initialize Iyzico client (server-side only)
export function getIyzicoClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Iyzico client can only be used server-side');
  }
  
  // Check if Iyzico credentials are configured
  if (!env.IYZICO_API_KEY || !env.IYZICO_SECRET_KEY) {
    const errorMsg = 'Iyzico API credentials are not configured. Please set IYZICO_API_KEY and IYZICO_SECRET_KEY in your environment variables.';
    console.error('Iyzico credentials missing:', {
      hasApiKey: !!env.IYZICO_API_KEY,
      hasSecretKey: !!env.IYZICO_SECRET_KEY,
    });
    throw new Error(errorMsg);
  }
  
  // Lazy load Iyzipay module (CommonJS)
  if (!Iyzipay) {
    try {
      // Use dynamic require for CommonJS module
      Iyzipay = eval('require')('iyzipay');
    } catch (error) {
      console.error('Failed to load iyzipay module:', error);
      throw new Error('Iyzico SDK not available');
    }
  }
  
  return new Iyzipay({
    apiKey: env.IYZICO_API_KEY,
    secretKey: env.IYZICO_SECRET_KEY,
    uri: env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  });
}

export interface PaymentRequest {
  price: number; // Amount in TRY (e.g., 1999.00 for ₺1,999)
  paidPrice: number; // Same as price for single payment
  currency: 'TRY';
  basketId: string; // Unique basket ID (e.g., purchase ID)
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string; // MM format (e.g., "12")
    expireYear: string; // YY format (e.g., "25")
    cvc: string;
    registerCard?: 0 | 1; // 0 = don't register, 1 = register
  };
  buyer: {
    id: string; // User ID
    name: string;
    surname: string;
    gsmNumber: string; // Phone number (e.g., "+905551234567")
    email: string;
    identityNumber: string; // TCKN or passport number
    registrationAddress: string;
    city: string;
    country: string;
    zipCode: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  basketItems: Array<{
    id: string; // Item ID (e.g., "plan-light" or "plan-premium")
    name: string; // Item name
    category1: string; // Category (e.g., "Subscription")
    category2?: string;
    itemType: 'PHYSICAL' | 'VIRTUAL';
    price: number; // Item price
  }>;
  callbackUrl: string; // Callback URL after payment
  locale: 'tr' | 'en';
  conversationId?: string; // Optional conversation ID for tracking
}

export interface PaymentResponse {
  status: 'success' | 'failure';
  paymentId?: string;
  paymentStatus?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  htmlContent?: string; // 3D Secure HTML content
}

/**
 * Initialize a payment with Iyzico
 * Returns payment HTML content for 3D Secure or direct payment
 */
export async function initializePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const paymentRequest = {
      locale: request.locale || 'tr',
      conversationId: request.conversationId || `conv-${Date.now()}`,
      price: request.price.toFixed(2),
      paidPrice: request.paidPrice.toFixed(2),
      currency: request.currency,
      basketId: request.basketId,
      paymentCard: request.paymentCard,
      buyer: request.buyer,
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      basketItems: request.basketItems.map(item => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2 || item.category1,
        itemType: item.itemType,
        price: item.price.toFixed(2),
      })),
      callbackUrl: request.callbackUrl,
    };

    const client = getIyzicoClient();
    return new Promise((resolve, reject) => {
      client.threedsInitialize.create(paymentRequest, (err: any, result: any) => {
        if (err) {
          console.error('Iyzico payment initialization error:', err);
          resolve({
            status: 'failure',
            errorCode: err.errorCode || 'UNKNOWN_ERROR',
            errorMessage: err.errorMessage || 'Payment initialization failed',
          });
          return;
        }

        if (result.status === 'success') {
          resolve({
            status: 'success',
            paymentId: result.paymentId,
            conversationId: result.conversationId,
            htmlContent: result.threeDSHtmlContent, // 3D Secure HTML
          });
        } else {
          resolve({
            status: 'failure',
            errorCode: result.errorCode,
            errorMessage: result.errorMessage,
          });
        }
      });
    });
  } catch (error) {
    console.error('Iyzico payment initialization exception:', error);
    return {
      status: 'failure',
      errorCode: 'EXCEPTION',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check payment status by payment ID
 */
export async function checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
  try {
    const client = getIyzicoClient();
    return new Promise((resolve, reject) => {
      client.payment.retrieve(
        {
          paymentId: paymentId,
        },
        (err: any, result: any) => {
          if (err) {
            console.error('Iyzico payment status check error:', err);
            resolve({
              status: 'failure',
              errorCode: err.errorCode || 'UNKNOWN_ERROR',
              errorMessage: err.errorMessage || 'Payment status check failed',
            });
            return;
          }

          if (result.status === 'success') {
            resolve({
              status: 'success',
              paymentId: result.paymentId,
              paymentStatus: result.paymentStatus, // SUCCESS, FAILURE, INIT_THREEDS, CALLBACK_URL_CALLED
              conversationId: result.conversationId,
            });
          } else {
            resolve({
              status: 'failure',
              errorCode: result.errorCode,
              errorMessage: result.errorMessage,
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Iyzico payment status check exception:', error);
    return {
      status: 'failure',
      errorCode: 'EXCEPTION',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Handle payment callback (after 3D Secure)
 */
export interface PaymentCallbackRequest {
  paymentId: string;
  conversationData?: string;
}

export async function handlePaymentCallback(
  request: PaymentCallbackRequest
): Promise<PaymentResponse> {
  try {
    const client = getIyzicoClient();
    return new Promise((resolve, reject) => {
      client.threedsPayment.create(
        {
          paymentId: request.paymentId,
          conversationData: request.conversationData,
        },
        (err: any, result: any) => {
          if (err) {
            console.error('Iyzico payment callback error:', err);
            resolve({
              status: 'failure',
              errorCode: err.errorCode || 'UNKNOWN_ERROR',
              errorMessage: err.errorMessage || 'Payment callback failed',
            });
            return;
          }

          if (result.status === 'success') {
            resolve({
              status: 'success',
              paymentId: result.paymentId,
              paymentStatus: result.paymentStatus,
              conversationId: result.conversationId,
            });
          } else {
            resolve({
              status: 'failure',
              errorCode: result.errorCode,
              errorMessage: result.errorMessage,
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Iyzico payment callback exception:', error);
    return {
      status: 'failure',
      errorCode: 'EXCEPTION',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}


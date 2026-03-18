/**
 * Type definitions for iyzipay package
 */

declare module 'iyzipay' {
  interface IyzicoConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface PaymentCard {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard?: 0 | 1;
  }

  interface Buyer {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    zipCode: string;
  }

  interface Address {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  }

  interface BasketItem {
    id: string;
    name: string;
    category1: string;
    category2?: string;
    itemType: 'PHYSICAL' | 'VIRTUAL';
    price: string;
  }

  interface ThreedsInitializeRequest {
    locale: 'tr' | 'en';
    conversationId?: string;
    price: string;
    paidPrice: string;
    currency: string;
    basketId: string;
    paymentCard: PaymentCard;
    buyer: Buyer;
    shippingAddress: Address;
    billingAddress: Address;
    basketItems: BasketItem[];
    callbackUrl: string;
  }

  interface PaymentRetrieveRequest {
    paymentId: string;
  }

  interface ThreedsPaymentRequest {
    paymentId: string;
    conversationData?: string;
  }

  interface IyzicoResponse {
    status: 'success' | 'failure';
    errorCode?: string;
    errorMessage?: string;
    paymentId?: string;
    paymentStatus?: string;
    conversationId?: string;
    threeDSHtmlContent?: string;
  }

  type IyzicoCallback = (err: Error | null, result: IyzicoResponse) => void;

  class Iyzipay {
    constructor(config: IyzicoConfig);
    threedsInitialize: {
      create: (request: ThreedsInitializeRequest, callback: IyzicoCallback) => void;
    };
    payment: {
      retrieve: (request: PaymentRetrieveRequest, callback: IyzicoCallback) => void;
    };
    threedsPayment: {
      create: (request: ThreedsPaymentRequest, callback: IyzicoCallback) => void;
    };
  }

  export = Iyzipay;
}


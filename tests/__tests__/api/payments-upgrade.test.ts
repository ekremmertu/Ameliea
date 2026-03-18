/**
 * Payment Upgrade API Route Tests
 * POST /api/payments/upgrade - Iyzico upgrade (charge price difference only)
 * @jest-environment node
 */

import { POST } from '@/app/api/payments/upgrade/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { initializePayment } from '@/lib/iyzico';
import { PLAN_PRICING, PLAN_TYPES } from '@/lib/constants';

jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/iyzico', () => ({
  initializePayment: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    dbError: jest.fn(),
    paymentInitiated: jest.fn(),
    apiError: jest.fn(),
  },
}));

const INVITATION_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = 'user-123';
const CURRENT_PURCHASE_ID = 'purchase-light-1';
const UPGRADE_PURCHASE_ID = 'purchase-upgrade-1';
const UPGRADE_PRICE = PLAN_PRICING[PLAN_TYPES.PREMIUM].amount - PLAN_PRICING[PLAN_TYPES.LIGHT].amount; // 2000

const validPaymentBody = {
  invitationId: INVITATION_ID,
  paymentCard: {
    cardHolderName: 'Test User',
    cardNumber: '5528790000000008',
    expireMonth: '12',
    expireYear: '30',
    cvc: '123',
  },
  buyer: {
    name: 'Test',
    surname: 'User',
    gsmNumber: '+905551234567',
    email: 'test@example.com',
    identityNumber: '12345678901',
    registrationAddress: 'Test Address 123 Street',
    city: 'Istanbul',
    country: 'Turkey',
    zipCode: '34000',
  },
  shippingAddress: {
    contactName: 'Test User',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Test Address 123 Street',
    zipCode: '34000',
  },
  billingAddress: {
    contactName: 'Test User',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Test Address 123 Street',
    zipCode: '34000',
  },
};

function createRequest(body: unknown) {
  return {
    json: () => Promise.resolve(body),
  } as unknown as Request;
}

describe('POST /api/payments/upgrade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } }) },
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = createRequest(validPaymentBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('UNAUTHORIZED');
  });

  it('returns 400 when body is invalid JSON / missing', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = createRequest(null);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('INVALID_JSON');
  });

  it('returns 400 when invitationId is missing or invalid', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const invalidBody = { ...validPaymentBody, invitationId: 'not-a-uuid' };
    const request = createRequest(invalidBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when paymentCard is invalid', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const invalidBody = { ...validPaymentBody, paymentCard: { ...validPaymentBody.paymentCard, cardNumber: '123' } };
    const request = createRequest(invalidBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when invitation not found', async () => {
    const mockFrom = jest.fn().mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        };
      }
      return {};
    });
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
      from: mockFrom,
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = createRequest(validPaymentBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('INVITATION_NOT_FOUND');
  });

  it('returns 400 when current plan is not Light', async () => {
    const invitationWithPremium = {
      id: INVITATION_ID,
      purchases: [{ id: CURRENT_PURCHASE_ID, plan_type: PLAN_TYPES.PREMIUM, status: 'completed' }],
    };
    const mockFrom = jest.fn().mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: invitationWithPremium, error: null }),
        };
      }
      return {};
    });
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
      from: mockFrom,
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = createRequest(validPaymentBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('INVALID_UPGRADE');
  });

  it('returns 400 when current purchase is not completed', async () => {
    const invitationWithPending = {
      id: INVITATION_ID,
      purchases: [{ id: CURRENT_PURCHASE_ID, plan_type: PLAN_TYPES.LIGHT, status: 'pending' }],
    };
    const mockFrom = jest.fn().mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: invitationWithPending, error: null }),
        };
      }
      return {};
    });
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
      from: mockFrom,
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = createRequest(validPaymentBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('INVALID_STATUS');
  });

  it('returns 200 with htmlContent and purchase amount 2000 when Iyzico succeeds', async () => {
    const invitationWithLight = {
      id: INVITATION_ID,
      purchases: [{ id: CURRENT_PURCHASE_ID, plan_type: PLAN_TYPES.LIGHT, status: 'completed' }],
    };
    const upgradePurchase = {
      id: UPGRADE_PURCHASE_ID,
      user_id: USER_ID,
      plan_type: PLAN_TYPES.PREMIUM,
      amount: UPGRADE_PRICE,
      currency: 'TRY',
      status: 'pending',
      payment_method: 'card',
      payment_provider: 'iyzico',
      is_upgrade: true,
      upgraded_from_purchase_id: CURRENT_PURCHASE_ID,
      invitation_id: INVITATION_ID,
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: upgradePurchase, error: null }),
      }),
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const mockFrom = jest.fn().mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: invitationWithLight, error: null }),
        };
      }
      if (table === 'purchases') {
        return {
          insert: mockInsert,
          update: mockUpdate,
          select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: upgradePurchase, error: null }) }),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
      from: mockFrom,
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);
    (initializePayment as jest.Mock).mockResolvedValue({
      status: 'success',
      paymentId: 'pid-1',
      conversationId: 'conv-1',
      htmlContent: '<form>3DS</form>',
    });

    const request = createRequest(validPaymentBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.paymentId).toBe('pid-1');
    expect(data.htmlContent).toBe('<form>3DS</form>');
    expect(data.purchaseId).toBe(UPGRADE_PURCHASE_ID);

    const insertCall = mockInsert.mock.calls[0][0];
    expect(insertCall.amount).toBe(2000);
    expect(insertCall.plan_type).toBe(PLAN_TYPES.PREMIUM);
    expect(insertCall.is_upgrade).toBe(true);
    expect(insertCall.invitation_id).toBe(INVITATION_ID);
    expect(insertCall.payment_method).toBe('card');
    expect(insertCall.payment_provider).toBe('iyzico');

    const paymentRequest = (initializePayment as jest.Mock).mock.calls[0][0];
    expect(paymentRequest.price).toBe(2000);
    expect(paymentRequest.paidPrice).toBe(2000);
    expect(paymentRequest.basketId).toBe(UPGRADE_PURCHASE_ID);
  });

  it('returns 400 and cancels purchase when Iyzico returns failure', async () => {
    const invitationWithLight = {
      id: INVITATION_ID,
      purchases: [{ id: CURRENT_PURCHASE_ID, plan_type: PLAN_TYPES.LIGHT, status: 'completed' }],
    };
    const upgradePurchase = {
      id: UPGRADE_PURCHASE_ID,
      user_id: USER_ID,
      plan_type: PLAN_TYPES.PREMIUM,
      amount: UPGRADE_PRICE,
      status: 'pending',
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const mockFrom = jest.fn().mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: invitationWithLight, error: null }),
        };
      }
      if (table === 'purchases') {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: upgradePurchase, error: null }),
            }),
          }),
          update: mockUpdate,
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }) },
      from: mockFrom,
    };
    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);
    (initializePayment as jest.Mock).mockResolvedValue({
      status: 'failure',
      errorMessage: 'Card declined',
      errorCode: '12345',
    });

    const request = createRequest(validPaymentBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('PAYMENT_INIT_FAILED');
    expect(data.details).toBe('Card declined');

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
    const eqCall = mockUpdate().eq.mock.calls[0];
    expect(eqCall[1]).toBe(UPGRADE_PURCHASE_ID);
  });
});

import crypto from 'crypto';

export interface CashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cfOrderId: string;
  orderId: string;
  orderStatus: string;
  paymentSessionId: string;
  orderAmount: number;
  orderCurrency: string;
  raw: any;
}

export class CashfreeService {
  private get appId(): string {
    return process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '';
  }

  private get secretKey(): string {
    return process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '';
  }

  private get apiVersion(): string {
    return process.env.CASHFREE_API_VERSION || '2023-08-01';
  }

  public get isProduction(): boolean {
    const env = (process.env.CASHFREE_ENV || process.env.PAYMENT_ENV || 'SANDBOX').toUpperCase();
    return env === 'PROD' || env === 'PRODUCTION';
  }

  public get isConfigured(): boolean {
    return Boolean(this.appId && this.secretKey && !this.appId.includes('placeholder'));
  }

  public get baseUrl(): string {
    return this.isProduction
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  /**
   * Creates a Cashfree payment order using official PG API 2023-08-01
   */
  async createOrder(params: CashfreeOrderParams): Promise<CashfreeOrderResponse> {
    if (!this.isConfigured) {
      throw new Error('Cashfree credentials are not configured on the server (CASHFREE_APP_ID / CASHFREE_SECRET_KEY).');
    }

    const payload = {
      order_id: params.orderId,
      order_amount: Number(params.orderAmount.toFixed(2)),
      order_currency: params.orderCurrency || 'INR',
      customer_details: {
        customer_id: params.customerId.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50),
        customer_name: params.customerName || 'Customer',
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone ? params.customerPhone.replace(/[^0-9]/g, '').slice(-10) : '9999999999',
      },
      order_meta: {
        return_url: params.returnUrl,
        notify_url: params.notifyUrl || undefined,
      },
      order_note: params.orderNote || 'Tony Prakash Music Purchase',
    };

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': this.apiVersion,
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    const data: any = await response.json();

    if (!response.ok) {
      const errMsg = data?.message || data?.error || `Cashfree Order API failed with HTTP ${response.status}`;
      throw new Error(`Cashfree error: ${errMsg}`);
    }

    return {
      cfOrderId: String(data.cf_order_id || ''),
      orderId: data.order_id,
      orderStatus: data.order_status,
      paymentSessionId: data.payment_session_id,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      raw: data,
    };
  }

  /**
   * Fetches official Cashfree Order status
   */
  async getOrder(orderId: string): Promise<any> {
    if (!this.isConfigured) {
      throw new Error('Cashfree credentials are not configured.');
    }

    const response = await fetch(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-api-version': this.apiVersion,
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
      },
      signal: AbortSignal.timeout(8000),
    });

    const data: any = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || `Failed to fetch Cashfree order (${response.status})`);
    }

    return data;
  }

  /**
   * Fetches payments made for an order to inspect exact payment method and cf_payment_id
   */
  async getOrderPayments(orderId: string): Promise<any[]> {
    if (!this.isConfigured) {
      throw new Error('Cashfree credentials are not configured.');
    }

    const response = await fetch(`${this.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      method: 'GET',
      headers: {
        'x-api-version': this.apiVersion,
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
      },
      signal: AbortSignal.timeout(8000),
    });

    const data = await response.json();
    if (!response.ok) {
      return [];
    }

    return Array.isArray(data) ? data : [];
  }

  /**
   * Cryptographically verifies Cashfree Webhook Signature:
   * Base64( HMAC-SHA256( timestamp + rawBody, secretKey ) )
   */
  verifyWebhookSignature(signature: string, timestamp: string, rawBody: string): boolean {
    if (!signature || !timestamp || !rawBody || !this.secretKey) {
      return false;
    }

    try {
      const payload = `${timestamp}${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('base64');

      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (err) {
      console.error('Error verifying Cashfree webhook signature:', err);
      return false;
    }
  }
}

export const cashfreeService = new CashfreeService();

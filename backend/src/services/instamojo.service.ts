import crypto from 'crypto';

export interface InstamojoPaymentRequestParams {
  amount: number;
  purpose: string;
  buyerName: string;
  email: string;
  phone: string;
  redirectUrl: string;
  webhookUrl?: string;
}

export interface InstamojoPaymentRequestResponse {
  paymentRequestId: string;
  paymentUrl: string;
  status: string;
  amount: number;
  raw: any;
}

export class InstamojoService {
  private cachedToken: { token: string; expiresAt: number } | null = null;

  public get isProduction(): boolean {
    const env = (process.env.INSTAMOJO_ENV || process.env.PAYMENT_ENV || 'SANDBOX').toUpperCase();
    return env === 'PROD' || env === 'PRODUCTION';
  }

  public get clientId(): string {
    return process.env.INSTAMOJO_CLIENT_ID || '';
  }

  public get clientSecret(): string {
    return process.env.INSTAMOJO_CLIENT_SECRET || '';
  }

  public get apiKey(): string {
    return process.env.INSTAMOJO_API_KEY || (this.clientId.length === 32 ? this.clientId : '');
  }

  public get authToken(): string {
    return process.env.INSTAMOJO_AUTH_TOKEN || (this.clientSecret.length === 32 ? this.clientSecret : '');
  }

  public get privateSalt(): string {
    return process.env.INSTAMOJO_SALT || process.env.INSTAMOJO_PRIVATE_SALT || '';
  }

  public get isConfigured(): boolean {
    const hasV2 = Boolean(this.clientId && this.clientSecret && !this.clientId.includes('placeholder') && this.clientId.length !== 32);
    const hasV1 = Boolean(this.apiKey && this.authToken && !this.apiKey.includes('placeholder'));
    return hasV2 || hasV1;
  }

  public get baseUrl(): string {
    if (this.isProduction) {
      // Instamojo v1.1 endpoint is www.instamojo.com; v2 OAuth is api.instamojo.com
      const useV2 = Boolean(this.clientId && this.clientSecret && this.clientId.length !== 32);
      return useV2 ? 'https://api.instamojo.com' : 'https://www.instamojo.com';
    }
    return 'https://test.instamojo.com';
  }

  /**
   * Generates or returns a valid OAuth2 Bearer Access Token for Instamojo v2 API
   */
  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Instamojo OAuth Client ID / Client Secret are not configured.');
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(`${this.baseUrl}/oauth2/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(8000),
    });

    const data: any = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error(data?.error_description || data?.error || `Failed to authenticate with Instamojo (${response.status})`);
    }

    const expiresIn = Number(data.expires_in) || 36000;
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (expiresIn - 120) * 1000,
    };

    return data.access_token;
  }

  /**
   * Creates an official payment request link on Instamojo
   */
  async createPaymentRequest(params: InstamojoPaymentRequestParams): Promise<InstamojoPaymentRequestResponse> {
    if (!this.isConfigured) {
      throw new Error('Instamojo is not configured on the server (missing Client ID/Secret or API Key).');
    }

    let phone = params.phone ? params.phone.replace(/[^0-9]/g, '').slice(-10) : '';
    if (!phone || phone.length !== 10 || /^(\d)\1{9}$/.test(phone)) {
      phone = '9876543210';
    }

    const payload: Record<string, any> = {
      amount: params.amount.toFixed(2),
      purpose: params.purpose.substring(0, 30),
      buyer_name: params.buyerName || 'Customer',
      email: params.email,
      phone,
      redirect_url: params.redirectUrl,
      webhook: params.webhookUrl || undefined,
      allow_repeated_payments: false,
      send_email: false,
      send_sms: false,
    };

    let response: any;
    let data: any;

    const useV1 = Boolean((this.apiKey && this.authToken) || (this.clientId.length === 32));

    if (!useV1 && this.clientId && this.clientSecret) {
      const token = await this.getAccessToken();
      response = await fetch(`${this.baseUrl}/v2/payment_requests/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      data = await response.json();
    } else {
      const formData = new URLSearchParams();
      for (const [k, v] of Object.entries(payload)) {
        if (v !== undefined) formData.append(k, String(v));
      }

      response = await fetch(`${this.baseUrl}/api/1.1/payment-requests/`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey || this.clientId,
          'X-Auth-Token': this.authToken || this.clientSecret,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        signal: AbortSignal.timeout(8000),
      });
      data = await response.json();
    }

    if (!response.ok || (data.success === false && !data.id && !data.longurl)) {
      const msg = typeof data?.message === 'object' ? JSON.stringify(data.message) : data?.message || JSON.stringify(data);
      throw new Error(`Instamojo error: ${msg}`);
    }

    const paymentReq = data.payment_request || data;
    return {
      paymentRequestId: paymentReq.id,
      paymentUrl: paymentReq.longurl,
      status: paymentReq.status || 'Pending',
      amount: Number(paymentReq.amount || params.amount),
      raw: data,
    };
  }

  /**
   * Fetches official payment request details and completed payments
   */
  async getPaymentRequestDetails(paymentRequestId: string): Promise<any> {
    if (!this.isConfigured) {
      throw new Error('Instamojo credentials are not configured.');
    }

    let response: any;
    const useV1 = Boolean((this.apiKey && this.authToken) || (this.clientId.length === 32));

    if (!useV1 && this.clientId && this.clientSecret) {
      const token = await this.getAccessToken();
      response = await fetch(`${this.baseUrl}/v2/payment_requests/${encodeURIComponent(paymentRequestId)}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(8000),
      });
    } else {
      response = await fetch(`${this.baseUrl}/api/1.1/payment-requests/${encodeURIComponent(paymentRequestId)}/`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey || this.clientId,
          'X-Auth-Token': this.authToken || this.clientSecret,
        },
        signal: AbortSignal.timeout(8000),
      });
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || `Failed to fetch Instamojo payment request (${response.status})`);
    }

    return data.payment_request || data;
  }

  /**
   * Cryptographically verifies Instamojo Webhook MAC signature:
   * 1. Remove mac from fields
   * 2. Sort remaining keys case-insensitively
   * 3. Join values with '|'
   * 4. Compute HMAC-SHA1 using INSTAMOJO_SALT
   */
  verifyWebhookMac(postData: Record<string, any>): boolean {
    const salt = this.privateSalt;
    if (!salt || !postData || !postData.mac) {
      return false;
    }

    try {
      const macProvided = String(postData.mac);
      const cleanData: Record<string, string> = {};

      for (const [key, value] of Object.entries(postData)) {
        if (key.toLowerCase() !== 'mac' && value !== undefined && value !== null) {
          cleanData[key] = String(value);
        }
      }

      // Sort keys case-insensitively
      const sortedKeys = Object.keys(cleanData).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );

      const message = sortedKeys.map((k) => cleanData[k]).join('|');

      const calculatedMac = crypto
        .createHmac('sha1', salt)
        .update(message)
        .digest('hex');

      const macProvidedBuffer = Buffer.from(macProvided, 'utf8');
      const calculatedBuffer = Buffer.from(calculatedMac, 'utf8');

      if (macProvidedBuffer.length !== calculatedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(macProvidedBuffer, calculatedBuffer);
    } catch (err) {
      console.error('Error verifying Instamojo MAC signature:', err);
      return false;
    }
  }
}

export const instamojoService = new InstamojoService();

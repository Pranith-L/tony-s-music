import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

// Initialize Supabase Client with Service Role Key for secure DB mutations
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://mrehomunxqccvcwpkwxd.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Gateways Configuration
const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID') || '';
const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY') || '';
const CASHFREE_ENV = (Deno.env.get('CASHFREE_ENV') || 'PROD').toUpperCase();

const INSTAMOJO_API_KEY = Deno.env.get('INSTAMOJO_API_KEY') || Deno.env.get('INSTAMOJO_CLIENT_ID') || '';
const INSTAMOJO_AUTH_TOKEN = Deno.env.get('INSTAMOJO_AUTH_TOKEN') || Deno.env.get('INSTAMOJO_CLIENT_SECRET') || '';
const INSTAMOJO_SALT = Deno.env.get('INSTAMOJO_SALT') || '';

const PRICING = {
  vipPassRupees: 299,
  vipPassPaise: 29900,
  trackRupees: 99,
  trackPaise: 9900,
};

// Cryptographic helpers
async function verifyCashfreeSignature(signature: string, timestamp: string, rawBody: string): Promise<boolean> {
  if (!signature || !timestamp || !CASHFREE_SECRET_KEY) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(CASHFREE_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(timestamp + rawBody)
    );
    const calculatedBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    return calculatedBase64 === signature;
  } catch (err) {
    console.error('Cashfree signature verification error:', err);
    return false;
  }
}

async function verifyInstamojoMac(postData: Record<string, string>): Promise<boolean> {
  const salt = INSTAMOJO_SALT;
  if (!salt || !postData || !postData.mac) return false;
  try {
    const keys = Object.keys(postData)
      .filter((k) => k.toLowerCase() !== 'mac')
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const message = keys.map((k) => postData[k]).join('|');

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(salt),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    const calculatedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return calculatedHex.toLowerCase() === postData.mac.toLowerCase();
  } catch (err) {
    console.error('Instamojo MAC verification error:', err);
    return false;
  }
}

// Database Order Fulfillment
async function fulfillOrder(orderId: string, gateway: string, gatewayOrderId: string, gatewayPaymentId: string) {
  try {
    // 1. Fetch Transaction
    const { data: tx } = await supabase
      .from('PaymentTransaction')
      .select('*')
      .eq('orderId', orderId)
      .single();

    if (!tx || tx.status === 'SUCCESS') return;

    // 2. Update Transaction to SUCCESS
    await supabase
      .from('PaymentTransaction')
      .update({
        status: 'SUCCESS',
        gatewayOrderId,
        gatewayPaymentId,
        updatedAt: new Date().toISOString(),
      })
      .eq('orderId', orderId);

    // 3. Grant Product Access
    if (tx.itemType === 'VIP_PASS' && tx.userId) {
      const hundredYearsLater = new Date();
      hundredYearsLater.setFullYear(hundredYearsLater.getFullYear() + 100);

      await supabase.from('Subscription').upsert({
        userId: tx.userId,
        planName: "Tony's VIP Pass",
        status: 'ACTIVE',
        amountPaise: PRICING.vipPassPaise,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: hundredYearsLater.toISOString(),
        gateway,
        gatewayOrderId,
        gatewayPaymentId,
        updatedAt: new Date().toISOString(),
      });
    } else if (tx.itemType === 'TRACK' && tx.userId && tx.trackId) {
      await supabase.from('Purchase').insert({
        userId: tx.userId,
        trackId: tx.trackId,
        amountPaise: PRICING.trackPaise,
        status: 'SUCCESS',
        gateway,
        gatewayOrderId,
        gatewayPaymentId,
        createdAt: new Date().toISOString(),
      });

      await supabase.from('Entitlement').upsert({
        userId: tx.userId,
        trackId: tx.trackId,
        entitlementType: 'PURCHASE',
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Fulfillment error:', err);
  }
}

// Main Deno Request Handler
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/functions\/v1\/api/, '').replace(/^\/api/, '');

  // 1. Health check
  if (path === '/health' || path === '') {
    return new Response(
      JSON.stringify({
        status: 'online',
        service: 'Tony Prakash Music API (Supabase Edge Backend)',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 2. Payments Config
  if (path === '/payments/config') {
    return new Response(
      JSON.stringify({
        paymentsPaused: false,
        gateways: {
          cashfree: {
            enabled: Boolean(CASHFREE_APP_ID && CASHFREE_SECRET_KEY),
            environment: CASHFREE_ENV,
          },
          instamojo: {
            enabled: Boolean(INSTAMOJO_API_KEY && INSTAMOJO_AUTH_TOKEN),
            environment: 'PRODUCTION',
          },
        },
        pricing: PRICING,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 3. Create Unified Order
  if (path === '/payments/create-unified-order' && req.method === 'POST') {
    try {
      const body = await req.json();
      const { itemType, trackId, gateway, customerName, customerEmail, customerPhone } = body;

      const isVip = itemType === 'VIP_PASS';
      const amountRupees = isVip ? PRICING.vipPassRupees : PRICING.trackRupees;
      const amountPaise = isVip ? PRICING.vipPassPaise : PRICING.trackPaise;
      const orderId = `tp_${isVip ? 'vip' : 'trk'}_${Date.now()}`;

      // Insert transaction into PostgreSQL
      await supabase.from('PaymentTransaction').insert({
        orderId,
        gateway,
        itemType,
        trackId: trackId || null,
        amountPaise,
        currency: 'INR',
        status: 'PENDING',
        customerName,
        customerEmail,
        customerPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (gateway === 'CASHFREE') {
        const cfUrl = CASHFREE_ENV === 'PROD' ? 'https://api.cashfree.com/pg/orders' : 'https://sandbox.cashfree.com/pg/orders';
        const cfRes = await fetch(cfUrl, {
          method: 'POST',
          headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: amountRupees,
            order_currency: 'INR',
            customer_details: {
              customer_id: `cust_${Date.now()}`,
              customer_name: customerName || 'Customer',
              customer_email: customerEmail || 'customer@tonyprakash.com',
              customer_phone: customerPhone?.replace(/[^0-9]/g, '').slice(-10) || '9876543210',
            },
            order_meta: {
              return_url: `https://tony-prakash-music.vercel.app/payment-return?order_id={order_id}&gateway=cashfree`,
              notify_url: `https://mrehomunxqccvcwpkwxd.supabase.co/functions/v1/api/payments/cashfree-webhook`,
            },
            order_note: isVip ? "Tony's VIP Pass" : 'Studio Minus-One Track',
          }),
        });

        const cfData = await cfRes.json();
        return new Response(
          JSON.stringify({
            success: true,
            orderId,
            cfOrderId: cfData.cf_order_id,
            paymentSessionId: cfData.payment_session_id,
            amount: amountRupees,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (gateway === 'INSTAMOJO') {
        let phone = customerPhone?.replace(/[^0-9]/g, '').slice(-10) || '';
        if (!phone || phone.length !== 10 || /^(\d)\1{9}$/.test(phone)) phone = '9876543210';

        const imFormData = new URLSearchParams({
          amount: String(amountRupees),
          purpose: isVip ? "VIP Lifetime Pass" : "Studio Minus-One Track",
          buyer_name: customerName || 'Customer',
          email: customerEmail || 'customer@tonyprakash.com',
          phone,
          redirect_url: `https://tony-prakash-music.vercel.app/payment-return?order_id=${encodeURIComponent(orderId)}&gateway=instamojo`,
          webhook: `https://mrehomunxqccvcwpkwxd.supabase.co/functions/v1/api/payments/instamojo-webhook`,
          allow_repeated_payments: 'false',
          send_email: 'false',
          send_sms: 'false',
        });

        const imRes = await fetch('https://www.instamojo.com/api/1.1/payment-requests/', {
          method: 'POST',
          headers: {
            'X-Api-Key': INSTAMOJO_API_KEY,
            'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: imFormData.toString(),
        });

        const imData = await imRes.json();
        const paymentReq = imData.payment_request || imData;

        // Update transaction with gatewayOrderId
        await supabase
          .from('PaymentTransaction')
          .update({ gatewayOrderId: paymentReq.id })
          .eq('orderId', orderId);

        return new Response(
          JSON.stringify({
            success: true,
            orderId,
            paymentRequestId: paymentReq.id,
            paymentUrl: paymentReq.longurl,
            amount: amountRupees,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // 4. Cashfree Webhook
  if (path.includes('/payments/cashfree-webhook') || path.includes('/payments/cashfree')) {
    try {
      const signature = req.headers.get('x-webhook-signature') || '';
      const timestamp = req.headers.get('x-webhook-timestamp') || '';
      const rawBody = await req.text();

      const isValid = await verifyCashfreeSignature(signature, timestamp, rawBody);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid Cashfree signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = JSON.parse(rawBody || '{}');
      const eventType = payload.type || 'PAYMENT_WEBHOOK';
      const data = payload.data || {};
      const orderData = data.order || {};
      const paymentData = data.payment || {};
      const orderId = orderData.order_id;
      const paymentId = paymentData.cf_payment_id || `cf_pay_${Date.now()}`;
      const eventId = `cf_evt_${orderId}_${paymentId}_${eventType}`;

      // Acknowledge Cashfree immediately with 200
      if (orderId && (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentData.payment_status === 'SUCCESS')) {
        fulfillOrder(orderId, 'CASHFREE', String(orderData.cf_order_id || ''), String(paymentId));
      }

      return new Response(JSON.stringify({ status: 'ok', eventId, received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // 5. Instamojo Webhook
  if (path.includes('/payments/instamojo-webhook') || path.includes('/payments/instamojo') || path.includes('/payments/instamoj')) {
    try {
      const formData = await req.formData();
      const postData: Record<string, string> = {};
      for (const [key, val] of formData.entries()) {
        postData[key] = String(val);
      }

      const isValid = await verifyInstamojoMac(postData);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid Instamojo MAC signature' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const paymentId = postData.payment_id;
      const paymentRequestId = postData.payment_request_id;
      const status = postData.status;
      const eventId = `im_evt_${paymentId}_${status}`;

      // Immediate 200 OK Response
      if (status === 'Credit' && paymentRequestId) {
        // Find order
        supabase
          .from('PaymentTransaction')
          .select('orderId')
          .eq('gatewayOrderId', paymentRequestId)
          .single()
          .then(({ data }) => {
            if (data?.orderId) {
              fulfillOrder(data.orderId, 'INSTAMOJO', paymentRequestId, paymentId);
            }
          });
      }

      return new Response(JSON.stringify({ status: 'ok', eventId, received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // 6. Verify Unified Payment (Polling from return page)
  if (path === '/payments/verify-unified-payment' && req.method === 'POST') {
    try {
      const body = await req.json();
      const { orderId, gateway } = body;

      const { data: tx } = await supabase
        .from('PaymentTransaction')
        .select('*')
        .eq('orderId', orderId)
        .single();

      if (!tx) {
        return new Response(JSON.stringify({ success: false, message: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (tx.status === 'SUCCESS') {
        return new Response(JSON.stringify({ success: true, message: 'Payment confirmed successfully!' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: false, status: tx.status, message: 'Payment pending or processing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

// @ts-nocheck
declare const Deno: any;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

// Initialize Supabase Client with Service Role Key for secure DB mutations
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://mrehomunxqccvcwpkwxd.supabase.co';
const supabaseServiceKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
  Deno.env.get('SUPABASE_ANON_KEY') ||
  'sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9';
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
  vipPassRupees: Number(Deno.env.get('VIP_PASS_PRICE_RUPEES')) || 299,
  vipPassPaise: (Number(Deno.env.get('VIP_PASS_PRICE_RUPEES')) || 299) * 100,
  trackRupees: Number(Deno.env.get('TRACK_PRICE_RUPEES')) || 99,
  trackPaise: (Number(Deno.env.get('TRACK_PRICE_RUPEES')) || 99) * 100,
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
async function fulfillOrder(orderId: string, gateway: string, gatewayOrderId: string, gatewayPaymentId: string, paymentMethod?: string) {
  try {
    // 1. Attempt PostgreSQL ACID RPC function fulfill_order_atomic
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('fulfill_order_atomic', {
        p_order_id: orderId,
        p_gateway: gateway,
        p_gateway_order_id: gatewayOrderId,
        p_gateway_payment_id: gatewayPaymentId,
        p_payment_method: paymentMethod || null,
      });

      if (!rpcError && rpcData?.success) {
        console.log(`Order ${orderId} atomically fulfilled via PostgreSQL RPC:`, rpcData);
        return;
      }
      if (rpcError) {
        console.warn('fulfill_order_atomic RPC error, falling back to direct table updates:', rpcError.message);
      }
    } catch (rpcErr) {
      console.warn('RPC execution exception, using direct fallback:', rpcErr);
    }

    // 2. Fetch Transaction for direct fallback
    const { data: tx } = await supabase
      .from('PaymentTransaction')
      .select('*')
      .eq('orderId', orderId)
      .maybeSingle();

    if (!tx || tx.status === 'SUCCESS') return;

    // Resolve user ID if missing from transaction
    let resolvedUserId = tx.userId;
    if (!resolvedUserId && tx.customerEmail) {
      const { data: userRow } = await supabase
        .from('User')
        .select('id')
        .ilike('email', tx.customerEmail)
        .maybeSingle();
      if (userRow?.id) {
        resolvedUserId = userRow.id;
      }
    }

    // 3. Update Transaction to SUCCESS
    await supabase
      .from('PaymentTransaction')
      .update({
        status: 'SUCCESS',
        userId: resolvedUserId,
        gatewayOrderId,
        gatewayPaymentId,
        paymentMethod: paymentMethod || tx.paymentMethod,
        updatedAt: new Date().toISOString(),
      })
      .eq('orderId', orderId);

    // 4. Grant Product Access
    if (tx.itemType === 'VIP_PASS' && resolvedUserId) {
      const hundredYearsLater = new Date();
      hundredYearsLater.setFullYear(hundredYearsLater.getFullYear() + 100);

      await supabase.from('Subscription').upsert({
        userId: resolvedUserId,
        planName: "Tony's VIP Pass",
        status: 'ACTIVE',
        amountPaise: tx.amountPaise || PRICING.vipPassPaise,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: hundredYearsLater.toISOString(),
        gateway,
        gatewayOrderId,
        gatewayPaymentId,
        updatedAt: new Date().toISOString(),
      });
    } else if (tx.itemType === 'TRACK' && resolvedUserId && tx.trackId) {
      await supabase.from('Purchase').insert({
        userId: resolvedUserId,
        trackId: tx.trackId,
        amountPaise: tx.amountPaise || PRICING.trackPaise,
        status: 'SUCCESS',
        gateway,
        gatewayOrderId,
        gatewayPaymentId,
        createdAt: new Date().toISOString(),
      });

      await supabase.from('Entitlement').upsert({
        userId: resolvedUserId,
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
  // Universal path matching: strips /functions/v1/<any-function-name> and optional /api prefix
  const rawPath = url.pathname.replace(/^\/functions\/v1\/[^/]+/, '').replace(/^\/api/, '');
  const path = rawPath.replace(/\/+$/, '') || '/';

  const hasCashfreeSig = req.headers.has('x-webhook-signature');
  const contentType = req.headers.get('content-type') || '';

  // 1. Instamojo Webhook (Direct path OR auto-detected by application/x-www-form-urlencoded POST)
  if (
    path.includes('/instamojo') ||
    path.includes('/instamoj') ||
    (!hasCashfreeSig && req.method === 'POST' && contentType.includes('application/x-www-form-urlencoded'))
  ) {
    try {
      const formData = await req.formData();
      const postData: Record<string, string> = {};
      for (const [key, val] of formData.entries()) {
        postData[key] = String(val);
      }

      if (postData.mac) {
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
      }
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. Cashfree Webhook
  if (path.includes('/cashfree') || hasCashfreeSig) {
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

  // 3. Health check or Root Ping
  if (path === '/' || path === '/health' || path === '') {
    return new Response(
      JSON.stringify({
        status: 'online',
        service: 'Tony Prakash Music API (Supabase Edge Backend)',
        function: 'hyper-responder',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 4. Payments Config
  if (path.includes('/payments/config')) {
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

  // 5. Create Unified Order
  if (path.includes('/payments/create-unified-order') && req.method === 'POST') {
    try {
      const body = await req.json();
      const { itemType, trackId, gateway, customerName, customerEmail, customerPhone } = body;

      const isVip = itemType === 'VIP_PASS';
      let amountRupees = isVip ? PRICING.vipPassRupees : PRICING.trackRupees;
      // Instamojo enforces a strict platform minimum of ₹9.00
      if (gateway === 'INSTAMOJO' && amountRupees < 9) {
        amountRupees = 9;
      }
      const amountPaise = amountRupees * 100;
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
              notify_url: `https://mrehomunxqccvcwpkwxd.supabase.co/functions/v1/hyper-responder/payments/cashfree-webhook`,
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
          webhook: `https://mrehomunxqccvcwpkwxd.supabase.co/functions/v1/hyper-responder/payments/instamojo-webhook`,
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

        if (!imRes.ok || !imData.success || !paymentReq?.longurl) {
          let errorMessage = 'Instamojo failed to create payment link.';
          if (imData.message) {
            if (typeof imData.message === 'object') {
              errorMessage = Object.entries(imData.message)
                .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
                .join('; ');
            } else {
              errorMessage = String(imData.message);
            }
          }
          console.error('Instamojo creation failed:', errorMessage, imData);
          return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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

  // 6. Verify Unified Payment
  if (path.includes('/payments/verify-unified-payment') && req.method === 'POST') {
    try {
      const body = await req.json();
      const { orderId, gateway } = body;

      if (!orderId) {
        return new Response(JSON.stringify({ success: false, message: 'Order ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 1. Check local database record first
      let { data: tx } = await supabase
        .from('PaymentTransaction')
        .select('*')
        .eq('orderId', orderId)
        .maybeSingle();

      if (tx && tx.status === 'SUCCESS') {
        return new Response(JSON.stringify({
          success: true,
          status: 'SUCCESS',
          message: 'Payment confirmed successfully!',
          orderId,
          itemType: tx.itemType,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. Direct Cashfree Gateway Status Fallback
      if ((!gateway || gateway === 'CASHFREE' || orderId.startsWith('tp_')) && CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
        try {
          const cfUrl = CASHFREE_ENV === 'PROD'
            ? `https://api.cashfree.com/pg/orders/${orderId}`
            : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

          const cfRes = await fetch(cfUrl, {
            headers: {
              'x-client-id': CASHFREE_APP_ID,
              'x-client-secret': CASHFREE_SECRET_KEY,
              'x-api-version': '2023-08-01',
            },
          });

          if (cfRes.ok) {
            const cfData = await cfRes.json();
            if (cfData.order_status === 'PAID') {
              console.log(`Direct Cashfree verification confirmed order ${orderId} is PAID! Fulfilling now...`);
              await fulfillOrder(
                orderId,
                'CASHFREE',
                String(cfData.cf_order_id || ''),
                String(cfData.order_id || '')
              );

              return new Response(JSON.stringify({
                success: true,
                status: 'SUCCESS',
                message: 'Payment confirmed successfully!',
                orderId,
                itemType: tx?.itemType || 'VIP_PASS',
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
        } catch (cfErr) {
          console.error('Direct Cashfree lookup error:', cfErr);
        }
      }

      // 3. Direct Instamojo Gateway Status Fallback
      const paymentReqId = tx?.gatewayOrderId || body.paymentRequestId;
      if ((gateway === 'INSTAMOJO' || paymentReqId) && INSTAMOJO_API_KEY && INSTAMOJO_AUTH_TOKEN) {
        try {
          const imRes = await fetch(`https://www.instamojo.com/api/1.1/payment-requests/${paymentReqId}/`, {
            headers: {
              'X-Api-Key': INSTAMOJO_API_KEY,
              'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
            },
          });

          if (imRes.ok) {
            const imData = await imRes.json();
            const pr = imData.payment_request || imData;
            if (pr.status === 'Completed') {
              const paymentId = pr.payments?.[0]?.payment_id || `im_pay_${Date.now()}`;
              console.log(`Direct Instamojo verification confirmed order ${orderId} is Completed! Fulfilling now...`);
              await fulfillOrder(orderId, 'INSTAMOJO', String(paymentReqId), String(paymentId));

              return new Response(JSON.stringify({
                success: true,
                status: 'SUCCESS',
                message: 'Payment confirmed successfully!',
                orderId,
                itemType: tx?.itemType || 'VIP_PASS',
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
        } catch (imErr) {
          console.error('Direct Instamojo lookup error:', imErr);
        }
      }

      // 4. If transaction exists but not yet marked SUCCESS and not yet confirmed by gateway API
      if (tx) {
        return new Response(JSON.stringify({
          success: false,
          status: tx.status,
          message: 'Payment is being processed by the bank. Please hold on a moment...',
          orderId,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 5. If order row hasn't synced yet (network race condition), return PENDING 200 (never 404)
      return new Response(JSON.stringify({
        success: false,
        status: 'PENDING',
        message: 'Order status is synchronizing, please wait...',
        orderId,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // 7. Order Status Lookup
  if (path.includes('/payments/order/') && req.method === 'GET') {
    try {
      const orderId = path.split('/payments/order/')[1]?.replace(/\/+$/, '');
      const { data: tx, error } = await supabase
        .from('PaymentTransaction')
        .select('*')
        .eq('orderId', orderId)
        .single();

      if (!tx || error) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          orderId: tx.orderId,
          gateway: tx.gateway,
          itemType: tx.itemType,
          amountPaise: tx.amountPaise,
          amountRupees: (tx.amountPaise || 0) / 100,
          status: tx.status,
          customerName: tx.customerName,
          customerEmail: tx.customerEmail,
          trackId: tx.trackId,
          createdAt: tx.createdAt,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // 8. Admin Payments Dashboard
  if (path.includes('/admin/payments') && req.method === 'GET') {
    try {
      const { data: transactions } = await supabase
        .from('PaymentTransaction')
        .select('*')
        .order('createdAt', { ascending: false });

      const txList = transactions || [];
      const successfulTx = txList.filter((t: any) => t.status === 'SUCCESS');
      const pendingTx = txList.filter((t: any) => t.status === 'PENDING');
      const failedTx = txList.filter((t: any) => t.status === 'FAILED' || t.status === 'CANCELLED');

      const totalRevenuePaise = successfulTx.reduce((acc: number, t: any) => acc + (t.amountPaise || 0), 0);
      const cashfreeSuccess = successfulTx.filter((t: any) => t.gateway === 'CASHFREE');
      const instamojoSuccess = successfulTx.filter((t: any) => t.gateway === 'INSTAMOJO');

      const summary = {
        totalSuccessful: successfulTx.length,
        totalRevenuePaise,
        totalRevenueRupees: totalRevenuePaise / 100,
        pendingPayments: pendingTx.length,
        failedPayments: failedTx.length,
        byGateway: {
          cashfree: {
            count: cashfreeSuccess.length,
            revenueRupees: cashfreeSuccess.reduce((acc: number, t: any) => acc + (t.amountPaise || 0), 0) / 100,
          },
          instamojo: {
            count: instamojoSuccess.length,
            revenueRupees: instamojoSuccess.reduce((acc: number, t: any) => acc + (t.amountPaise || 0), 0) / 100,
          },
          razorpay: { count: 0, revenueRupees: 0 },
        },
      };

      return new Response(
        JSON.stringify({
          summary,
          transactions: txList,
          purchases: [],
          subscriptions: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found', path }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

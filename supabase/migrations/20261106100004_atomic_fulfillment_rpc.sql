-- Migration 04: Atomic Order Fulfillment PostgreSQL Function (RPC)
-- Executes order status update, VIP pass activation, and track entitlement in a single ACID transaction

CREATE OR REPLACE FUNCTION public.fulfill_order_atomic(
  p_order_id TEXT,
  p_gateway TEXT,
  p_gateway_order_id TEXT,
  p_gateway_payment_id TEXT,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_tx RECORD;
  v_user_id TEXT;
  v_hundred_years TIMESTAMPTZ;
  v_existing_sub_id TEXT;
  v_existing_purchase_id TEXT;
BEGIN
  -- 1. Fetch and Lock Transaction row
  SELECT * INTO v_tx 
  FROM public."PaymentTransaction" 
  WHERE "orderId" = p_order_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found in transaction ledger: ' || p_order_id
    );
  END IF;

  -- 2. Idempotency Check: if already SUCCESS, return success immediately
  IF v_tx.status = 'SUCCESS' THEN
    RETURN jsonb_build_object(
      'success', true,
      'orderId', p_order_id,
      'alreadyFulfilled', true,
      'itemType', v_tx."itemType",
      'userId', v_tx."userId",
      'message', 'Order was already fulfilled successfully.'
    );
  END IF;

  -- 3. Resolve user ID: if not attached to transaction, lookup by customerEmail
  v_user_id := v_tx."userId";
  IF v_user_id IS NULL AND v_tx."customerEmail" IS NOT NULL THEN
    SELECT id INTO v_user_id 
    FROM public."User" 
    WHERE LOWER(email) = LOWER(v_tx."customerEmail") 
    LIMIT 1;

    -- Update transaction with resolved user ID
    IF v_user_id IS NOT NULL THEN
      UPDATE public."PaymentTransaction" 
      SET "userId" = v_user_id 
      WHERE "orderId" = p_order_id;
    END IF;
  END IF;

  -- 4. Mark Transaction as SUCCESS
  UPDATE public."PaymentTransaction"
  SET
    status = 'SUCCESS',
    gateway = COALESCE(p_gateway, gateway),
    "gatewayOrderId" = COALESCE(p_gateway_order_id, "gatewayOrderId"),
    "gatewayPaymentId" = COALESCE(p_gateway_payment_id, "gatewayPaymentId"),
    "paymentMethod" = COALESCE(p_payment_method, "paymentMethod"),
    "updatedAt" = NOW()
  WHERE "orderId" = p_order_id;

  -- 5. Fulfill VIP Pass Subscription (₹299 One-Time Lifetime Pass)
  IF v_tx."itemType" = 'VIP_PASS' AND v_user_id IS NOT NULL THEN
    v_hundred_years := NOW() + INTERVAL '100 years';

    SELECT id INTO v_existing_sub_id 
    FROM public."Subscription" 
    WHERE "userId" = v_user_id 
    LIMIT 1;

    IF v_existing_sub_id IS NOT NULL THEN
      UPDATE public."Subscription"
      SET
        status = 'ACTIVE',
        "planName" = 'Tony''s VIP Lifetime Pass',
        "amountPaise" = COALESCE(v_tx."amountPaise", 29900),
        "currentPeriodStart" = NOW(),
        "currentPeriodEnd" = v_hundred_years,
        gateway = p_gateway,
        "gatewayOrderId" = p_gateway_order_id,
        "gatewayPaymentId" = p_gateway_payment_id,
        "updatedAt" = NOW()
      WHERE id = v_existing_sub_id;
    ELSE
      INSERT INTO public."Subscription" (
        id,
        "userId",
        "planName",
        status,
        "amountPaise",
        "currentPeriodStart",
        "currentPeriodEnd",
        gateway,
        "gatewayOrderId",
        "gatewayPaymentId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        v_user_id,
        'Tony''s VIP Lifetime Pass',
        'ACTIVE',
        COALESCE(v_tx."amountPaise", 29900),
        NOW(),
        v_hundred_years,
        p_gateway,
        p_gateway_order_id,
        p_gateway_payment_id,
        NOW(),
        NOW()
      );
    END IF;

  -- 6. Fulfill Single Backing Track Purchase (₹99 Studio Track)
  ELSIF v_tx."itemType" = 'TRACK' AND v_user_id IS NOT NULL AND v_tx."trackId" IS NOT NULL THEN
    SELECT id INTO v_existing_purchase_id 
    FROM public."Purchase" 
    WHERE "userId" = v_user_id AND "trackId" = v_tx."trackId" 
    LIMIT 1;

    IF v_existing_purchase_id IS NOT NULL THEN
      UPDATE public."Purchase"
      SET
        status = 'SUCCESS',
        gateway = p_gateway,
        "gatewayOrderId" = p_gateway_order_id,
        "gatewayPaymentId" = p_gateway_payment_id
      WHERE id = v_existing_purchase_id;
    ELSE
      INSERT INTO public."Purchase" (
        id,
        "userId",
        "trackId",
        "amountPaise",
        status,
        gateway,
        "gatewayOrderId",
        "gatewayPaymentId",
        "createdAt"
      )
      VALUES (
        gen_random_uuid()::text,
        v_user_id,
        v_tx."trackId",
        COALESCE(v_tx."amountPaise", 9900),
        'SUCCESS',
        p_gateway,
        p_gateway_order_id,
        p_gateway_payment_id,
        NOW()
      );
    END IF;

    -- Upsert Entitlement
    INSERT INTO public."Entitlement" (
      id,
      "userId",
      "trackId",
      "entitlementType",
      "createdAt"
    )
    VALUES (
      gen_random_uuid()::text,
      v_user_id,
      v_tx."trackId",
      'PURCHASE',
      NOW()
    )
    ON CONFLICT ("userId", "trackId", "entitlementType") DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'orderId', p_order_id,
    'itemType', v_tx."itemType",
    'userId', v_user_id,
    'message', CASE 
      WHEN v_tx."itemType" = 'VIP_PASS' THEN 'Tony''s One-Time VIP Lifetime Pass activated successfully.'
      ELSE 'Studio backing track purchase verified and access unlocked.'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


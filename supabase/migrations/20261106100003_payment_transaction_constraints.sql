-- Migration 03: Constraints, Indexes & Audit Timestamps
-- Adds performance indexes and prevents duplicate transaction records

-- 1. Index PaymentTransaction
CREATE INDEX IF NOT EXISTS "idx_payment_tx_user_id" 
  ON public."PaymentTransaction"("userId");

CREATE INDEX IF NOT EXISTS "idx_payment_tx_order_id" 
  ON public."PaymentTransaction"("orderId");

CREATE INDEX IF NOT EXISTS "idx_payment_tx_gateway_order_id" 
  ON public."PaymentTransaction"("gatewayOrderId");

CREATE INDEX IF NOT EXISTS "idx_payment_tx_status" 
  ON public."PaymentTransaction"("status");

CREATE INDEX IF NOT EXISTS "idx_payment_tx_created_at" 
  ON public."PaymentTransaction"("createdAt" DESC);

-- 2. Index Subscription & Purchase
CREATE INDEX IF NOT EXISTS "idx_subscription_user_status" 
  ON public."Subscription"("userId", "status");

CREATE INDEX IF NOT EXISTS "idx_purchase_user_track_status" 
  ON public."Purchase"("userId", "trackId", "status");

-- 3. Index Track & Entitlement
CREATE INDEX IF NOT EXISTS "idx_track_status_category" 
  ON public."Track"("status", "category");

CREATE INDEX IF NOT EXISTS "idx_track_is_track" 
  ON public."Track"("isTrack");

CREATE INDEX IF NOT EXISTS "idx_entitlement_user_track" 
  ON public."Entitlement"("userId", "trackId");

-- 4. Index WebhookEvent for idempotency
CREATE INDEX IF NOT EXISTS "idx_webhook_event_event_id" 
  ON public."WebhookEvent"("eventId");


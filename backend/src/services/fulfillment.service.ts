import { prisma } from '../prisma.js';

export interface FulfillmentParams {
  orderId: string;
  gateway: 'CASHFREE' | 'INSTAMOJO' | 'RAZORPAY';
  gatewayOrderId?: string;
  gatewayPaymentId: string;
  paymentMethod?: string;
  rawResponse?: any;
}

export class FulfillmentService {
  /**
   * Helper to ensure user exists in PostgreSQL before recording transactions
   */
  async ensureUser(user: { id: string; email: string; name?: string; phone?: string; role?: string }): Promise<string> {
    const normalizedEmail = user.email.toLowerCase().trim();
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
        ],
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: normalizedEmail,
          name: user.name || 'Customer',
          phone: user.phone || null,
          role: user.role || 'USER',
          provider: 'LOCAL',
        },
      });
    }

    return dbUser.id;
  }

  /**
   * Fulfills an order securely and idempotently
   */
  async fulfillOrder(params: FulfillmentParams): Promise<{
    success: boolean;
    orderId: string;
    itemType: string;
    message: string;
    alreadyFulfilled?: boolean;
    trackTitle?: string;
  }> {
    const { orderId, gateway, gatewayOrderId, gatewayPaymentId, paymentMethod, rawResponse } = params;

    // 1. Locate the pending transaction in database
    let transaction = await prisma.paymentTransaction.findUnique({
      where: { orderId },
      include: { track: true, user: true },
    });

    // Fallback: check Purchase or Subscription by gatewayOrderId or orderId
    if (!transaction) {
      const existingPurchase = await prisma.purchase.findFirst({
        where: {
          OR: [
            { razorpayOrderId: orderId },
            { gatewayOrderId: orderId },
            { id: orderId },
          ],
        },
        include: { track: true, user: true },
      });

      if (existingPurchase) {
        transaction = await prisma.paymentTransaction.create({
          data: {
            orderId,
            gateway,
            gatewayOrderId: gatewayOrderId || orderId,
            gatewayPaymentId,
            userId: existingPurchase.userId,
            itemType: 'TRACK',
            trackId: existingPurchase.trackId,
            amountPaise: existingPurchase.amountPaise,
            status: existingPurchase.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
            customerName: existingPurchase.user?.name,
            customerEmail: existingPurchase.user?.email,
          },
          include: { track: true, user: true },
        });
      }
    }

    if (!transaction) {
      throw new Error(`Order ${orderId} was not found in the transaction records.`);
    }

    // 2. Idempotency Check: If already completed, return immediately
    if (transaction.status === 'SUCCESS') {
      return {
        success: true,
        orderId,
        itemType: transaction.itemType,
        message: 'Order was already successfully fulfilled.',
        alreadyFulfilled: true,
        trackTitle: transaction.track?.titleEnglish,
      };
    }

    const userId = transaction.userId;
    if (!userId) {
      throw new Error(`Transaction ${orderId} does not have an associated customer.`);
    }

    // 3. Fulfill Entitlement based on product type
    if (transaction.itemType === 'VIP_PASS') {
      // Rule: ₹299 One-time regular song pass
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 100); // 100-year lifetime pass

      const existingSub = await prisma.subscription.findFirst({
        where: { userId },
      });

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: 'ACTIVE',
            planName: "Tony's VIP Lifetime Pass",
            amountPaise: 29900,
            gateway,
            gatewayOrderId: gatewayOrderId || orderId,
            gatewayPaymentId,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            planName: "Tony's VIP Lifetime Pass",
            status: 'ACTIVE',
            amountPaise: 29900,
            gateway,
            gatewayOrderId: gatewayOrderId || orderId,
            gatewayPaymentId,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
      }
    } else if (transaction.itemType === 'TRACK') {
      // Rule: ₹99 individual backing / karaoke track purchase
      const trackId = transaction.trackId;
      if (!trackId) {
        throw new Error(`Track transaction ${orderId} is missing target trackId.`);
      }

      // Upsert Purchase record
      const existingPurchase = await prisma.purchase.findFirst({
        where: { userId, trackId },
      });

      if (existingPurchase) {
        await prisma.purchase.update({
          where: { id: existingPurchase.id },
          data: {
            status: 'SUCCESS',
            gateway,
            gatewayOrderId: gatewayOrderId || orderId,
            gatewayPaymentId,
          },
        });
      } else {
        await prisma.purchase.create({
          data: {
            userId,
            trackId,
            amountPaise: transaction.amountPaise || 9900,
            status: 'SUCCESS',
            gateway,
            gatewayOrderId: gatewayOrderId || orderId,
            gatewayPaymentId,
          },
        });
      }

      // Upsert Entitlement record
      await prisma.entitlement.upsert({
        where: {
          userId_trackId_entitlementType: {
            userId,
            trackId,
            entitlementType: 'PURCHASE',
          },
        },
        create: {
          userId,
          trackId,
          entitlementType: 'PURCHASE',
        },
        update: {},
      });
    }

    // 4. Update PaymentTransaction ledger status to SUCCESS
    await prisma.paymentTransaction.update({
      where: { orderId },
      data: {
        status: 'SUCCESS',
        gateway,
        gatewayOrderId: gatewayOrderId || orderId,
        gatewayPaymentId,
        paymentMethod: paymentMethod || undefined,
        rawResponse: rawResponse ? JSON.stringify(rawResponse) : undefined,
      },
    });

    return {
      success: true,
      orderId,
      itemType: transaction.itemType,
      message: transaction.itemType === 'VIP_PASS'
        ? "Payment verified! Tony's One-Time VIP Lifetime Pass activated."
        : 'Payment verified! Studio backing track unlocked.',
      trackTitle: transaction.track?.titleEnglish,
    };
  }

  /**
   * Marks a transaction as FAILED
   */
  async failOrder(orderId: string, errorMessage: string, rawResponse?: any): Promise<void> {
    try {
      await prisma.paymentTransaction.updateMany({
        where: { orderId },
        data: {
          status: 'FAILED',
          errorMessage,
          rawResponse: rawResponse ? JSON.stringify(rawResponse) : undefined,
        },
      });
    } catch (err) {
      console.error(`Error marking order ${orderId} as failed:`, err);
    }
  }
}

export const fulfillmentService = new FulfillmentService();


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
   * Fulfills an order securely, atomically, and idempotently
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

    // 1. Try PostgreSQL Atomic RPC `public.fulfill_order_atomic` first (row lock FOR UPDATE)
    try {
      const rpcRows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT public.fulfill_order_atomic($1, $2, $3, $4, $5) as res`,
        orderId,
        gateway,
        gatewayOrderId || orderId,
        gatewayPaymentId,
        paymentMethod || gateway
      );

      if (rpcRows && rpcRows[0]?.res) {
        const res = rpcRows[0].res;
        if (res.success) {
          // Persist rawResponse if available
          if (rawResponse) {
            await prisma.paymentTransaction.updateMany({
              where: { orderId },
              data: {
                rawResponse: typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse),
              },
            }).catch(() => {});
          }

          // Fetch track title if item is TRACK
          let trackTitle: string | undefined;
          if (res.itemType === 'TRACK') {
            const tx = await prisma.paymentTransaction.findUnique({
              where: { orderId },
              include: { track: true },
            });
            trackTitle = tx?.track?.titleEnglish;
          }

          return {
            success: true,
            orderId,
            itemType: res.itemType || 'TRACK',
            message: res.message || (res.itemType === 'VIP_PASS'
              ? "Payment verified! Tony's One-Time VIP Lifetime Pass activated."
              : 'Payment verified! Studio backing track unlocked.'),
            alreadyFulfilled: Boolean(res.alreadyFulfilled),
            trackTitle,
          };
        }
      }
    } catch (rpcErr) {
      console.warn('PostgreSQL atomic RPC note, executing Prisma interactive transaction:', rpcErr);
    }

    // 2. ACID Fallback: Prisma interactive $transaction with row-level safety
    return await prisma.$transaction(async (tx) => {
      let transaction = await tx.paymentTransaction.findUnique({
        where: { orderId },
        include: { track: true, user: true },
      });

      // Fallback: check Purchase or Subscription by gatewayOrderId or orderId
      if (!transaction) {
        const existingPurchase = await tx.purchase.findFirst({
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
          transaction = await tx.paymentTransaction.create({
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

      // Idempotency Check: If already completed, return immediately
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

      // Fulfill VIP Pass
      if (transaction.itemType === 'VIP_PASS') {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 100);

        const existingSub = await tx.subscription.findFirst({
          where: { userId },
        });

        if (existingSub) {
          await tx.subscription.update({
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
          await tx.subscription.create({
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
        const trackId = transaction.trackId;
        if (!trackId) {
          throw new Error(`Track transaction ${orderId} is missing target trackId.`);
        }

        const existingPurchase = await tx.purchase.findFirst({
          where: { userId, trackId },
        });

        if (existingPurchase) {
          await tx.purchase.update({
            where: { id: existingPurchase.id },
            data: {
              status: 'SUCCESS',
              gateway,
              gatewayOrderId: gatewayOrderId || orderId,
              gatewayPaymentId,
            },
          });
        } else {
          await tx.purchase.create({
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

        await tx.entitlement.upsert({
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

      // Mark Transaction as SUCCESS in the same transaction
      await tx.paymentTransaction.update({
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
    });
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


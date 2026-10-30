import { CashfreeService } from '../backend/dist/src/services/cashfree.service.js';
import { InstamojoService } from '../backend/dist/src/services/instamojo.service.js';

console.log('====================================================');
console.log('🧪 VERIFYING APPLICATION BACKEND PAYMENT SERVICES');
console.log('====================================================\n');

async function testServices() {
  const cashfree = new CashfreeService();
  const instamojo = new InstamojoService();

  console.log('1. CASHFREE SERVICE CONFIGURATION:');
  console.log('   - isConfigured:', cashfree.isConfigured);
  console.log('   - isProduction:', cashfree.isProduction);
  console.log('   - baseUrl:', cashfree.baseUrl);

  console.log('\n2. INSTAMOJO SERVICE CONFIGURATION:');
  console.log('   - isConfigured:', instamojo.isConfigured);
  console.log('   - isProduction:', instamojo.isProduction);
  console.log('   - baseUrl:', instamojo.baseUrl);

  // Test Cashfree Order Creation
  console.log('\n3. TESTING CASHFREE LIVE ORDER CREATION (₹299 VIP PASS)...');
  try {
    const cfOrder = await cashfree.createOrder({
      orderId: 'cf_live_test_' + Date.now(),
      orderAmount: 299.00,
      orderCurrency: 'INR',
      customerId: 'cust_live_test_user',
      customerName: 'Tony Prakash Customer',
      customerEmail: 'customer@tonyprakash.com',
      customerPhone: '9848012345',
      returnUrl: 'https://tony-prakash-music.vercel.app/payment-return?order_id={order_id}',
      orderNote: 'VIP Pass Lifetime Access',
    });

    console.log('   ✅ CASHFREE ORDER CREATED SUCCESSFULLY!');
    console.log('   - cfOrderId:', cfOrder.cfOrderId);
    console.log('   - orderId:', cfOrder.orderId);
    console.log('   - orderStatus:', cfOrder.orderStatus);
    console.log('   - paymentSessionId prefix:', cfOrder.paymentSessionId.slice(0, 30) + '...');
  } catch (err) {
    console.error('   ❌ CASHFREE ERROR:', err.message);
  }

  // Test Instamojo Payment Request Creation
  console.log('\n4. TESTING INSTAMOJO LIVE PAYMENT CREATION (₹99 BACKING TRACK)...');
  try {
    const imOrder = await instamojo.createPaymentRequest({
      amount: 99.00,
      purpose: 'Studio Minus-One Track',
      buyerName: 'Tony Prakash Customer',
      email: 'customer@tonyprakash.com',
      phone: '9848012345',
      redirectUrl: 'https://tony-prakash-music.vercel.app/payment-return',
    });

    console.log('   ✅ INSTAMOJO PAYMENT REQUEST CREATED SUCCESSFULLY!');
    console.log('   - paymentRequestId:', imOrder.paymentRequestId);
    console.log('   - paymentUrl:', imOrder.paymentUrl);
    console.log('   - status:', imOrder.status);
    console.log('   - amount:', imOrder.amount);
  } catch (err) {
    console.error('   ❌ INSTAMOJO ERROR:', err.message);
  }

  console.log('\n====================================================');
  console.log('🎉 LIVE CREDENTIAL VERIFICATION COMPLETE');
  console.log('====================================================');
}

testServices().catch(console.error);

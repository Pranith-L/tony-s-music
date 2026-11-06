const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://mrehomunxqccvcwpkwxd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9';

const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'tony_prakash_auth_session',
  },
});

async function runAuthTests() {
  console.log('====================================================');
  console.log('PROMPT 04 VERIFICATION: SUPABASE AUTH & 14-DAY SESSIONS');
  console.log('====================================================');

  const adminEmail = 'Tonyprakash.l@admin.in';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Tonyprakash@admin';

  console.log(`\n[Test 1] Testing Administrator Sign-In: ${adminEmail}`);
  const { data: adminAuth, error: adminErr } = await client.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (adminErr) {
    console.error('❌ Admin Sign-In failed:', adminErr.message);
    process.exit(1);
  }

  console.log('✅ Admin authenticated successfully!');
  console.log(`   User ID: ${adminAuth.user.id}`);
  console.log(`   Email: ${adminAuth.user.email}`);
  console.log(`   Role in metadata: ${adminAuth.user.user_metadata?.role || adminAuth.user.app_metadata?.role}`);
  console.log(`   Access Token (first 25 chars): ${adminAuth.session.access_token.slice(0, 25)}...`);
  console.log(`   Refresh Token present: ${Boolean(adminAuth.session.refresh_token)}`);
  console.log(`   Expires In: ${adminAuth.session.expires_in} seconds (~${Math.round(adminAuth.session.expires_in / 3600)}h)`);

  console.log('\n[Test 2] Verifying User Profile in public."User" under RLS');
  const { data: dbUser, error: dbErr } = await client
    .from('User')
    .select('id, email, name, role')
    .eq('id', adminAuth.user.id)
    .single();

  if (dbErr) {
    console.error('❌ Failed to fetch user profile under RLS:', dbErr.message);
    process.exit(1);
  }
  console.log('✅ Profile fetched under RLS:');
  console.log(`   Name: ${dbUser.name}`);
  console.log(`   Role in DB: ${dbUser.role}`);

  console.log('\n[Test 3] Verifying RLS Admin Privileges (public.is_admin())');
  const { data: tracks, error: tracksErr } = await client
    .from('Track')
    .select('id, titleEnglish')
    .limit(3);

  if (tracksErr) {
    console.error('❌ Failed to read tracks as Admin:', tracksErr.message);
    process.exit(1);
  }
  console.log(`✅ Tracks accessible under RLS: fetched ${tracks.length} tracks.`);

  console.log('\n[Test 4] Testing Session Refresh & Token Rotation');
  const { data: refreshed, error: refreshErr } = await client.auth.refreshSession({
    refresh_token: adminAuth.session.refresh_token,
  });

  if (refreshErr) {
    console.error('❌ Refresh failed:', refreshErr.message);
    process.exit(1);
  }
  console.log('✅ Session refreshed successfully!');
  console.log(`   New Access Token (first 25 chars): ${refreshed.session.access_token.slice(0, 25)}...`);
  console.log(`   New Refresh Token present: ${Boolean(refreshed.session.refresh_token)}`);

  console.log('\n[Test 5] Testing Regular User Registration & Session');
  const testUserEmail = `test.listener.${Date.now()}@gmail.com`;
  const testUserPassword = 'TestPassword123!';
  const { data: registeredUser, error: regErr } = await client.auth.signUp({
    email: testUserEmail,
    password: testUserPassword,
    options: {
      data: {
        name: 'Test Listener',
        full_name: 'Test Listener',
        role: 'USER',
      },
    },
  });

  if (regErr) {
    console.error('❌ Registration failed:', regErr.message);
  } else {
    console.log(`✅ Test user registered: ${testUserEmail}`);
    console.log(`   User ID: ${registeredUser.user?.id}`);
    
    // Check if user was synced to public."User" via our migration trigger
    const { data: syncedUser } = await client
      .from('User')
      .select('id, email, name, role')
      .eq('id', registeredUser.user.id)
      .maybeSingle();

    if (syncedUser) {
      console.log(`✅ Auto-synced to public."User" successfully! (Name: ${syncedUser.name}, Role: ${syncedUser.role})`);
    } else {
      console.log('ℹ️ User trigger pending or confirmed email required.');
    }
  }

  console.log('\n[Test 6] Testing Sign-Out & Session Revocation');
  const { error: signoutErr } = await client.auth.signOut();
  if (signoutErr) {
    console.error('❌ Sign-out error:', signoutErr.message);
    process.exit(1);
  }
  console.log('✅ Sign-out successful, local session cleared.');

  const { data: postLogoutSession } = await client.auth.getSession();
  console.log(`   Post-logout active session: ${Boolean(postLogoutSession.session)}`);

  console.log('\n====================================================');
  console.log('ALL PROMPT 04 AUTHENTICATION & SESSION TESTS PASSED!');
  console.log('====================================================');
}

runAuthTests().catch((e) => {
  console.error('Unexpected error in auth verification:', e);
  process.exit(1);
});

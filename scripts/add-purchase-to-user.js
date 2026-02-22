/**
 * Add Purchase to Existing User
 * 
 * This script adds a purchase record to an existing user
 * 
 * Usage: node scripts/add-purchase-to-user.js <email>
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addPurchaseToUser(email) {
  console.log(`🚀 Adding purchase to user: ${email}\n`);

  try {
    // Find user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // Check if purchase already exists
    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingPurchase) {
      console.log('ℹ️  Purchase already exists for this user');
      return;
    }

    // Create purchase
    console.log('📦 Creating purchase record...');
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: user.id,
        status: 'completed',
        amount: 99.99,
        currency: 'TRY',
        payment_method: 'manual',
        payment_provider: 'test',
        transaction_id: `test-${Date.now()}`,
        expires_at: null // Lifetime access
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('❌ Error creating purchase:', purchaseError.message);
      if (purchaseError.message.includes('table') && purchaseError.message.includes('not found')) {
        console.error('\n⚠️  The purchases table does not exist in your database.');
        console.error('   Please run the SQL migration from supabase/schema.sql');
        console.error('   Specifically, run the "Purchases table" section.');
      }
      process.exit(1);
    }

    console.log('✅ Purchase created successfully!');
    console.log(`   Purchase ID: ${purchase.id}`);
    console.log(`   Amount: ${purchase.amount} ${purchase.currency}`);
    console.log(`   Status: ${purchase.status}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2] || 'purchased@test.com';
addPurchaseToUser(email);


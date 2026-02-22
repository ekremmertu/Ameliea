/**
 * Create Test Users with Purchase Status
 * 
 * This script creates two test users:
 * 1. User with purchase (can access dashboard)
 * 2. User without purchase (cannot access dashboard)
 * 
 * Usage: node scripts/create-test-users-with-purchase.js
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
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  // User 1: With purchase
  const userWithPurchase = {
    email: 'purchased@test.com',
    password: 'Test123456!',
    user_metadata: {
      name: 'Test User (Purchased)',
      full_name: 'Test User (Purchased)'
    }
  };

  // User 2: Without purchase
  const userWithoutPurchase = {
    email: 'notpurchased@test.com',
    password: 'Test123456!',
    user_metadata: {
      name: 'Test User (Not Purchased)',
      full_name: 'Test User (Not Purchased)'
    }
  };

  try {
    // Create user with purchase
    console.log('📝 Creating user with purchase...');
    
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser1 = existingUsers?.users?.find(u => u.email === userWithPurchase.email);
    
    let user1;
    if (existingUser1) {
      console.log('   ⚠️  User already exists, updating password...');
      // Update password for existing user
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser1.id,
        {
          password: userWithPurchase.password,
          user_metadata: userWithPurchase.user_metadata
        }
      );
      
      if (updateError) {
        console.error('   ❌ Error updating user:', updateError.message);
        throw updateError;
      }
      
      user1 = { user: existingUser1 };
      console.log('   ✅ User password updated:', existingUser1.email);
    } else {
      const { data: newUser, error: error1 } = await supabaseAdmin.auth.admin.createUser({
        email: userWithPurchase.email,
        password: userWithPurchase.password,
        email_confirm: true,
        user_metadata: userWithPurchase.user_metadata
      });

      if (error1) {
        throw error1;
      }
      
      user1 = newUser;
      console.log('   ✅ User created:', user1.user.email);
    }

    if (user1.user) {
      console.log('   📦 Creating/updating purchase record...');
      
      // Check if purchase already exists
      const { data: existingPurchase } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .eq('user_id', user1.user.id)
        .eq('status', 'completed')
        .maybeSingle();
      
      if (existingPurchase) {
        console.log('   ℹ️  Purchase already exists for this user');
      } else {
        // Create purchase for this user
        const { data: purchase, error: purchaseError } = await supabaseAdmin
          .from('purchases')
          .insert({
            user_id: user1.user.id,
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
          console.error('   ❌ Error creating purchase:', purchaseError.message);
        } else {
          console.log('   ✅ Purchase created successfully');
        }
      }
    }

    console.log('\n📝 Creating user without purchase...');
    
    // Check if user already exists
    const existingUser2 = existingUsers?.users?.find(u => u.email === userWithoutPurchase.email);
    
    if (existingUser2) {
      console.log('   ⚠️  User already exists, updating password...');
      // Update password for existing user
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser2.id,
        {
          password: userWithoutPurchase.password,
          user_metadata: userWithoutPurchase.user_metadata
        }
      );
      
      if (updateError) {
        console.error('   ❌ Error updating user:', updateError.message);
        throw updateError;
      }
      
      console.log('   ✅ User password updated:', existingUser2.email);
      console.log('   ℹ️  No purchase record (user cannot access dashboard)');
    } else {
      const { data: user2, error: error2 } = await supabaseAdmin.auth.admin.createUser({
        email: userWithoutPurchase.email,
        password: userWithoutPurchase.password,
        email_confirm: true,
        user_metadata: userWithoutPurchase.user_metadata
      });

      if (error2) {
        throw error2;
      }
      
      console.log('   ✅ User created:', user2.user.email);
      console.log('   ℹ️  No purchase record (user cannot access dashboard)');
    }

    console.log('\n✅ Test users created successfully!\n');
    console.log('📋 Test Credentials:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User WITH Purchase (Dashboard Access):');
    console.log('   Email:    purchased@test.com');
    console.log('   Password: Test123456!');
    console.log('   Status:   ✅ Can access dashboard');
    console.log('\nUser WITHOUT Purchase (No Dashboard Access):');
    console.log('   Email:    notpurchased@test.com');
    console.log('   Password: Test123456!');
    console.log('   Status:   ❌ Cannot access dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
    process.exit(1);
  }
}

createTestUsers();


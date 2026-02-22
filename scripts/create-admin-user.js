/**
 * Create Admin Test User Script
 * Creates a test admin user in Supabase
 * 
 * Usage: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const adminEmail = 'admin@test.com';
  const adminPassword = 'Admin123!';
  const adminFirstName = 'Admin';
  const adminLastName = 'User';

  try {
    console.log('🔄 Creating admin test user...');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === adminEmail);

    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Update password
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            first_name: adminFirstName,
            last_name: adminLastName,
            full_name: `${adminFirstName} ${adminLastName}`,
          },
        }
      );

      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        process.exit(1);
      }

      console.log('✅ Admin user password updated successfully!');
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm (no email sent)
        user_metadata: {
          first_name: adminFirstName,
          last_name: adminLastName,
          full_name: `${adminFirstName} ${adminLastName}`,
        },
      });

      if (authError) {
        console.error('❌ Error creating user:', authError);
        process.exit(1);
      }

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 IMPORTANT: Add this email to .env.local:');
    console.log(`ADMIN_EMAILS=${adminEmail}`);
    console.log('\n🔐 Login credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n✅ You can now login at /login and access /admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createAdminUser();


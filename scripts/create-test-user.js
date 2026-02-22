/**
 * Test Kullanıcısı Oluşturma Script'i
 * 
 * Kullanım:
 * node scripts/create-test-user.js
 * 
 * Veya email belirtmek için:
 * node scripts/create-test-user.js test@example.com
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local dosyasını manuel oku
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Hata: .env.local dosyasında SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı!');
  process.exit(1);
}

// Service role key ile admin client oluştur
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser(email, password = 'Test123!@#') {
  try {
    console.log(`\n🔐 Test kullanıcısı oluşturuluyor...`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}\n`);

    // Kullanıcı oluştur (email confirmation kapalı olduğu için direkt confirm ediyoruz)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email'i otomatik confirm et (email confirmation kapalı olsa bile)
      user_metadata: {
        name: 'Test User',
        role: 'test'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Bu email zaten kayıtlı!');
        
        // Kullanıcıyı bul
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === email);
        
        if (user) {
          console.log(`✅ Kullanıcı bulundu:`);
          console.log(`   User ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Created: ${user.created_at}`);
          console.log(`\n🔗 Magic link ile giriş yapabilirsiniz: http://localhost:4173/login`);
        }
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Kullanıcı oluşturulamadı');
    }

    console.log('✅ Test kullanıcısı başarıyla oluşturuldu!');
    console.log(`\n📋 Kullanıcı Bilgileri:`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   Created: ${authData.user.created_at}`);
    console.log(`\n🔗 Giriş yapmak için:`);
    console.log(`   1. http://localhost:4173/login adresine gidin`);
    console.log(`   2. Email: ${email}`);
    console.log(`   3. Magic link gönderin veya password ile giriş yapın`);
    console.log(`\n💡 Not: Supabase Auth'da password authentication açık değilse, sadece magic link kullanabilirsiniz.`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.details) {
      console.error('   Detaylar:', error.details);
    }
    process.exit(1);
  }
}

// Script çalıştır
const email = process.argv[2] || 'test@example.com';
createTestUser(email);


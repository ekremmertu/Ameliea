/**
 * Kurulum kontrolü: env değişkenleri ve (isteğe bağlı) Supabase bağlantısı
 * Gizli değerleri yazdırmaz, sadece var/yok ve geçerli mi kontrol eder.
 *
 * Kullanım: node scripts/check-setup.js
 * Health API test (sunucu çalışıyorsa): node scripts/check-setup.js --health
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
    return true;
  }
  return false;
}

const required = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', minLength: 20, hint: 'Supabase proje URL (https://xxx.supabase.co)' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', minLength: 20, hint: 'Supabase anon (public) key' },
  { key: 'NEXT_PUBLIC_APP_URL', minLength: 5, hint: 'Uygulama URL (örn. http://localhost:4173)' },
];

const optional = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_EMAILS',
  'NEXT_PUBLIC_ADMIN_EMAILS',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'IYZICO_API_KEY',
  'IYZICO_SECRET_KEY',
];

function checkUrl(val) {
  if (!val || val.length < 10) return false;
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}

function main() {
  console.log('=== Kurulum Kontrolü ===\n');

  const hasEnvFile = loadEnvFile();
  if (!hasEnvFile) {
    console.log('⚠️  .env.local bulunamadı. Örnek: cp .env.example .env.local');
    console.log('   Gerekli değişkenler .env.example içinde.\n');
  } else {
    console.log('✅ .env.local okundu\n');
  }

  let allOk = true;
  console.log('Zorunlu değişkenler:');
  for (const { key, minLength, hint } of required) {
    const val = process.env[key];
    const set = val && String(val).trim().length >= minLength;
    const placeholder = val && (val.includes('placeholder') || val.includes('your_'));
    const urlOk = key.includes('URL') ? checkUrl(val) : true;
    if (!set || placeholder || !urlOk) {
      console.log(`  ❌ ${key}: ${!val ? 'eksik' : placeholder ? 'placeholder/örnek değer' : !urlOk ? 'geçersiz URL' : 'çok kısa'}`);
      if (hint) console.log(`     → ${hint}`);
      allOk = false;
    } else {
      console.log(`  ✅ ${key}: tanımlı (${String(val).length} karakter)`);
    }
  }

  console.log('\nOpsiyonel değişkenler:');
  for (const key of optional) {
    const val = process.env[key];
    console.log(`  ${val ? '✅' : '○'} ${key}: ${val ? 'tanımlı' : 'yok'}`);
  }

  const runHealth = process.argv.includes('--health');
  if (runHealth) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4173';
    const url = new URL('/api/health', baseUrl);
    console.log(`\nHealth API (${url.toString()}):`);
    const req = http.get(url.toString(), (res) => {
      let body = '';
      res.on('data', (ch) => (body += ch));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.status === 'healthy' && data.database === 'connected') {
            console.log('  ✅ status:', data.status, ', database:', data.database);
          } else {
            console.log('  ⚠️', data.status || body);
            if (data.error) console.log('  Hata:', data.error);
          }
        } catch {
          console.log('  ❌ Yanıt parse edilemedi:', body.slice(0, 200));
        }
      });
    });
    req.on('error', (err) => {
      console.log('  ❌ İstek hatası (sunucu çalışıyor mu?):', err.message);
    });
    req.setTimeout(5000, () => {
      req.destroy();
      console.log('  ❌ Zaman aşımı');
    });
    return;
  }

  console.log('\n---');
  if (allOk) {
    console.log('✅ Zorunlu değişkenler tamam. Health test için: node scripts/check-setup.js --health');
  } else {
    console.log('❌ Eksik/hatalı değişkenleri .env.local içinde düzeltin.');
    process.exit(1);
  }
}

main();

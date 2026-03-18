/**
 * Tema videolarını Supabase Storage'a yükler.
 * 
 * Kullanım:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your_key \
 *   node scripts/upload-theme-videos.js
 * 
 * Yükleme sonrası: public bucket'tan video URL'leri otomatik çalışır.
 * Bucket adı: theme-assets (public erişim açık olmalı)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'theme-assets';

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project')) {
  console.error('❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.');
  console.error('   Kullanım: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=key node scripts/upload-theme-videos.js');
  process.exit(1);
}

const THEMES = [
  { folderName: 'Aşk',             videoFile: 'Video.mp4' },
  { folderName: 'Elit',            videoFile: 'Video.mp4' },
  { folderName: 'Ruhun Güzelliği', videoFile: 'Video.mp4' },
  { folderName: 'Vow',             videoFile: 'Video.mp4' },
  { folderName: 'Bloom',           videoFile: 'Video.mp4' },
];

const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'temalar');

async function uploadFile(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
  const url = new URL(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedPath}`);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'video/mp4',
        'Content-Length': fileBuffer.length,
        'x-upsert': 'true',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true, path: storagePath });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

async function createBucketIfNeeded() {
  const url = new URL(`${SUPABASE_URL}/storage/v1/bucket`);
  const body = JSON.stringify({ id: BUCKET, name: BUCKET, public: true });

  return new Promise((resolve) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let respBody = '';
      res.on('data', (chunk) => respBody += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ Bucket "${BUCKET}" oluşturuldu.`);
        } else if (res.statusCode === 409) {
          console.log(`ℹ️  Bucket "${BUCKET}" zaten mevcut.`);
        } else {
          console.warn(`⚠️  Bucket oluşturma: HTTP ${res.statusCode}: ${respBody}`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.warn(`⚠️  Bucket oluşturma hatası: ${err.message}`);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`\n🎬 Tema videoları Supabase Storage'a yükleniyor...`);
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Bucket: ${BUCKET}\n`);

  await createBucketIfNeeded();

  for (const theme of THEMES) {
    const localFile = path.join(PUBLIC_DIR, theme.folderName, theme.videoFile);
    const storagePath = `temalar/${theme.folderName}/${theme.videoFile}`;

    if (!fs.existsSync(localFile)) {
      console.warn(`⚠️  Dosya bulunamadı: ${localFile}`);
      continue;
    }

    const sizeMB = (fs.statSync(localFile).size / 1024 / 1024).toFixed(1);
    process.stdout.write(`📤 ${theme.folderName}/Video.mp4 (${sizeMB} MB) yükleniyor... `);

    try {
      await uploadFile(localFile, storagePath);
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent('temalar')}/${encodeURIComponent(theme.folderName)}/${encodeURIComponent(theme.videoFile)}`;
      console.log(`✅`);
      console.log(`   URL: ${publicUrl}`);
    } catch (err) {
      console.log(`❌ Hata: ${err.message}`);
    }
  }

  console.log(`\n✅ Tamamlandı! Artık video dosyalarını Git'ten çıkarabilirsiniz:`);
  console.log(`   git rm --cached "public/temalar/*/Video.mp4"`);
  console.log(`   .gitignore'a "public/temalar/**/Video.mp4" ekleyin.`);
  console.log(`\n   NEXT_PUBLIC_SUPABASE_URL ortam değişkeni ayarlandıktan sonra`);
  console.log(`   lib/theme-assets.ts videoları Supabase'den otomatik okur.\n`);
}

main().catch((err) => {
  console.error('❌ Kritik hata:', err);
  process.exit(1);
});

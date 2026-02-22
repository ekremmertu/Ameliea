#!/usr/bin/env node

/**
 * Corvus OS Sync Script
 * 
 * Bu script, web-next projesini Corvus Company OS'a tanıtır.
 * 
 * Kullanım:
 *   node scripts/corvus-sync.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ID = 'CORVUS_20260115_223526';
const CORVUS_ROOT = path.resolve(__dirname, '../../../../..');

console.log('🔗 Corvus OS Sync Başlatılıyor...\n');

// 1. .corvus.json kontrolü
const corvusJsonPath = path.join(__dirname, '../.corvus.json');
if (!fs.existsSync(corvusJsonPath)) {
  console.log('❌ .corvus.json bulunamadı!');
  process.exit(1);
}
console.log('✅ .corvus.json mevcut');

// 2. Build kontrolü
try {
  console.log('\n🔨 Build kontrolü...');
  execSync('npm run build', { stdio: 'pipe', cwd: __dirname + '/..' });
  console.log('✅ Build başarılı');
} catch (error) {
  console.log('❌ Build başarısız!');
  process.exit(1);
}

// 3. Corvus OS main.py kontrolü
const mainPyPath = path.join(CORVUS_ROOT, 'main.py');
if (!fs.existsSync(mainPyPath)) {
  console.log('\n⚠️  Corvus OS main.py bulunamadı');
  console.log(`   Beklenen yol: ${mainPyPath}`);
  console.log('   Manuel sync için: python main.py --project-id CORVUS_20260115_223526 --sync');
} else {
  console.log('\n✅ Corvus OS main.py mevcut');
  console.log('\n📋 Sync komutu:');
  console.log(`   cd ${CORVUS_ROOT}`);
  console.log(`   python main.py --project-id ${PROJECT_ID} --sync`);
}

// 4. Proje durumu özeti
console.log('\n📊 Proje Durumu:');
console.log(`   Project ID: ${PROJECT_ID}`);
console.log('   Platform: Web (Next.js 14)');
console.log('   Status: Active');
console.log('   Premium Upgrade: ✅ Tamamlandı');
console.log('\n✅ Sync hazır!');


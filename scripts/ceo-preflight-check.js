#!/usr/bin/env node

/**
 * CEO Pre-Flight Check
 * 
 * Yayınlamadan önce CEO'nun kontrol etmesi gereken tüm kritik noktaları kontrol eder.
 * 
 * Kullanım:
 *   npm run ceo-check
 *   node scripts/ceo-preflight-check.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let hasErrors = false;
let hasWarnings = false;

function log(message, type = 'info') {
  const colors = {
    error: RED,
    warning: YELLOW,
    success: GREEN,
    info: BLUE,
  };
  console.log(`${colors[type] || ''}${message}${RESET}`);
}

function checkBuild() {
  log('\n🔨 1. Build Kontrolü...', 'info');
  try {
    execSync('npm run build', { stdio: 'pipe', cwd: process.cwd() });
    log('✅ Build başarılı!', 'success');
    return true;
  } catch (error) {
    log('❌ Build başarısız!', 'error');
    log(error.stdout?.toString() || error.message, 'error');
    hasErrors = true;
    return false;
  }
}

function checkLint() {
  log('\n🔍 2. Lint Kontrolü...', 'info');
  try {
    execSync('npm run lint', { stdio: 'pipe', cwd: process.cwd() });
    log('✅ Lint hatası yok!', 'success');
    return true;
  } catch (error) {
    log('⚠️  Lint uyarıları var (kritik değil)', 'warning');
    hasWarnings = true;
    return false;
  }
}

function checkTypeScript() {
  log('\n📘 3. TypeScript Kontrolü...', 'info');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: process.cwd() });
    log('✅ TypeScript hatası yok!', 'success');
    return true;
  } catch (error) {
    log('❌ TypeScript hatası var!', 'error');
    log(error.stdout?.toString() || error.message, 'error');
    hasErrors = true;
    return false;
  }
}

function checkPremiumStrategy() {
  log('\n💎 4. Premium Strateji Kontrolü...', 'info');
  const checks = {
    pricing: false,
    packages: false,
    ctas: false,
  };

  // Pricing kontrolü
  const files = [
    'app/page.tsx',
    'components/sections/Themes.tsx',
    'lib/i18n.ts',
  ];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
    if (content.includes('$') || content.includes('price') || content.includes('pricing')) {
      if (!content.includes('pricing_title') && !content.includes('nav_pricing')) {
        checks.pricing = true;
      }
    }
  });

  // CTA kontrolü
  const i18nContent = fs.readFileSync(path.join(process.cwd(), 'lib/i18n.ts'), 'utf-8');
  if (i18nContent.includes('Start a conversation') || i18nContent.includes('Tell us your story')) {
    checks.ctas = true;
  }

  if (checks.pricing) {
    log('⚠️  Fiyat referansları bulundu (kontrol edilmeli)', 'warning');
    hasWarnings = true;
  } else {
    log('✅ Fiyat gösterimi yok (premium strateji uygun)', 'success');
  }

  if (checks.ctas) {
    log('✅ CTA\'lar görüşme odaklı (premium strateji uygun)', 'success');
  } else {
    log('⚠️  CTA\'lar kontrol edilmeli', 'warning');
    hasWarnings = true;
  }

  return true;
}

function checkSEO() {
  log('\n🔎 5. SEO Kontrolü...', 'info');
  const layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf-8');
  
  const checks = {
    metadata: layoutContent.includes('export const metadata'),
    openGraph: layoutContent.includes('openGraph'),
    structuredData: layoutContent.includes('application/ld+json'),
    sitemap: fs.existsSync(path.join(process.cwd(), 'app/sitemap.ts')),
    robots: fs.existsSync(path.join(process.cwd(), 'app/robots.ts')),
  };

  Object.entries(checks).forEach(([key, value]) => {
    if (value) {
      log(`✅ ${key} mevcut`, 'success');
    } else {
      log(`❌ ${key} eksik!`, 'error');
      hasErrors = true;
    }
  });

  return Object.values(checks).every(v => v);
}

function checkAccessibility() {
  log('\n♿ 6. Erişilebilirlik Kontrolü...', 'info');
  const componentFiles = [
    'components/layout/Header.tsx',
    'components/sections/Hero.tsx',
    'components/sections/Contact.tsx',
  ];

  let allGood = true;
  componentFiles.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
    if (!content.includes('aria-label') && !content.includes('aria-')) {
      log(`⚠️  ${file}: ARIA labels eksik olabilir`, 'warning');
      hasWarnings = true;
      allGood = false;
    }
  });

  if (allGood) {
    log('✅ Temel erişilebilirlik kontrolleri geçti', 'success');
  }

  return allGood;
}

function checkPerformance() {
  log('\n⚡ 7. Performans Kontrolü...', 'info');
  const nextConfig = fs.readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf-8');
  
  const checks = {
    imageOptimization: nextConfig.includes('images'),
    compression: nextConfig.includes('compress'),
    swcMinify: nextConfig.includes('swcMinify'),
  };

  Object.entries(checks).forEach(([key, value]) => {
    if (value) {
      log(`✅ ${key} aktif`, 'success');
    } else {
      log(`⚠️  ${key} kontrol edilmeli`, 'warning');
      hasWarnings = true;
    }
  });

  return true;
}

function generateReport() {
  log('\n' + '='.repeat(60), 'info');
  log('📊 CEO PRE-FLIGHT CHECK RAPORU', 'info');
  log('='.repeat(60), 'info');

  if (hasErrors) {
    log('\n❌ KRİTİK HATALAR VAR!', 'error');
    log('Yayınlamadan önce bu hataları düzeltmelisiniz.', 'error');
    process.exit(1);
  } else if (hasWarnings) {
    log('\n⚠️  UYARILAR VAR', 'warning');
    log('Yayınlamadan önce bu uyarıları kontrol etmeniz önerilir.', 'warning');
    process.exit(0);
  } else {
    log('\n✅ TÜM KONTROLLER GEÇTİ!', 'success');
    log('Site yayınlamaya hazır. 🚀', 'success');
    process.exit(0);
  }
}

// Ana kontrol akışı
async function main() {
  log('🚀 CEO Pre-Flight Check Başlatılıyor...', 'info');
  log('Yayınlamadan önce tüm kritik noktalar kontrol ediliyor...\n', 'info');

  checkBuild();
  checkLint();
  checkTypeScript();
  checkPremiumStrategy();
  checkSEO();
  checkAccessibility();
  checkPerformance();

  generateReport();
}

main().catch(error => {
  log(`\n❌ Beklenmeyen hata: ${error.message}`, 'error');
  process.exit(1);
});


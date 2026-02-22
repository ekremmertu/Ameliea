/**
 * Ana Sayfa Stress Testi
 * 2000 concurrent kullanıcı ile ana sayfa yükleme testi
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time');

// Base URL - Environment variable'dan al veya default
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4173';

export const options = {
  stages: [
    // Ramp-up: 30 saniyede 500 kullanıcıya çık
    { duration: '30s', target: 500 },
    // Ramp-up: 1 dakikada 1000 kullanıcıya çık
    { duration: '1m', target: 1000 },
    // Ramp-up: 2 dakikada 2000 kullanıcıya çık
    { duration: '2m', target: 2000 },
    // Sustained load: 2 dakika 2000 kullanıcıyla devam et
    { duration: '2m', target: 2000 },
    // Ramp-down: 1 dakikada 0'a düş
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    // %95'i 3 saniyeden az olmalı (daha gerçekçi)
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    // Hata oranı %5'ten az olmalı (404'ler kabul edilebilir)
    http_req_failed: ['rate<0.05'],
    // Sayfa yükleme süresi
    page_load_time: ['p(95)<3000'],
    // Errors (sadece gerçek hatalar)
    errors: ['rate<0.01'],
  },
};

export default function () {
  const startTime = Date.now();

  // Ana sayfa yükleme
  const response = http.get(`${BASE_URL}/`, {
    tags: { name: 'Homepage' },
    headers: {
      'User-Agent': 'k6-load-test',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    },
  });

  const loadTime = Date.now() - startTime;
  pageLoadTime.add(loadTime);

  // Response kontrolü
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
    'has HTML content': (r) => r.body.includes('<!DOCTYPE html') || r.body.includes('<html'),
    'has title': (r) => r.body.includes('Amor Élite') || r.body.includes('title'),
  });

  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  // Static assets yükleme simülasyonu
  // Next.js'de static assets build hash'li olduğu için sadece ana sayfayı test ediyoruz
  // Gerçek kullanıcı davranışı: sayfa yüklendikten sonra bekle

  // Gerçekçi kullanıcı davranışı: 1-3 saniye bekle
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  try {
    return {
      'stdout': textSummary(data, { indent: ' ', enableColors: true }),
      'tests/load/results/homepage-stress-summary.json': JSON.stringify(data, null, 2),
    };
  } catch (error) {
    // Fallback: sadece JSON döndür
    return {
      'stdout': `\n⚠️  Summary oluşturulurken hata: ${error.message}\n`,
      'tests/load/results/homepage-stress-summary.json': JSON.stringify(data, null, 2),
    };
  }
}

function textSummary(data, options) {
  const indent = options.indent || '';
  
  // Safe getter function
  const getMetric = (metricName, field, defaultValue = 0) => {
    try {
      const metric = data.metrics[metricName];
      if (!metric || !metric.values) return defaultValue;
      const value = metric.values[field];
      return value !== undefined && value !== null ? value : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  let summary = '\n';
  summary += `${indent}✓ Ana Sayfa Stress Testi Tamamlandı\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  // HTTP Metrics
  const totalReqs = getMetric('http_reqs', 'count', 0);
  const failedRate = getMetric('http_req_failed', 'rate', 0);
  const failedCount = Math.round(failedRate * totalReqs);
  const successCount = totalReqs - failedCount;
  
  summary += `${indent}HTTP Metrikleri:\n`;
  summary += `${indent}  • Toplam İstek: ${totalReqs}\n`;
  summary += `${indent}  • Başarılı: ${successCount}\n`;
  summary += `${indent}  • Başarısız: ${failedCount}\n`;
  summary += `${indent}  • Hata Oranı: ${(failedRate * 100).toFixed(2)}%\n\n`;
  
  // Response Time
  const avgDuration = getMetric('http_req_duration', 'avg', 0);
  const medDuration = getMetric('http_req_duration', 'med', 0);
  const p95Duration = getMetric('http_req_duration', 'p(95)', 0);
  const p99Duration = getMetric('http_req_duration', 'p(99)', 0);
  const maxDuration = getMetric('http_req_duration', 'max', 0);
  
  summary += `${indent}Yanıt Süreleri:\n`;
  summary += `${indent}  • Ortalama: ${avgDuration.toFixed(2)}ms\n`;
  summary += `${indent}  • Medyan (p50): ${medDuration.toFixed(2)}ms\n`;
  summary += `${indent}  • p95: ${p95Duration.toFixed(2)}ms\n`;
  summary += `${indent}  • p99: ${p99Duration.toFixed(2)}ms\n`;
  summary += `${indent}  • Maksimum: ${maxDuration.toFixed(2)}ms\n\n`;
  
  // Throughput
  const reqRate = getMetric('http_reqs', 'rate', 0);
  summary += `${indent}Throughput:\n`;
  summary += `${indent}  • İstek/Saniye: ${reqRate.toFixed(2)}\n\n`;
  
  // Status
  if (failedRate < 0.01 && avgDuration < 2000) {
    summary += `${indent}✅ TEST BAŞARILI - Tüm hedefler karşılandı!\n`;
  } else {
    summary += `${indent}⚠️  TEST UYARILARI - Bazı hedefler karşılanmadı\n`;
    if (failedRate >= 0.01) {
      summary += `${indent}   • Hata oranı çok yüksek: ${(failedRate * 100).toFixed(2)}%\n`;
    }
    if (avgDuration >= 2000) {
      summary += `${indent}   • Ortalama yanıt süresi yüksek: ${avgDuration.toFixed(2)}ms\n`;
    }
  }
  
  return summary;
}


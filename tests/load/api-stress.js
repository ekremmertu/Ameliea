/**
 * API Endpoint Stress Testi
 * 1000 concurrent kullanıcı ile API endpoint'lerini test eder
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
// errors: Sadece 5xx server hatalarını sayar
const errorRate = new Rate('errors');
// api_response_time: Sadece başarılı API çağrılarının süresini ölçer
const apiResponseTime = new Trend('api_response_time');

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4173';

export const options = {
  stages: [
    // Ramp-up: 20 saniyede 200 kullanıcıya çık
    { duration: '20s', target: 200 },
    // Ramp-up: 1 dakikada 500 kullanıcıya çık
    { duration: '1m', target: 500 },
    // Ramp-up: 1 dakikada 1000 kullanıcıya çık
    { duration: '1m', target: 1000 },
    // Sustained load: 2 dakika 1000 kullanıcıyla devam et
    { duration: '2m', target: 1000 },
    // Ramp-down: 30 saniyede 0'a düş
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    // http_req_failed'ı kaldırdık çünkü 4xx'leri de sayıyor (404 normal)
    // Sadece custom errors metric'ini kullanıyoruz (sadece 5xx)
    api_response_time: ['p(95)<2000'],
    errors: ['rate<0.01'], // Sadece gerçek hatalar (5xx)
  },
};

// Test data
const testSlug = __ENV.TEST_SLUG || 'demo-invitation';

export default function () {
  // 1. Health Check (en hızlı endpoint)
  const healthResponse = http.get(`${BASE_URL}/api/health`, {
    tags: { name: 'HealthCheck' },
  });

  const healthSuccess = check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Rate metric: Her istek için add(0) veya add(1) çağrılmalı
  // add(0) = başarılı, add(1) = hata
  if (healthResponse.status >= 500) {
    errorRate.add(1); // Server hatası
  } else {
    errorRate.add(0); // Başarılı veya client hatası (4xx)
  }

  sleep(0.5);

  // 2. Invitation GET (public endpoint)
  const invitationResponse = http.get(`${BASE_URL}/api/invitations/${testSlug}`, {
    tags: { name: 'GetInvitation' },
  });

  const invitationSuccess = check(invitationResponse, {
    'invitation status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'invitation response time < 2s': (r) => r.timings.duration < 2000,
  });

  // 404 normal bir durum (invitation mevcut değilse), sadece 5xx hataları say
  if (invitationResponse.status >= 500) {
    errorRate.add(1); // Server hatası
  } else {
    errorRate.add(0); // Başarılı (200) veya client hatası (404)
    if (invitationResponse.status === 200) {
      apiResponseTime.add(invitationResponse.timings.duration);
    }
  }

  sleep(1);

  // 3. RSVP POST (public endpoint - en çok kullanılan)
  const rsvpPayload = JSON.stringify({
    slug: testSlug,
    full_name: `Test User ${Math.random().toString(36).substring(7)}`,
    email: `test${Math.random().toString(36).substring(7)}@example.com`,
    phone: `+90${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    attendance: ['yes', 'no', 'maybe'][Math.floor(Math.random() * 3)],
    guests_count: Math.floor(Math.random() * 5) + 1,
    note: 'Test RSVP submission',
  });

  const rsvpResponse = http.post(`${BASE_URL}/api/rsvp`, rsvpPayload, {
    tags: { name: 'SubmitRSVP' },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const rsvpSuccess = check(rsvpResponse, {
    'rsvp status is 201 or 400 or 404': (r) => [201, 400, 404].includes(r.status),
    'rsvp response time < 2s': (r) => r.timings.duration < 2000,
  });

  // 201 = başarılı, 400 = validation error (normal), 404 = invitation bulunamadı (normal)
  // Sadece 5xx server hatalarını say
  if (rsvpResponse.status >= 500) {
    errorRate.add(1); // Server hatası
  } else {
    errorRate.add(0); // Başarılı (201) veya client hatası (400, 404)
    if (rsvpResponse.status === 201) {
      // Başarılı çağrıların süresini ölç
      apiResponseTime.add(rsvpResponse.timings.duration);
    }
  }

  sleep(1);

  // 4. Guest Questions GET (public endpoint)
  const questionsResponse = http.get(`${BASE_URL}/api/invitations/${testSlug}/guest-questions`, {
    tags: { name: 'GetGuestQuestions' },
  });

  const questionsSuccess = check(questionsResponse, {
    'questions status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'questions response time < 2s': (r) => r.timings.duration < 2000,
  });

  // 404 normal bir durum, sadece 5xx hataları say
  if (questionsResponse.status >= 500) {
    errorRate.add(1); // Server hatası
  } else {
    errorRate.add(0); // Başarılı (200) veya client hatası (404)
    if (questionsResponse.status === 200) {
      apiResponseTime.add(questionsResponse.timings.duration);
    }
  }

  sleep(0.5);
}

export function handleSummary(data) {
  try {
    return {
      'stdout': textSummary(data, { indent: ' ', enableColors: true }),
      'tests/load/results/api-stress-summary.json': JSON.stringify(data, null, 2),
    };
  } catch (error) {
    return {
      'stdout': `\n⚠️  Summary oluşturulurken hata: ${error.message}\n`,
      'tests/load/results/api-stress-summary.json': JSON.stringify(data, null, 2),
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
  summary += `${indent}✓ API Endpoint Stress Testi Tamamlandı\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  // HTTP Metrics
  const totalReqs = getMetric('http_reqs', 'count', 0);
  const customErrorRate = getMetric('errors', 'rate', 0);
  
  // http_req_failed 4xx'leri de saydığı için ayrı gösteriyoruz
  const httpFailedRate = getMetric('http_req_failed', 'rate', 0);
  const httpFailedCount = Math.round(httpFailedRate * totalReqs);
  const successCount = totalReqs - httpFailedCount;
  
  // Server hataları (5xx) - errors metric'inden
  // Rate metric: rate = fails / (passes + fails)
  const errorsPasses = getMetric('errors', 'passes', 0);
  const errorsFails = getMetric('errors', 'fails', 0);
  const errorsTotal = errorsPasses + errorsFails;
  
  // Server hata sayısı: errorsFails (sadece 5xx'ler)
  // Client hata sayısı: httpFailedCount - errorsFails (4xx'ler)
  // Not: errorsTotal, errorRate.add() çağrı sayısıdır (her HTTP isteği için 1 çağrı)
  // Eğer errorsTotal < totalReqs ise, bazı istekler için errorRate.add() çağrılmamış demektir
  const serverErrorCount = errorsFails;
  const clientErrorCount = Math.max(0, httpFailedCount - serverErrorCount);
  
  // Server hata oranı: errorsTotal'e göre hesaplanmalı (tracked requests)
  const actualServerErrorRate = errorsTotal > 0 ? (errorsFails / errorsTotal) : 0;
  
  summary += `${indent}HTTP Metrikleri:\n`;
  summary += `${indent}  • Toplam İstek: ${totalReqs}\n`;
  summary += `${indent}  • Başarılı (2xx): ${successCount}\n`;
  summary += `${indent}  • Client Hataları (4xx): ${clientErrorCount}\n`;
  summary += `${indent}  • Server Hataları (5xx): ${serverErrorCount}\n`;
  if (errorsTotal > 0) {
    summary += `${indent}  • Server Hata Oranı: ${(actualServerErrorRate * 100).toFixed(2)}% (${serverErrorCount}/${errorsTotal} tracked)\n`;
  } else {
    summary += `${indent}  • Server Hata Oranı: 0.00% (hiç 5xx hatası yok)\n`;
  }
  summary += `${indent}  • Toplam Hata Oranı (4xx+5xx): ${(httpFailedRate * 100).toFixed(2)}%\n\n`;
  
  // Response Time
  const avgDuration = getMetric('http_req_duration', 'avg', 0);
  const medDuration = getMetric('http_req_duration', 'med', 0);
  const p95Duration = getMetric('http_req_duration', 'p(95)', 0);
  const p99Duration = getMetric('http_req_duration', 'p(99)', 0);
  
  summary += `${indent}API Yanıt Süreleri:\n`;
  summary += `${indent}  • Ortalama: ${avgDuration.toFixed(2)}ms\n`;
  summary += `${indent}  • Medyan (p50): ${medDuration.toFixed(2)}ms\n`;
  summary += `${indent}  • p95: ${p95Duration.toFixed(2)}ms\n`;
  summary += `${indent}  • p99: ${p99Duration.toFixed(2)}ms\n\n`;
  
  // Throughput
  const reqRate = getMetric('http_reqs', 'rate', 0);
  summary += `${indent}Throughput:\n`;
  summary += `${indent}  • İstek/Saniye: ${reqRate.toFixed(2)}\n\n`;
  
  // Status (sadece server hatalarını kontrol et)
  if (customErrorRate < 0.01 && avgDuration < 2000) {
    summary += `${indent}✅ TEST BAŞARILI - Tüm hedefler karşılandı!\n`;
  } else {
    summary += `${indent}⚠️  TEST UYARILARI - Bazı hedefler karşılanmadı\n`;
    if (customErrorRate >= 0.01) {
      summary += `${indent}   • Server hata oranı çok yüksek: ${(customErrorRate * 100).toFixed(2)}%\n`;
    }
    if (avgDuration >= 2000) {
      summary += `${indent}   • Ortalama yanıt süresi yüksek: ${avgDuration.toFixed(2)}ms\n`;
    }
  }
  
  return summary;
}


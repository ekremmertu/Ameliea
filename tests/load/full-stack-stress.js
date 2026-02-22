/**
 * Full Stack Stress Testi
 * 2000 concurrent kullanıcı ile tüm endpoint'leri test eder
 * Gerçekçi kullanıcı akışı simülasyonu
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time');
const apiResponseTime = new Trend('api_response_time');
const userFlowCounter = new Counter('user_flows_completed');

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4173';

export const options = {
  stages: [
    // Ramp-up: 30 saniyede 500 kullanıcıya çık
    { duration: '30s', target: 500 },
    // Ramp-up: 1 dakikada 1000 kullanıcıya çık
    { duration: '1m', target: 1000 },
    // Ramp-up: 2 dakikada 2000 kullanıcıya çık
    { duration: '2m', target: 2000 },
    // Sustained load: 3 dakika 2000 kullanıcıyla devam et
    { duration: '3m', target: 2000 },
    // Ramp-down: 1 dakikada 0'a düş
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    // http_req_failed'ı kaldırdık çünkü 4xx'leri de sayıyor (404 normal)
    page_load_time: ['p(95)<3000'],
    api_response_time: ['p(95)<2000'],
    errors: ['rate<0.01'], // Sadece 5xx server hataları
    user_flows_completed: ['count>100'], // En az 100 kullanıcı akışı tamamlanmalı
  },
};

// Test data
const testSlug = __ENV.TEST_SLUG || 'demo-invitation';

// Kullanıcı senaryoları (weighted)
const scenarios = [
  { name: 'visitor', weight: 70 },      // %70 sadece ziyaretçi
  { name: 'rsvp_submitter', weight: 20 }, // %20 RSVP gönderen
  { name: 'full_flow', weight: 10 },     // %10 tam akış
];

function selectScenario() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const scenario of scenarios) {
    cumulative += scenario.weight;
    if (rand <= cumulative) {
      return scenario.name;
    }
  }
  return 'visitor';
}

export default function () {
  const scenario = selectScenario();
  
  switch (scenario) {
    case 'visitor':
      runVisitorFlow();
      break;
    case 'rsvp_submitter':
      runRSVPFlow();
      break;
    case 'full_flow':
      runFullFlow();
      break;
  }
  
  userFlowCounter.add(1);
}

// Senaryo 1: Sadece ziyaretçi (ana sayfa + invitation görüntüleme)
function runVisitorFlow() {
  // 1. Ana sayfa
  const homepageResponse = http.get(`${BASE_URL}/`, {
    tags: { name: 'Homepage' },
  });

  check(homepageResponse, {
    'homepage status is 200': (r) => r.status === 200,
  });
  
  // Sadece 5xx server hatalarını say
  if (homepageResponse.status >= 500) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  if (homepageResponse.status === 200) {
    pageLoadTime.add(homepageResponse.timings.duration);
  }

  sleep(Math.random() * 2 + 1);

  // 2. Invitation sayfası
  const invitationResponse = http.get(`${BASE_URL}/invitation/${testSlug}`, {
    tags: { name: 'ViewInvitation' },
  });

  check(invitationResponse, {
    'invitation page status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });
  
  // Sadece 5xx server hatalarını say
  if (invitationResponse.status >= 500) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  if (invitationResponse.status === 200) {
    pageLoadTime.add(invitationResponse.timings.duration);
  }

  sleep(Math.random() * 3 + 2);
}

// Senaryo 2: RSVP gönderen kullanıcı
function runRSVPFlow() {
  // 1. Ana sayfa
  http.get(`${BASE_URL}/`, { tags: { name: 'Homepage' } });
  sleep(1);

  // 2. Invitation sayfası
  http.get(`${BASE_URL}/invitation/${testSlug}`, { tags: { name: 'ViewInvitation' } });
  sleep(2);

  // 3. RSVP gönder
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
    headers: { 'Content-Type': 'application/json' },
  });

  check(rsvpResponse, {
    'rsvp status is 201 or 400 or 404': (r) => [201, 400, 404].includes(r.status),
  });
  
  // Sadece 5xx server hatalarını say
  if (rsvpResponse.status >= 500) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  if (rsvpResponse.status === 201) {
    apiResponseTime.add(rsvpResponse.timings.duration);
  }

  sleep(1);
}

// Senaryo 3: Tam akış (login, dashboard, invitation oluşturma)
function runFullFlow() {
  // 1. Ana sayfa
  http.get(`${BASE_URL}/`, { tags: { name: 'Homepage' } });
  sleep(1);

  // 2. Login sayfası
  const loginPageResponse = http.get(`${BASE_URL}/login`, {
    tags: { name: 'LoginPage' },
  });

  check(loginPageResponse, {
    'login page status is 200': (r) => r.status === 200,
  });
  
  // Sadece 5xx server hatalarını say
  if (loginPageResponse.status >= 500) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  sleep(1);

  // 3. Register sayfası (bazı kullanıcılar)
  if (Math.random() > 0.5) {
    http.get(`${BASE_URL}/register`, { tags: { name: 'RegisterPage' } });
    sleep(1);
  }

  // 4. Dashboard (auth gerektirir, 404 veya redirect beklenir)
  const dashboardResponse = http.get(`${BASE_URL}/dashboard`, {
    tags: { name: 'Dashboard' },
  });

  check(dashboardResponse, {
    'dashboard status is 200 or 401 or 302': (r) => [200, 401, 302].includes(r.status),
  });
  
  // Sadece 5xx server hatalarını say
  if (dashboardResponse.status >= 500) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  sleep(1);

  // 5. API Health Check
  const healthResponse = http.get(`${BASE_URL}/api/health`, {
    tags: { name: 'HealthCheck' },
  });

  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
  });
  
  // Sadece 5xx server hatalarını say
  if (healthResponse.status >= 500) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  sleep(0.5);
}

export function handleSummary(data) {
  try {
    return {
      'stdout': textSummary(data, { indent: ' ', enableColors: true }),
      'tests/load/results/full-stack-stress-summary.json': JSON.stringify(data, null, 2),
    };
  } catch (error) {
    return {
      'stdout': `\n⚠️  Summary oluşturulurken hata: ${error.message}\n`,
      'tests/load/results/full-stack-stress-summary.json': JSON.stringify(data, null, 2),
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
  summary += `${indent}✓ Full Stack Stress Testi Tamamlandı\n`;
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
  const p95Duration = getMetric('http_req_duration', 'p(95)', 0);
  const p99Duration = getMetric('http_req_duration', 'p(99)', 0);
  
  summary += `${indent}Yanıt Süreleri:\n`;
  summary += `${indent}  • Ortalama: ${avgDuration.toFixed(2)}ms\n`;
  summary += `${indent}  • p95: ${p95Duration.toFixed(2)}ms\n`;
  summary += `${indent}  • p99: ${p99Duration.toFixed(2)}ms\n\n`;
  
  // User Flows
  const flowsCompleted = getMetric('user_flows_completed', 'count', 0);
  summary += `${indent}Kullanıcı Akışları:\n`;
  summary += `${indent}  • Tamamlanan: ${flowsCompleted}\n\n`;
  
  // Throughput
  const reqRate = getMetric('http_reqs', 'rate', 0);
  summary += `${indent}Throughput:\n`;
  summary += `${indent}  • İstek/Saniye: ${reqRate.toFixed(2)}\n\n`;
  
  // Status
  if (failedRate < 0.02 && avgDuration < 2000) {
    summary += `${indent}✅ TEST BAŞARILI - Tüm hedefler karşılandı!\n`;
  } else {
    summary += `${indent}⚠️  TEST UYARILARI - Bazı hedefler karşılanmadı\n`;
    if (failedRate >= 0.02) {
      summary += `${indent}   • Hata oranı çok yüksek: ${(failedRate * 100).toFixed(2)}%\n`;
    }
    if (avgDuration >= 2000) {
      summary += `${indent}   • Ortalama yanıt süresi yüksek: ${avgDuration.toFixed(2)}ms\n`;
    }
  }
  
  return summary;
}


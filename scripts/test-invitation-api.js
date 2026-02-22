#!/usr/bin/env node
/**
 * Test davetiyesi API'sini doğrular.
 * Kullanım: Dev server çalışırken (npm run dev) → node scripts/test-invitation-api.js
 * Veya: npm run test:invitation-api
 */

const BASE = process.env.BASE_URL || 'http://localhost:4174';
const TEST_SLUGS = ['test-guest', 'test', 'demo'];

async function main() {
  let failed = 0;
  for (const slug of TEST_SLUGS) {
    const url = `${BASE}/api/invitations/${slug}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        console.error(`FAIL ${slug}: ${res.status}`, data);
        failed++;
        continue;
      }
      if (!data.slug || !data.host_names || !data.theme) {
        console.error(`FAIL ${slug}: response missing required fields`, data);
        failed++;
        continue;
      }
      console.log(`OK ${slug} → ${data.host_names}`);
    } catch (e) {
      console.error(`FAIL ${slug}:`, e.message);
      failed++;
    }
  }
  if (failed) {
    console.error('\nTest invitation API: %d failed. Is dev server running on %s?', failed, BASE);
    process.exit(1);
  }
  console.log('\nTest invitation API: all slugs OK.');
}

main();

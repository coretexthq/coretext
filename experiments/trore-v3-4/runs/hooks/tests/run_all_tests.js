const { spawnSync } = require('child_process');
const path = require('path');

const tests = [
  { name: 'Foundation Smoke Tests', file: 'tests/test_foundation.js' },
  { name: 'Renter Endpoint Tests', file: 'tests/test_renter.js' },
  { name: 'Host Operations Tests', file: 'tests/test_host.js' },
  { name: 'Booking Lifecycle Tests', file: 'tests/test_booking.js' }
];

console.log('==================================================');
console.log('       TRORE MARKETPLACE FULL E2E SUITE');
console.log('==================================================\n');

// First, run seed to make sure we start fresh
console.log('Resetting and seeding database initially...');
const seedResult = spawnSync('node', [path.resolve(__dirname, '../scripts/seed.js')], { stdio: 'inherit' });
if (seedResult.status !== 0) {
  console.error('❌ Database seeding failed! Aborting tests.');
  process.exit(1);
}
console.log('✅ Database seeded.\n');

const results = [];

for (const t of tests) {
  console.log(`--------------------------------------------------`);
  console.log(`Running: ${t.name} (${t.file})`);
  console.log(`--------------------------------------------------`);
  
  // Clean seed before renter and host tests just to guarantee starting state
  if (t.file !== 'tests/test_foundation.js' && t.file !== 'tests/test_booking.js') {
    spawnSync('node', [path.resolve(__dirname, '../scripts/seed.js')], { stdio: 'ignore' });
  }

  const start = Date.now();
  const testProc = spawnSync('node', [path.resolve(__dirname, '../', t.file)], { stdio: 'inherit' });
  const duration = Date.now() - start;

  if (testProc.status === 0) {
    console.log(`\n✅ ${t.name} PASSED (${(duration / 1000).toFixed(2)}s)\n`);
    results.push({ name: t.name, status: 'PASSED', duration });
  } else {
    console.error(`\n❌ ${t.name} FAILED (${(duration / 1000).toFixed(2)}s)\n`);
    results.push({ name: t.name, status: 'FAILED', duration });
  }
}

console.log('==================================================');
console.log('               E2E VERIFICATION SUMMARY');
console.log('==================================================');
let allPassed = true;
for (const r of results) {
  const statusStr = r.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED';
  console.log(`- ${r.name}: ${statusStr} (${(r.duration / 1000).toFixed(2)}s)`);
  if (r.status !== 'PASSED') allPassed = false;
}
console.log('==================================================');

if (allPassed) {
  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED. CHECK DETAILS ABOVE.');
  process.exit(1);
}

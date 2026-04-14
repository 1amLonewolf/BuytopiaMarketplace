const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const LOGIN_ENDPOINT = `${BASE_URL}/api/auth/login`;

async function testRateLimit() {
  console.log('🧪 Rate Limit Test — Login Endpoint');
  console.log(`📡 Target: ${LOGIN_ENDPOINT}`);
  console.log(`📊 Sending 25 rapid requests...\n`);

  const results = [];
  let rateLimitedAt = null;

  for (let i = 1; i <= 25; i++) {
    try {
      const startTime = Date.now();
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });

      const duration = Date.now() - startTime;
      const status = response.status;

      // Try to parse response body
      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      results.push({
        request: i,
        status: status,
        duration: `${duration}ms`,
        limited: status === 429,
        message: data.message || ''
      });

      if (status === 429) {
        if (!rateLimitedAt) {
          rateLimitedAt = i;
          console.log(`\n🚨 RATE LIMITED! Starting at request #${i}`);

          const retryAfter = response.headers.get('retry-after');
          if (retryAfter) {
            console.log(`⏱️  Retry-After: ${retryAfter} seconds`);
          }
        }

        const limit = response.headers.get('ratelimit-limit');
        const remaining = response.headers.get('ratelimit-remaining');
        const reset = response.headers.get('ratelimit-reset');

        console.log(`🚫 Request ${i.toString().padStart(2)} → Status ${status}: ${data.message || 'Rate limited'} (${duration}ms)`);
        if (limit) console.log(`   📊 RateLimit-Limit: ${limit}`);
        if (remaining) console.log(`   📊 RateLimit-Remaining: ${remaining}`);
        if (reset) console.log(`   📊 RateLimit-Reset: ${reset}s`);

      } else {
        console.log(`✅ Request ${i.toString().padStart(2)} → Status ${status} (${duration}ms)`);
      }

    } catch (error) {
      console.log(`❌ Request ${i.toString().padStart(2)} → Network error: ${error.message}`);
      results.push({
        request: i,
        status: 'N/A',
        duration: 'N/A',
        limited: false,
        message: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => !r.limited).length;
  const limited = results.filter(r => r.limited).length;

  console.log(`✅ Successful requests: ${successful}`);
  console.log(`🚫 Rate limited:        ${limited}`);

  if (rateLimitedAt) {
    console.log(`🎯 Rate limit triggered at request #${rateLimitedAt}`);
    console.log(`💡 Expected: ~20 requests (auth limit)`);
    console.log(limited > 0 ? '✅ PASS: Rate limiting is working!' : '❌ FAIL: Rate limiting not detected');
  } else {
    console.log('❌ FAIL: Rate limiting was NOT triggered after 25 requests');
    console.log('💡 Check backend server.js for rate limit configuration');
  }

  console.log('='.repeat(60));
}

testRateLimit().catch(err => {
  console.error('💥 Test failed:', err.message);
  console.log('\n⚠️  Make sure your backend is running on port 5000');
  console.log('💡 Run: cd backend && npm run dev');
});

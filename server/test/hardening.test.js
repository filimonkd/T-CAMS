/**
 * Tier 3 item 6: security headers and rate limiting.
 *
 * The limiter is skipped under NODE_ENV=test so the rest of the suite can
 * hit routes freely, so this file builds its OWN app with the flag cleared
 * before requiring app.js. That is the only way to exercise the real
 * limiting behaviour rather than just asserting the middleware is mounted.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_URL = 'https://t-cams-frontend.example.com';

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert');

// No database here. Without this, every model call waits out Mongoose's
// 10s buffering timeout and this file takes ~50s instead of ~1s.
require('mongoose').set('bufferCommands', false);

let server;
let base;
let app;

before(async () => {
  // Clear the test flag, then load app.js fresh so rateLimit.js reads it.
  const savedNodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV;

  for (const key of Object.keys(require.cache)) {
    if (key.includes('/src/')) delete require.cache[key];
  }
  app = require('../src/app');
  process.env.NODE_ENV = savedNodeEnv;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('helmet security headers', () => {
  test('sets the headers helmet is responsible for', async () => {
    const res = await fetch(`${base}/api/health`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.ok(res.headers.get('strict-transport-security'), 'expected HSTS');
  });

  test('removes the Express fingerprint', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.strictEqual(res.headers.get('x-powered-by'), null);
  });
});

describe('auth rate limiting', () => {
  test('blocks a sixth failed sign-in attempt from the same client', async () => {
    const attempt = () =>
      fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong' }),
      });

    // The limiter allows 5 failures per window. These 400 on missing-user
    // lookup or 500 with no DB; either way they count as failures, which is
    // what skipSuccessfulRequests keys on.
    const statuses = [];
    for (let i = 0; i < 6; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      statuses.push((await attempt()).status);
    }

    assert.strictEqual(statuses[5], 429, `expected the 6th attempt to be limited, got ${statuses}`);
  });

  test('a limited response carries the documented error code', async () => {
    const res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong' }),
    });

    assert.strictEqual(res.status, 429);
    assert.strictEqual((await res.json()).code, 'RATE_LIMITED');
  });

  test('the limiter does not apply to unrelated routes', async () => {
    // /api/health sits under the global limiter (1000/window), so it must
    // still answer after the auth limiter has tripped.
    const res = await fetch(`${base}/api/health`);
    assert.strictEqual(res.status, 200);
  });
});

describe('proxy trust', () => {
  test('app trusts exactly one proxy hop', () => {
    // Render terminates TLS one hop in front of the app. Trusting 0 keys
    // every user to the same address; trusting all lets a client spoof
    // X-Forwarded-For and evade the limiter entirely.
    assert.strictEqual(app.get('trust proxy'), 1);
  });
});

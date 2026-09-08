/**
 * Smoke tests for the Express app.
 *
 * Deliberately DB-free: they exercise the public endpoints, the requireAuth
 * middleware and the CORS allowlist, none of which touch MongoDB. That keeps
 * CI fast and means the backend-tests job needs no MongoDB service container.
 * Anything that needs a live database belongs in a separate suite - see the
 * note in .github/workflows/ci.yml.
 *
 * These env vars must be set before requiring src/app.js: app.js reads
 * CLIENT_URL at module load to build the CORS allowlist.
 */
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_URL = 'https://t-cams-frontend.example.com';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const app = require('../src/app');

let server;
let base;

before(async () => {
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

test('GET /api/health is public and returns ok', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('GET /api/use-cases is public and returns the registry', async () => {
  const res = await fetch(`${base}/api/use-cases`);
  assert.strictEqual(res.status, 200);

  const body = await res.json();
  assert.ok(body.count > 0, 'expected a non-empty use-case registry');
  assert.strictEqual(body.count, body.useCases.length);
});

test('a protected route rejects a request with no token', async () => {
  const res = await fetch(`${base}/api/vendors`);
  assert.strictEqual(res.status, 401);
  assert.strictEqual((await res.json()).code, 'UNAUTHENTICATED');
});

test('a protected route rejects a malformed token', async () => {
  const res = await fetch(`${base}/api/vendors`, {
    headers: { Authorization: 'Bearer not-a-real-token' },
  });
  assert.strictEqual(res.status, 401);
  assert.strictEqual((await res.json()).code, 'INVALID_TOKEN');
});

test('a protected route rejects an expired token', async () => {
  const token = jwt.sign({ sub: 'u1', role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
  const res = await fetch(`${base}/api/vendors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.status, 401);
  assert.strictEqual((await res.json()).code, 'INVALID_TOKEN');
});

test('a valid token passes requireAuth', async () => {
  const token = jwt.sign(
    { sub: 'u1', email: 'admin@tcams.local', role: 'ADMIN', name: 'Admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  const res = await fetch(`${base}/api/vendors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Past requireAuth the controller hits Mongoose with no connection, so a
  // 5xx is expected here. The point is only that it is NOT a 401.
  assert.notStrictEqual(res.status, 401, 'a valid token must not be rejected by requireAuth');
});

test('POST /api/auth/login is public and validates before touching the DB', async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual((await res.json()).code, 'MISSING_CREDENTIALS');
});

test('CORS allows the configured CLIENT_URL origin', async () => {
  const res = await fetch(`${base}/api/health`, {
    headers: { Origin: process.env.CLIENT_URL },
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('access-control-allow-origin'), process.env.CLIENT_URL);
});

test('CORS blocks an origin that is not on the allowlist', async () => {
  const res = await fetch(`${base}/api/health`, {
    headers: { Origin: 'https://evil.example.com' },
  });
  assert.strictEqual(res.headers.get('access-control-allow-origin'), null);
});

test('CORS preflight advertises the Authorization header', async () => {
  const res = await fetch(`${base}/api/vendors`, {
    method: 'OPTIONS',
    headers: {
      Origin: process.env.CLIENT_URL,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  });
  assert.strictEqual(res.status, 204);
  assert.match(res.headers.get('access-control-allow-headers'), /Authorization/i);
});

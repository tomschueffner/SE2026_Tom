// Unit tests for the verifyToken middleware — no Express, no DB.
// JWT_SECRET is read inside verifyToken at call time, so setting it here is sufficient.
import { describe, test, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { verifyToken } from './auth.js';

const SECRET = 'test-secret';
process.env.JWT_SECRET = SECRET;

// Minimal res mock — captures status code and body without requiring Express
function mockRes() {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

describe('verifyToken', () => {
  test('valid JWT → next() called, req.user populated', () => {
    const token = jwt.sign({ id: 1, email: 'alice@example.com' }, SECRET);
    const req = { cookies: { token } };
    const res = mockRes();
    let nextCalled = false;
    verifyToken(req, res, () => { nextCalled = true; });
    console.log('Input: valid JWT signed with correct secret | Expected: nextCalled=true, req.user.id=1 | Actual: nextCalled=', nextCalled, ', req.user.id=', req.user?.id);
    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe(1);
    expect(req.user.email).toBe('alice@example.com');
  });

  test('no token in cookies → 401', () => {
    const req = { cookies: {} };
    const res = mockRes();
    let nextCalled = false;
    verifyToken(req, res, () => { nextCalled = true; });
    console.log('Input: cookies={} (no token) | Expected: nextCalled=false, status=401 | Actual: nextCalled=', nextCalled, ', status=', res.statusCode);
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  test('JWT signed with wrong secret → 401', () => {
    const token = jwt.sign({ id: 1, email: 'alice@example.com' }, 'wrong-secret');
    const req = { cookies: { token } };
    const res = mockRes();
    let nextCalled = false;
    verifyToken(req, res, () => { nextCalled = true; });
    console.log('Input: JWT signed with wrong-secret | Expected: nextCalled=false, status=401 | Actual: nextCalled=', nextCalled, ', status=', res.statusCode);
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  test('cookies missing entirely → 401', () => {
    const req = {};
    const res = mockRes();
    let nextCalled = false;
    verifyToken(req, res, () => { nextCalled = true; });
    console.log('Input: req={} (no cookies property) | Expected: nextCalled=false, status=401 | Actual: nextCalled=', nextCalled, ', status=', res.statusCode);
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  test('expired JWT → 401', () => {
    const token = jwt.sign({ id: 1, email: 'alice@example.com' }, SECRET, { expiresIn: -10 });
    const req = { cookies: { token } };
    const res = mockRes();
    let nextCalled = false;
    verifyToken(req, res, () => { nextCalled = true; });
    console.log('Input: JWT with expiresIn=-10 (already expired) | Expected: nextCalled=false, status=401 | Actual: nextCalled=', nextCalled, ', status=', res.statusCode);
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });
});

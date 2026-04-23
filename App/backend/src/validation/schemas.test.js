// Backend schema unit tests — no server, no DB, pure Zod logic.
// Run with: npm test (headless) or npm run test:ui (browser UI)
import { describe, test, expect } from 'vitest';
import { registerSchema, progressSchema, subjectSchema, loginSchema, topicSchema } from './schemas.js';

describe('registerSchema', () => {
  test('valid input → success', () => {
    const input = { name: 'Alice', email: 'alice@example.com', password: 'Password1!' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=true | Actual: success=', r.success);
    expect(r.success).toBe(true);
  });

  test('email malformed → fail', () => {
    const input = { name: 'Alice', email: 'not-an-email', password: 'Password1!' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('password no uppercase → fail', () => {
    const input = { name: 'Alice', email: 'alice@example.com', password: 'password1!' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('password no lowercase → fail', () => {
    const input = { name: 'Alice', email: 'alice@example.com', password: 'PASSWORD1!' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('password no digit → fail', () => {
    const input = { name: 'Alice', email: 'alice@example.com', password: 'Password!' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('password no special char → fail', () => {
    const input = { name: 'Alice', email: 'alice@example.com', password: 'Password1' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('password too short → fail', () => {
    const input = { name: 'Alice', email: 'alice@example.com', password: 'Ab1!' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('name > 15 chars → fail', () => {
    const input = { name: 'A'.repeat(16), email: 'alice@example.com', password: 'Password1!' };
    const r = registerSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });
});

describe('progressSchema', () => {
  test('valid input → success', () => {
    const input = { topicId: 1, value: 75 };
    const r = progressSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=true | Actual: success=', r.success);
    expect(r.success).toBe(true);
  });

  test('value = 101 → fail', () => {
    const input = { topicId: 1, value: 101 };
    const r = progressSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('value = -1 → fail', () => {
    const input = { topicId: 1, value: -1 };
    const r = progressSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('note > 500 chars → fail', () => {
    const input = { topicId: 1, value: 50, note: 'x'.repeat(501) };
    const r = progressSchema.safeParse(input);
    console.log('Input:', JSON.stringify({ ...input, note: `${'x'.repeat(10)}...(501 chars)` }), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });
});

describe('subjectSchema', () => {
  test('empty name → fail', () => {
    const input = { name: '' };
    const r = subjectSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('name > 100 chars → fail', () => {
    const input = { name: 'a'.repeat(101) };
    const r = subjectSchema.safeParse(input);
    console.log('Input:', JSON.stringify({ name: `${'a'.repeat(10)}...(101 chars)` }), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('valid name → success', () => {
    const input = { name: 'Math' };
    const r = subjectSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=true | Actual: success=', r.success);
    expect(r.success).toBe(true);
  });
});

describe('loginSchema', () => {
  test('valid input → success', () => {
    const input = { email: 'alice@example.com', password: 'Password1!' };
    const r = loginSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=true | Actual: success=', r.success);
    expect(r.success).toBe(true);
  });

  test('email malformed → fail', () => {
    const input = { email: 'not-an-email', password: 'Password1!' };
    const r = loginSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('empty password → fail', () => {
    const input = { email: 'alice@example.com', password: '' };
    const r = loginSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });
});

describe('topicSchema', () => {
  test('valid input → success', () => {
    const input = { name: 'Algebra', subjectId: 1 };
    const r = topicSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=true | Actual: success=', r.success);
    expect(r.success).toBe(true);
  });

  test('empty name → fail', () => {
    const input = { name: '', subjectId: 1 };
    const r = topicSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('name > 100 chars → fail', () => {
    const input = { name: 'a'.repeat(101), subjectId: 1 };
    const r = topicSchema.safeParse(input);
    console.log('Input:', JSON.stringify({ name: `${'a'.repeat(10)}...(101 chars)`, subjectId: 1 }), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });

  test('subjectId = 0 → fail (not positive)', () => {
    const input = { name: 'Algebra', subjectId: 0 };
    const r = topicSchema.safeParse(input);
    console.log('Input:', JSON.stringify(input), '| Expected: success=false | Actual: success=', r.success);
    expect(r.success).toBe(false);
  });
});

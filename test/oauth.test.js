const assert = require('node:assert/strict');
const test = require('node:test');
const { getMissingOAuthSettings } = require('../config/oauth');
const { isAuthenticated, requireOAuth } = require('../middleware/authenticate');

const settings = {
  GITHUB_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_SECRET: 'test-client-secret',
  GITHUB_CALLBACK_URL: 'http://localhost:3000/auth/github/callback'
};

const setOAuthEnv = (t, env) => {
  const original = Object.fromEntries(Object.keys(settings).map((name) => [name, process.env[name]]));
  for (const name of Object.keys(settings)) {
    if (env[name] === undefined) delete process.env[name];
    else process.env[name] = env[name];
  }
  t.after(() => {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
};

test('OAuth configuration identifies missing, empty, and whitespace-only settings', () => {
  assert.deepEqual(getMissingOAuthSettings({}), Object.keys(settings));
  for (const name of Object.keys(settings)) {
    for (const value of [undefined, '', ' \t ']) {
      assert.deepEqual(getMissingOAuthSettings({ ...settings, [name]: value }), [name]);
    }
  }
  assert.deepEqual(getMissingOAuthSettings(settings), []);
});

test('OAuth guard returns 503 with missing names but no configuration values', (t) => {
  setOAuthEnv(t, { ...settings, GITHUB_CLIENT_SECRET: '' });
  const res = {
    status(code) {
      assert.equal(code, 503);
      return this;
    },
    json(body) {
      assert.deepEqual(body.missingVariables, ['GITHUB_CLIENT_SECRET']);
      assert.match(body.message, /restart/i);
      for (const value of Object.values(settings)) {
        assert.ok(!JSON.stringify(body).includes(value));
      }
      return this;
    }
  };
  assert.equal(requireOAuth({}, res, () => assert.fail('OAuth must remain disabled')), res);
});

test('OAuth guard allows configured requests to continue', (t) => {
  setOAuthEnv(t, settings);
  let continued = false;
  requireOAuth({}, {}, () => { continued = true; });
  assert.equal(continued, true);
});

test('write authentication remains required when OAuth is not configured', (t) => {
  setOAuthEnv(t, {});
  const res = {
    status(code) {
      assert.equal(code, 401);
      return this;
    },
    json(body) {
      assert.match(body.message, /Sign in with GitHub/);
      return this;
    }
  };
  assert.equal(isAuthenticated({}, res, () => assert.fail('Writes must remain protected')), res);
});

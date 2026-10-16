const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const test = require('node:test');
const { idRules, playerRules, workoutRules } = require('../middleware/validate');

const request = async (t, method, path, middleware, payload) => {
  const app = express();
  app.use(express.json());
  app[method](path, middleware, (req, res) => res.status(200).json(req.body || req.params));
  const server = app.listen(0);
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    method: method.toUpperCase(),
    headers: payload ? { 'content-type': 'application/json' } : {},
    body: payload ? JSON.stringify(payload) : undefined
  });
  return { body: await response.json(), status: response.status };
};

test('workout validation rejects an out-of-range difficulty', async (t) => {
  const result = await request(t, 'post', '/workouts', workoutRules, {
    name: 'Push Day', type: 'strength', difficulty: 11, durationMinutes: 45, xpReward: 150
  });

  assert.equal(result.status, 400);
  assert.ok(result.body.errors.some((error) => error.path === 'difficulty'));
});

test('workout validation normalizes valid numeric and boolean fields', async (t) => {
  const result = await request(t, 'post', '/workouts', workoutRules, {
    name: ' Push Day ', type: 'strength', difficulty: '5', durationMinutes: '45',
    xpReward: '150', completed: 'false'
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.name, 'Push Day');
  assert.equal(result.body.difficulty, 5);
  assert.equal(result.body.completed, false);
});

test('player validation rejects malformed email addresses', async (t) => {
  const result = await request(t, 'post', '/players', playerRules, {
    username: 'workoutfan', displayName: 'Workout Fan', email: 'not-an-email'
  });

  assert.equal(result.status, 400);
  assert.ok(result.body.errors.some((error) => error.path === 'email'));
});

test('id validation rejects malformed MongoDB ids', async (t) => {
  const result = await request(t, 'get', '/items/:id', idRules, undefined);
  assert.equal(result.status, 400);
  assert.ok(result.body.errors.some((error) => error.path === 'id'));
});
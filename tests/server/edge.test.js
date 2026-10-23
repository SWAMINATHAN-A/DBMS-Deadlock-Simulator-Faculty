/** Hostile / malformed input against every API route. */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { openDatabase } from '../../server/db.js';
import { createApp } from '../../server/app.js';

let app;
beforeAll(() => { app = createApp(openDatabase(':memory:')); });

const BAD_IDS = ['abc', '1e999', '-1', '0', '999999999999999999999', 'null', '%20', '1; DROP TABLE simulations', '1.5', 'NaN'];

describe('malformed ids never crash the server', () => {
  it('GET /api/history/:id', async () => {
    for (const id of BAD_IDS) {
      const r = await request(app).get(`/api/history/${encodeURIComponent(id)}`);
      expect([200, 404, 400], `id=${id} -> ${r.status}`).toContain(r.status);
    }
  });

  it('GET /api/history/:id/export', async () => {
    for (const id of BAD_IDS) {
      const r = await request(app).get(`/api/history/${encodeURIComponent(id)}/export?format=md`);
      expect([200, 404, 400], `id=${id} -> ${r.status}`).toContain(r.status);
    }
  });

  it('DELETE /api/history/:id', async () => {
    for (const id of BAD_IDS) {
      const r = await request(app).delete(`/api/history/${encodeURIComponent(id)}`);
      expect([200, 404, 400], `id=${id} -> ${r.status}`).toContain(r.status);
    }
  });
});

describe('malformed query parameters are clamped, not crashed', () => {
  const QUERIES = ['', '?limit=abc', '?limit=-5', '?limit=0', '?limit=99999', '?limit=1e9', '?limit=NaN', '?limit[]=1', '?format=../../etc/passwd'];
  it('list endpoints', async () => {
    for (const q of QUERIES) {
      for (const path of ['/api/history', '/api/scores', '/api/quiz', '/api/tutor-log', '/api/analytics']) {
        const r = await request(app).get(path + q);
        expect(r.status, `${path}${q} -> ${r.status}`).toBe(200);
      }
    }
  });
});

describe('malformed POST bodies are rejected with 400, never 500', () => {
  const BODIES = [
    {}, { mode: 'detection' }, { mode: 'x', input: {}, result: { steps: [] } },
    { mode: 'detection', input: 'not-an-object', result: { steps: [] } },
    { mode: 'detection', input: {}, result: 'nope' },
    { mode: 'detection', input: {}, result: { steps: 'nope' } },
    { mode: 'detection', input: {}, result: { steps: [] }, title: 'x'.repeat(5000) },
    { mode: null, input: null, result: null },
  ];
  it('POST /api/history', async () => {
    for (const b of BODIES) {
      const r = await request(app).post('/api/history').send(b);
      expect([200, 201, 400], JSON.stringify(b).slice(0, 60) + ' -> ' + r.status).toContain(r.status);
    }
  });

  it('POST /api/scores', async () => {
    for (const b of [{}, { level: '' }, { level: 'L1' }, { level: 'L1', score: 'x', moves: 1 },
      { level: 'L1', score: 1.5, moves: 1 }, { level: 'L1', score: 99999, moves: 1 },
      { level: 'L1', score: 1, moves: -1 }, { level: 123, score: 1, moves: 1 }]) {
      const r = await request(app).post('/api/scores').send(b);
      expect([201, 400], JSON.stringify(b) + ' -> ' + r.status).toContain(r.status);
    }
  });

  it('POST /api/quiz', async () => {
    for (const b of [{}, { total: 0, correct: 0 }, { total: 5, correct: 9 }, { total: -1, correct: 0 },
      { total: 1e9, correct: 1 }, { total: 'x', correct: 'y' }, { total: 5, correct: 5, percent: 'high' }]) {
      const r = await request(app).post('/api/quiz').send(b);
      expect([201, 400], JSON.stringify(b) + ' -> ' + r.status).toContain(r.status);
    }
  });

  it('POST /api/tutor-log', async () => {
    for (const b of [{}, { question: '' }, { question: 'q' }, { question: 'q', answer: 123 },
      { question: 'q'.repeat(5000), answer: 'a'.repeat(9000), simulationId: 'x' }]) {
      const r = await request(app).post('/api/tutor-log').send(b);
      expect([201, 400], JSON.stringify(b).slice(0, 50) + ' -> ' + r.status).toContain(r.status);
    }
  });

  it('malformed JSON and oversized payloads', async () => {
    const bad = await request(app).post('/api/history').set('Content-Type', 'application/json').send('{"unclosed":');
    expect(bad.status).toBe(400);
    const huge = await request(app).post('/api/history').set('Content-Type', 'application/json').send(JSON.stringify({ mode: 'detection', input: { s: 'x'.repeat(3_000_000) }, result: { steps: [] } }));
    expect([400, 413]).toContain(huge.status);
  });
});

describe('stored values round-trip safely', () => {
  it('keeps unicode, quotes and HTML intact', async () => {
    const title = `T1 → T2 "quoted" <script>alert(1)</script> 'single' ⟨P1⟩`;
    const post = await request(app).post('/api/history').send({
      mode: 'detection', title,
      input: { schedule: "T1: WRITE A\nT1: COMMIT" },
      result: { steps: [{ index: 0, event: 'END', explanation: { title: 'x', text: 'y', why: 'z' } }], summary: { deadlocks: 0, rollbacks: 0, committed: ['T1'], stuck: [] } },
    });
    expect(post.status).toBe(201);
    const got = await request(app).get(`/api/history/${post.body.id}`);
    expect(got.body.title).toBe(title.slice(0, 120));
    expect(got.body.input.schedule).toContain('WRITE A');
    const md = await request(app).get(`/api/history/${post.body.id}/export?format=md`);
    expect(md.status).toBe(200);
    expect(md.text).toContain('WRITE A');
  });

  it("a SQL-injection-looking title is stored literally, tables survive", async () => {
    const evil = "'); DROP TABLE simulations; --";
    await request(app).post('/api/history').send({ mode: 'detection', title: evil, input: {}, result: { steps: [], summary: {} } });
    const list = await request(app).get('/api/history');
    expect(list.status).toBe(200);
    expect(list.body.some((r) => r.title === evil)).toBe(true);
  });
});

describe('export format handling', () => {
  it('defaults to JSON for unknown formats and sets a download header', async () => {
    const post = await request(app).post('/api/history').send({ mode: 'bankers', title: 'b', input: { available: '1' }, result: { steps: [], summary: { safe: true, sequence: [0] } } });
    for (const f of ['md', 'json', 'exe', '', '../x']) {
      const r = await request(app).get(`/api/history/${post.body.id}/export?format=${encodeURIComponent(f)}`);
      expect(r.status).toBe(200);
      expect(r.headers['content-disposition']).toMatch(/attachment; filename="deadlock-run-\d+\.(md|json)"/);
    }
  });
});

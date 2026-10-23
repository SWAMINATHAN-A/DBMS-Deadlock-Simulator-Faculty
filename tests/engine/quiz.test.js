import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { QUESTIONS, TOPICS, DIFFICULTIES, buildQuiz, countQuestions, scoreQuiz, gradeOf, shuffle, REVISE_TAB } from '../../client/src/engine/quiz.js';
import { openDatabase } from '../../server/db.js';
import { createApp } from '../../server/app.js';

describe('question bank', () => {
  it('has enough well-formed questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(100);
    for (const q of QUESTIONS) {
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, `${q.id} has duplicate options`).toBe(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(4);
      expect(TOPICS[q.topic], `${q.id} unknown topic`).toBeTruthy();
      expect(DIFFICULTIES, q.id).toContain(q.difficulty);
      expect(q.q.length, q.id).toBeGreaterThan(15);
      expect(q.explain.length, `${q.id} needs a real explanation`).toBeGreaterThan(40);
      expect(q.q, q.id).toMatch(/[?:]$/);
    }
  });

  it('uses unique ids and covers every topic', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const topic of Object.keys(TOPICS)) {
      expect(countQuestions(topic, 'all'), `topic ${topic}`).toBeGreaterThanOrEqual(12);
      expect(REVISE_TAB[topic], `revise tab for ${topic}`).toBeTruthy();
    }
  });

  it('is written in plain ASCII-ish English (no stray characters)', () => {
    for (const q of QUESTIONS) {
      const text = `${q.q} ${q.options.join(' ')} ${q.explain}`;
      expect(text, q.id).not.toMatch(/[Ѐ-ӿ一-鿿]/); // Cyrillic / CJK
      expect(text, `${q.id} has an unrendered escape`).not.toMatch(/\u[0-9a-fA-F]{4}/);
    }
  });

  it('covers every difficulty in every topic combination that the UI offers', () => {
    for (const d of DIFFICULTIES) expect(countQuestions('all', d), `difficulty ${d}`).toBeGreaterThanOrEqual(15);
    // the UI offers quizzes of up to 20 questions on "all topics"
    expect(countQuestions('all', 'all')).toBeGreaterThanOrEqual(20);
  });

  it('has no duplicated question text', () => {
    const seen = new Map();
    for (const q of QUESTIONS) {
      const key = q.q.toLowerCase().replace(/[^a-z0-9]/g, '');
      expect(seen.has(key), `${q.id} duplicates ${seen.get(key)}`).toBe(false);
      seen.set(key, q.id);
    }
  });
});

describe('buildQuiz', () => {
  it('filters by topic and difficulty and limits the count', () => {
    const easy = buildQuiz({ difficulty: 'easy', count: 0, seed: 1 });
    expect(easy.every((q) => q.difficulty === 'easy')).toBe(true);
    expect(easy).toHaveLength(countQuestions('all', 'easy'));
    const bankers = buildQuiz({ topic: 'bankers', count: 3, seed: 1 });
    expect(bankers).toHaveLength(3);
    expect(bankers.every((q) => q.topic === 'bankers')).toBe(true);
  });

  it('is deterministic per seed and shuffles between seeds', () => {
    const a = buildQuiz({ count: 10, seed: 42 }).map((q) => q.id);
    const b = buildQuiz({ count: 10, seed: 42 }).map((q) => q.id);
    const c = buildQuiz({ count: 10, seed: 7 }).map((q) => q.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(new Set(a).size).toBe(10); // no repeats within one quiz
  });

  it('shuffle keeps every element', () => {
    const items = [1, 2, 3, 4, 5];
    expect(shuffle(items, 9).sort()).toEqual(items);
  });
});

describe('scoreQuiz', () => {
  const qs = buildQuiz({ count: 4, seed: 3 });

  it('counts correct answers and groups by topic', () => {
    const answers = Object.fromEntries(qs.map((q, i) => [q.id, i < 3 ? q.answer : (q.answer + 1) % 4]));
    const s = scoreQuiz(qs, answers);
    expect(s.correct).toBe(3);
    expect(s.total).toBe(4);
    expect(s.percent).toBe(75);
    expect(Object.values(s.byTopic).reduce((a, v) => a + v.total, 0)).toBe(4);
    expect(s.results.filter((r) => r.correct)).toHaveLength(3);
  });

  it('treats unanswered questions as wrong', () => {
    const s = scoreQuiz(qs, {});
    expect(s.correct).toBe(0);
    expect(s.percent).toBe(0);
    expect(s.results.every((r) => r.answered === false)).toBe(true);
  });

  it('grades sensibly', () => {
    expect(gradeOf(100).label).toBe('Excellent');
    expect(gradeOf(75).label).toBe('Good');
    expect(gradeOf(55).label).toBe('Fair');
    expect(gradeOf(20).tone).toBe('danger');
  });
});

describe('/api/quiz', () => {
  const app = createApp(openDatabase(':memory:'));

  it('stores attempts and reports the best score', async () => {
    expect((await request(app).get('/api/quiz')).body).toMatchObject({ best: null, attempts: 0 });
    const r1 = await request(app).post('/api/quiz').send({ topic: 'all', difficulty: 'all', total: 10, correct: 7, percent: 70 });
    expect(r1.status).toBe(201);
    await request(app).post('/api/quiz').send({ topic: 'bankers', difficulty: 'hard', total: 5, correct: 5, percent: 100 });
    const list = await request(app).get('/api/quiz');
    expect(list.body).toMatchObject({ best: 100, attempts: 2, average: 85 });
    expect(list.body.recent[0]).toMatchObject({ topic: 'bankers', percent: 100 });
    expect(list.body.byTopic).toHaveLength(2);
    const a = await request(app).get('/api/analytics');
    expect(a.body.quiz.attempts).toBe(2);
    expect(a.body.quiz.trend).toHaveLength(2);
  });

  it('computes percent when omitted and validates the payload', async () => {
    const r = await request(app).post('/api/quiz').send({ total: 4, correct: 1 });
    expect(r.body.percent).toBe(25);
    expect((await request(app).post('/api/quiz').send({ total: 0, correct: 0 })).status).toBe(400);
    expect((await request(app).post('/api/quiz').send({ total: 5, correct: 9 })).status).toBe(400);
    expect((await request(app).post('/api/quiz').send({})).status).toBe(400);
  });
});

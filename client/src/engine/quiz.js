/**
 * quiz.js — quiz logic: filtering, deterministic shuffling, scoring and grading.
 * The question bank itself lives in quizQuestions.js (100 questions).
 */
import { QUESTIONS } from './quizQuestions.js';

export { QUESTIONS };

export const TOPICS = {
  basics: 'Locks & 2PL',
  deadlock: 'Deadlocks & Coffman conditions',
  detection: 'Detection & wait-for graph',
  prevention: 'Prevention (wait-die / wound-wait)',
  bankers: "Avoidance (Banker's algorithm)",
  practice: 'Real DBMS & practice',
};

export const DIFFICULTIES = ['easy', 'medium', 'hard'];

/** Deterministic shuffle (xorshift) so a quiz can be replayed from a seed. */
export function shuffle(items, seed = Date.now() % 100000) {
  let s = seed >>> 0 || 1;
  const rand = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a quiz.
 * @param {{topic?:string, difficulty?:string, count?:number, seed?:number}} opts
 *   topic/difficulty 'all' or a key; count 0 = every matching question.
 */
export function buildQuiz({ topic = 'all', difficulty = 'all', count = 10, seed } = {}) {
  let pool = QUESTIONS.filter((q) => (topic === 'all' || q.topic === topic) && (difficulty === 'all' || q.difficulty === difficulty));
  pool = shuffle(pool, seed ?? Date.now() % 100000);
  return count > 0 ? pool.slice(0, count) : pool;
}

/** Count of questions matching a filter (for the "N available" hint). */
export function countQuestions(topic = 'all', difficulty = 'all') {
  return QUESTIONS.filter((q) => (topic === 'all' || q.topic === topic) && (difficulty === 'all' || q.difficulty === difficulty)).length;
}

/**
 * Score a finished quiz.
 * @param {object[]} questions
 * @param {Record<string, number>} answers  questionId → chosen option index
 */
export function scoreQuiz(questions, answers) {
  const results = questions.map((q) => ({
    id: q.id,
    topic: q.topic,
    chosen: answers[q.id],
    correct: answers[q.id] === q.answer,
    answered: answers[q.id] !== undefined,
  }));
  const correct = results.filter((r) => r.correct).length;
  const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const byTopic = {};
  for (const r of results) {
    byTopic[r.topic] ??= { correct: 0, total: 0 };
    byTopic[r.topic].total++;
    if (r.correct) byTopic[r.topic].correct++;
  }
  return { correct, total: questions.length, percent, results, byTopic, grade: gradeOf(percent) };
}

export function gradeOf(percent) {
  if (percent >= 90) return { label: 'Excellent', tone: 'ok', note: 'You can explain deadlocks confidently — try the hard questions or the Game levels.' };
  if (percent >= 70) return { label: 'Good', tone: 'ok', note: 'Solid understanding. Review the topics you missed below.' };
  if (percent >= 50) return { label: 'Fair', tone: 'warn', note: 'The basics are there. Re-read the Theory tab for the weak topics, then retry.' };
  return { label: 'Needs review', tone: 'danger', note: 'Work through the Theory tab and step through a sample simulation, then try again.' };
}

/** Topic → tab to revise it in. */
export const REVISE_TAB = {
  basics: 'theory',
  deadlock: 'theory',
  detection: 'detection',
  prevention: 'prevention',
  bankers: 'bankers',
  practice: 'theory',
};

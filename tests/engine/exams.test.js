import { describe, it, expect } from 'vitest';
import { EXAM_QUESTIONS, EXAM_TOPICS, EXAMS, EXAM_YEARS } from '../../client/src/engine/examQuestions.js';

describe('exam bank integrity', () => {
  it('has 75-100 questions with unique ids', () => {
    expect(EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(75);
    expect(EXAM_QUESTIONS.length).toBeLessThanOrEqual(100);
    expect(new Set(EXAM_QUESTIONS.map((q) => q.id)).size).toBe(EXAM_QUESTIONS.length);
  });

  it('every question carries an exam label and a plausible year', () => {
    for (const q of EXAM_QUESTIONS) {
      expect(q.exam, q.id).toBeTruthy();
      expect(Number.isInteger(q.year), `${q.id} year`).toBe(true);
      expect(q.year, `${q.id} year ${q.year}`).toBeGreaterThanOrEqual(2000);
      expect(q.year, `${q.id} year ${q.year}`).toBeLessThanOrEqual(new Date().getFullYear());
      expect(EXAM_TOPICS[q.topic], `${q.id} topic`).toBeTruthy();
      expect(['easy', 'medium', 'hard'], q.id).toContain(q.difficulty);
    }
  });

  it('MCQs have 4 distinct options and a valid answer index', () => {
    for (const q of EXAM_QUESTIONS.filter((x) => x.type === 'mcq')) {
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, `${q.id} duplicate options`).toBe(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(4);
    }
  });

  it('numericals have a finite numeric answer and no options', () => {
    for (const q of EXAM_QUESTIONS.filter((x) => x.type === 'numerical')) {
      expect(typeof q.answer, q.id).toBe('number');
      expect(Number.isFinite(q.answer), q.id).toBe(true);
      expect(q.answer, `${q.id} negative answer`).toBeGreaterThanOrEqual(0);
      expect(q.options, `${q.id} should not have options`).toBeUndefined();
    }
  });

  it('every question has a worked solution, not just the answer', () => {
    for (const q of EXAM_QUESTIONS) {
      expect(q.solution, q.id).toBeTruthy();
      expect(q.solution.length, `${q.id} solution too short`).toBeGreaterThan(60);
      expect(q.q.length, `${q.id} question too short`).toBeGreaterThan(25);
    }
  });

  it('has a usable spread of exams, types and topics', () => {
    expect(EXAMS.length).toBeGreaterThanOrEqual(4);
    expect(EXAM_YEARS.length).toBeGreaterThanOrEqual(10);
    const numericals = EXAM_QUESTIONS.filter((q) => q.type === 'numerical').length;
    expect(numericals, 'needs a meaningful number of numericals').toBeGreaterThanOrEqual(20);
    for (const t of Object.keys(EXAM_TOPICS)) {
      expect(EXAM_QUESTIONS.filter((q) => q.topic === t).length, `topic ${t}`).toBeGreaterThanOrEqual(5);
    }
  });

  it('has no duplicated question text', () => {
    const seen = new Map();
    for (const q of EXAM_QUESTIONS) {
      const key = q.q.toLowerCase().replace(/[^a-z0-9]/g, '');
      expect(seen.has(key), `${q.id} duplicates ${seen.get(key)}`).toBe(false);
      seen.set(key, q.id);
    }
  });
});

/**
 * The resource numericals all follow two standard formulas. Re-deriving the answer
 * from the numbers in the question text catches arithmetic slips in the bank.
 *   identical processes: R_min = n(m-1)+1
 *   different maxima:    R_min = Σmax - n + 1
 */
describe('resource numericals are arithmetically correct', () => {
  const minUnits = (n, m) => n * (m - 1) + 1;
  const maxProcs = (R, m) => Math.floor((R - 1) / (m - 1));

  const cases = [
    ['n2', minUnits(4, 3), 9],
    ['n3', maxProcs(6, 2), 5],
    ['n6', 3 + 4 + 5 - 3 + 1, 10],
    ['n7', 2 + 3 + 4 + 5 - 4 + 1, 11],
    ['n8', maxProcs(10, 3), 4],
    ['n9', minUnits(2, 4), 7],
    ['n13', minUnits(2, 2), 3],
    ['n14', maxProcs(20, 5), 4],
    ['n15', minUnits(3, 4) - 9, 1],
    ['n20', 2 + 2 + 3 + 3 - 4 + 1, 7],
    ['n21', maxProcs(8, 3), 3],
    ['n25', minUnits(6, 2), 7],
  ];

  it.each(cases)('%s matches the formula', (id, derived, expected) => {
    const q = EXAM_QUESTIONS.find((x) => x.id === id);
    expect(q, `question ${id} missing`).toBeTruthy();
    expect(derived, `formula check for ${id}`).toBe(expected);
    expect(q.answer, `bank answer for ${id}`).toBe(expected);
  });

  it('n12: 3 processes needing 4,5,6 with 12 units are short by 1 unit', () => {
    const required = 4 + 5 + 6 - 3 + 1; // = 13
    const q = EXAM_QUESTIONS.find((x) => x.id === 'n12');
    expect(required - 12).toBe(1);
    expect(q.answer).toBe(1);
  });

  it('n17: five processes needing 4 each can deadlock holding all 15 units', () => {
    const q = EXAM_QUESTIONS.find((x) => x.id === 'n17');
    expect(15).toBeLessThan(minUnits(5, 4));   // 15 < 16, so deadlock is possible
    expect(5 * (4 - 1)).toBe(15);              // and all 15 units can be held
    expect(q.answer).toBe(15);
  });

  it('n10: worst-case free units with 5 processes, max 3, 11 units', () => {
    const q = EXAM_QUESTIONS.find((x) => x.id === 'n10');
    expect(11 - 5 * (3 - 1)).toBe(1);
    expect(q.answer).toBe(1);
    expect(11).toBeGreaterThanOrEqual(minUnits(5, 3)); // so it is also deadlock-free
  });

  it('y4: dining philosophers reduces to the same formula', () => {
    const q = EXAM_QUESTIONS.find((x) => x.id === 'y4');
    expect(maxProcs(5, 2)).toBe(4);
    expect(q.answer).toBe(4);
  });
});

describe("Banker's numericals are consistent", () => {
  it('k3: Available A for the classic 5x3 state is 3', () => {
    const total = 10;
    const allocA = [0, 2, 3, 2, 0].reduce((a, b) => a + b, 0);
    expect(total - allocA).toBe(3);
    expect(EXAM_QUESTIONS.find((q) => q.id === 'k3').answer).toBe(3);
  });

  it('k4: the quoted safe sequence really is safe', () => {
    const need = { P0: [7, 4, 3], P1: [1, 2, 2], P2: [6, 0, 0], P3: [0, 1, 1], P4: [4, 3, 1] };
    const alloc = { P0: [0, 1, 0], P1: [2, 0, 0], P2: [3, 0, 2], P3: [2, 1, 1], P4: [0, 0, 2] };
    let work = [3, 3, 2];
    for (const p of ['P1', 'P3', 'P4', 'P0', 'P2']) {
      expect(need[p].every((v, i) => v <= work[i]), `${p} cannot run yet`).toBe(true);
      work = work.map((v, i) => v + alloc[p][i]);
    }
    expect(work).toEqual([10, 5, 7]); // everything returned
    const q = EXAM_QUESTIONS.find((x) => x.id === 'k4');
    expect(q.options[q.answer]).toContain('P1, P3, P4, P0, P2');
  });

  it('k6: exactly two processes can start a safe sequence', () => {
    const work = [1, 1, 2];
    const needs = [[0, 1, 0], [2, 0, 1], [1, 0, 2]];
    const eligible = needs.filter((n) => n.every((v, i) => v <= work[i])).length;
    expect(eligible).toBe(2);
    expect(EXAM_QUESTIONS.find((q) => q.id === 'k6').answer).toBe(2);
  });

  it('k11: single-resource state is safe with 3 units available', () => {
    const alloc = [5, 2, 2], max = [10, 4, 9], total = 12;
    let work = total - alloc.reduce((a, b) => a + b, 0);
    expect(work).toBe(3);
    const need = max.map((m, i) => m - alloc[i]);
    const finished = new Set();
    for (let pass = 0; pass < 3; pass++) {
      need.forEach((n, i) => { if (!finished.has(i) && n <= work) { work += alloc[i]; finished.add(i); } });
    }
    expect(finished.size, 'all three should finish').toBe(3);
    expect(EXAM_QUESTIONS.find((q) => q.id === 'k11').answer).toBe(3);
  });

  it('k13: available units and safety for the 10-unit state', () => {
    const alloc = [2, 3, 1], max = [7, 6, 5], total = 10;
    let work = total - alloc.reduce((a, b) => a + b, 0);
    expect(work).toBe(4);
    expect(EXAM_QUESTIONS.find((q) => q.id === 'k13').answer).toBe(4);

    // and the state the solution claims is safe really is: ⟨P2, P3, P1⟩
    const need = max.map((m, i) => m - alloc[i]);
    expect(need).toEqual([5, 3, 4]);
    for (const i of [1, 2, 0]) {
      expect(need[i], `P${i + 1} cannot run yet`).toBeLessThanOrEqual(work);
      work += alloc[i];
    }
    expect(work).toBe(total);
  });
});

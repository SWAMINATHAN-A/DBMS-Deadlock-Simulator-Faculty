# Test cases

Automated tests live in `tests/` and run with `npm test` (Vitest). **125 tests, all passing.**
`npm run check` runs ESLint, the test suite and a production build together.

| Suite | File | Cases |
|---|---|---|
| Parser | `tests/engine/parser.test.js` | 13 |
| Lock manager | `tests/engine/lockManager.test.js` | 7 |
| Wait-for graph | `tests/engine/waitForGraph.test.js` | 5 |
| Detection / prevention / Banker's | `tests/engine/simulators.test.js` | 16 |
| Game / tutor / report | `tests/engine/game-tutor.test.js` | 17 |
| REST API | `tests/server/api.test.js` | 5 |
| AI tutor (config, request builders, error mapping, routes, context summary) | `tests/server/ai.test.js` | 9 |
| Quiz (100-question bank integrity, filtering, scoring, API) | `tests/engine/quiz.test.js` | 13 |
| Competitive exams (89-question bank integrity + arithmetic re-derivation of every numerical) | `tests/engine/exams.test.js` | 28 |
| API hostile input (malformed ids, query params, bodies, injection, export formats) | `tests/server/edge.test.js` | 12 |

## 1. Input validation

| ID | Input | Expected | Automated |
|---|---|---|---|
| V1 | `T1: LOCK-X(A)` … `T1: COMMIT` | ok, 4 ops, canonical text `T1: LOCK-X(A)` | ✔ |
| V2 | `t1: select a` / `T2: update B` | S / X locks, `sql` field set | ✔ |
| V3 | comments `#`, `--`, blank lines | ignored | ✔ |
| V4 | `hello world`, `T1: FOO(A)` | errors on lines 2 and 3 | ✔ |
| V5 | `T1: UNLOCK(A)` without lock | "never requested a lock" | ✔ |
| V6 | op after `COMMIT` | "already committed" | ✔ |
| V7 | `LOCK-X(A)` then `LOCK-S(A)` | redundant lock error | ✔ |
| V8 | empty / comment-only text | "Schedule is empty" | ✔ |
| V9 | 13 transactions | "Too many transactions" | ✔ |
| V10 | Banker's row/column mismatch, Allocation > Max, bad request pid/length | specific errors | ✔ |

## 2. Lock manager
| ID | Scenario | Expected | Automated |
|---|---|---|---|
| L1 | compatibility matrix | S/S only | ✔ |
| L2 | two S holders, X request | blocked by both | ✔ |
| L3 | three X requests, release first | FIFO: second granted, third still waiting | ✔ |
| L4 | S→X upgrade with / without other S holders | granted / blocked, granted after release | ✔ |
| L5 | `releaseAll` | clears holders and queue entries | ✔ |

## 3. Cycle detection
| ID | Graph | Expected | Automated |
|---|---|---|---|
| C1 | chain T1→T2→T3 | no cycle, 3 visits | ✔ |
| C2 | T1⇄T2 | cycle `[T1,T2,T1]`, trace ends with `cycleFound` | ✔ |
| C3 | T1→T2→T3→T4→T2 | cycle `[T2,T3,T4,T2]` | ✔ |

## 4. Simulators (see `docs/SAMPLE_IO.md` for full traces)
| ID | Sample | Expected | Automated |
|---|---|---|---|
| S1 | Classic 2-txn | 1 deadlock, cycle T1→T2→T1, victim T2, both commit | ✔ |
| S2 | 3-txn ring | cycle T1→T2→T3→T1, victim T3 | ✔ |
| S3 | Shared readers | 0 deadlocks, T3 waits on T1 & T2, WFG acyclic at every step | ✔ |
| S4 | Lock upgrade | 1 deadlock, cycle T1→T2→T1 | ✔ |
| S5 | Victim policies | oldest → T1, requester → T2 | ✔ |
| S6 | Locks never released | END reports stuck T2 | ✔ |
| S7 | Wait-die | T1 WAITs, T2 DIEs, T2 re-executes B then A after restart | ✔ |
| S8 | Wound-wait | T1 WOUNDs T2, no WAIT step | ✔ |
| S9 | Both schemes on all samples | never a cycle, 0 deadlocks | ✔ |
| S10 | Banker's textbook | safe, ⟨P1,P3,P4,P0,P2⟩ | ✔ |
| S11 | P1 requests (1,0,2) | granted, Available (2,3,0) | ✔ |
| S12 | P0 requests (0,2,0) after S11 | denied — unsafe | ✔ |
| S13 | request > need / > available | rejected with reason | ✔ |
| S14 | Available (0,0,0), Max > 0 | unsafe | ✔ |

## 5. Game
| ID | Scenario | Expected | Automated |
|---|---|---|---|
| G1 | L1: T1,T1,T1,T2,T2,T2 | won, score 120 | ✔ |
| G2 | L1: T1,T2,T1,T2 | deadlock T1→T2→T1, no moves available | ✔ |
| G3 | hints after T1,T2 | both moves unsafe, −10 points | ✔ |
| G4 | every level | winnable from start **and** can deadlock | ✔ |
| G5 | undo | replays without last move | ✔ |
| G6 | random level seed 42 | deterministic, valid, winnable | ✔ |

## 6. Tutor
| ID | Question | Expected | Automated |
|---|---|---|---|
| T1 | "Is there a deadlock?" | intent `cycle`, mentions T1 → T2 → T1, stepRef = deadlock step | ✔ |
| T2 | "why did T2 get rolled back?" | intent `whyVictim`, mentions youngest | ✔ |
| T3 | "who is T1 waiting for" (at block step) | "T1 waits for T2" | ✔ |
| T4 | "What if I used wound-wait instead?" | re-runs engine, "aborted: T2" | ✔ |
| T5 | "explain step 3" | stepRef 2 | ✔ |
| T6 | "what is a wait-for graph?" | glossary definition | ✔ |
| T7 | Banker's: safe sequence / request denied | correct answers | ✔ |
| T8 | "banana" | fallback + ≥ 4 suggestions | ✔ |

## 7. Quiz
| ID | Scenario | Expected | Automated |
|---|---|---|---|
| Q1 | Question bank integrity | ≥ 100 questions; 4 unique options each; answer index in range; known topic/difficulty; every question ends in `?` or `:`; explanation > 40 chars | ✔ |
| Q2 | Ids unique, every topic has ≥ 12 questions and a "revise" target tab | ✔ | ✔ |
| Q3 | No stray non-English characters or unrendered unicode escapes in any question | ✔ | ✔ |
| Q3b | No two questions share the same text; each difficulty has ≥ 15 questions overall | ✔ | ✔ |
| Q4 | `buildQuiz` filters by topic/difficulty and caps the count | ✔ | ✔ |
| Q5 | Same seed → same questions; different seed → different order; no repeats in one quiz | ✔ | ✔ |
| Q6 | `scoreQuiz` counts correct answers, groups by topic, treats unanswered as wrong | ✔ | ✔ |
| Q7 | Grades: 100 → Excellent, 75 → Good, 55 → Fair, 20 → danger tone | ✔ | ✔ |
| Q8 | `POST /api/quiz` stores an attempt; `GET` reports best/average/by-topic; analytics includes the quiz trend | ✔ | ✔ |
| Q9 | Percent computed when omitted; total ≤ 0, correct > total, empty body → 400 | ✔ | ✔ |

## 8. API
| ID | Scenario | Expected | Automated |
|---|---|---|---|
| A1 | `GET /api/health`, `/api/samples` | ok, ≥ 5 samples | ✔ |
| A2 | POST → GET → export md/json → DELETE history | 201, summary text, markdown, 404 after delete | ✔ |
| A3 | invalid mode / missing result / malformed JSON | 400 | ✔ |
| A4 | scores + tutor log + analytics | best per level, totals, intents | ✔ |
| A5 | unknown `/api/*` | 404 | ✔ |
| A6 | AI not configured: `/api/ai/status` disabled, `/api/ai/ask` → 503 | ✔ |
| A7 | AI configured: status shows provider (never the key); empty / over-long question → 400 | ✔ |
| A8 | Gemini and OpenAI-compatible request bodies built correctly; 401/429/empty answers mapped to friendly errors (mocked fetch) | ✔ |

## 8b. Competitive exam bank
| ID | Scenario | Expected | Automated |
|---|---|---|---|
| E1 | 75–100 questions, unique ids | ✔ 89 | ✔ |
| E2 | Every question carries an exam label and a year between 2000 and the current year | ✔ | ✔ |
| E3 | MCQs: 4 distinct options, answer index in range | ✔ | ✔ |
| E4 | Numericals: finite non-negative numeric answer, no options array | ✔ | ✔ |
| E5 | Every question has a worked solution longer than 60 characters | ✔ | ✔ |
| E6 | Spread: ≥ 4 exams, ≥ 10 years, ≥ 20 numericals, ≥ 5 questions per topic | ✔ | ✔ |
| E7 | No duplicated question text | ✔ | ✔ |
| E8 | Resource numericals re-derived from `R ≥ n(m−1)+1` / `Σmax ≤ R+n−1` (12 cases) | ✔ answers match the formulas | ✔ |
| E9 | `n12`, `n17`, `n10`, `y4` special cases re-derived independently | ✔ | ✔ |
| E10 | Banker's numericals: Available recomputed from totals; the quoted safe sequence ⟨P1,P3,P4,P0,P2⟩ simulated step by step | ✔ all processes finish, Work returns to (10,5,7) | ✔ |
| E11 | UI: 89 cards render with tags, 5 filters, MCQ grading, numerical grading, practice mode | ✔ | ✔ (browser smoke test) |

## 9. Robustness audit (October 2026)

A dedicated audit pass; see `docs/AI_PROMPT_LOG.md` for the session notes.

| ID | Check | Method | Result |
|---|---|---|---|
| R1 | Parser survives hostile input — empty, whitespace, `null`/`undefined`/numbers/objects, unbalanced brackets, unknown verbs, 400-line schedules, HTML/script strings, `;DROP TABLE` | fuzz harness | ✔ always returns `{ok, ops, errors}`, never throws |
| R2 | 400 random schedules through detection + both prevention schemes | fuzz harness | ✔ no throw, no hang, every run ends with an `END` step, step cap respected |
| R3 | Prevention can never produce a cycle | fuzz harness | ✔ wait-for graph verified acyclic at **every** step of every run |
| R4 | Every step of every run has a non-empty explanation | fuzz harness | ✔ |
| R5 | Banker's degenerate inputs (all-zero, single resource, request = available) and invalid ones (negative, fractional, mismatched) | fuzz harness | ✔ valid ones trace, invalid ones rejected |
| R6 | Tutor: 21 questions × 8 contexts (including empty context and "nothing run yet") | fuzz harness | ✔ always a non-empty answer; every `stepRef` within range |
| R7 | Game: 12 random playthroughs of every level + random levels; hints cross-checked against exhaustive reachability | fuzz harness | ✔ hints are truthful, games always terminate, score never negative |
| R8 | Report JSON export → import round-trip; malformed files rejected | fuzz harness | ✔ |
| R9 | Max-size schedule (12 transactions × 12 items, 156 ops) | fuzz harness | ✔ 262 steps in **3 ms** (requirement: < 2 s) |
| R10 | API: malformed ids (`abc`, `NaN`, `1e999`, `1; DROP TABLE …`) on every `/:id` route | `tests/server/edge.test.js` | ✔ 404/400, never 500 |
| R11 | API: malformed query params and POST bodies on every route | `tests/server/edge.test.js` | ✔ clamped or 400, never 500 |
| R12 | API: unicode, quotes, HTML and SQL-injection strings stored and exported | `tests/server/edge.test.js` | ✔ stored literally, tables intact |
| R13 | Every tab rendered in a real browser, console and network watched | puppeteer smoke test | ✔ no console errors, no failed requests, no React warnings |
| R14 | All samples in Detection + Prevention, all 4 victim policies, invalid input, Banker's valid/invalid, full game, full quiz, history save/open, tutor Q&A, theme toggle | puppeteer smoke test | ✔ |
| R15 | Deep links incl. nonexistent sample/level/tab, out-of-range step, corrupt base64 | puppeteer smoke test | ✔ page always renders |
| R16 | Responsive at 375 / 768 / 1280 px | puppeteer smoke test | ✔ no horizontal overflow |
| R17 | Production build (`npm start`) — SPA fallback, JSON API 404s, full smoke test against the minified bundle | puppeteer + curl | ✔ |
| R18 | ESLint (react + react-hooks) | `npm run lint` | ✔ clean |

## 10. Manual UI checks
| ID | Check | Result |
|---|---|---|
| U1 | Run sample 1, step to BLOCK step: DFS animation, "Cycle found" chip, red cycle edges | ✔ |
| U2 | Victim step shows red diamond for T2; T1 wakes | ✔ |
| U3 | Banker's page: matrices, Work/Finish, safe-sequence chips update per step | ✔ |
| U4 | Game L1 win → toast, score saved, "best" chip on level card | ✔ |
| U5 | History: analytics charts, Open reloads run, exports download | ✔ |
| U6 | Dark/light toggle persists; graph recolours | ✔ |
| U7 | 375 px viewport: panes stack, tabs wrap, no horizontal scroll | ✔ |
| U8 | Keyboard: ← → Space Home End step the active tab only | ✔ |
| U9 | Tutor answers through the UI, "Jump to step" link works | ✔ |
| U10 | Largest sample runs in < 5 ms (shown in summary chip) | ✔ |
| U11 | Quiz: answer marked right/wrong, explanation shown, finish → score, per-topic table, answer review, attempt saved to the database | ✔ |
| U12 | Guide and References tabs render; all 28 reference links return 200 (ACM/MySQL return 403 to `curl` only — bot filtering — and open normally in a browser) | ✔ |
| U13 | All 11 tabs fit the top bar at 1280 px and wrap below that | ✔ |

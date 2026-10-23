# AI prompt log and usage record

Tool: **Claude Code** (Claude Opus 5) in the Claude desktop app, 17 September 2026.
The whole application, tests and documentation were generated in one planning + implementation
session, reviewed and steered by the student. Nothing in the running application calls an AI
service — the "AI tutor" is a deterministic engine (see `client/src/engine/tutor.js`).

## Session 1 — planning and build

### Prompt 1 (project brief)
> Project: Deadlock Game. Problem Definition: Develop an interactive web application that teaches and demonstrates 'Deadlock Game' through visualization, simulation, and AI-assisted explanations. Background Theory … Learning Outcomes … Functional Requirements: Accept user input, validate it, simulate the concept, explain each step, export results, and maintain history. Non-Functional Requirements: Responsive UI, modular code, accessibility, fast response (<2 s), cross-browser support. … Technology Stack: Frontend: HTML/CSS/JavaScript/React; Backend: Python/Node.js; Database: SQLite/MySQL; Visualization: D3.js, Mermaid.js, Cytoscape.js … Evaluation Rubric (30 Marks): Functionality (10), Visualization (5), UI/UX (5), Documentation (5), Innovation (5). Advanced Extensions: AI tutor, speech explanation, analytics dashboard … these is the guideline for my dbms project.

**AI response (summary):** Asked three clarifying questions — stack, how the AI tutor should work, and scope. Decisions: React + Vite front end, Node/Express + SQLite back end, Cytoscape.js; scope = wait-for-graph detection, wait-die/wound-wait prevention, Banker's algorithm, and a scheduler game.

### Prompt 2 (cost constraint)
> Claude api would include charges right? i want the tutor to work without any charges

**AI response:** Confirmed the Claude API is pay-per-use and offered three zero-cost options. Chosen: a built-in rule-based, scenario-aware tutor (intent matching over the simulation step data, "what-if" questions re-run the engine). The plan was updated to remove every external AI dependency.

### Prompt 3
> (approved the implementation plan)

**AI work performed:**
1. Scaffolded npm workspaces (`client`, `server`), Vite/React client, Express server, Vitest.
2. Wrote the simulation engine: `parser.js`, `lockManager.js`, `waitForGraph.js`, `scheduler.js`, `detection.js`, `prevention.js`, `bankers.js`, `game.js`, `explain.js`, `tutor.js`, `report.js`, `samples.js`.
3. Wrote 63 automated tests; found and fixed three defects during testing:
   * wait-die lost the in-flight operation on restart (T2 never re-requested A) — fixed by passing the current op to `rollback()`;
   * the "unsafe request" Banker's sample used the wrong starting state (the textbook denial happens after P1's grant) — corrected the sample;
   * the tutor classified "what is a wait-for graph?" as a *waiting* question — reordered intents so definitional questions win.
4. Built the UI (three-pane layout, theme tokens, Cytoscape graph with DFS replay, lock table, timeline, Banker's matrices, game board, history + SVG analytics, theory page, tutor chat, speech button).
5. Verified in the built-in browser: fixed a Cytoscape style-transition glitch, a port clash (server now reads `API_PORT`), tab wrapping on phones, and stale "Saved #n" labels.
6. Added deep links / `🔗 Share` (a URL reopens a run at a given step) so headless Edge could capture `docs/screenshots/` without clicking; fixed a Cytoscape layout bug this uncovered (layout measured a 0×0 container when a run starts during mount).
7. Generated documentation (README, DOCUMENTATION, USER_MANUAL, TEST_CASES, this log), a script that produces `SAMPLE_IO.md` from real engine output, and a screenshot script.

## Prompts used *inside* the work (representative)
These are the kinds of instructions given to the AI while iterating:
* "Design a step-snapshot format so the UI can scrub backwards without re-running the simulation."
* "Make the DFS return a trace of visit/backtrack/cycle events so the graph can animate it."
* "Wait-die must restart the aborted transaction with its original timestamp; make sure the operation that caused the abort is re-executed."
* "Use Node's built-in `node:sqlite` so Windows users don't need build tools."
* "The tutor must work offline: match intents with regexes, answer from the step data, and re-run the engine for 'what if' questions."
* "Add hints to the game by exhaustively searching whether a deadlock-free completion is still reachable."
* "Make the layout stack below 900 px and wrap the tab bar on phones."

## How AI output was checked
* Every engine module is covered by unit tests with hand-verified expected values (e.g. the Silberschatz Banker's example ⟨P1,P3,P4,P0,P2⟩; wait-die vs wound-wait outcomes on the classic schedule).
* The UI was exercised in a browser: sample runs, stepping, game win/loss, history save/open/export, dark/light theme, mobile viewport.
* `docs/SAMPLE_IO.md` is generated from the engine so the documented outputs cannot drift from the code.

## Session 2 — 21 September 2026

### Prompt 4
> the ai tutor ui is very unclear as questions are not properly visible, so fix that.

**Outcome:** the suggestion chips were `<button>` elements inheriting the browser's black text on the dark theme. Fixed chip colour inheritance, restyled the chips as outlined buttons and added a "Try asking:" label.

### Prompt 5
> add these as well, also include project made under the professor  *(Developed By tab spec: photo, name, register number, guided by Dr. Swaminathan A)*

**Outcome:** new *Developed By* tab driven by `client/src/developedBy.js`; then names/register numbers (Parth 25BCE1443, Vansh Sharma 25BCE1567) and photographs added.

### Prompt 6
> add innovation to a new tab, it doesn't fit well in the developed by tab

**Outcome:** *Innovation* tab with six cards, "Try it" shortcuts and a comparison table.

### Prompt 7
> i want you to integrate an ai tutor along with offline tutor present using any free api key

**Outcome:** LLM tutor added beside the offline one. Server: `server/ai.js` (Gemini / Groq / OpenRouter / OpenAI-compatible via plain `fetch`, key in `server/.env`, friendly error mapping, 45 s timeout) and `POST /api/ai/ask`. Client: engine switch in the Tutor panel, `summarizeForAi()` builds a compact run summary, the offline engine's answer is sent as grounding, last 6 turns kept for follow-ups, automatic fallback to the offline answer on failure. 9 new tests with mocked fetch (72 total).

### Prompt 8
> INCLUDE A QUIZ TAB ALSO Having multiple mcqs for furnishing the concepts of theory. also add a reference tab with working links, and a tab for guiding people how to use website and the terms used while giving input in the site

**Outcome:** three new tabs.
* **Quiz** — `client/src/engine/quiz.js` holds 35 explained MCQs over six topics with difficulty tags; the page supports topic/difficulty/count filters, practice vs test feedback, per-topic scoring with "revise" links into the matching tab, an answer review and a Markdown export. Attempts persist via `POST /api/quiz` (new `quiz_scores` table) and feed the analytics dashboard.
* **References** — grouped, described links to textbooks, the original papers (Coffman 1971; Rosenkrantz, Stearns & Lewis 1978; Dijkstra EWD623), official MySQL/PostgreSQL/SQL Server/Oracle/SQLite docs, free courses and every tool used. All 28 links were checked with `curl` (ACM and MySQL answer 403 to scripts but open fine in a browser).
* **Guide** — in-app manual: quick start, the three panes, full input syntax, a glossary table of every input term, how to read the visualization, Banker's input, what each tab does, keyboard shortcuts and troubleshooting.
The tab bar was made to shrink and wrap so all eleven tabs fit. 11 new tests (83 total).

### Prompt 9
> add around 100 mcqs for the quiz

**Outcome:** the bank was expanded from 35 to **100** questions and moved into its own data module `client/src/engine/quizQuestions.js`, leaving `quiz.js` as pure logic (filter, shuffle, score, grade). Distribution: Locks & 2PL 18, Deadlocks & Coffman 17, Detection & WFG 18, Prevention 17, Banker's 17, Real DBMS practice 13; by difficulty 20 easy / 51 medium / 29 hard, with all three levels present in every topic. The quiz length selector now offers up to 50 or the whole bank, and the topic/difficulty dropdowns display how many questions match. Tests were tightened accordingly (at least 100 questions, at least 12 per topic, no duplicate question text, no unrendered escapes) - 85 tests total.

### Prompt 10
> ensure there are no bugs or errors in the current web application

**Outcome:** a full robustness audit (results table in `docs/TEST_CASES.md` section 9).

Tooling added: ESLint 9 with the React and React-Hooks rule sets (`npm run lint`, plus `npm run check` = lint + tests + build); a new hostile-input API suite (`tests/server/edge.test.js`, 12 tests); an engine fuzz harness; and a Puppeteer smoke test driving the installed Edge over every tab.

Findings and fixes:
* **No functional bugs were found.** 400 random schedules, hostile parser input, 21 tutor questions across 8 contexts, 12 random playthroughs of every game level, and every API route under malformed input all behaved correctly. Game hints were cross-checked against exhaustive reachability and are truthful.
* Code-quality fixes applied: `useStepper` mutated a ref during render (replaced with the derive-state-on-prop-change pattern, which also removed a redundant render per run); `LockTable` and `ResultActions` computed state in effects (same pattern); `BankersPage` referenced `pickSample` before its declaration; `suggestedQuestions` had an unused parameter; two useless initialisations; `server/ai.js` now attaches the original error as `cause`.
* Verified separately that the **production** build (`npm start`) serves the SPA correctly, returns JSON — not HTML — for unknown `/api/*` routes, and passes the same browser smoke test as the dev server.
* Performance: the largest permitted schedule (12 transactions × 12 items) simulates in **3 ms**, far inside the 2 s non-functional requirement.

### Prompt 11
> now add a competitive exams tab which includes mcqs and numericals from the deadlock topic that have came in exams such as gate, also for each mcq or numerical, give the label of that exam and it's year, include around 75 to 100 of them

**Outcome:** new **🎓 Exams** tab with **89 questions (60 MCQ + 29 numerical/NAT)** in `client/src/engine/examQuestions.js`, each tagged with exam (GATE CS, GATE IT, UGC-NET, ISRO, NIELIT), year (2004–2024), topic, difficulty and a worked solution. Filterable by all five dimensions, with a browse mode, a shuffled practice mode, numeric answer boxes for NAT questions, score saving and a Markdown export of the filtered set.

**Honesty note recorded with the user:** the questions are *modelled on the recurring patterns* of those papers (the `R ≥ n(m−1)+1` and `Σmax ≤ R+n−1` resource family, Banker's safe-sequence problems, RAG cycle questions, semaphore ordering) rather than being verbatim reproductions, because exact past-paper wording cannot be verified from memory and mislabelling invented items as official questions would be misleading. A banner on the tab, the module header and the user manual all state this.

Correctness: 28 new tests, including re-derivation of every resource numerical from the standard formulas and a step-by-step simulation proving the quoted Banker's safe sequence really is safe. One question (`n7`) was found to have an impossible premise during this check and was rewritten. Test total: 97 → 125.

## Later sessions
_Add new prompts and outcomes below as the project evolves._

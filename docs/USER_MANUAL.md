# Deadlock Game — User Manual

## Starting the application
1. Install Node.js 22 or newer.
2. In the project folder run `npm install` once, then `npm run dev`.
3. Open <http://localhost:5173> in any modern browser.

The top bar has twelve tabs: **Detection · Prevention · Banker's · Game · History · Theory · Quiz · Exams · Guide · References · Innovation · Developed By** and a
🌙/☀️ button that toggles dark / light mode (remembered per browser).

## Layout of the simulator pages
```
┌──────────────┬──────────────────────────────┬──────────────────────┐
│  INPUT       │  VISUALIZATION               │  EXPLANATION         │
│  sample      │  summary chips               │  current step        │
│  editor      │  wait-for graph (Cytoscape)  │  why it matters      │
│  validation  │  lock table                  │  🔊 listen           │
│  options     │  timeline                    │  step log            │
│  Run / Reset │  ⏮ ◀ ▶ ▶| ⏭  scrubber  speed │  Tutor chat          │
└──────────────┴──────────────────────────────┴──────────────────────┘
```
On narrow screens the panes stack vertically.

## Detection tab
1. **Load a sample** from the dropdown *or* type a schedule, one operation per line:
   `T1: READ A` (takes a shared lock) or `T1: WRITE A` (takes an exclusive lock), then `T1: COMMIT`.
   Explicit lock syntax is accepted too: `T1: LOCK-S(A)`, `T1: LOCK-X(A)`, `T1: UNLOCK(A)`.
   `SELECT` is a synonym for `READ`; `UPDATE`, `INSERT` and `DELETE` are synonyms for `WRITE`.
2. Validation messages appear under the editor with the line number. Fix them until the green
   "Schedule is valid" line shows.
3. Choose a **victim selection policy** (youngest · oldest · fewest locks · closed the cycle).
4. Press **▶ Run simulation**.
5. Step through with the controls or the keyboard: **←/→** previous/next, **Space** play/pause,
   **Home/End** first/last. Drag the scrubber or click any entry in the step log or timeline.

What you see:
* **Graph** — nodes are transactions: blue circle = active, amber square = blocked,
  red diamond = aborted, green hexagon = committed. An edge `T1 → T2` labelled `B` means
  T1 waits for item B held by T2. On every *block* step the DFS is replayed: purple border =
  being visited, dark border = finished, red = cycle.
* **Lock table** — holders and wait queue per item; rows touched by the current step flash.
* **Timeline** — one cell per step for each transaction (lock, ⏳ wait, ✗ abort, C commit, ↻ restart).
* **Summary chips** — number of deadlocks / rollbacks / steps, simulation time, status of every transaction.

Buttons above the graph: **💾 Save to history**, **⬇ Report (.md)**, **⬇ JSON**, **🔗 Share** (copies a link that reopens this run at the current step), **PNG** (graph image).
**Import JSON** in the input pane reloads an exported file.

## Prevention tab
Same editor and visualization. Choose **wait-die** or **wound-wait**. Steps are labelled
WAIT / DIE / WOUND / RESTART and each explanation shows the timestamp comparison that decided
the outcome. The transaction chips show each transaction's timestamp (TS).

## Banker's tab
1. Enter **Available** (e.g. `3 3 2`), **Max** and **Allocation** (one row per process, numbers
   separated by spaces or commas). Need is computed automatically.
2. Optionally enter a **Request** (process + vector) to run the resource-request algorithm.
3. Press **▶ Run**. The matrices highlight the process being examined; **Work** and **Finish**
   update each step; the safe sequence grows as chips. The request is shown as granted or
   denied with the reason.

## Game tab
* Pick a level card (easy → hard) or **🎲 Random**.
* Each transaction is a card showing its **next operation** and the queue after it. Click a card
  to execute that operation. Blocked cards show ⏳ and cannot be clicked until they wake up.
* The graph and lock table update live. Forming a cycle ends the level (score 0).
  Committing every transaction wins; +20 bonus if nobody ever waited.
* **💡 Hint** (−10 points) colours every clickable card green (a win is still reachable) or red
  (leads to unavoidable deadlock). **↶ Undo** replays the game without the last move.
* Scores are saved automatically; the best score per level appears on the level card.

## History tab
* **Analytics** — saved runs, deadlocks found, average steps, games played, charts of runs per
  mode, deadlock ratio, score trend, best score per level, most-asked tutor topics.
* **Saved runs** — filter by mode, **Open** (reloads the run in its tab), download the
  **Report .md** or **JSON**, **Delete**, or **Clear all**.

## Tutor (right pane)
Type a question or click a suggestion chip. Examples:
* *Is there a deadlock?* · *Who is waiting for whom?* · *Why did T2 abort?*
* *Explain step 5* · *What does T1 hold?*
* *What if I used wound-wait instead?* (re-runs the schedule under the other strategy)
* *What is the safe sequence?* · *Why was the request denied?*
* *What is a wait-for graph?* (glossary)

Answers that refer to a step include a **→ Jump to step** link. Every answer and every step
explanation has a 🔊 button that reads it aloud (browser speech synthesis).

The switch at the top of the panel chooses the engine:
* **📴 Offline tutor** — deterministic answers from the simulation data; always available.
* **✨ AI tutor** — a large language model explains the run in its own words. It receives the
  same simulation data plus the offline engine's answer, so it stays factual, and it can hold a
  short conversation with follow-up questions. Needs a free API key in `server/.env`
  (see README → *Optional: enable the AI tutor*). If the provider is rate-limited or unreachable,
  the panel shows the offline answer instead.

## Theory tab
Concise notes on deadlocks, Coffman conditions, detection, prevention, avoidance, victim
selection, comparison table, how real databases behave, limitations and references.

## Quiz tab
Self-assessment with **100** multiple-choice questions across six topics (locks & 2PL 18,
deadlocks & Coffman conditions 17, detection & wait-for graph 18, prevention 17, Banker's 17,
real DBMS practice 13), each tagged easy / medium / hard. Quizzes of 5-100 questions can be
generated; the dropdowns show how many questions match the current filter.

1. Choose a **topic**, a **difficulty**, how many questions, and whether to see the answer after
   each question (practice) or only at the end (test).
2. Answer by clicking an option. In practice mode the correct option turns green, a wrong choice
   turns red, and the explanation appears immediately.
3. At the end you get a percentage, a grade, a **score-by-topic** table with **Revise →** buttons
   that jump to the tab where that topic is taught, and a full answer review.
4. **⬇ Download review (.md)** saves the questions, your answers and the explanations.
   Attempts are stored in the database; your best score appears on the start screen and in History.

## Exams tab
Competitive-exam practice on the deadlock topic: **89 questions — 60 MCQs and 29 numericals (NAT)** —
written in the style of GATE CS/IT, UGC-NET, ISRO and NIELIT. Every card is tagged with the exam,
the year, the difficulty and the type, and every question has a worked solution.

> **Provenance.** The questions are *modelled on the recurring question patterns* of those exams —
> the formulas, traps and phrasing they reuse year after year. They are **not** verbatim copies of
> official papers; check the official PDF before quoting any item as a past-paper question. A banner
> at the top of the tab says the same thing.

* **Filter** by exam, year, topic (conditions, graphs, resource numericals, Banker's, strategies,
  synchronisation), type (MCQ / numerical) and difficulty. The counts update as you filter.
* **Browse mode** lists every matching question; answer any of them and press **Check answer** to
  reveal the worked solution.
* **Numericals** give you a number box — type your value and press Enter or *Check answer*; the exact
  expected value and its unit are shown with the solution.
* **▶ Practice these** shuffles the filtered set and shows one question at a time with a progress bar;
  **Finish & save score** records the attempt alongside your quiz scores.
* **⬇ Download set (.md)** exports the current filtered selection with answers and solutions — useful
  as a revision handout.

The resource numericals are built on the two formulas those exams reuse constantly:
`R ≥ n(m−1)+1` for identical processes and `Σmaxᵢ ≤ R + n − 1` for differing maxima. Automated tests
re-derive the answers from these formulas so the bank cannot drift.

## Guide tab
The in-app manual: quick start, what each pane does, the full input syntax (lock-level and
SQL-style), a glossary of every term used in the input (shared/exclusive lock, unlock, commit,
abort, upgrade, wait queue, victim policy, timestamp, Need, Work/Finish, safe sequence…),
how to read the graph/lock table/timeline, what each tab is for, keyboard shortcuts and
troubleshooting.

## References tab
Textbooks, the original research papers (Coffman 1971; Rosenkrantz, Stearns & Lewis 1978),
official MySQL / PostgreSQL / SQL Server / Oracle documentation, free courses (CMU 15-445,
NPTEL, MIT OCW), the open-source tools used to build the app, and the free AI-tutor providers.
Every entry has a short description and a working link that opens in a new tab.

## Innovation tab
Six cards explaining what sets the project apart (game mode, offline tutor, animated DFS,
multi-strategy comparison, history/sharing, accessibility) with "Try it" shortcuts, plus a
comparison table against a typical classroom demo.

## Developed By tab
Student photograph(s), name(s) and register number(s), plus the guide (Dr. Swaminathan A,
Assistant Professor). Edit `client/src/developedBy.js` to change the details; photos go in
`client/public/team/`.

## Keyboard shortcuts
| Key | Action |
|---|---|
| → / ← | next / previous step |
| Space | play / pause |
| Home / End | first / last step |
| Tab | move between controls; Enter activates step-log entries and level cards |

## Troubleshooting
* **"Cannot reach the server"** — make sure `npm run dev` is running (it starts both the client and the API).
* **Port in use** — set `API_PORT=3002` for the server and update `client/vite.config.js` proxy target.
* **No 🔊 button** — the browser does not support the Web Speech API.

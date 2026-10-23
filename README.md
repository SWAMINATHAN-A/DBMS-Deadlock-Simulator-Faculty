# 🔒 Deadlock Game

An interactive web application that teaches **deadlocks in database systems** through
simulation, step-by-step visualization and explanation:

| Mode | What it shows |
|---|---|
| **Detection** | Wait-for graph built from a lock schedule; animated DFS cycle detection; victim selection and rollback |
| **Prevention** | The same schedule under **wait-die** and **wound-wait** timestamp schemes |
| **Banker's** | Safety algorithm and resource-request algorithm with live Work / Finish vectors |
| **Game** | *You* are the scheduler: pick which transaction runs next and avoid the cycle; hints, scores, levels |
| **History** | Saved runs (SQLite), Markdown / JSON export, analytics dashboard |
| **Theory** | Background, Coffman conditions, algorithms & complexity, real-world DBMS behaviour, references |
| **Quiz** | **100** explained MCQs across 6 topics and 3 difficulty levels, per-topic scoring, "revise" links back to the right tab, downloadable review |
| **Exams** | **89** competitive-exam practice questions (60 MCQ + 29 numerical) in GATE CS/IT, UGC-NET, ISRO and NIELIT style, each tagged with exam + year, filterable, with worked solutions |
| **Guide** | How to use the site, the full input syntax and a glossary of every term used in the input |
| **References** | Textbooks, papers, official DBMS docs, free courses and the tools used — all with working links |
| **Innovation** | What makes the project different, with shortcuts into each feature and a comparison table |
| **Developed By** | Student photos, names, register numbers and the project guide (edit `client/src/developedBy.js`) |

Every step has a rule-based explanation, a "why it matters" note, a 🔊 read-aloud button and a
built-in **offline tutor** that answers questions about the current run ("why did T2 abort?",
"what if I used wound-wait?") with no keys or network. An optional **AI tutor** (LLM) can be
switched on with a free-tier API key — see below — and is grounded in the offline engine's facts.

## Quick start

Requirements: **Node.js 22+** (uses the built-in `node:sqlite` — no native build tools needed).

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The API server runs on port 3001 and is proxied under `/api`.

Other commands:

```bash
npm test          # vitest — engine + API tests
npm run lint      # eslint (react + react-hooks rules)
npm run check     # lint + tests + production build, all in one
npm run build     # production build of the client into client/dist
npm run docs:samples      # regenerate docs/SAMPLE_IO.md from the engine
npm run docs:screenshots  # capture docs/screenshots/*.png (needs the dev server + Edge/Chrome)
npm start         # serve the built client + API from one process on :3001
```

The SQLite database is created automatically at `server/data/deadlock.db`.

### Optional: enable the AI tutor (free API key)

The offline tutor always works. To also enable the LLM tutor:

1. Get a free key from **one** provider (no card needed):
   Google Gemini → <https://aistudio.google.com/apikey> · Groq → <https://console.groq.com/keys> · OpenRouter → <https://openrouter.ai/keys>
2. Copy `server/.env.example` to `server/.env` and fill in `AI_PROVIDER` and `AI_API_KEY` (optionally `AI_MODEL`).
3. Restart `npm run dev`. The Tutor panel now shows an **✨ AI tutor** switch.

A local model works too: run Ollama and set `AI_PROVIDER=openai-compatible`, `AI_BASE_URL=http://localhost:11434/v1`, `AI_MODEL=llama3.2`.
The key never leaves the server; the browser only talks to `/api/ai/ask`. Free tiers are rate-limited — the UI falls back to the offline answer if a request fails.

## Project layout

```
client/src/engine/     pure simulation core (parser, lock manager, WFG, detection, prevention,
                       Banker's, game, explanations, tutor, reports, samples) — no dependencies
client/src/components/ React UI (input panels, Cytoscape graph, lock table, timeline, tutor…)
client/src/pages/      Detection / Prevention / Banker's / Game / History / Theory /
                       Quiz / Guide / References / Innovation / Developed By pages
server/                Express API + node:sqlite persistence
tests/                 vitest unit tests (engine) and API tests (supertest)
docs/                  documentation, user manual, sample I/O, test cases, AI prompt log, screenshots
```

## Documentation

- [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) — theory, architecture, algorithms & complexity, limitations, references
- [docs/USER_MANUAL.md](docs/USER_MANUAL.md) — how to use every screen
- [docs/SAMPLE_IO.md](docs/SAMPLE_IO.md) — seven sample inputs with expected outputs
- [docs/TEST_CASES.md](docs/TEST_CASES.md) — test plan and automated test map
- [docs/AI_PROMPT_LOG.md](docs/AI_PROMPT_LOG.md) — prompts and AI usage log

## Rubric mapping

| Criterion | Where |
|---|---|
| Functionality (10) | 4 simulators, validated input DSL (READ/WRITE *and* explicit lock syntax), history, export/import, tutor |
| Visualization (5) | Animated Cytoscape wait-for graph with DFS replay, lock table with change flashes, per-transaction timeline, Banker's matrices, SVG analytics charts |
| UI/UX (5) | Three-pane dashboard, dark/light theme, keyboard stepping, responsive down to phone width, ARIA live regions, reduced-motion support |
| Documentation (5) | `docs/` folder + in-app **Guide** (usage + input glossary), **Theory** and **References** tabs |
| Innovation (5) | Scheduler **game** with exhaustive-search hints, offline tutor with "what-if" re-simulation plus an optional LLM tutor grounded in the same data, self-assessment quiz that links weak topics back to the simulator, speech output, analytics, shareable deep links |

## Credits

Developed by Parth (25BCE1443) and Vansh Sharma (25BCE1567) under the guidance of **Dr. Swaminathan A**, Assistant Professor (see the *Developed By* tab).

## Tech stack

React 18 + Vite · Cytoscape.js · Express 4 · Node `node:sqlite` · Vitest + Supertest. Plain JavaScript (ESM) with JSDoc.

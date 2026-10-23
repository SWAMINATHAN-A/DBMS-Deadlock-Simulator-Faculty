/**
 * ReferencesPage — sources used for the theory and the algorithms, with live links.
 * Links open in a new tab with rel="noreferrer" and are grouped by kind.
 */

const GROUPS = [
  {
    title: '📘 Textbooks',
    note: 'The algorithms in this app follow these standard treatments.',
    items: [
      {
        name: 'Silberschatz, Korth & Sudarshan — Database System Concepts, 7th ed.',
        detail: 'Chapter 18 (Concurrency Control): two-phase locking, deadlock handling, wait-die / wound-wait, wait-for graphs, victim selection. The primary reference for Detection and Prevention modes.',
        url: 'https://www.db-book.com/',
        linkText: 'db-book.com (official site, free slides & resources)',
      },
      {
        name: 'Silberschatz, Galvin & Gagne — Operating System Concepts, 10th ed.',
        detail: "Chapter 8 (Deadlocks): Coffman conditions, resource-allocation graphs and the Banker's algorithm. The 5×3 textbook example used in the Banker's samples comes from here.",
        url: 'https://www.os-book.com/',
        linkText: 'os-book.com (official site)',
      },
      {
        name: 'Elmasri & Navathe — Fundamentals of Database Systems, 7th ed.',
        detail: 'Chapter 21: locking protocols, deadlock prevention, detection and timeouts.',
        url: 'https://www.pearson.com/en-us/subject-catalog/p/fundamentals-of-database-systems/P200000003546',
        linkText: 'Publisher page',
      },
      {
        name: 'Garcia-Molina, Ullman & Widom — Database Systems: The Complete Book',
        detail: 'Concurrency control and locking, with a formal treatment of serialisability.',
        url: 'http://infolab.stanford.edu/~ullman/dscb.html',
        linkText: 'Stanford InfoLab page',
      },
    ],
  },
  {
    title: '📄 Research papers',
    note: 'The original sources of the ideas implemented here.',
    items: [
      {
        name: 'Coffman, Elphick & Shoshani — "System Deadlocks" (1971)',
        detail: 'ACM Computing Surveys 3(2), 67–78. The paper that states the four necessary conditions for deadlock used on the Theory tab.',
        url: 'https://dl.acm.org/doi/10.1145/356586.356588',
        linkText: 'ACM Digital Library',
      },
      {
        name: 'Rosenkrantz, Stearns & Lewis — "System Level Concurrency Control for Distributed Database Systems" (1978)',
        detail: 'ACM TODS 3(2), 178–198. Introduces the WAIT-DIE and WOUND-WAIT timestamp schemes implemented in Prevention mode.',
        url: 'https://dl.acm.org/doi/10.1145/320251.320260',
        linkText: 'ACM Digital Library',
      },
      {
        name: 'Eswaran, Gray, Lorie & Traiger — "The Notions of Consistency and Predicate Locks in a Database System" (1976)',
        detail: 'CACM 19(11). The foundation of two-phase locking.',
        url: 'https://dl.acm.org/doi/10.1145/360363.360369',
        linkText: 'ACM Digital Library',
      },
      {
        name: 'Dijkstra — "EWD623: The mathematics behind the Banker\'s Algorithm"',
        detail: "Dijkstra's own notes on the algorithm he invented; the E. W. Dijkstra Archive hosts the manuscripts free of charge.",
        url: 'https://www.cs.utexas.edu/~EWD/transcriptions/EWD06xx/EWD623.html',
        linkText: 'EWD Archive, UT Austin',
      },
    ],
  },
  {
    title: '🗄️ Official database documentation',
    note: 'How real systems behave — quoted on the Theory tab.',
    items: [
      {
        name: 'MySQL 8.0 — Deadlocks in InnoDB',
        detail: 'How InnoDB detects deadlocks, chooses the victim (fewest rows modified) and reports them via SHOW ENGINE INNODB STATUS.',
        url: 'https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks.html',
        linkText: 'dev.mysql.com',
      },
      {
        name: 'MySQL 8.0 — Deadlock detection and how to minimise deadlocks',
        detail: 'innodb_deadlock_detect, lock wait timeouts and practical advice on avoiding deadlocks.',
        url: 'https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlock-detection.html',
        linkText: 'dev.mysql.com',
      },
      {
        name: 'PostgreSQL — Explicit locking & deadlocks',
        detail: 'Lock modes, the deadlock_timeout parameter and error 40P01 (deadlock_detected).',
        url: 'https://www.postgresql.org/docs/current/explicit-locking.html',
        linkText: 'postgresql.org',
      },
      {
        name: 'Microsoft SQL Server — Deadlocks guide',
        detail: 'The lock monitor, DEADLOCK_PRIORITY, deadlock graphs and error 1205.',
        url: 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide',
        linkText: 'learn.microsoft.com',
      },
      {
        name: 'Oracle Database — ORA-00060 and deadlock detection',
        detail: 'Oracle detects deadlocks immediately and raises ORA-00060 in the statement that closed the cycle.',
        url: 'https://docs.oracle.com/en/database/oracle/oracle-database/19/errmg/ORA-00000.html',
        linkText: 'docs.oracle.com (error messages)',
      },
      {
        name: 'SQLite — Locking and transaction model',
        detail: 'A simpler file-level locking model, useful for contrast with row-level locking.',
        url: 'https://www.sqlite.org/lockingv3.html',
        linkText: 'sqlite.org',
      },
    ],
  },
  {
    title: '🎓 Free courses & lectures',
    note: 'For a deeper dive beyond this app.',
    items: [
      {
        name: 'CMU 15-445/645 — Database Systems (Andy Pavlo)',
        detail: 'Free lecture videos, slides and notes; the two-phase locking and concurrency control lectures map directly onto Detection and Prevention modes.',
        url: 'https://15445.courses.cs.cmu.edu/',
        linkText: 'CMU course site',
      },
      {
        name: 'NPTEL — Database Management System',
        detail: 'Full Indian university course with video lectures covering concurrency control and deadlock handling.',
        url: 'https://nptel.ac.in/courses/106104135',
        linkText: 'nptel.ac.in',
      },
      {
        name: 'MIT OpenCourseWare — 6.830 Database Systems',
        detail: 'Lecture notes and assignments on transactions, locking and recovery.',
        url: 'https://ocw.mit.edu/courses/6-830-database-systems-fall-2010/',
        linkText: 'ocw.mit.edu',
      },
    ],
  },
  {
    title: '🛠️ Tools & libraries used to build this app',
    note: 'Everything here is open source and free.',
    items: [
      { name: 'React', detail: 'UI library used for the dashboard and all pages.', url: 'https://react.dev/', linkText: 'react.dev' },
      { name: 'Vite', detail: 'Development server and production bundler for the client.', url: 'https://vite.dev/', linkText: 'vite.dev' },
      { name: 'Cytoscape.js', detail: 'Graph rendering library used for the animated wait-for graph.', url: 'https://js.cytoscape.org/', linkText: 'js.cytoscape.org' },
      { name: 'Express', detail: 'The REST API server (history, scores, analytics, quiz, AI proxy).', url: 'https://expressjs.com/', linkText: 'expressjs.com' },
      { name: 'Node.js node:sqlite', detail: "Node's built-in SQLite module — stores history, quiz and game scores with no native build step.", url: 'https://nodejs.org/api/sqlite.html', linkText: 'nodejs.org/api/sqlite' },
      { name: 'Vitest', detail: 'Test runner for the engine and API test suites.', url: 'https://vitest.dev/', linkText: 'vitest.dev' },
      { name: 'Web Speech API (MDN)', detail: 'Browser speech synthesis behind the 🔊 "Listen" buttons.', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API', linkText: 'developer.mozilla.org' },
    ],
  },
  {
    title: '✨ Optional AI tutor providers',
    note: 'Free-tier API keys that can power the ✨ AI tutor. None is required — the offline tutor always works.',
    items: [
      { name: 'Google AI Studio (Gemini)', detail: 'Free API key without a credit card; recommended default (gemini-2.5-flash).', url: 'https://aistudio.google.com/apikey', linkText: 'aistudio.google.com/apikey' },
      { name: 'Groq Cloud', detail: 'Free tier with very fast inference on open models such as Llama 3.3.', url: 'https://console.groq.com/keys', linkText: 'console.groq.com/keys' },
      { name: 'OpenRouter', detail: 'Aggregator with several models whose ids end in ":free".', url: 'https://openrouter.ai/keys', linkText: 'openrouter.ai/keys' },
      { name: 'Ollama', detail: 'Run a model locally — no key and no internet needed; set AI_PROVIDER=openai-compatible.', url: 'https://ollama.com/', linkText: 'ollama.com' },
    ],
  },
];

export default function ReferencesPage() {
  return (
    <main className="page" aria-labelledby="tab-references" style={{ maxWidth: 960 }}>
      <section style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40 }} aria-hidden="true">🔗</div>
        <h1 id="references-heading" style={{ margin: '4px 0 6px', fontSize: 28 }}>References</h1>
        <p style={{ margin: '0 auto', maxWidth: 680, color: 'var(--fg-muted)' }}>
          Sources for the theory, the algorithms and the real-world behaviour described in this app.
          Every link opens in a new tab.
        </p>
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 19, margin: '0 0 4px', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>{g.title}</h2>
          <p className="help" style={{ margin: '0 0 10px' }}>{g.note}</p>
          <ul className="reflist">
            {g.items.map((it) => (
              <li key={it.name}>
                <div className="refname">{it.name}</div>
                <p>{it.detail}</p>
                <a href={it.url} target="_blank" rel="noreferrer noopener">{it.linkText} ↗</a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section>
        <h2 style={{ fontSize: 19, margin: '0 0 8px', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>How to cite this project</h2>
        <pre style={{ background: 'var(--bg-sunken)', padding: 12, borderRadius: 'var(--radius-sm)', overflow: 'auto', fontSize: 13, fontFamily: 'var(--mono)' }}>
{`Parth (25BCE1443) and Vansh Sharma (25BCE1567),
"Deadlock Game: an interactive simulator for deadlock detection,
prevention and avoidance in DBMS", Database Management Systems
course project, guided by Dr. Swaminathan A, Assistant Professor, 2026.`}
        </pre>
      </section>
    </main>
  );
}

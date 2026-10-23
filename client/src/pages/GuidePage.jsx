/**
 * GuidePage — how to use the app and what every term in the input means.
 * Written for a student opening the site for the first time.
 */

const SECTIONS = [
  ['start', '1. Quick start'],
  ['layout', '2. The three panes'],
  ['syntax', '3. Input syntax (schedules)'],
  ['terms', '4. Glossary of terms used in the input'],
  ['reading', '5. Reading the visualization'],
  ['bankers', "6. Banker's input"],
  ['tabs', '7. What each tab does'],
  ['keys', '8. Keyboard & accessibility'],
  ['faq', '9. Troubleshooting'],
];

function Term({ term, children }) {
  return (
    <tr>
      <td className="mono" style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{term}</td>
      <td>{children}</td>
    </tr>
  );
}

export default function GuidePage({ onTab }) {
  return (
    <main className="page prose" aria-labelledby="tab-guide">
      <h1>How to use Deadlock Game</h1>
      <p style={{ color: 'var(--fg-muted)' }}>
        A five-minute tour of the app, the input language and every term you will meet.
        New here? Follow section 1, then press <strong>▶ Run simulation</strong>.
      </p>
      <nav className="toc" aria-label="Contents">{SECTIONS.map(([id, t]) => <a key={id} className="chip chip-btn" href={`#${id}`}>{t}</a>)}</nav>

      <h2 id="start">1. Quick start</h2>
      <ol>
        <li>Open the <strong>Detection</strong> tab (it is the default).</li>
        <li>In the left pane choose <em>“1. Classic two-transaction deadlock”</em> from <strong>Load a sample</strong>. The schedule appears in the editor and runs immediately.</li>
        <li>Press <span className="kbd">→</span> repeatedly (or ▶ in the player bar) to walk through the simulation one step at a time.</li>
        <li>Read the right-hand pane: each step has a title, an explanation and a “why it matters” note.</li>
        <li>At the deadlock step, watch the graph: the depth-first search lights up the nodes it visits and the cycle flashes red.</li>
        <li>Ask the tutor a question, e.g. <em>“why was T2 aborted?”</em></li>
      </ol>
      <div className="callout">Nothing you do can break anything — press <strong>Reset</strong> at any time, or reload the page.</div>

      <h2 id="layout">2. The three panes</h2>
      <table className="data">
        <thead><tr><th>Pane</th><th>What it is for</th></tr></thead>
        <tbody>
          <tr><td><strong>Left — Input</strong></td><td>Pick a sample or type your own schedule, choose the strategy options, then press Run. Validation errors appear here with line numbers.</td></tr>
          <tr><td><strong>Centre — Visualization</strong></td><td>Summary chips, the wait-for graph, the lock table and the timeline, plus the step player (first / previous / play / next / last, a scrubber and a speed slider).</td></tr>
          <tr><td><strong>Right — Explanation</strong></td><td>The current step explained in words, the full step log (click any entry to jump), and the Tutor chat.</td></tr>
        </tbody>
      </table>
      <p>On a narrow screen the three panes stack vertically in the same order.</p>

      <h2 id="syntax">3. Input syntax (schedules)</h2>
      <p>A <strong>schedule</strong> is the interleaved list of operations of several transactions — one operation per line, executed from top to bottom. Two styles are accepted and can be mixed:</p>

      <h3>Read / write style (recommended)</h3>
      <p>Say what the transaction <em>does</em> and the right lock is taken for you:</p>
      <pre>{`T1: READ A        → shared (S) lock on A     — many transactions may read A at once
T2: WRITE B       → exclusive (X) lock on B  — only one transaction may write B
T1: COMMIT        # T1 finishes and releases every lock it holds
T2: ABORT         # T2 gives up and releases every lock it holds`}</pre>
      <p><code>SELECT</code> is accepted as a synonym for <code>READ</code>, and <code>UPDATE</code>, <code>INSERT</code> and <code>DELETE</code> for <code>WRITE</code>.</p>

      <h3>Explicit lock style</h3>
      <p>If you prefer to name the locks yourself, or to release one before commit:</p>
      <pre>{`T1: LOCK-X(A)     # exclusive lock on A — same as WRITE A
T2: LOCK-S(B)     # shared lock on B    — same as READ B
T1: UNLOCK(A)     # release A early
T1: COMMIT        # releases anything still held`}</pre>
      <p>Short forms work too: <code>T1: X(A)</code>, <code>T1: S(B)</code>, <code>T1: U(A)</code>. The two styles can be mixed in one schedule.</p>

      <h3>Rules the validator checks</h3>
      <ul>
        <li>Every line must be <code>Tn: operation</code>. Transaction names are <code>T1</code>, <code>T2</code>, … and item names are letters/digits such as <code>A</code>, <code>B</code>, <code>ACC1</code>.</li>
        <li>Reading an item and then writing it (<code>READ A</code> then <code>WRITE A</code>) is a <em>lock upgrade</em> — a common source of deadlock, and exactly what the “Lock-upgrade deadlock” sample demonstrates.</li>
        <li>You cannot <code>UNLOCK</code> an item the transaction never locked.</li>
        <li>No operations are allowed after a transaction’s <code>COMMIT</code> or <code>ABORT</code>.</li>
        <li>Re-requesting a lock you already hold in the same or a weaker mode is flagged as redundant.</li>
        <li>At most 12 transactions and 12 items, so the graph stays readable.</li>
        <li><code>#</code> or <code>--</code> starts a comment; blank lines are ignored.</li>
      </ul>
      <div className="callout"><strong>Tip:</strong> the green “Schedule is valid” line must appear before <strong>▶ Run simulation</strong> is enabled.</div>

      <h2 id="terms">4. Glossary of terms used in the input</h2>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th style={{ width: 170 }}>Term</th><th>Meaning</th></tr></thead>
          <tbody>
            <Term term="Transaction (T1, T2…)">A sequence of database operations that must happen as one unit. Each transaction is a node in the wait-for graph.</Term>
            <Term term="Data item (A, B…)">A lockable unit of data — think of it as a row or a record. Any name you like; it is created automatically the first time it is locked.</Term>
            <Term term="LOCK-S(A) / S(A)">Request a <strong>shared</strong> lock on A — permission to <em>read</em>. Several transactions may hold S on the same item at once.</Term>
            <Term term="LOCK-X(A) / X(A)">Request an <strong>exclusive</strong> lock on A — permission to <em>write</em>. Only one transaction may hold it, and it conflicts with every other lock.</Term>
            <Term term="UNLOCK(A) / U(A)">Release the lock the transaction holds on A. Any transaction waiting for A may now be granted it (FIFO order).</Term>
            <Term term="COMMIT">The transaction finishes successfully and releases <em>all</em> its locks at once (strict two-phase locking).</Term>
            <Term term="ABORT">The transaction gives up voluntarily, undoing its work and releasing all its locks.</Term>
            <Term term="READ A">Read item A — the simulator takes a <strong>shared (S)</strong> lock on A. <code>SELECT A</code> means the same thing.</Term>
            <Term term="WRITE A">Write item A — the simulator takes an <strong>exclusive (X)</strong> lock on A. <code>UPDATE A</code>, <code>INSERT A</code> and <code>DELETE A</code> mean the same thing.</Term>
            <Term term="Lock upgrade">Asking for X on an item you already hold in S mode. It is granted only when nobody else holds the item — a classic source of deadlock.</Term>
            <Term term="Wait queue">Transactions that asked for an item held in a conflicting mode. They are served in arrival order once the item is free.</Term>
            <Term term="Victim selection policy">Which transaction gets rolled back when a deadlock is found: <em>youngest</em> (least work lost), <em>oldest</em>, <em>fewest locks held</em>, or the one that <em>closed the cycle</em>.</Term>
            <Term term="Prevention scheme">How conflicts are resolved so a deadlock can never form: <em>wait-die</em> (a younger requester aborts) or <em>wound-wait</em> (an older requester aborts the younger holder).</Term>
            <Term term="Timestamp (TS)">A transaction’s age, assigned in order of first appearance in the schedule. Smaller = older. Shown on the status chips in Prevention mode.</Term>
          </tbody>
        </table>
      </div>

      <h2 id="reading">5. Reading the visualization</h2>
      <h3>Wait-for graph</h3>
      <ul>
        <li>A node is a transaction. An arrow <code>T1 → T2</code> labelled <code>B</code> means “T1 is waiting for item B, which T2 holds”.</li>
        <li>Node shape and colour show the state — <span className="chip chip-active">blue circle = active</span> <span className="chip chip-blocked">amber square = blocked</span> <span className="chip chip-aborted">red diamond = aborted</span> <span className="chip chip-committed">green hexagon = committed</span>.</li>
        <li>During a cycle check the search animates: a purple border is the node being visited, a dark border means it is finished, and red marks the cycle.</li>
        <li><strong>PNG</strong> (top-right of the graph) downloads the picture for your report.</li>
      </ul>
      <h3>Lock table</h3>
      <p>One row per data item: who holds it and in which mode, and who is queued behind it. Rows touched by the current step flash.</p>
      <h3>Timeline</h3>
      <p>One row per transaction, one cell per step: <code>XA</code> = took X on A, ⏳ = started waiting, ✗ = aborted, <code>C</code> = committed, ↻ = restarted. Click any cell to jump to that step.</p>
      <h3>Summary chips</h3>
      <p>Deadlocks found, rollbacks, number of steps, how long the simulation took, and the live status (and timestamp) of each transaction.</p>

      <h2 id="bankers">6. Banker's input</h2>
      <p>The Banker's tab takes numbers instead of a schedule. Values are separated by spaces or commas; one <strong>row per process</strong>:</p>
      <pre>{`Available  : 3 3 2          ← free units of each resource type (R0 R1 R2)
Max        : 7 5 3          ← row 0 = P0's maximum demand
             3 2 2          ← row 1 = P1 …
             9 0 2
Allocation : 0 1 0          ← what each process already holds
             2 0 0
             3 0 2
Request    : P1 → 1 0 2     ← optional: ask for more resources`}</pre>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th style={{ width: 150 }}>Term</th><th>Meaning</th></tr></thead>
          <tbody>
            <Term term="Process (P0, P1…)">The Banker's equivalent of a transaction — one row of the matrices.</Term>
            <Term term="Resource type (R0…)">A kind of resource with several interchangeable units (e.g. 3 printers), one column of the matrices.</Term>
            <Term term="Available">How many units of each type are currently free.</Term>
            <Term term="Max">The maximum each process may ever demand — must be declared in advance.</Term>
            <Term term="Allocation">How many units each process currently holds.</Term>
            <Term term="Need">Computed for you as <code>Max − Allocation</code>: what the process may still request.</Term>
            <Term term="Work / Finish">The working vectors of the safety algorithm: free units available to the simulation so far, and which processes could finish.</Term>
            <Term term="Safe sequence">An order in which every process can obtain its full Need and finish. If one exists, the state is <strong>safe</strong>.</Term>
            <Term term="Request">An optional extra demand from one process; the app checks it against Need, then Available, then re-runs the safety algorithm.</Term>
          </tbody>
        </table>
      </div>

      <h2 id="tabs">7. What each tab does</h2>
      <table className="data">
        <thead><tr><th>Tab</th><th>Use it to…</th></tr></thead>
        <tbody>
          <tr><td>🔍 <strong>Detection</strong></td><td>Let a deadlock happen, watch the wait-for graph and the cycle search, then see a victim rolled back. <button className="btn btn-sm" onClick={() => onTab('detection')}>Open</button></td></tr>
          <tr><td>🛡️ <strong>Prevention</strong></td><td>Run the same schedule under wait-die or wound-wait and compare who gets aborted. <button className="btn btn-sm" onClick={() => onTab('prevention')}>Open</button></td></tr>
          <tr><td>🏦 <strong>Banker's</strong></td><td>Check whether a resource state is safe and whether a request can be granted. <button className="btn btn-sm" onClick={() => onTab('bankers')}>Open</button></td></tr>
          <tr><td>🎮 <strong>Game</strong></td><td>Be the scheduler: choose which transaction runs next and avoid creating a cycle. <button className="btn btn-sm" onClick={() => onTab('game')}>Open</button></td></tr>
          <tr><td>🕘 <strong>History</strong></td><td>Reopen saved runs, download reports, and see analytics of everything you have run. <button className="btn btn-sm" onClick={() => onTab('history')}>Open</button></td></tr>
          <tr><td>📚 <strong>Theory</strong></td><td>Read the background: Coffman conditions, algorithms, complexity, real DBMS behaviour. <button className="btn btn-sm" onClick={() => onTab('theory')}>Open</button></td></tr>
          <tr><td>📝 <strong>Quiz</strong></td><td>Test yourself with MCQs; each answer is explained and weak topics link back to the right tab. <button className="btn btn-sm" onClick={() => onTab('quiz')}>Open</button></td></tr>
          <tr><td>🔗 <strong>References</strong></td><td>Textbooks, papers and official documentation behind the content. <button className="btn btn-sm" onClick={() => onTab('references')}>Open</button></td></tr>
        </tbody>
      </table>

      <h3>Saving and sharing a run</h3>
      <ul>
        <li><strong>💾 Save to history</strong> — stores the run in the database so you can reopen it later.</li>
        <li><strong>⬇ Report (.md)</strong> — a Markdown report of every step, ready to paste into your write-up.</li>
        <li><strong>⬇ JSON</strong> — the full run; <strong>Import JSON</strong> in the input pane loads it back.</li>
        <li><strong>🔗 Share</strong> — copies a link that reopens the same run at the same step.</li>
      </ul>

      <h3>The Tutor (right pane)</h3>
      <p>
        Click a suggested question or type your own. The <strong>📴 Offline tutor</strong> answers from the simulation data
        and always works. The <strong>✨ AI tutor</strong> (if a free API key has been configured on the server) explains the
        same run in its own words. Answers that mention a step include a “Jump to step” link, and 🔊 reads them aloud.
      </p>

      <h2 id="keys">8. Keyboard & accessibility</h2>
      <table className="data">
        <thead><tr><th>Key</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td><span className="kbd">→</span> / <span className="kbd">←</span></td><td>Next / previous step</td></tr>
          <tr><td><span className="kbd">Space</span></td><td>Play / pause the animation</td></tr>
          <tr><td><span className="kbd">Home</span> / <span className="kbd">End</span></td><td>Jump to the first / last step</td></tr>
          <tr><td><span className="kbd">Tab</span> / <span className="kbd">Enter</span></td><td>Move between controls and activate them</td></tr>
        </tbody>
      </table>
      <p>
        The explanation panel is announced to screen readers as it changes, transaction states use shape as well as colour,
        the 🌙/☀️ button switches dark and light mode, and animations are disabled automatically if your system asks for reduced motion.
      </p>

      <h2 id="faq">9. Troubleshooting</h2>
      <table className="data">
        <thead><tr><th>Problem</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td>“Run simulation” is greyed out</td><td>The schedule has validation errors — fix the lines listed under the editor until the green “Schedule is valid” message appears.</td></tr>
          <tr><td>“Cannot reach the server”</td><td>The API is not running. Start both parts with <code>npm run dev</code> in the project folder.</td></tr>
          <tr><td>Nothing happens when I press →</td><td>Click once inside the page first (outside the text editor), or use the ◀ ▶ buttons in the player bar.</td></tr>
          <tr><td>The ✨ AI tutor says “setup needed”</td><td>That is optional. Add a free API key to <code>server/.env</code> (see the README) — the offline tutor works regardless.</td></tr>
          <tr><td>My schedule never deadlocks</td><td>A deadlock needs each transaction to hold one item and request another one in the opposite order. Try sample 1 and change it from there.</td></tr>
          <tr><td>The graph looks empty</td><td>No transaction is waiting at this step — that is normal. Step forward to a BLOCK/WAIT step to see edges.</td></tr>
        </tbody>
      </table>
    </main>
  );
}

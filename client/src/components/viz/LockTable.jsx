import { useState } from 'react';

/** Resources whose holders or wait queue differ between two lock-table snapshots. */
function diffRows(now = {}, was = {}) {
  const diff = new Set();
  for (const r of new Set([...Object.keys(now), ...Object.keys(was)])) {
    if (JSON.stringify(now[r] ?? null) !== JSON.stringify(was[r] ?? null)) diff.add(r);
  }
  return diff;
}

/** Resource × holders/wait-queue table. Rows that changed since the previous step flash. */
export default function LockTable({ step, resources = [] }) {
  // "Adjust state when a prop changes": recompute the flash set during render so the
  // highlight lands on the same paint as the new values (no ref, no extra effect).
  const [prevStep, setPrevStep] = useState(step);
  const [changed, setChanged] = useState(() => new Set());
  if (prevStep !== step) {
    setPrevStep(step);
    setChanged(diffRows(step?.lockTable, prevStep?.lockTable));
  }

  const table = step?.lockTable || {};
  const rows = [...new Set([...resources, ...Object.keys(table)])];
  const focusRes = step?.op?.res;

  if (!rows.length) return <p className="empty">Lock table is empty.</p>;

  return (
    <div className="table-wrap">
      <table className="data" aria-label="Lock table">
        <thead>
          <tr><th>Resource</th><th>Held by (mode)</th><th>Wait queue</th></tr>
        </thead>
        <tbody>
          {rows.map((res) => {
            const e = table[res] || { holders: [], queue: [] };
            const cls = [focusRes === res ? 'highlight' : '', changed.has(res) ? 'flash' : ''].join(' ');
            return (
              <tr key={res} className={cls}>
                <td className="mono"><strong>{res}</strong></td>
                <td>{e.holders.length ? e.holders.map((h) => <span key={h.txn} className={`chip chip-${h.mode === 'X' ? 'active' : 'committed'}`} style={{ marginRight: 4 }}>{h.txn} · {h.mode}</span>) : <span style={{ color: 'var(--fg-muted)' }}>free</span>}</td>
                <td>{e.queue.length ? e.queue.map((q, i) => <span key={q.txn + i} className="chip chip-blocked" style={{ marginRight: 4 }}>{q.txn} wants {q.mode}</span>) : <span style={{ color: 'var(--fg-muted)' }}>—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * prevention.js — run a schedule under a timestamp-based deadlock PREVENTION
 * scheme. Deadlock can never occur because waits are only allowed in one
 * direction of the timestamp order.
 *
 *   wait-die   : Ti requests a lock held by Tj.
 *                TS(Ti) < TS(Tj) (Ti older)   → Ti waits
 *                TS(Ti) > TS(Tj) (Ti younger) → Ti dies (aborts, restarts with same TS)
 *   wound-wait : TS(Ti) < TS(Tj) (Ti older)   → Ti wounds Tj (Tj aborts), Ti gets the lock
 *                TS(Ti) > TS(Tj) (Ti younger) → Ti waits
 */
import { Scheduler, MAX_STEPS } from './scheduler.js';

/**
 * @param {import('./parser.js').Op[]} ops
 * @param {string[]} txns
 * @param {{scheme?: 'wait-die'|'wound-wait'}} [options]
 */
export function simulatePrevention(ops, txns, options = {}) {
  const scheme = options.scheme === 'wound-wait' ? 'wound-wait' : 'wait-die';
  const s = new Scheduler(ops, txns);
  let guard = 0;

  while (s.steps.length < MAX_STEPS && guard++ < MAX_STEPS * 2) {
    const op = s.nextOp();
    if (!op) break;

    if (op.type === 'UNLOCK') { s.executeUnlock(op); continue; }
    if (op.type === 'COMMIT' || op.type === 'ABORT') { s.executeCommit(op); continue; }

    const tsReq = s.timestamp.get(op.txn);
    const conflicts = s.lm.conflicts(op.txn, op.res, op.mode);

    if (conflicts.length === 0) {
      const r = s.lm.request(op.txn, op.res, op.mode);
      s.done.get(op.txn).push(op);
      s.record('GRANT', op, { meta: { upgrade: r.upgrade, redundant: r.redundant, holds: s.lm.holdsOf(op.txn).map((h) => `${h.mode}(${h.res})`) } });
      continue;
    }

    // Conflict — decide per scheme. Compare against the oldest / youngest conflicting holder as needed.
    const holders = conflicts.map((c) => c.txn);
    const olderHolders = holders.filter((h) => s.timestamp.get(h) < tsReq);
    const youngerHolders = holders.filter((h) => s.timestamp.get(h) > tsReq);

    if (scheme === 'wait-die') {
      if (olderHolders.length === 0) {
        // requester is older than every holder → wait
        const holder = youngerHolders.reduce((a, b) => (s.timestamp.get(a) < s.timestamp.get(b) ? a : b));
        s.lm.request(op.txn, op.res, op.mode);
        s.blockedOp.set(op.txn, op);
        const dfs = s.runCycleCheck();
        s.record('WAIT', op, { dfs, meta: { scheme, holder, tsReq, tsHolder: s.timestamp.get(holder), rule: 'an older transaction may wait for a younger one' } });
      } else {
        // requester is younger than some holder → die
        const holder = olderHolders.reduce((a, b) => (s.timestamp.get(a) < s.timestamp.get(b) ? a : b));
        const { released, grants, restartOps } = s.rollback(op.txn, op);
        s.record('DIE', op, { granted: grants, meta: { scheme, holder, tsReq, tsHolder: s.timestamp.get(holder), released } });
        if (s.restarts.get(op.txn) <= 5) s.scheduleRestart(op.txn, restartOps);
      }
    } else {
      // wound-wait
      if (youngerHolders.length > 0) {
        // wound every younger conflicting holder, then take the lock
        let allGrants = [];
        for (const v of youngerHolders) {
          const { grants, restartOps } = s.rollback(v);
          allGrants = allGrants.concat(grants);
          if (s.restarts.get(v) <= 5) s.scheduleRestart(v, restartOps);
        }
        const victim = youngerHolders.join(', ');
        const stillConflicting = s.lm.conflicts(op.txn, op.res, op.mode);
        if (stillConflicting.length === 0) {
          const r = s.lm.request(op.txn, op.res, op.mode);
          s.done.get(op.txn).push(op);
          s.record('WOUND', op, { granted: [...allGrants, { txn: op.txn, res: op.res, mode: op.mode }], meta: { scheme, victim, tsReq, tsHolder: s.timestamp.get(youngerHolders[0]), upgrade: r.upgrade } });
        } else {
          // an older holder remains → wound the young ones, then wait for the old one
          s.lm.request(op.txn, op.res, op.mode);
          s.blockedOp.set(op.txn, op);
          const holder = stillConflicting[0].txn;
          s.record('WOUND', op, { granted: allGrants, meta: { scheme, victim, tsReq, tsHolder: s.timestamp.get(youngerHolders[0]) } });
          const dfs = s.runCycleCheck();
          s.record('WAIT', op, { dfs, meta: { scheme, holder, tsReq, tsHolder: s.timestamp.get(holder), rule: 'a younger transaction waits for an older one' } });
        }
      } else {
        const holder = olderHolders.reduce((a, b) => (s.timestamp.get(a) < s.timestamp.get(b) ? a : b));
        s.lm.request(op.txn, op.res, op.mode);
        s.blockedOp.set(op.txn, op);
        const dfs = s.runCycleCheck();
        s.record('WAIT', op, { dfs, meta: { scheme, holder, tsReq, tsHolder: s.timestamp.get(holder), rule: 'a younger transaction waits for an older one' } });
      }
    }
  }
  s.finish();
  return { mode: 'prevention', options: { scheme }, steps: s.steps, summary: s.summary(), txns };
}

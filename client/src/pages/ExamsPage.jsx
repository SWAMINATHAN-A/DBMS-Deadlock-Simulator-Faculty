import { useMemo, useState } from 'react';
import { EXAM_QUESTIONS, EXAM_TOPICS, EXAMS, EXAM_YEARS } from '../engine/examQuestions.js';
import { shuffle } from '../engine/quiz.js';
import { api, downloadText } from '../api/client.js';

const LETTER = ['A', 'B', 'C', 'D'];
const DIFFS = ['easy', 'medium', 'hard'];

/** True when a typed numerical answer matches (integers compared exactly). */
const numericalCorrect = (typed, expected) => {
  const v = Number(String(typed).trim());
  return Number.isFinite(v) && Math.abs(v - expected) < 1e-9;
};

const matches = (q, f) =>
  (f.exam === 'all' || q.exam === f.exam) &&
  (f.year === 'all' || q.year === Number(f.year)) &&
  (f.topic === 'all' || q.topic === f.topic) &&
  (f.type === 'all' || q.type === f.type) &&
  (f.difficulty === 'all' || q.difficulty === f.difficulty);

function Tag({ q }) {
  return (
    <span className="exam-tag" title={`${q.exam} ${q.year} — ${EXAM_TOPICS[q.topic]}`}>
      <strong>{q.exam}</strong>&nbsp;{q.year}
      <span className={`badge badge-${q.difficulty}`} style={{ marginLeft: 6 }}>{q.difficulty}</span>
      <span className="chip" style={{ marginLeft: 6 }}>{q.type === 'numerical' ? 'NAT' : 'MCQ'}</span>
    </span>
  );
}

/** One question rendered with its options / numeric box and (optionally) the worked solution. */
function Question({ q, n, response, onRespond, revealed, onReveal }) {
  const correct = q.type === 'mcq' ? response === q.answer : numericalCorrect(response, q.answer);
  return (
    <div className="card exam-q">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 15, flex: 1 }}>{n != null && `${n}. `}{q.q}</h3>
        <Tag q={q} />
      </div>

      {q.type === 'mcq' ? (
        <div className="quiz-options" role="radiogroup" aria-label="Answer options">
          {q.options.map((o, i) => {
            const chosen = response === i;
            const state = revealed ? (i === q.answer ? 'right' : chosen ? 'wrong' : '') : chosen ? 'chosen' : '';
            return (
              <button key={i} type="button" role="radio" aria-checked={chosen} className={`quiz-option ${state}`}
                onClick={() => !revealed && onRespond(i)} disabled={revealed}>
                <span className="letter">{LETTER[i]}</span>
                <span>{o}</span>
                {revealed && i === q.answer && <span className="mark">✓</span>}
                {revealed && chosen && i !== q.answer && <span className="mark">✗</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="nat-answer">
          <label className="field" style={{ maxWidth: 260 }}>
            <span>Your answer {q.unit ? <small style={{ fontWeight: 400 }}>({q.unit})</small> : null}</span>
            <input type="number" inputMode="numeric" value={response ?? ''} disabled={revealed}
              onChange={(e) => onRespond(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !revealed) onReveal(); }}
              placeholder="type a number" aria-label="Numerical answer" />
          </label>
          {revealed && (
            <p className={`msg ${correct ? 'msg-ok' : 'msg-error'}`} style={{ display: 'block', marginTop: 8 }}>
              {correct ? '✓ Correct.' : `✗ Correct answer: ${q.answer}${q.unit ? ' ' + q.unit : ''}`}
              {!correct && response !== undefined && response !== '' && ` (you entered ${response})`}
            </p>
          )}
        </div>
      )}

      {revealed && (
        <div className="why" style={{ marginTop: 10 }}>
          <strong>Solution:</strong> {q.solution}
        </div>
      )}
      {!revealed && onReveal && (
        <div><button className="btn btn-sm" onClick={onReveal} disabled={response === undefined || response === ''}>Check answer</button></div>
      )}
    </div>
  );
}

export default function ExamsPage({ toast }) {
  const [filters, setFilters] = useState({ exam: 'all', year: 'all', topic: 'all', type: 'all', difficulty: 'all' });
  const [mode, setMode] = useState('browse'); // 'browse' | 'practice'
  const [responses, setResponses] = useState({});
  const [revealed, setRevealed] = useState({});
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState(null);

  const pool = useMemo(() => EXAM_QUESTIONS.filter((q) => matches(q, filters)), [filters]);
  const list = useMemo(() => (order ? order.map((id) => pool.find((q) => q.id === id)).filter(Boolean) : pool), [order, pool]);

  const set = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setIndex(0); setOrder(null); };
  const respond = (id, v) => setResponses((r) => ({ ...r, [id]: v }));
  const reveal = (id) => setRevealed((r) => ({ ...r, [id]: true }));

  const answered = list.filter((q) => revealed[q.id]);
  const correctCount = answered.filter((q) => (q.type === 'mcq' ? responses[q.id] === q.answer : numericalCorrect(responses[q.id], q.answer))).length;

  const startPractice = () => {
    setOrder(shuffle(pool.map((q) => q.id), Date.now() % 100000));
    setResponses({}); setRevealed({}); setIndex(0); setMode('practice');
  };

  const finish = () => {
    if (!answered.length) { setMode('browse'); return; }
    const pct = Math.round((correctCount / answered.length) * 100);
    api.quiz.save({ topic: 'exam', difficulty: filters.difficulty, total: answered.length, correct: correctCount, percent: pct })
      .then(() => toast?.(`Exam practice: ${correctCount}/${answered.length} (${pct}%) saved`)).catch(() => {});
    setMode('browse');
  };

  const exportSet = () => {
    const md = [`# Deadlock — competitive exam practice set`, '',
      `Filter: ${Object.entries(filters).filter(([, v]) => v !== 'all').map(([k, v]) => `${k}=${v}`).join(', ') || 'all questions'}  ·  ${list.length} questions`,
      '', '> Questions are modelled on the recurring patterns of the named exams; they are not verbatim reproductions of official papers.', '']
      .concat(list.flatMap((q, i) => {
        const head = `## ${i + 1}. [${q.exam} ${q.year} · ${q.type === 'numerical' ? 'NAT' : 'MCQ'} · ${q.difficulty}] ${q.q}`;
        const body = q.type === 'mcq'
          ? q.options.map((o, j) => `${j === q.answer ? '**✓**' : '  -'} ${LETTER[j]}. ${o}`)
          : [`**Answer:** ${q.answer}${q.unit ? ' ' + q.unit : ''}`];
        return [head, '', ...body, '', `> **Solution.** ${q.solution}`, ''];
      })).join('\n');
    downloadText(`deadlock-exam-practice-${list.length}q.md`, md, 'text/markdown');
    toast?.(`${list.length} questions downloaded`);
  };

  const current = list[index];

  return (
    <main className="page" aria-labelledby="tab-exams" style={{ maxWidth: 1000 }}>
      <section style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 40 }} aria-hidden="true">🎓</div>
        <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>Competitive exam practice</h1>
        <p style={{ margin: '0 auto', maxWidth: 740, color: 'var(--fg-muted)' }}>
          {EXAM_QUESTIONS.length} questions on deadlocks — {EXAM_QUESTIONS.filter((q) => q.type === 'mcq').length} MCQs and{' '}
          {EXAM_QUESTIONS.filter((q) => q.type === 'numerical').length} numericals (NAT) — in the style of GATE CS/IT, UGC-NET, ISRO and NIELIT,
          each tagged with the exam and year, and every one worked through in the solution.
        </p>
      </section>

      <div className="callout" style={{ marginBottom: 16 }}>
        <strong>About these questions.</strong> They are <em>modelled on the recurring question patterns</em> of the exams named on each
        card — the formulas, traps and phrasing those papers reuse year after year. They are not verbatim copies of official papers, so
        check the official PDF before quoting any item as a past-paper question.
      </div>

      <div className="exam-filters">
        <label className="field"><span>Exam</span>
          <select value={filters.exam} onChange={(e) => set('exam', e.target.value)}>
            <option value="all">All exams ({EXAM_QUESTIONS.length})</option>
            {EXAMS.map((x) => <option key={x} value={x}>{x} ({EXAM_QUESTIONS.filter((q) => q.exam === x).length})</option>)}
          </select>
        </label>
        <label className="field"><span>Year</span>
          <select value={filters.year} onChange={(e) => set('year', e.target.value)}>
            <option value="all">Any year</option>
            {EXAM_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="field"><span>Topic</span>
          <select value={filters.topic} onChange={(e) => set('topic', e.target.value)}>
            <option value="all">All topics</option>
            {Object.entries(EXAM_TOPICS).map(([k, v]) => <option key={k} value={k}>{v} ({EXAM_QUESTIONS.filter((q) => q.topic === k).length})</option>)}
          </select>
        </label>
        <label className="field"><span>Type</span>
          <select value={filters.type} onChange={(e) => set('type', e.target.value)}>
            <option value="all">MCQ + numerical</option>
            <option value="mcq">MCQ only</option>
            <option value="numerical">Numerical (NAT) only</option>
          </select>
        </label>
        <label className="field"><span>Difficulty</span>
          <select value={filters.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            <option value="all">Any</option>
            {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', margin: '12px 0 16px', flexWrap: 'wrap', gap: 10 }}>
        <strong>{list.length} question{list.length === 1 ? '' : 's'} match</strong>
        <div className="btn-group">
          {mode === 'browse'
            ? <button className="btn btn-primary" onClick={startPractice} disabled={!pool.length}>▶ Practice these ({pool.length})</button>
            : <button className="btn" onClick={finish}>Finish & save score</button>}
          <button className="btn btn-sm" onClick={exportSet} disabled={!list.length}>⬇ Download set (.md)</button>
          {answered.length > 0 && <span className="chip chip-active">score {correctCount}/{answered.length}</span>}
        </div>
      </div>

      {list.length === 0 && <p className="empty">No question matches this combination — widen a filter.</p>}

      {mode === 'practice' && current ? (
        <>
          <div className="quiz-head">
            <strong>Question {index + 1} of {list.length}</strong>
            <span className="chip">{EXAM_TOPICS[current.topic]}</span>
          </div>
          <div className="quiz-progress"><div style={{ width: `${((index + 1) / list.length) * 100}%` }} /></div>
          <div style={{ marginTop: 12 }}>
            <Question q={current} response={responses[current.id]} onRespond={(v) => respond(current.id, v)}
              revealed={!!revealed[current.id]} onReveal={() => reveal(current.id)} />
          </div>
          <div className="btn-group" style={{ marginTop: 12, justifyContent: 'space-between' }}>
            <button className="btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>← Previous</button>
            {!revealed[current.id] && <button className="btn" onClick={() => reveal(current.id)}>Show solution</button>}
            <button className="btn btn-primary" onClick={() => (index + 1 < list.length ? setIndex(index + 1) : finish())}>
              {index + 1 < list.length ? 'Next →' : 'Finish'}
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((q, i) => (
            <Question key={q.id} q={q} n={i + 1} response={responses[q.id]} onRespond={(v) => respond(q.id, v)}
              revealed={!!revealed[q.id]} onReveal={() => reveal(q.id)} />
          ))}
        </div>
      )}
    </main>
  );
}

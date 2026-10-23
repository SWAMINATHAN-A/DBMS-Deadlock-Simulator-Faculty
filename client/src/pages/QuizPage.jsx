import { useEffect, useMemo, useState } from 'react';
import { QUESTIONS, TOPICS, DIFFICULTIES, buildQuiz, countQuestions, scoreQuiz, REVISE_TAB } from '../engine/quiz.js';
import { api, downloadText } from '../api/client.js';

const LETTER = ['A', 'B', 'C', 'D'];

function Setup({ opts, setOpts, start, best }) {
  const available = countQuestions(opts.topic, opts.difficulty);
  return (
    <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: 20 }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>Start a quiz</h2>
      <p>Multiple-choice questions on locking, deadlocks, detection, prevention and avoidance. Every answer comes with an explanation, so the quiz teaches as you go.</p>
      <label className="field">
        <span>Topic</span>
        <select value={opts.topic} onChange={(e) => setOpts({ ...opts, topic: e.target.value })}>
          <option value="all">All topics ({QUESTIONS.length} questions)</option>
          {Object.entries(TOPICS).map(([k, label]) => <option key={k} value={k}>{label} ({countQuestions(k, 'all')})</option>)}
        </select>
      </label>
      <label className="field">
        <span>Difficulty</span>
        <select value={opts.difficulty} onChange={(e) => setOpts({ ...opts, difficulty: e.target.value })}>
          <option value="all">Any ({countQuestions(opts.topic, 'all')})</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d} ({countQuestions(opts.topic, d)})</option>)}
        </select>
      </label>
      <label className="field">
        <span>Number of questions <small style={{ fontWeight: 400 }}>{available} available</small></span>
        <select value={opts.count} onChange={(e) => setOpts({ ...opts, count: Number(e.target.value) })}>
          {[5, 10, 15, 20, 25, 30, 50].filter((n) => n < available).map((n) => <option key={n} value={n}>{n}</option>)}
          <option value={0}>All {available}</option>
        </select>
      </label>
      <label className="field">
        <span>Feedback</span>
        <select value={opts.instant ? 'instant' : 'end'} onChange={(e) => setOpts({ ...opts, instant: e.target.value === 'instant' })}>
          <option value="instant">Show the answer after each question (practice)</option>
          <option value="end">Only at the end (test)</option>
        </select>
      </label>
      {best != null && <p className="help">Your best score so far: <strong>{best}%</strong></p>}
      <button className="btn btn-primary" onClick={start} disabled={available === 0}>▶ Start quiz</button>
    </div>
  );
}

function Review({ questions, answers, score, onTab, restart }) {
  const weak = Object.entries(score.byTopic).filter(([, v]) => v.correct < v.total);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={`card banner-${score.grade.tone}`} style={{ textAlign: 'center', padding: 22 }}>
        <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{score.percent}%</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{score.grade.label} — {score.correct} / {score.total} correct</div>
        <p style={{ margin: '6px 0 0' }}>{score.grade.note}</p>
        <div className="btn-group" style={{ justifyContent: 'center', marginTop: 10 }}>
          <button className="btn btn-primary" onClick={restart}>↻ New quiz</button>
          <button className="btn" onClick={() => onTab('theory')}>📚 Open Theory</button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>Score by topic</h3>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Topic</th><th>Score</th><th>Revise</th></tr></thead>
            <tbody>
              {Object.entries(score.byTopic).map(([t, v]) => (
                <tr key={t}>
                  <td>{TOPICS[t]}</td>
                  <td className={v.correct === v.total ? '' : 'mono'}>{v.correct} / {v.total}</td>
                  <td>{v.correct < v.total ? <button className="btn btn-sm" onClick={() => onTab(REVISE_TAB[t] || 'theory')}>Revise →</button> : '✓'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {weak.length === 0 && <p className="msg msg-ok" style={{ marginTop: 8 }}>Perfect score — every topic correct.</p>}
      </div>

      <div>
        <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>Answer review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q, i) => {
            const chosen = answers[q.id];
            const ok = chosen === q.answer;
            return (
              <div className="card" key={q.id} style={{ borderLeft: `4px solid var(--${ok ? 'ok' : 'danger'})` }}>
                <div className="row"><h3 style={{ fontSize: 15 }}>{i + 1}. {q.q}</h3><span className={`chip chip-${ok ? 'committed' : 'aborted'}`}>{ok ? '✓ correct' : '✗ wrong'}</span></div>
                <p style={{ margin: 0 }}>
                  {chosen === undefined ? <em>Not answered. </em> : !ok && <>You chose <strong>{LETTER[chosen]}. {q.options[chosen]}</strong>. </>}
                  Correct answer: <strong>{LETTER[q.answer]}. {q.options[q.answer]}</strong>
                </p>
                <div className="why"><strong>Why:</strong> {q.explain}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage({ onTab, toast }) {
  const [opts, setOpts] = useState({ topic: 'all', difficulty: 'all', count: 10, instant: true });
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(null);

  useEffect(() => { api.quiz.list().then((r) => setBest(r.best ?? null)).catch(() => {}); }, [done]);

  const q = questions?.[index];
  const score = useMemo(() => (done && questions ? scoreQuiz(questions, answers) : null), [done, questions, answers]);

  const start = () => {
    setQuestions(buildQuiz(opts));
    setAnswers({}); setIndex(0); setRevealed(false); setDone(false);
  };
  const restart = () => { setQuestions(null); setDone(false); };

  const choose = (optIdx) => {
    if (revealed) return;
    setAnswers((a) => ({ ...a, [q.id]: optIdx }));
    if (opts.instant) setRevealed(true);
  };

  const next = () => {
    if (index + 1 < questions.length) { setIndex(index + 1); setRevealed(false); return; }
    setDone(true);
    const s = scoreQuiz(questions, answers);
    api.quiz.save({ topic: opts.topic, difficulty: opts.difficulty, total: s.total, correct: s.correct, percent: s.percent })
      .then(() => toast?.(`Quiz finished — ${s.percent}% saved`)).catch(() => {});
  };

  const exportReview = () => {
    const s = scoreQuiz(questions, answers);
    const md = [`# Deadlock Game — quiz review`, '', `Score: **${s.correct}/${s.total} (${s.percent}%)** — ${s.grade.label}`, '']
      .concat(questions.flatMap((qq, i) => {
        const ch = answers[qq.id];
        return [`## ${i + 1}. ${qq.q}`, '', ...qq.options.map((o, j) => `${j === qq.answer ? '**✓**' : '  '} ${LETTER[j]}. ${o}${j === ch ? '  ← your answer' : ''}`), '', `> ${qq.explain}`, ''];
      })).join('\n');
    downloadText(`quiz-review-${new Date().toISOString().slice(0, 10)}.md`, md, 'text/markdown');
    toast?.('Review downloaded');
  };

  if (!questions) {
    return (
      <main className="page" aria-labelledby="tab-quiz" style={{ maxWidth: 900 }}>
        <section style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 40 }} aria-hidden="true">📝</div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>Quiz</h1>
          <p style={{ margin: 0, color: 'var(--fg-muted)' }}>Check your understanding of the theory — <strong>{QUESTIONS.length}</strong> questions across {Object.keys(TOPICS).length} topics, each with a written explanation.</p>
        </section>
        <Setup opts={opts} setOpts={setOpts} start={start} best={best} />
      </main>
    );
  }

  if (done) {
    return (
      <main className="page" aria-labelledby="tab-quiz" style={{ maxWidth: 900 }}>
        <div className="btn-group" style={{ justifyContent: 'flex-end', marginBottom: 10 }}>
          <button className="btn btn-sm" onClick={exportReview}>⬇ Download review (.md)</button>
        </div>
        <Review questions={questions} answers={answers} score={score} onTab={onTab} restart={restart} />
      </main>
    );
  }

  const chosen = answers[q.id];
  const answeredCount = Object.keys(answers).length;

  return (
    <main className="page" aria-labelledby="tab-quiz" style={{ maxWidth: 820 }}>
      <div className="quiz-head">
        <div>
          <strong>Question {index + 1} of {questions.length}</strong>
          <span className="chip" style={{ marginLeft: 8 }}>{TOPICS[q.topic]}</span>
          <span className={`badge badge-${q.difficulty}`} style={{ marginLeft: 6 }}>{q.difficulty}</span>
        </div>
        <button className="btn btn-sm" onClick={restart}>Exit quiz</button>
      </div>
      <div className="quiz-progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length}>
        <div style={{ width: `${((index + (revealed || !opts.instant ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <div className="card" style={{ padding: 20, marginTop: 14 }}>
        <h2 style={{ fontSize: 19, margin: 0 }}>{q.q}</h2>
        <div className="quiz-options" role="radiogroup" aria-label="Answer options">
          {q.options.map((o, i) => {
            const isChosen = chosen === i;
            const state = revealed ? (i === q.answer ? 'right' : isChosen ? 'wrong' : '') : isChosen ? 'chosen' : '';
            return (
              <button key={i} type="button" role="radio" aria-checked={isChosen} className={`quiz-option ${state}`} onClick={() => choose(i)} disabled={revealed}>
                <span className="letter">{LETTER[i]}</span>
                <span>{o}</span>
                {revealed && i === q.answer && <span className="mark" aria-label="correct">✓</span>}
                {revealed && isChosen && i !== q.answer && <span className="mark" aria-label="your answer, wrong">✗</span>}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={`msg ${chosen === q.answer ? 'msg-ok' : 'msg-error'}`} style={{ marginTop: 12, display: 'block' }} aria-live="polite">
            <strong>{chosen === q.answer ? '✓ Correct.' : `✗ Not quite — the answer is ${LETTER[q.answer]}.`}</strong> {q.explain}
          </div>
        )}

        <div className="btn-group" style={{ marginTop: 14, justifyContent: 'space-between' }}>
          <button className="btn" onClick={() => { setIndex(Math.max(0, index - 1)); setRevealed(false); }} disabled={index === 0}>← Previous</button>
          {opts.instant && !revealed && chosen !== undefined && <button className="btn" onClick={() => setRevealed(true)}>Check answer</button>}
          <button className="btn btn-primary" onClick={next} disabled={opts.instant && !revealed}>
            {index + 1 === questions.length ? `Finish (${answeredCount}/${questions.length} answered)` : 'Next →'}
          </button>
        </div>
      </div>
    </main>
  );
}

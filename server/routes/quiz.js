import { Router } from 'express';

/** Quiz attempts: POST a finished attempt, GET recent attempts + best score. */
export function quizRoutes(db) {
  const r = Router();
  const insert = db.prepare('INSERT INTO quiz_scores (topic, difficulty, total, correct, percent) VALUES (?, ?, ?, ?, ?)');
  const list = db.prepare('SELECT * FROM quiz_scores ORDER BY id DESC LIMIT ?');
  const best = db.prepare('SELECT MAX(percent) AS best, COUNT(*) AS attempts, AVG(percent) AS average FROM quiz_scores');
  const byTopic = db.prepare('SELECT topic, COUNT(*) AS attempts, MAX(percent) AS best, AVG(percent) AS average FROM quiz_scores GROUP BY topic ORDER BY topic');

  r.get('/', (req, res) => {
    const b = best.get();
    res.json({
      recent: list.all(Math.min(100, Number(req.query.limit) || 20)),
      best: b.attempts ? b.best : null,
      attempts: b.attempts,
      average: b.attempts ? Math.round(b.average) : null,
      byTopic: byTopic.all(),
    });
  });

  r.post('/', (req, res) => {
    const { topic, difficulty, total, correct, percent } = req.body || {};
    if (!Number.isInteger(total) || total <= 0 || total > 100) return res.status(400).json({ error: 'total must be an integer between 1 and 100' });
    if (!Number.isInteger(correct) || correct < 0 || correct > total) return res.status(400).json({ error: 'correct must be between 0 and total' });
    const pct = Number.isInteger(percent) ? percent : Math.round((correct / total) * 100);
    const info = insert.run(String(topic || 'all').slice(0, 30), String(difficulty || 'all').slice(0, 20), total, correct, pct);
    res.status(201).json({ id: Number(info.lastInsertRowid), percent: pct });
  });

  return r;
}

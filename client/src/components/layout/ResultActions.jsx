import { useState } from 'react';
import { api, downloadText } from '../../api/client.js';
import { toMarkdown, toJSON } from '../../engine/report.js';

/** Save-to-history / export buttons shown above a finished simulation. */
export default function ResultActions({ run, onSaved, toast, shareUrl = null }) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  // A new simulation is a different thing to save: clear the "Saved #n" label.
  const [savedFor, setSavedFor] = useState(run?.result);
  if (savedFor !== run?.result) {
    setSavedFor(run?.result);
    setSavedId(null);
  }
  if (!run?.result) return null;

  const save = async () => {
    setSaving(true);
    try {
      const saved = await api.history.save({ mode: run.mode, title: run.title, input: run.input, result: run.result });
      setSavedId(saved.id);
      onSaved?.(saved);
      toast?.(`Saved to history as #${saved.id}`);
    } catch (e) {
      toast?.(e.message);
    } finally {
      setSaving(false);
    }
  };
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  return (
    <div className="btn-group">
      <button className="btn btn-sm" onClick={save} disabled={saving}>{saving ? <span className="spinner" /> : '💾'} {savedId ? `Saved #${savedId}` : 'Save to history'}</button>
      <button className="btn btn-sm" onClick={() => { downloadText(`deadlock-${run.mode}-${stamp}.md`, toMarkdown({ ...run, createdAt: Date.now() }), 'text/markdown'); toast?.('Markdown report downloaded'); }}>⬇ Report (.md)</button>
      <button className="btn btn-sm" onClick={() => { downloadText(`deadlock-${run.mode}-${stamp}.json`, toJSON(run), 'application/json'); toast?.('JSON exported'); }}>⬇ JSON</button>
      {shareUrl && (
        <button className="btn btn-sm" title="Copy a link that reopens this run at the current step" onClick={async () => {
          try { await navigator.clipboard.writeText(shareUrl); toast?.('Link copied'); } catch { window.prompt('Copy this link', shareUrl); }
        }}>🔗 Share</button>
      )}
    </div>
  );
}

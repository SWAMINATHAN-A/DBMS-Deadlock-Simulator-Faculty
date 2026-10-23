import { useCallback, useEffect, useState } from 'react';

/**
 * Step cursor with autoplay and keyboard shortcuts (← → Space Home End).
 * @param {number} total  number of steps (changing it restarts at step 0)
 * @param {boolean} active  only the visible tab listens for key presses
 */
export function useStepper(total, active = true) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // steps per second

  // A new run replaces the step list: restart at the beginning. Deriving this
  // from `total` during render avoids the extra render an effect would cost.
  const [lastTotal, setLastTotal] = useState(total);
  if (lastTotal !== total) {
    setLastTotal(total);
    setIndex(0);
    setPlaying(false);
  }

  // `total` is read through the current render's closure, so every callback is
  // recreated when it changes — no ref needed.
  const clamp = useCallback((i) => Math.max(0, Math.min(total - 1, i)), [total]);
  const goTo = useCallback((i) => setIndex(clamp(i)), [clamp]);
  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp]);
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp]);
  const first = useCallback(() => setIndex(0), []);
  const last = useCallback(() => setIndex(clamp(Infinity)), [clamp]);
  const toggle = useCallback(() => setPlaying((p) => !p), []);

  // autoplay
  useEffect(() => {
    if (!playing) return undefined;
    // reached the last step: stop the timer-driven playback
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (index >= total - 1) { setPlaying(false); return undefined; }
    const id = setTimeout(() => setIndex((i) => clamp(i + 1)), 1000 / speed);
    return () => clearTimeout(id);
  }, [playing, index, total, speed, clamp]);

  // keyboard shortcuts (ignored while typing in a field)
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === ' ') { e.preventDefault(); toggle(); }
      else if (e.key === 'Home') { e.preventDefault(); first(); }
      else if (e.key === 'End') { e.preventDefault(); last(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, first, last, toggle, active]);

  return { index, total, playing, speed, setSpeed, goTo, next, prev, first, last, toggle, setPlaying };
}

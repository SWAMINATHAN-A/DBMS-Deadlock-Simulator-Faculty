/**
 * developedBy.js — details shown on the "Developed By" tab.
 *
 * Edit this file only:
 *  - add one object per team member (photo files go in client/public/team/)
 *  - leave `photo` empty to show an initials avatar instead
 */

export const PROJECT = {
  title: 'Deadlock Game',
  subtitle: 'Interactive visualization of deadlock detection, prevention and avoidance in DBMS',
  course: 'Database Management Systems',
  year: '2026',
};

/** What makes this project different — shown as cards on the Innovation tab. */
export const INNOVATIONS = [
  {
    icon: '🎮',
    title: 'You are the scheduler',
    text: 'Instead of only watching a deadlock happen, the Game mode lets the student choose which transaction runs next. Every click updates the wait-for graph live, one wrong order closes the cycle, and an exhaustive state-space search powers the hint system that marks which moves still lead to a deadlock-free finish.',
  },
  {
    icon: '🤖',
    title: 'Two tutors: offline + AI',
    text: 'A built-in offline tutor answers natural-language questions about the current run — "why did T2 abort?", "what if I used wound-wait instead?" — by reading the simulation data and re-running the engine, with no keys or network. Flip a switch and a real LLM (free-tier Gemini, Groq or OpenRouter key, or a local model) explains the same run in its own words, grounded in the offline engine\'s facts so it cannot invent transactions or steps.',
  },
  {
    icon: '🔍',
    title: 'Watch the algorithm think',
    text: 'The depth-first search that detects a cycle is replayed on the graph: nodes turn purple as they are visited, edges light up as they are followed, and the cycle flashes red the moment it is found. Detection, wait-die, wound-wait and the Banker\'s algorithm all share the same scrub-anywhere step timeline.',
  },
  {
    icon: '🧩',
    title: 'One schedule, four strategies',
    text: 'The same lock schedule can be run under detection with four victim policies, or under wait-die and wound-wait, so students can compare how each strategy treats the identical conflict. Input can be written as plain READ / WRITE operations (translated to shared and exclusive locks automatically) or as explicit LOCK-S / LOCK-X requests.',
  },
  {
    icon: '📊',
    title: 'History, analytics and sharing',
    text: 'Every run can be saved to SQLite, exported as a Markdown report or JSON, reopened later, or shared as a link that opens the exact step. An analytics dashboard tracks deadlock rates, game scores and the questions students ask the tutor most.',
  },
  {
    icon: '🔊',
    title: 'Accessible by design',
    text: 'Every explanation can be read aloud, the whole simulator is keyboard-driven, node states use shape as well as colour, dark and light themes are supported, and the layout works down to phone width.',
  },
];

export const TEAM = [
  {
    name: 'Parth',
    register: '25BCE1443',
    photo: '/team/parth.jpg',          // ← put the file in client/public/team/ (or leave '' for initials)
    role: 'Developer',
  },
  {
    name: 'Vansh Sharma',
    register: '25BCE1567',
    photo: '/team/vansh.jpg',          // ← put the file in client/public/team/ (or leave '' for initials)
    role: 'Developer',
  },
];

export const GUIDE = {
  name: 'Dr. Swaminathan A',
  title: 'Assistant Professor',
  photo: '/team/guide.png',
};

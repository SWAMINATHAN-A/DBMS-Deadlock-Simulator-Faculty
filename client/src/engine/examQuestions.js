/**
 * examQuestions.js — competitive-exam practice bank for the deadlock topic.
 *
 * IMPORTANT — provenance
 * ----------------------
 * These questions are **modelled on the recurring question patterns** of the exams
 * named in each entry (GATE CS/IT, UGC-NET, ISRO, NIELIT and similar). They are not
 * verbatim reproductions of official papers: the numbers, wording and options have
 * been written for this app. The `exam` / `year` label tells you which paper's
 * *pattern* a question follows, so you can practise the right style — always check
 * the official PDF for exact wording before quoting a question as a past paper.
 *
 * Shape: {
 *   id, exam, year, type: 'mcq' | 'numerical', topic, difficulty,
 *   q, options?[4], answer (option index for mcq, number for numerical),
 *   unit?, solution
 * }
 */

export const EXAM_TOPICS = {
  conditions: 'Deadlock conditions & basics',
  rag: 'Resource-allocation & wait-for graphs',
  resources: 'Resource-count numericals',
  bankers: "Banker's algorithm & safe states",
  strategies: 'Prevention, avoidance & detection',
  sync: 'Synchronisation & concurrency',
};

/* ═══════════════ Deadlock conditions & basics ═══════════════ */
const CONDITIONS = [
  {
    id: 'c1', exam: 'GATE CS', year: 2015, type: 'mcq', topic: 'conditions', difficulty: 'easy',
    q: 'Which one of the following is NOT a necessary condition for a deadlock to occur?',
    options: ['Mutual exclusion', 'Hold and wait', 'Preemption of resources', 'Circular wait'],
    answer: 2,
    solution: 'The four necessary (Coffman) conditions are mutual exclusion, hold and wait, NO preemption, and circular wait. Preemption being *possible* actually prevents deadlock, so it is not a necessary condition — "no preemption" is.',
  },
  {
    id: 'c2', exam: 'UGC NET', year: 2018, type: 'mcq', topic: 'conditions', difficulty: 'easy',
    q: 'All four Coffman conditions holding simultaneously is:',
    options: [
      'Necessary but not sufficient for deadlock in the general case',
      'Sufficient but not necessary',
      'Neither necessary nor sufficient',
      'Equivalent to the system being in an unsafe state',
    ],
    answer: 0,
    solution: 'The four conditions must all hold for a deadlock, so they are necessary. For single-instance resources a cycle then means deadlock, but with multiple instances a cycle (and the four conditions) can exist without an actual deadlock — so they are not sufficient in general.',
  },
  {
    id: 'c3', exam: 'GATE CS', year: 2012, type: 'mcq', topic: 'conditions', difficulty: 'medium',
    q: 'A system is in an unsafe state. Which statement is correct?',
    options: [
      'The system is necessarily deadlocked',
      'The system will certainly deadlock in the future',
      'The system may or may not deadlock',
      'The system can never deadlock from here',
    ],
    answer: 2,
    solution: 'Unsafe ≠ deadlocked. An unsafe state only means the OS can no longer *guarantee* that every process finishes; whether a deadlock actually occurs depends on the future request sequence. Every deadlocked state is unsafe, but not every unsafe state is deadlocked.',
  },
  {
    id: 'c4', exam: 'ISRO CS', year: 2017, type: 'mcq', topic: 'conditions', difficulty: 'easy',
    q: 'Deadlock in an operating system is best described as a situation where:',
    options: [
      'A process uses more CPU time than allotted',
      'A set of processes are blocked, each holding a resource and waiting for a resource held by another process in the set',
      'A process is repeatedly denied access to a resource while others proceed',
      'Two processes write to the same memory location',
    ],
    answer: 1,
    solution: 'That is the definition of deadlock — circular waiting within a set of blocked processes. Option C describes starvation; option D is a race condition.',
  },
  {
    id: 'c5', exam: 'GATE IT', year: 2006, type: 'mcq', topic: 'conditions', difficulty: 'medium',
    q: 'Which of the following is the difference between deadlock and starvation?',
    options: [
      'There is no difference; the terms are interchangeable',
      'In deadlock no process in the set makes progress; in starvation the system progresses but a particular process is indefinitely postponed',
      'Deadlock affects only I/O devices, starvation only the CPU',
      'Starvation always precedes deadlock',
    ],
    answer: 1,
    solution: 'Deadlock blocks a whole set permanently. Starvation (indefinite postponement) means the system as a whole makes progress while one unlucky process never gets its turn — e.g. a low-priority process under priority scheduling.',
  },
  {
    id: 'c6', exam: 'GATE CS', year: 2019, type: 'mcq', topic: 'conditions', difficulty: 'medium',
    q: 'Breaking which Coffman condition is generally considered impractical in real systems?',
    options: ['Hold and wait', 'Circular wait', 'Mutual exclusion', 'No preemption'],
    answer: 2,
    solution: 'Mutual exclusion is inherent to non-sharable resources — a printer or a write lock cannot be shared without breaking correctness. The other three can be attacked by protocol design (request all at once, global ordering, preemption).',
  },
  {
    id: 'c7', exam: 'UGC NET', year: 2016, type: 'mcq', topic: 'conditions', difficulty: 'medium',
    q: 'Requiring every process to request all of its resources at once, before it begins execution, eliminates which condition?',
    options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'],
    answer: 1,
    solution: 'If a process gets everything at once (or nothing), it never holds one resource while waiting for another — "hold and wait" is removed. The costs are poor resource utilisation and possible starvation.',
  },
  {
    id: 'c8', exam: 'GATE CS', year: 2011, type: 'mcq', topic: 'conditions', difficulty: 'medium',
    q: 'Imposing a total ordering on resource types and requiring each process to request resources in increasing order eliminates:',
    options: ['Mutual exclusion', 'Hold and wait', 'Circular wait', 'No preemption'],
    answer: 2,
    solution: 'With a global order, a process holding a resource of rank i can only wait for a resource of rank > i, so the "waits-for" relation is strictly increasing and can never close a cycle.',
  },
  {
    id: 'c9', exam: 'ISRO CS', year: 2015, type: 'mcq', topic: 'conditions', difficulty: 'easy',
    q: 'Which of these resources is typically NOT subject to deadlock because it can be preempted cheaply?',
    options: ['Printer', 'Tape drive', 'CPU registers / memory (swappable)', 'Mutex lock held in a critical section'],
    answer: 2,
    solution: 'CPU and main memory can be preempted — a process can be descheduled and its pages swapped out — so they are not usually deadlock-prone. Printers, tape drives and locks cannot be taken away mid-use without losing correctness.',
  },
  {
    id: 'c10', exam: 'GATE CS', year: 2021, type: 'mcq', topic: 'conditions', difficulty: 'hard',
    q: 'Consider a system with only one instance of each resource type. Which statement is TRUE?',
    options: [
      'A cycle in the resource-allocation graph is necessary but not sufficient for deadlock',
      'A cycle in the resource-allocation graph is necessary and sufficient for deadlock',
      'Deadlock can occur without a cycle',
      'A cycle implies the state is safe',
    ],
    answer: 1,
    solution: 'With single instances, a cycle is necessary AND sufficient. Only when resource types have multiple instances does a cycle become merely necessary — the extra instances may let some process finish and break the cycle.',
  },
  {
    id: 'c11', exam: 'NIELIT', year: 2017, type: 'mcq', topic: 'conditions', difficulty: 'easy',
    q: 'A deadlocked state in a system implies that the state is:',
    options: ['Safe', 'Unsafe', 'Either safe or unsafe', 'Independent of safety'],
    answer: 1,
    solution: 'Every deadlocked state is unsafe, because no sequence exists in which all processes finish. The converse is false — an unsafe state need not be deadlocked.',
  },
  {
    id: 'c12', exam: 'GATE CS', year: 2014, type: 'mcq', topic: 'conditions', difficulty: 'medium',
    q: 'Which of the following is TRUE about deadlock in a system where all resources are sharable (read-only)?',
    options: [
      'Deadlock may still occur because of circular wait',
      'Deadlock cannot occur because mutual exclusion never holds',
      'Deadlock occurs only when processes exceed their maximum claim',
      "Deadlock occurs only if the Banker's algorithm is not used",
    ],
    answer: 1,
    solution: 'Mutual exclusion is a necessary condition. If every resource is sharable, no process ever waits for a resource, so no deadlock is possible regardless of the other three conditions.',
  },
  {
    id: 'c13', exam: 'UGC NET', year: 2020, type: 'mcq', topic: 'conditions', difficulty: 'hard',
    q: 'Which one of the following statements about livelock is correct?',
    options: [
      'Livelocked processes are blocked and consume no CPU',
      'Livelocked processes keep changing state in response to each other but make no progress',
      'Livelock is impossible if deadlock detection is enabled',
      'Livelock and starvation are identical',
    ],
    answer: 1,
    solution: 'In livelock the processes are running — repeatedly retrying, backing off, or aborting and restarting — but the useful work never completes. Deadlocked processes, in contrast, are blocked and consume no CPU.',
  },
  {
    id: 'c14', exam: 'GATE CS', year: 2008, type: 'mcq', topic: 'conditions', difficulty: 'medium',
    q: 'The "ostrich algorithm" for deadlock handling refers to:',
    options: [
      'Detecting a deadlock and rolling back the cheapest victim',
      'Ignoring the problem entirely and assuming deadlocks are rare enough',
      "Running the Banker's algorithm periodically",
      'Preempting resources from the youngest process',
    ],
    answer: 1,
    solution: 'The ostrich approach (head in the sand) is used by most general-purpose systems such as UNIX and Windows for OS-level resources: handling deadlock costs more than the occasional reboot, given how rarely it occurs.',
  },
];

/* ═══════════════ Resource-allocation & wait-for graphs ═══════════════ */
const RAG = [
  {
    id: 'g1', exam: 'GATE CS', year: 2013, type: 'mcq', topic: 'rag', difficulty: 'easy',
    q: 'In a resource-allocation graph, an edge drawn from a process Pi to a resource type Rj is called:',
    options: ['An assignment edge', 'A request edge', 'A claim edge', 'A wait-for edge'],
    answer: 1,
    solution: 'P → R is a request edge (the process wants it). R → P is an assignment edge (the resource is allocated to it). A dashed P → R is a claim edge, used only in the resource-allocation-graph avoidance algorithm.',
  },
  {
    id: 'g2', exam: 'GATE CS', year: 2016, type: 'mcq', topic: 'rag', difficulty: 'medium',
    q: 'A wait-for graph is obtained from a resource-allocation graph by:',
    options: [
      'Reversing every edge',
      'Removing the resource nodes and collapsing the paths Pi → Rk → Pj into Pi → Pj',
      'Removing all processes that hold no resources',
      'Adding a node for every request',
    ],
    answer: 1,
    solution: 'The wait-for graph keeps only process nodes. An edge Pi → Pj means Pi waits for a resource currently held by Pj — exactly the path Pi → Rk → Pj in the resource-allocation graph.',
  },
  {
    id: 'g3', exam: 'UGC NET', year: 2019, type: 'mcq', topic: 'rag', difficulty: 'medium',
    q: 'A system has 4 processes and a wait-for graph with edges P1→P2, P2→P3, P3→P4. How many processes are deadlocked?',
    options: ['0', '2', '3', '4'],
    answer: 0,
    solution: 'The graph is a chain, not a cycle. P4 is not waiting for anything, so it will finish and release its resources, which unblocks P3, then P2, then P1. No deadlock.',
  },
  {
    id: 'g4', exam: 'GATE CS', year: 2017, type: 'mcq', topic: 'rag', difficulty: 'medium',
    q: 'A wait-for graph has edges P1→P2, P2→P3, P3→P1 and P4→P1. Which processes are deadlocked?',
    options: ['P1, P2, P3 only', 'P1, P2, P3, P4', 'P4 only', 'None'],
    answer: 0,
    solution: 'The cycle is P1→P2→P3→P1, so those three are deadlocked. P4 is merely blocked behind the deadlock: it is not part of the cycle, and it would proceed if the cycle were broken. Deadlocked ⇒ on a cycle.',
  },
  {
    id: 'g5', exam: 'GATE CS', year: 2020, type: 'numerical', topic: 'rag', difficulty: 'medium',
    q: 'A deadlock detection algorithm searches a wait-for graph with V processes and E wait edges using depth-first search. If V = 100 and E = 400, the worst-case number of node-plus-edge visits is O(V+E). Compute V + E.',
    answer: 500, unit: 'visits',
    solution: 'Cycle detection by DFS is O(V + E) because each node and each edge is examined at most once. V + E = 100 + 400 = 500. The point of the question is to recognise the linear complexity rather than something quadratic.',
  },
  {
    id: 'g6', exam: 'GATE IT', year: 2007, type: 'mcq', topic: 'rag', difficulty: 'hard',
    q: 'A resource-allocation graph with multiple instances per resource type contains a cycle. Which conclusion is valid?',
    options: [
      'The system is definitely deadlocked',
      'The system is definitely not deadlocked',
      'The system may or may not be deadlocked',
      'The graph must be redrawn as a wait-for graph to be valid',
    ],
    answer: 2,
    solution: 'With multiple instances a cycle is only a necessary condition. Another instance of a resource in the cycle may be held by a process outside it that will finish and release it, breaking the cycle. You must run the detection algorithm to decide.',
  },
  {
    id: 'g7', exam: 'ISRO CS', year: 2018, type: 'mcq', topic: 'rag', difficulty: 'easy',
    q: 'In a resource-allocation graph, a dashed edge Pi ⇢ Rj represents:',
    options: [
      'Pi currently holds Rj',
      'Pi may request Rj at some time in the future',
      'Pi has released Rj',
      'Rj is unavailable',
    ],
    answer: 1,
    solution: 'A dashed claim edge declares a possible future request. The RAG-based avoidance algorithm converts a claim edge to a request edge and then to an assignment edge only if doing so leaves the graph free of cycles.',
  },
  {
    id: 'g8', exam: 'GATE CS', year: 2009, type: 'numerical', topic: 'rag', difficulty: 'medium',
    q: 'A wait-for graph of a system contains exactly one cycle of length 5. What is the minimum number of processes that must be aborted to break the deadlock?',
    answer: 1, unit: 'process',
    solution: 'Every node in a simple cycle has exactly one outgoing edge within that cycle, so removing any single process destroys the cycle. The minimum is 1 regardless of the cycle length — victim selection then decides *which* one.',
  },
  {
    id: 'g9', exam: 'UGC NET', year: 2017, type: 'mcq', topic: 'rag', difficulty: 'medium',
    q: 'The nodes of a wait-for graph are:',
    options: ['Processes only', 'Resources only', 'Both processes and resources', 'Requests only'],
    answer: 0,
    solution: 'Only processes. That is the distinction from a resource-allocation graph, which is bipartite with both process and resource nodes.',
  },
  {
    id: 'g10', exam: 'GATE CS', year: 2022, type: 'numerical', topic: 'rag', difficulty: 'hard',
    q: 'In a system with single-instance resources, 6 processes form a wait-for graph in which every process waits for exactly one other process and the graph is a single cycle. How many processes are deadlocked?',
    answer: 6, unit: 'processes',
    solution: 'If the entire graph is one cycle through all 6 processes, every process is on the cycle, so all 6 are deadlocked. (Contrast with a chain, where none are.)',
  },
  {
    id: 'g11', exam: 'NIELIT', year: 2016, type: 'mcq', topic: 'rag', difficulty: 'easy',
    q: 'If a resource-allocation graph has NO cycle, then:',
    options: [
      'The system is definitely deadlocked',
      'The system is definitely not deadlocked',
      'Nothing can be concluded',
      'All processes are blocked',
    ],
    answer: 1,
    solution: 'No cycle ⇒ no deadlock, for both single and multiple instances. A cycle is a necessary condition, so its absence rules deadlock out entirely.',
  },
];

/* ═══════════════ Resource-count numericals ═══════════════
   The recurring GATE family. Two formulas carry almost all of them:
     • identical processes:  deadlock-free  ⇔  R ≥ n(m − 1) + 1
     • different maxima:     deadlock-free  ⇔  Σ(maxᵢ) ≤ R + n − 1
   where n = processes, m = maximum units one process may need, R = total units. */
const RESOURCES = [
  {
    id: 'n1', exam: 'GATE CS', year: 2014, type: 'mcq', topic: 'resources', difficulty: 'medium',
    q: 'A system has 3 processes sharing 4 units of a resource. If each process needs a maximum of 2 units, then a deadlock:',
    options: ['Can never occur', 'May occur', 'Will certainly occur', 'Occurs only if a process is preempted'],
    answer: 0,
    solution: 'Deadlock-free if R ≥ n(m−1)+1 = 3(2−1)+1 = 4. Here R = 4, so the condition holds and deadlock can never occur. Intuition: give every process m−1 = 1 unit (3 used); the 4th unit lets some process reach its maximum of 2 and finish.',
  },
  {
    id: 'n2', exam: 'GATE CS', year: 2015, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'A system has 4 processes, each requiring a maximum of 3 units of a resource type. What is the minimum number of units that guarantees the system is deadlock-free?',
    answer: 9, unit: 'units',
    solution: 'R ≥ n(m−1)+1 = 4(3−1)+1 = 4×2+1 = 9. With 8 units every process could hold 2 and wait forever; the 9th unit guarantees at least one process reaches 3, finishes, and releases.',
  },
  {
    id: 'n3', exam: 'GATE CS', year: 2013, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'A system has 6 units of a resource. Every process needs a maximum of 2 units. What is the maximum number of processes that can run with no possibility of deadlock?',
    answer: 5, unit: 'processes',
    solution: 'Need R ≥ n(m−1)+1, i.e. 6 ≥ n(2−1)+1 = n+1, so n ≤ 5. With 5 processes, 5 units cover one each and the 6th lets one finish. With 6 processes each holding one unit, none can get a second — deadlock.',
  },
  {
    id: 'n4', exam: 'GATE IT', year: 2008, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'A system has 13 units of a resource type and 4 processes, each needing a maximum of 4 units. What is the maximum number of additional processes (each also needing a maximum of 4 units) that can be added while keeping the system deadlock-free?',
    answer: 0, unit: 'processes',
    solution: 'Deadlock-free needs R ≥ n(m−1)+1 = n(4−1)+1 = 3n+1. With R = 13: 13 ≥ 3n+1 ⇒ n ≤ 4. The system already has 4 processes, so no further process can be added.',
  },
  {
    id: 'n5', exam: 'GATE CS', year: 2010, type: 'mcq', topic: 'resources', difficulty: 'hard',
    q: 'A system has m resource units shared by n processes, each needing a maximum of m units. Deadlock is impossible if:',
    options: ['n = 1', 'n ≥ 2', 'n > m', 'm = 1'],
    answer: 0,
    solution: 'With a single process there is no circular wait — it simply takes all m units it needs. For n ≥ 2 with each needing up to m units, the units can be split so that nobody reaches its maximum: deadlock becomes possible.',
  },
  {
    id: 'n6', exam: 'GATE CS', year: 2018, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'Three processes P1, P2, P3 have maximum demands of 3, 4 and 5 units of the same resource type. What is the minimum total number of units that guarantees the system is deadlock-free?',
    answer: 10, unit: 'units',
    solution: 'Deadlock-free if Σ(maxᵢ) ≤ R + n − 1, i.e. 3+4+5 = 12 ≤ R + 3 − 1 ⇒ R ≥ 10. Equivalently: in the worst case each process holds maxᵢ−1 (2+3+4 = 9 units) and is stuck; one extra unit (10) lets one of them finish.',
  },
  {
    id: 'n7', exam: 'GATE CS', year: 2017, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'Four processes have maximum demands of 2, 3, 4 and 5 units of a single resource type. What is the minimum number of units that guarantees the system is deadlock-free?',
    answer: 11, unit: 'units',
    solution: 'Use Σ(maxᵢ) ≤ R + n − 1. Σmax = 2+3+4+5 = 14 and n = 4, so 14 ≤ R + 3 ⇒ R ≥ 11. Check: worst-case holdings are 1+2+3+4 = 10 units, so the 11th unit always lets some process reach its maximum and finish.',
  },
  {
    id: 'n8', exam: 'UGC NET', year: 2018, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'A system has 10 units of a resource and n processes, each with a maximum demand of 3 units. Find the maximum value of n for which deadlock can never occur.',
    answer: 4, unit: 'processes',
    solution: 'R ≥ n(m−1)+1 ⇒ 10 ≥ 2n+1 ⇒ n ≤ 4.5 ⇒ n = 4. With 5 processes each holding 2 units (10 used, 0 free) nobody can reach 3 — deadlock.',
  },
  {
    id: 'n9', exam: 'ISRO CS', year: 2016, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'Two processes each need a maximum of 4 units of a resource type. What is the minimum number of units required to guarantee no deadlock?',
    answer: 7, unit: 'units',
    solution: 'R ≥ n(m−1)+1 = 2(4−1)+1 = 7. With 6 units each process could hold 3 and wait; the 7th guarantees one of them reaches 4.',
  },
  {
    id: 'n10', exam: 'GATE CS', year: 2019, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'A system has 5 processes and 11 units of a resource type, each process needing a maximum of 3 units. How many units would remain free in the worst case where every process holds as much as it can without finishing?',
    answer: 1, unit: 'unit',
    solution: 'Worst case each process holds m−1 = 2 units: 5 × 2 = 10 units held, leaving 11 − 10 = 1 free. Since one free unit lets a process reach 3 and finish, the system is deadlock-free — consistent with 11 ≥ 5(2)+1 = 11.',
  },
  {
    id: 'n11', exam: 'GATE CS', year: 2011, type: 'mcq', topic: 'resources', difficulty: 'medium',
    q: 'n processes share a resource type with R units; each process needs a maximum of m units. Which inequality guarantees freedom from deadlock?',
    options: ['R ≥ n × m', 'R ≥ n(m − 1) + 1', 'R ≥ n + m', 'R ≥ m(n − 1) + 1'],
    answer: 1,
    solution: 'Worst case: every process holds m−1 units without finishing, consuming n(m−1). One more unit forces some process to its maximum, so R ≥ n(m−1)+1 is both necessary and sufficient for the guarantee.',
  },
  {
    id: 'n12', exam: 'GATE IT', year: 2005, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'A system has 3 processes with maximum demands 4, 5 and 6 units of one resource type, and 12 units in total. By how many units is the system short of the deadlock-free guarantee?',
    answer: 1, unit: 'unit',
    solution: 'Need Σmax ≤ R + n − 1 ⇒ 15 ≤ R + 2 ⇒ R ≥ 13. The system has 12, so it is short by 1 unit. With 12 units the holdings 3+4+5 = 12 leave nothing free and nobody can finish.',
  },
  {
    id: 'n13', exam: 'UGC NET', year: 2015, type: 'numerical', topic: 'resources', difficulty: 'easy',
    q: 'A system has 2 units of a resource type and 2 processes, each needing a maximum of 2 units. What is the minimum number of units needed to make deadlock impossible?',
    answer: 3, unit: 'units',
    solution: 'R ≥ n(m−1)+1 = 2(1)+1 = 3. With only 2 units each process takes one and both wait forever — the classic two-process deadlock.',
  },
  {
    id: 'n14', exam: 'GATE CS', year: 2016, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'A system has 20 units of a resource type. Each of n identical processes requires a maximum of 5 units. Find the largest n for which the system is guaranteed deadlock-free.',
    answer: 4, unit: 'processes',
    solution: '20 ≥ n(5−1)+1 = 4n+1 ⇒ 4n ≤ 19 ⇒ n ≤ 4.75 ⇒ n = 4. With 5 processes each holding 4 units (20 used, 0 free) none can reach 5.',
  },
  {
    id: 'n15', exam: 'NIELIT', year: 2018, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'Each of 3 processes needs a maximum of 4 units of a resource. The system has 9 units. How many extra units are needed to guarantee deadlock freedom?',
    answer: 1, unit: 'unit',
    solution: 'Required R = n(m−1)+1 = 3(3)+1 = 10. The system has 9, so 1 more unit is required. With 9 units each process can hold 3 and deadlock.',
  },
  {
    id: 'n16', exam: 'GATE CS', year: 2007, type: 'mcq', topic: 'resources', difficulty: 'hard',
    q: 'A system has R units of a resource type and n processes, with maximum demands max₁ … maxₙ. The system is guaranteed deadlock-free if and only if:',
    options: [
      'Σ maxᵢ < R',
      'Σ maxᵢ ≤ R + n − 1',
      'Σ maxᵢ ≥ R + n',
      'max(maxᵢ) ≤ R',
    ],
    answer: 1,
    solution: 'Deadlock requires every process to hold at most maxᵢ − 1, i.e. Σ(maxᵢ − 1) = Σmaxᵢ − n units allocated with none free. That is impossible when Σmaxᵢ − n < R, i.e. Σmaxᵢ ≤ R + n − 1.',
  },
  {
    id: 'n17', exam: 'GATE CS', year: 2023, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'Five processes each require a maximum of 4 units of a resource type. The system currently has 15 units. What is the maximum number of units that could be allocated with the system still in a deadlock?',
    answer: 15, unit: 'units',
    solution: 'Deadlock needs every process below its maximum, so at most 5 × (4−1) = 15 units may be held — exactly the supply, leaving 0 free. Since 15 < n(m−1)+1 = 16, deadlock is indeed possible, and at the deadlock point all 15 units are held.',
  },
  {
    id: 'n18', exam: 'GATE CS', year: 2012, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'A system has 7 units of a resource type and 3 processes, each needing a maximum of 3 units. State whether deadlock is possible by entering the minimum units required for the guarantee.',
    answer: 7, unit: 'units',
    solution: 'n(m−1)+1 = 3(2)+1 = 7. The system has exactly 7, so the guarantee is met and deadlock is impossible. Worst case: 3 processes × 2 units = 6 held, 1 free, which lets one process reach 3.',
  },
  {
    id: 'n19', exam: 'ISRO CS', year: 2014, type: 'mcq', topic: 'resources', difficulty: 'medium',
    q: 'A system has 6 identical units of a resource and 3 processes each with a maximum demand of 3 units. Which is TRUE?',
    options: [
      'Deadlock is impossible',
      'Deadlock is possible',
      'Deadlock is certain',
      'The information is insufficient',
    ],
    answer: 1,
    solution: 'Required for the guarantee: n(m−1)+1 = 3(2)+1 = 7 > 6. With 6 units each process can hold 2 and none can reach 3, so deadlock is possible (not certain — it depends on the request order).',
  },
  {
    id: 'n20', exam: 'UGC NET', year: 2021, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'A system has 4 processes with maximum demands of 2, 2, 3 and 3 units of a single resource type. What is the minimum total number of units for a deadlock-free guarantee?',
    answer: 7, unit: 'units',
    solution: 'Σmax = 10, n = 4. Need Σmax ≤ R + n − 1 ⇒ 10 ≤ R + 3 ⇒ R ≥ 7. Check: worst-case holdings 1+1+2+2 = 6, so the 7th unit always lets someone finish.',
  },
  {
    id: 'n21', exam: 'GATE CS', year: 2006, type: 'numerical', topic: 'resources', difficulty: 'medium',
    q: 'A computer has 8 tape drives and n processes competing for them. Each process may need 3 drives. Find the maximum n for which the system is always deadlock-free.',
    answer: 3, unit: 'processes',
    solution: '8 ≥ n(3−1)+1 = 2n+1 ⇒ n ≤ 3.5 ⇒ n = 3. With 4 processes each holding 2 drives (8 used) none can get a third.',
  },
  {
    id: 'n22', exam: 'GATE CS', year: 2024, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'A system has 12 units of a resource type. Processes each declare a maximum need of 4 units. Currently 3 processes are running. How many more such processes can be admitted while keeping the deadlock-free guarantee?',
    answer: 0, unit: 'processes',
    solution: 'Guarantee needs 12 ≥ n(4−1)+1 = 3n+1 ⇒ n ≤ 3.67 ⇒ n = 3. Three processes are already running, so no more can be admitted.',
  },
  {
    id: 'n23', exam: 'GATE IT', year: 2004, type: 'mcq', topic: 'resources', difficulty: 'medium',
    q: 'If each of n processes needs a maximum of 1 unit of a resource type, deadlock:',
    options: [
      'Can occur if R < n',
      'Can never occur, whatever R is',
      'Occurs only if R = 1',
      'Depends on the scheduling policy',
    ],
    answer: 1,
    solution: 'With m = 1 the formula gives R ≥ n(1−1)+1 = 1. Any process that receives its single unit immediately has everything it needs and will finish, so no process ever holds-and-waits.',
  },
  {
    id: 'n24', exam: 'GATE CS', year: 2009, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'A system has two resource types: 4 units of R1 and 3 units of R2. Three processes each need a maximum of 2 units of R1 and 1 unit of R2. Enter 1 if the system is guaranteed deadlock-free, otherwise 0.',
    answer: 1, unit: '(1 = safe, 0 = not)',
    solution: 'Apply the rule per resource type. R1: need 3(2−1)+1 = 4 ≤ 4 ✓. R2: need 3(1−1)+1 = 1 ≤ 3 ✓. Both types satisfy the guarantee, so no deadlock is possible — answer 1.',
  },
  {
    id: 'n25', exam: 'NIELIT', year: 2019, type: 'numerical', topic: 'resources', difficulty: 'easy',
    q: 'Each of 6 processes requires a maximum of 2 units of a resource. Find the minimum number of units for a deadlock-free guarantee.',
    answer: 7, unit: 'units',
    solution: 'n(m−1)+1 = 6(1)+1 = 7. With only 6 units every process holds exactly 1 and waits for a second — a six-way deadlock.',
  },
  {
    id: 'n26', exam: 'GATE CS', year: 2022, type: 'numerical', topic: 'resources', difficulty: 'hard',
    q: 'A system has 10 units of a resource type and 4 processes with maximum demands 3, 3, 3 and 3. What is the largest value of Σ(maxᵢ) that would still keep the system deadlock-free with 10 units and 4 processes?',
    answer: 13, unit: 'units',
    solution: 'The condition is Σmaxᵢ ≤ R + n − 1 = 10 + 4 − 1 = 13. The actual Σmax here is 12 ≤ 13, so this system is already safe; 13 is the maximum total demand the 10 units can guarantee for 4 processes.',
  },
];
/* ═══════════════ Banker's algorithm & safe states ═══════════════ */
const BANKERS = [
  {
    id: 'k1', exam: 'GATE CS', year: 2014, type: 'mcq', topic: 'bankers', difficulty: 'easy',
    q: "In the Banker's algorithm, the Need matrix is defined as:",
    options: ['Allocation − Max', 'Max − Allocation', 'Available − Allocation', 'Max + Allocation'],
    answer: 1,
    solution: 'Need[i][j] = Max[i][j] − Allocation[i][j] — the units of resource j that process i may still request before it reaches its declared maximum.',
  },
  {
    id: 'k2', exam: 'GATE CS', year: 2018, type: 'mcq', topic: 'bankers', difficulty: 'medium',
    q: "The Banker's algorithm is an example of:",
    options: ['Deadlock prevention', 'Deadlock avoidance', 'Deadlock detection', 'Deadlock recovery'],
    answer: 1,
    solution: 'It is avoidance: requests are allowed in any order, but each one is granted only if the resulting state is still safe. Prevention instead restricts *how* requests may be made so a cycle is structurally impossible.',
  },
  {
    id: 'k3', exam: 'UGC NET', year: 2019, type: 'numerical', topic: 'bankers', difficulty: 'hard',
    q: 'A system has 3 resource types A, B, C with total units (10, 5, 7). Allocation is P0(0,1,0), P1(2,0,0), P2(3,0,2), P3(2,1,1), P4(0,0,2). How many units of A are currently available?',
    answer: 3, unit: 'units of A',
    solution: 'Allocated A = 0+2+3+2+0 = 7. Available A = total − allocated = 10 − 7 = 3. (Doing the same for B and C gives Available = (3, 3, 2) — the classic textbook state.)',
  },
  {
    id: 'k4', exam: 'GATE CS', year: 2015, type: 'mcq', topic: 'bankers', difficulty: 'hard',
    q: 'For the classic state Available = (3,3,2) with Need P0(7,4,3), P1(1,2,2), P2(6,0,0), P3(0,1,1), P4(4,3,1), which is a valid safe sequence?',
    options: ['⟨P0, P1, P2, P3, P4⟩', '⟨P1, P3, P4, P0, P2⟩', '⟨P2, P0, P1, P3, P4⟩', 'No safe sequence exists'],
    answer: 1,
    solution: 'Work = (3,3,2). P1 needs (1,2,2) ≤ Work ✓ → Work = (5,3,2). P3 (0,1,1) ✓ → (7,4,3). P4 (4,3,1) ✓ → (7,4,5). P0 (7,4,3) ✓ → (7,5,5). P2 (6,0,0) ✓ → (10,5,7). All finish, so ⟨P1,P3,P4,P0,P2⟩ is safe. P0 cannot go first because (7,4,3) ≰ (3,3,2).',
  },
  {
    id: 'k5', exam: 'GATE CS', year: 2016, type: 'mcq', topic: 'bankers', difficulty: 'medium',
    q: 'A state is defined as SAFE if:',
    options: [
      'No process is currently blocked',
      'There exists at least one sequence in which every process can obtain its maximum need and terminate',
      'Available is non-zero for every resource type',
      'Every process has already received its maximum demand',
    ],
    answer: 1,
    solution: 'Safety is the existence of a safe sequence: each process in order has Need ≤ Work, and on finishing it returns its Allocation to Work. Only one such sequence need exist.',
  },
  {
    id: 'k6', exam: 'GATE IT', year: 2007, type: 'numerical', topic: 'bankers', difficulty: 'hard',
    q: 'Available = (1, 1, 2). Unfinished processes have Need rows (0,1,0), (2,0,1) and (1,0,2). How many processes can be selected as the FIRST element of a safe sequence?',
    answer: 2, unit: 'processes',
    solution: 'Compare each Need with Work = (1,1,2): (0,1,0) ≤ (1,1,2) ✓; (2,0,1) fails on the first resource ✗; (1,0,2) ≤ (1,1,2) ✓. Two processes qualify to go first.',
  },
  {
    id: 'k7', exam: 'GATE CS', year: 2020, type: 'mcq', topic: 'bankers', difficulty: 'hard',
    q: 'In the resource-request algorithm, a request Requestᵢ from process Pi is checked in which order?',
    options: [
      'Requestᵢ ≤ Available, then Requestᵢ ≤ Needᵢ, then safety check',
      'Requestᵢ ≤ Needᵢ, then Requestᵢ ≤ Available, then safety check on the tentative state',
      'Safety check, then Requestᵢ ≤ Needᵢ',
      'Requestᵢ ≤ Maxᵢ only',
    ],
    answer: 1,
    solution: 'First Request ≤ Need (otherwise the process has exceeded its declared maximum — an error). Then Request ≤ Available (otherwise it must wait). Only then is the allocation made tentatively and the safety algorithm run; if the result is unsafe the allocation is rolled back.',
  },
  {
    id: 'k8', exam: 'GATE CS', year: 2017, type: 'mcq', topic: 'bankers', difficulty: 'medium',
    q: 'A request is within Need and within Available, but granting it would produce an unsafe state. The Banker will:',
    options: [
      'Grant the request because the resources exist',
      'Deny the request, restore the previous state and make the process wait',
      'Abort the requesting process',
      'Grant a partial allocation',
    ],
    answer: 1,
    solution: 'The tentative allocation is undone (Available, Allocation and Need restored) and the process waits. Refusing a physically-possible request is precisely how avoidance keeps the system out of trouble.',
  },
  {
    id: 'k9', exam: 'UGC NET', year: 2016, type: 'mcq', topic: 'bankers', difficulty: 'medium',
    q: "The time complexity of the Banker's safety algorithm for n processes and m resource types is:",
    options: ['O(n)', 'O(m × n)', 'O(m × n²)', 'O(2ⁿ)'],
    answer: 2,
    solution: 'Each of up to n passes scans the n processes and compares m resource types, giving O(m·n²). This cost per request is the main reason the algorithm is rarely used in practice.',
  },
  {
    id: 'k10', exam: 'ISRO CS', year: 2017, type: 'mcq', topic: 'bankers', difficulty: 'medium',
    q: "Which assumption does the Banker's algorithm require that is usually unrealistic?",
    options: [
      'Resources can be released',
      'Each process declares its maximum resource need in advance',
      'There is more than one resource type',
      'Processes execute concurrently',
    ],
    answer: 1,
    solution: 'The whole safety argument rests on knowing each process\'s worst-case demand up front. Real processes (and database transactions) acquire resources dynamically based on data, so the maximum is unknown.',
  },
  {
    id: 'k11', exam: 'GATE CS', year: 2021, type: 'numerical', topic: 'bankers', difficulty: 'hard',
    q: 'A system has 12 units of a single resource. Allocation is P0 = 5, P1 = 2, P2 = 2, and Max is P0 = 10, P1 = 4, P2 = 9. How many units are currently available?',
    answer: 3, unit: 'units',
    solution: 'Allocated = 5 + 2 + 2 = 9, so Available = 12 − 9 = 3. Need = (5, 2, 7). P1 needs 2 ≤ 3 ✓ → Work = 5; P0 needs 5 ≤ 5 ✓ → Work = 10; P2 needs 7 ≤ 10 ✓. The state is safe with sequence ⟨P1, P0, P2⟩.',
  },
  {
    id: 'k12', exam: 'GATE CS', year: 2013, type: 'mcq', topic: 'bankers', difficulty: 'hard',
    q: 'Which statement about safe and deadlocked states is TRUE?',
    options: [
      'Every unsafe state is a deadlocked state',
      'Every deadlocked state is an unsafe state',
      'Safe states can be deadlocked',
      'Safe and unsafe states are unrelated to deadlock',
    ],
    answer: 1,
    solution: 'Deadlocked ⊂ unsafe. If processes are deadlocked, no completion order exists, so the state cannot be safe. The converse fails: an unsafe state may still avoid deadlock if processes happen not to demand their maxima.',
  },
  {
    id: 'k13', exam: 'NIELIT', year: 2017, type: 'numerical', topic: 'bankers', difficulty: 'medium',
    q: 'A single-resource system has 10 units. Three processes hold 2, 3 and 1 units with maximum demands 7, 6 and 5. How many units must remain free for the state to be safe? (Enter the current Available.)',
    answer: 4, unit: 'units',
    solution: 'Allocated = 2+3+1 = 6, Available = 10 − 6 = 4. Need = (5, 3, 4). With Work = 4: P2 needs 3 ✓ → Work = 7; P3 needs 4 ✓ → Work = 8; P1 needs 5 ✓ → Work = 10. Safe sequence ⟨P2, P3, P1⟩.',
  },
  {
    id: 'k14', exam: 'GATE CS', year: 2012, type: 'mcq', topic: 'bankers', difficulty: 'hard',
    q: 'If a safe sequence exists for a given state, is it necessarily unique?',
    options: [
      'Yes, exactly one order is always safe',
      'No — several orders may be safe; the algorithm reports the first one it finds',
      'Yes, because processes are scanned in index order',
      'Only when there is a single resource type',
    ],
    answer: 1,
    solution: 'Many sequences can satisfy the condition. Scanning processes in index order makes the output deterministic, but it is just one witness that the state is safe.',
  },
  {
    id: 'k15', exam: 'GATE IT', year: 2006, type: 'numerical', topic: 'bankers', difficulty: 'hard',
    q: 'A system has 2 resource types with Available = (2, 1). Need rows are P0(1,1), P1(0,2), P2(2,0). How many processes can finish if the safety algorithm is run? (Enter the number that reach Finish = true.)',
    answer: 3, unit: 'processes',
    solution: 'Work = (2,1). P0 (1,1) ≤ (2,1) ✓ — assume Allocation P0 returns at least (1,0): Work grows. Running the algorithm: P0 finishes → Work ≥ (2,1); then P2 (2,0) ✓ → Work grows further; then P1 (0,2) ✓. All 3 finish, so the state is safe. (If no process had Need ≤ Work initially, the answer would be 0.)',
  },
  {
    id: 'k16', exam: 'GATE CS', year: 2019, type: 'mcq', topic: 'bankers', difficulty: 'medium',
    q: 'In the safety algorithm, the Work vector is initialised to:',
    options: ['The Max matrix', 'The Available vector', 'The Need matrix', 'A zero vector'],
    answer: 1,
    solution: 'Work starts as Available (what is free right now) and grows by Allocationᵢ each time a process is marked finished, simulating the release of its resources.',
  },
];

/* ═══════════════ Prevention, avoidance & detection ═══════════════ */
const STRATEGIES = [
  {
    id: 's1', exam: 'GATE CS', year: 2016, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'Under the WAIT-DIE scheme, if an older transaction requests a lock held by a younger one, then:',
    options: ['The older one waits', 'The older one is aborted', 'The younger one is aborted', 'Both are aborted'],
    answer: 0,
    solution: 'Wait-die is non-preemptive: an older (smaller timestamp) requester is allowed to wait. Only a younger requester dies and restarts, keeping its original timestamp.',
  },
  {
    id: 's2', exam: 'GATE CS', year: 2017, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'Under the WOUND-WAIT scheme, if a younger transaction requests a lock held by an older one, then:',
    options: ['The younger one wounds the older one', 'The younger one waits', 'The younger one is aborted', 'The older one restarts'],
    answer: 1,
    solution: 'Wound-wait permits young → old waits only. The younger requester simply waits; preemption happens only when an OLDER transaction requests a resource held by a younger one.',
  },
  {
    id: 's3', exam: 'UGC NET', year: 2018, type: 'mcq', topic: 'strategies', difficulty: 'hard',
    q: 'Why can neither wait-die nor wound-wait ever produce a deadlock?',
    options: [
      'Because they never allow a transaction to hold more than one lock',
      'Because waiting is permitted in only one direction of the timestamp order, so the wait-for graph stays acyclic',
      'Because they run cycle detection after every request',
      'Because aborted transactions are never restarted',
    ],
    answer: 1,
    solution: 'Wait-die allows only old → young waits; wound-wait only young → old. A cycle would need waits in both directions, which the rule forbids, so the wait-for graph can never contain one.',
  },
  {
    id: 's4', exam: 'GATE CS', year: 2010, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'A restarted transaction in wait-die / wound-wait retains its original timestamp in order to:',
    options: [
      'Reduce the number of locks it needs',
      'Prevent starvation, since it eventually becomes the oldest',
      'Allow it to preempt every other transaction',
      'Keep the wait-for graph connected',
    ],
    answer: 1,
    solution: 'If it received a fresh (larger) timestamp it would grow younger with every restart and could be aborted forever. Keeping the original timestamp makes it progressively older until it wins.',
  },
  {
    id: 's5', exam: 'ISRO CS', year: 2018, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'Which deadlock-handling strategy allows deadlocks to occur and then resolves them?',
    options: ['Prevention', 'Avoidance', 'Detection and recovery', 'The ostrich approach'],
    answer: 2,
    solution: 'Detection lets the system enter a deadlock, periodically searches the wait-for graph for a cycle, then recovers by aborting a victim or preempting its resources.',
  },
  {
    id: 's6', exam: 'GATE CS', year: 2022, type: 'mcq', topic: 'strategies', difficulty: 'hard',
    q: 'How often a deadlock detection algorithm should be invoked depends on:',
    options: [
      'Only the number of processes',
      'How often deadlocks are likely to occur and how many processes are typically affected',
      'The CPU scheduling algorithm only',
      'The size of main memory',
    ],
    answer: 1,
    solution: 'Running it on every request detects deadlocks immediately but costs CPU; running it rarely is cheap but lets more processes pile up behind the deadlock. Systems compromise — PostgreSQL waits deadlock_timeout (1 s) before checking.',
  },
  {
    id: 's7', exam: 'GATE CS', year: 2011, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'Which of the following is a recovery technique after deadlock detection?',
    options: [
      'Increasing the degree of multiprogramming',
      'Process termination or resource preemption with rollback',
      'Reducing the time quantum',
      'Compacting memory',
    ],
    answer: 1,
    solution: 'Recovery is either killing processes (all of them, or one at a time until the cycle breaks) or preempting resources from a victim and rolling it back to a safe checkpoint.',
  },
  {
    id: 's8', exam: 'UGC NET', year: 2020, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'Which factor is NOT normally used when selecting a victim for rollback?',
    options: [
      'How much work the process has already done',
      'How many resources it holds',
      'The alphabetical order of the process name',
      'How many times it has already been rolled back',
    ],
    answer: 2,
    solution: 'Victim selection minimises cost: work completed, resources held, remaining work, priority, and rollback count (to prevent starvation). The name is irrelevant.',
  },
  {
    id: 's9', exam: 'GATE CS', year: 2009, type: 'mcq', topic: 'strategies', difficulty: 'hard',
    q: 'A disadvantage of deadlock PREVENTION compared with DETECTION is:',
    options: [
      'It needs a quadratic safety check on every request',
      'It lowers device utilisation and throughput by restricting how requests may be made',
      'It cannot handle multiple resource instances',
      'It requires each process to declare a maximum claim',
    ],
    answer: 1,
    solution: 'Prevention is conservative — requesting everything up front, or obeying a global order, idles resources and can abort transactions that would never have deadlocked. Declaring a maximum claim is the requirement of avoidance, not prevention.',
  },
  {
    id: 's10', exam: 'GATE CS', year: 2008, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'Rollback to a safe state after preempting a resource requires:',
    options: ['A checkpoint of the process state', 'A larger page table', 'Round-robin scheduling', 'A longer time quantum'],
    answer: 0,
    solution: 'The process must be restarted from a recorded checkpoint, since its partially-completed work with the preempted resource cannot simply continue. Total rollback (restart from the beginning) is the simplest form.',
  },
  {
    id: 's11', exam: 'NIELIT', year: 2016, type: 'mcq', topic: 'strategies', difficulty: 'easy',
    q: 'Most general-purpose operating systems such as UNIX and Windows handle OS-level deadlocks by:',
    options: ['Running the Banker’s algorithm', 'Ignoring the problem', 'Preventing circular wait globally', 'Detecting cycles every millisecond'],
    answer: 1,
    solution: 'They use the "ostrich algorithm" — deadlocks are rare enough at the OS level that the cost of prevention or avoidance outweighs the occasional failure. Databases, where deadlocks are common, do implement detection.',
  },
  {
    id: 's12', exam: 'GATE IT', year: 2005, type: 'mcq', topic: 'strategies', difficulty: 'hard',
    q: 'Which pair correctly matches a technique with the Coffman condition it removes?',
    options: [
      'Spooling a printer — circular wait',
      'Global ordering of resource types — circular wait',
      'Requesting all resources at once — no preemption',
      'Preempting a resource — mutual exclusion',
    ],
    answer: 1,
    solution: 'A global order removes circular wait. Spooling attacks mutual exclusion (the printer becomes effectively sharable); requesting everything at once removes hold-and-wait; preemption removes the no-preemption condition.',
  },
  {
    id: 's13', exam: 'GATE CS', year: 2023, type: 'mcq', topic: 'strategies', difficulty: 'medium',
    q: 'In a distributed database, timestamp-based prevention is preferred over wait-for-graph detection mainly because:',
    options: [
      'Timestamps use less memory',
      'Each site can decide locally by comparing two timestamps, with no global graph to construct across sites',
      'Detection cannot find cycles of length greater than two',
      'Distributed systems have no deadlocks',
    ],
    answer: 1,
    solution: 'Building a global wait-for graph needs expensive message passing and can produce false "phantom" deadlocks from stale snapshots. Wait-die / wound-wait need only the two timestamps in the conflict.',
  },
  {
    id: 's14', exam: 'GATE CS', year: 2024, type: 'mcq', topic: 'strategies', difficulty: 'hard',
    q: 'A transaction is repeatedly selected as the deadlock victim and never completes. This is called, and is prevented by:',
    options: [
      'Deadlock; running detection more often',
      'Starvation; including the rollback count in the victim-selection cost',
      'Livelock; increasing the lock timeout',
      'Thrashing; adding more memory',
    ],
    answer: 1,
    solution: 'This is starvation. If selection depends only on age or lock count, the same unlucky transaction can be picked forever; counting previous rollbacks makes it progressively more expensive to abort, guaranteeing eventual completion.',
  },
];

/* ═══════════════ Synchronisation & concurrency ═══════════════ */
const SYNC = [
  {
    id: 'y1', exam: 'GATE CS', year: 2015, type: 'mcq', topic: 'sync', difficulty: 'medium',
    q: 'Two processes execute P(S); P(Q); … and P(Q); P(S); … on binary semaphores S and Q initialised to 1. This code can:',
    options: ['Never deadlock', 'Deadlock, because the semaphores are acquired in opposite orders', 'Cause starvation but not deadlock', 'Cause a race condition only'],
    answer: 1,
    solution: 'Classic inverted ordering: if the first process completes P(S) and the second completes P(Q), each then blocks on the semaphore the other holds — a two-process circular wait. Acquiring S and Q in the same order everywhere removes it.',
  },
  {
    id: 'y2', exam: 'GATE CS', year: 2013, type: 'mcq', topic: 'sync', difficulty: 'hard',
    q: 'The dining-philosophers problem with 5 philosophers each picking up the left fork then the right fork can deadlock. Which fix does NOT remove the deadlock?',
    options: [
      'Allow at most 4 philosophers to sit at the table simultaneously',
      'Make odd-numbered philosophers pick up the right fork first',
      'Require a philosopher to pick up both forks atomically',
      'Increase the thinking time of every philosopher',
    ],
    answer: 3,
    solution: 'Longer thinking only makes the deadlock less likely, never impossible — timing changes do not remove a structural circular wait. The other three each break a Coffman condition (limiting seats, breaking symmetry, removing hold-and-wait).',
  },
  {
    id: 'y3', exam: 'UGC NET', year: 2017, type: 'mcq', topic: 'sync', difficulty: 'medium',
    q: 'A binary semaphore initialised to 0 on which a process performs P(S) with no other process ever performing V(S) results in:',
    options: ['A deadlock involving one process', 'Indefinite blocking of that process', 'A busy-wait loop', 'Normal termination'],
    answer: 1,
    solution: 'The process blocks forever. Strictly this is indefinite blocking rather than classical deadlock, since there is no circular wait among a set of processes — a common exam distinction.',
  },
  {
    id: 'y4', exam: 'GATE CS', year: 2019, type: 'numerical', topic: 'sync', difficulty: 'hard',
    q: 'In the dining-philosophers problem with 5 philosophers and 5 forks, what is the maximum number of philosophers that may be seated simultaneously while guaranteeing freedom from deadlock?',
    answer: 4, unit: 'philosophers',
    solution: 'Each philosopher needs 2 forks of the 5 available. Using R ≥ n(m−1)+1 with m = 2: 5 ≥ n(1)+1 ⇒ n ≤ 4. With all 5 seated and each holding one fork, nobody can take a second — the classic deadlock.',
  },
  {
    id: 'y5', exam: 'GATE CS', year: 2021, type: 'mcq', topic: 'sync', difficulty: 'medium',
    q: 'Which condition is violated when a thread acquires mutex A then mutex B, while another acquires B then A?',
    options: ['Mutual exclusion', 'Circular wait is created', 'Bounded waiting', 'Progress'],
    answer: 1,
    solution: 'Opposite acquisition order creates a circular wait between the two threads. The standard fix is a lock hierarchy — every thread acquires locks in one globally agreed order.',
  },
  {
    id: 'y6', exam: 'ISRO CS', year: 2015, type: 'mcq', topic: 'sync', difficulty: 'easy',
    q: 'A process that holds a non-preemptible resource and blocks while requesting another satisfies which condition?',
    options: ['Mutual exclusion only', 'Hold and wait', 'Circular wait', 'Bounded waiting'],
    answer: 1,
    solution: 'Holding one resource while waiting for another is exactly the hold-and-wait condition — one of the four that must hold simultaneously for deadlock.',
  },
  {
    id: 'y7', exam: 'GATE IT', year: 2008, type: 'mcq', topic: 'sync', difficulty: 'hard',
    q: 'Priority inversion, where a high-priority task waits on a lock held by a low-priority task that is itself preempted, is best addressed by:',
    options: ['Priority inheritance', 'Round-robin scheduling', 'Increasing the time quantum', 'Deadlock detection'],
    answer: 0,
    solution: 'Priority inheritance temporarily raises the lock holder to the priority of the highest waiter so it can finish and release. Priority inversion is a liveness problem distinct from deadlock, though it is frequently examined alongside it.',
  },
  {
    id: 'y8', exam: 'GATE CS', year: 2020, type: 'mcq', topic: 'sync', difficulty: 'medium',
    q: 'Which of the following best prevents deadlock in a multithreaded application using several mutexes?',
    options: [
      'Using recursive mutexes everywhere',
      'Defining a global lock-acquisition order and obeying it in every thread',
      'Using longer critical sections',
      'Increasing the number of threads',
    ],
    answer: 1,
    solution: 'A lock hierarchy removes circular wait structurally and costs nothing at run time. `try_lock` with back-off is the alternative when a fixed order is impossible.',
  },
];

export const EXAM_QUESTIONS = [...CONDITIONS, ...RAG, ...RESOURCES, ...BANKERS, ...STRATEGIES, ...SYNC];

/** Distinct exam labels present in the bank, most frequent first. */
export const EXAMS = [...new Set(EXAM_QUESTIONS.map((q) => q.exam))].sort();
/** Distinct years, newest first. */
export const EXAM_YEARS = [...new Set(EXAM_QUESTIONS.map((q) => q.year))].sort((a, b) => b - a);


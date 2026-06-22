export type GateDifficulty = "EASY" | "MEDIUM" | "HARD";
export type GatePriority = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type GatePart = {
  name: string;
  estimatedMinutes: number;
  difficulty: GateDifficulty;
  priority: GatePriority;
};

export type GateSubtopic = {
  name: string;
  estimatedMinutes: number;
  difficulty: GateDifficulty;
  priority: GatePriority;
  parts?: GatePart[];
};

export type GateTopic = {
  name: string;
  estimatedHours: number;
  difficulty: GateDifficulty;
  priority: GatePriority;
  subtopics: GateSubtopic[];
};

export type GateSubject = {
  name: string;
  slug: string;
  defaultDays: number;
  priority: GatePriority;
  weightage: number;
  topics: GateTopic[];
};

const rawGateCseRoadmap = String.raw`
C Programming: 1920m total
  C Basics: 240m
    Introduction and Program Structure: 90m
      Program structure and main: 30m | EASY | MEDIUM
      Compilation and execution model: 20m | EASY | LOW
      Tokens, identifiers, keywords: 20m | EASY | LOW
      First worked examples: 20m | EASY | MEDIUM
    Data Types and Variables: 80m
      Primitive types and size intuition: 25m | EASY | MEDIUM
      Variables, constants, literals: 20m | EASY | MEDIUM
      Signed vs unsigned: 15m | MEDIUM | MEDIUM
      Type casting basics: 20m | MEDIUM | MEDIUM
    Input and Output: 70m
      printf/scanf basics: 25m | EASY | MEDIUM
      Format specifiers: 20m | EASY | MEDIUM
      Buffered input gotchas: 10m | MEDIUM | LOW
      Worked I/O examples: 15m | EASY | MEDIUM

  Control Flow: 210m
    Conditionals: 75m
      if/else branching: 25m | EASY | MEDIUM
      nested conditionals: 20m | EASY | MEDIUM
      switch-case and fallthrough: 30m | MEDIUM | MEDIUM
    Loops: 95m
      for loop patterns: 25m | EASY | MEDIUM
      while and do-while: 25m | EASY | MEDIUM
      break/continue: 15m | EASY | LOW
      nested loops and trace tables: 30m | MEDIUM | MEDIUM
    Control-flow practice: 40m
      dry-run questions: 20m | MEDIUM | HIGH
      loop output problems: 20m | MEDIUM | HIGH

  Functions and Recursion: 220m
    Functions: 90m
      declaration-definition-call: 30m | EASY | MEDIUM
      parameter passing and return: 25m | EASY | MEDIUM
      scope and storage classes basics: 35m | MEDIUM | MEDIUM
    Recursion: 130m
      base case and recursive case: 30m | MEDIUM | HIGH
      call stack tracing: 35m | MEDIUM | HIGH
      classic examples factorial/fibonacci: 25m | MEDIUM | MEDIUM
      recursion output questions: 40m | HARD | HIGH

  Arrays: 220m
    1D Arrays: 95m
      declaration and traversal: 25m | EASY | MEDIUM
      searching and update: 25m | EASY | MEDIUM
      insertion/deletion idea: 20m | MEDIUM | MEDIUM
      practice set: 25m | MEDIUM | HIGH
    2D Arrays: 75m
      declaration and indexing: 25m | MEDIUM | MEDIUM
      row-major intuition: 25m | MEDIUM | HIGH
      matrix-style practice: 25m | MEDIUM | HIGH
    Array Analysis: 50m
      memory layout: 20m | MEDIUM | HIGH
      complexity of common operations: 15m | MEDIUM | HIGH
      common traps: 15m | MEDIUM | HIGH

  Strings: 190m
    Representation: 45m
      char arrays and null terminator: 20m | MEDIUM | MEDIUM
      input/output patterns: 25m | MEDIUM | MEDIUM
    Library Operations: 65m
      strlen/strcpy/strcmp basics: 25m | EASY | MEDIUM
      strcat and mutation caveats: 20m | MEDIUM | MEDIUM
      worked examples: 20m | MEDIUM | HIGH
    Manual String Processing: 80m
      counting/reversal/traversal: 25m | MEDIUM | HIGH
      palindrome and frequency tasks: 25m | MEDIUM | HIGH
      practice problems: 30m | MEDIUM | HIGH

  Pointers: 300m
    Pointer Basics: 90m
      address and dereference: 30m | MEDIUM | HIGH
      pointer variables and types: 25m | MEDIUM | HIGH
      NULL and basic safety: 15m | EASY | MEDIUM
      tracing addresses: 20m | MEDIUM | HIGH
    Pointer Arithmetic: 75m
      increment/decrement semantics: 25m | HARD | HIGH
      array-pointer relationship: 25m | HARD | HIGH
      common output questions: 25m | HARD | VERY_HIGH
    Pointers with Functions and Arrays: 85m
      arrays as function arguments: 25m | MEDIUM | HIGH
      pointers to arrays basics: 20m | HARD | MEDIUM
      functions returning pointers: 20m | HARD | MEDIUM
      double pointers intro: 20m | HARD | MEDIUM
    Pointer Practice: 50m
      mixed dry-run problems: 50m | HARD | VERY_HIGH

  Structures and Unions: 150m
    Structures: 80m
      struct declaration and access: 25m | EASY | MEDIUM
      nested structures: 20m | MEDIUM | MEDIUM
      arrays of structures: 15m | MEDIUM | MEDIUM
      worked examples: 20m | MEDIUM | MEDIUM
    Unions and Memory Layout: 70m
      union semantics: 20m | MEDIUM | MEDIUM
      padding and alignment basics: 25m | MEDIUM | HIGH
      compare struct vs union questions: 25m | MEDIUM | HIGH

  GATE Output and Mixed Practice: 190m
    Operator Precedence and Expressions: 70m
      precedence table essentials: 20m | MEDIUM | HIGH
      increment/decrement traps: 25m | HARD | VERY_HIGH
      expression dry-runs: 25m | HARD | VERY_HIGH
    Undefined/Implementation-Dependent behaviour basics: 40m
      unsafe patterns to recognise: 20m | HARD | HIGH
      exam-safe interpretation: 20m | HARD | HIGH
    Mixed Practice and PYQ Drill: 80m
      recursion outputs: 25m | HARD | HIGH
      pointer outputs: 25m | HARD | VERY_HIGH
      mixed C mini-set: 30m | HARD | VERY_HIGH

  Subject Checkpoint: 200m
    Short-notes revision: 50m | MEDIUM | HIGH
    Topic-wise PYQ drill: 80m | HARD | VERY_HIGH
    Subject test: 40m | HARD | HIGH
    Mistake review: 30m | MEDIUM | HIGH


Data Structures: 3360m total
  Arrays: 420m
    1D Arrays: 130m
      representation and indexing: 25m | EASY | MEDIUM
      traversal and updates: 25m | EASY | MEDIUM
      searching patterns: 25m | EASY | HIGH
      insertion/deletion intuition: 25m | MEDIUM | MEDIUM
      practice set: 30m | MEDIUM | HIGH
    2D Arrays and Matrix Form: 120m
      row/column access: 25m | EASY | MEDIUM
      row-major layout: 30m | MEDIUM | HIGH
      matrix traversals: 30m | MEDIUM | HIGH
      matrix practice: 35m | MEDIUM | HIGH
    Complexity and Use Cases: 70m
      time complexity of operations: 20m | MEDIUM | HIGH
      contiguous memory advantages: 20m | MEDIUM | MEDIUM
      limitations and resizing intuition: 30m | MEDIUM | MEDIUM
    Array Problems and PYQ: 100m
      easy drills: 30m | MEDIUM | HIGH
      moderate drills: 40m | MEDIUM | HIGH
      PYQ patterns: 30m | HARD | VERY_HIGH

  Linked Lists: 500m
    Singly Linked List: 160m
      node structure and traversal: 35m | EASY | MEDIUM
      insertion cases: 35m | MEDIUM | HIGH
      deletion cases: 30m | MEDIUM | HIGH
      search and update: 20m | EASY | MEDIUM
      worked problems: 40m | MEDIUM | HIGH
    Doubly and Circular Lists: 130m
      DLL structure and bidirectional traversal: 35m | MEDIUM | HIGH
      DLL insertion/deletion: 35m | MEDIUM | HIGH
      circular list concepts: 25m | MEDIUM | MEDIUM
      comparison questions: 35m | MEDIUM | HIGH
    List Algorithms: 140m
      reversal: 35m | MEDIUM | VERY_HIGH
      middle/cycle detection: 35m | MEDIUM | VERY_HIGH
      merge two lists idea: 30m | MEDIUM | HIGH
      pointer dry-runs: 40m | HARD | VERY_HIGH
    Linked-list practice/PYQ: 70m
      mixed practice set: 40m | HARD | VERY_HIGH
      PYQ drill: 30m | HARD | VERY_HIGH

  Stack: 330m
    Stack Basics: 100m
      ADT and operations: 25m | EASY | MEDIUM
      array implementation: 25m | MEDIUM | HIGH
      linked-list implementation: 25m | MEDIUM | HIGH
      underflow/overflow and practice: 25m | MEDIUM | HIGH
    Expression Applications: 130m
      infix-postfix conversion: 35m | MEDIUM | VERY_HIGH
      postfix evaluation: 30m | MEDIUM | HIGH
      prefix relation basics: 20m | MEDIUM | MEDIUM
      balanced parentheses: 20m | EASY | HIGH
      recursion stack connection: 25m | MEDIUM | HIGH
    Stack practice/PYQ: 100m
      trace questions: 30m | MEDIUM | HIGH
      expression problems: 40m | HARD | VERY_HIGH
      PYQ mini-set: 30m | HARD | VERY_HIGH

  Queue: 240m
    Simple and Circular Queue: 95m
      queue ADT and operations: 25m | EASY | MEDIUM
      array implementation: 25m | MEDIUM | MEDIUM
      circular queue: 25m | MEDIUM | HIGH
      common trace questions: 20m | MEDIUM | HIGH
    Deque and Priority Queue: 80m
      deque operations: 30m | MEDIUM | MEDIUM
      priority queue intuition: 25m | MEDIUM | HIGH
      applications: 25m | MEDIUM | MEDIUM
    Queue practice/PYQ: 65m
      implementation drills: 30m | MEDIUM | HIGH
      PYQ patterns: 35m | HARD | HIGH

  Trees: 780m
    Binary Trees: 170m
      terminology and properties: 30m | EASY | MEDIUM
      traversals: 45m | MEDIUM | VERY_HIGH
      level-order idea: 20m | MEDIUM | HIGH
      practice problems: 35m | MEDIUM | HIGH
      representation basics: 40m | MEDIUM | MEDIUM
    Binary Search Trees: 170m
      BST invariant: 30m | EASY | HIGH
      search/insert/delete: 60m | MEDIUM | VERY_HIGH
      predecessor/successor: 30m | MEDIUM | HIGH
      BST practice: 50m | MEDIUM | VERY_HIGH
    AVL and Balanced Trees: 120m
      balance factor: 25m | MEDIUM | HIGH
      LL/RR/LR/RL rotations: 55m | HARD | HIGH
      balancing questions: 40m | HARD | HIGH
    Heap: 150m
      heap property and representation: 30m | MEDIUM | HIGH
      insert/delete heapify: 45m | MEDIUM | VERY_HIGH
      priority queue relation: 25m | MEDIUM | HIGH
      heap problems: 50m | MEDIUM | HIGH
    Tree drills/PYQ: 170m
      traversal questions: 40m | MEDIUM | VERY_HIGH
      BST/AVL trace questions: 60m | HARD | VERY_HIGH
      heap questions: 30m | MEDIUM | HIGH
      PYQ block: 40m | HARD | VERY_HIGH

  Hashing: 240m
    Hash Function Basics: 70m
      goals and load factor: 25m | MEDIUM | HIGH
      simple hash functions: 20m | EASY | MEDIUM
      collision intuition: 25m | MEDIUM | HIGH
    Collision Resolution: 110m
      chaining: 30m | MEDIUM | HIGH
      linear probing: 25m | MEDIUM | HIGH
      quadratic probing: 20m | MEDIUM | MEDIUM
      double hashing intro: 15m | HARD | MEDIUM
      comparison drills: 20m | HARD | HIGH
    Practice/PYQ: 60m
      construction problems: 30m | MEDIUM | HIGH
      PYQ drill: 30m | HARD | HIGH

  Graphs: 450m
    Graph Representation: 95m
      adjacency matrix: 25m | EASY | MEDIUM
      adjacency list: 25m | EASY | MEDIUM
      sparsity/density trade-offs: 20m | MEDIUM | HIGH
      representation drills: 25m | MEDIUM | HIGH
    Traversals: 180m
      BFS mechanics: 45m | MEDIUM | VERY_HIGH
      DFS mechanics: 45m | MEDIUM | VERY_HIGH
      connected components: 30m | MEDIUM | HIGH
      traversal dry-runs: 60m | HARD | VERY_HIGH
    Graph Basics Practice/PYQ: 175m
      traversal questions: 60m | HARD | VERY_HIGH
      representation conversion: 35m | MEDIUM | HIGH
      graph mini-set: 40m | HARD | HIGH
      PYQ drill: 40m | HARD | VERY_HIGH

  DS Checkpoint: 400m
    Subject revision: 90m | MEDIUM | HIGH
    Mixed DS practice: 140m | HARD | VERY_HIGH
    Subject PYQ: 100m | HARD | VERY_HIGH
    Subject test + review: 70m | HARD | HIGH


Algorithms: 2880m total
  Complexity Analysis: 240m
    Asymptotic notation: 90m
      Big-O: 25m | EASY | HIGH
      Big-Omega: 20m | MEDIUM | MEDIUM
      Big-Theta: 20m | MEDIUM | MEDIUM
      compare growth rates: 25m | MEDIUM | HIGH
    Time/Space analysis drill: 150m
      loop analysis: 40m | MEDIUM | HIGH
      nested loops: 35m | MEDIUM | HIGH
      recursive glimpses: 25m | MEDIUM | HIGH
      complexity practice set: 50m | HARD | VERY_HIGH

  Recurrences: 250m
    Techniques: 170m
      substitution: 40m | MEDIUM | HIGH
      recursion tree: 45m | MEDIUM | HIGH
      master theorem statement/use: 50m | MEDIUM | VERY_HIGH
      edge cases: 35m | HARD | HIGH
    Practice/PYQ: 80m
      recurrence drill: 50m | HARD | VERY_HIGH
      PYQ: 30m | HARD | VERY_HIGH

  Searching and Sorting: 450m
    Searching: 100m
      linear vs binary search: 25m | EASY | HIGH
      binary search conditions: 35m | MEDIUM | VERY_HIGH
      trace questions: 40m | MEDIUM | VERY_HIGH
    Sorting fundamentals: 220m
      merge sort: 55m | MEDIUM | VERY_HIGH
      quick sort: 65m | HARD | VERY_HIGH
      heap sort: 45m | MEDIUM | HIGH
      counting sort basics: 20m | MEDIUM | MEDIUM
      comparison questions: 35m | HARD | VERY_HIGH
    Sorting drill/PYQ: 130m
      recurrence + sort mixes: 50m | HARD | VERY_HIGH
      trace questions: 40m | HARD | VERY_HIGH
      PYQ: 40m | HARD | VERY_HIGH

  Divide and Conquer: 250m
    Pattern recognition: 70m
      divide/combine recurrence framing: 30m | MEDIUM | HIGH
      classic examples: 40m | MEDIUM | HIGH
    Worked algorithms: 110m
      binary search as paradigm: 20m | EASY | MEDIUM
      merge sort: 35m | MEDIUM | HIGH
      quick sort partition intuition: 30m | MEDIUM | HIGH
      median/select intro: 25m | HARD | MEDIUM
    Practice/PYQ: 70m
      paradigm identification: 30m | MEDIUM | HIGH
      mixed questions: 40m | HARD | HIGH

  Greedy Algorithms: 360m
    Strategy basics: 80m
      greedy choice intuition: 30m | MEDIUM | HIGH
      proof idea/exchange argument: 25m | HARD | HIGH
      counterexamples: 25m | HARD | HIGH
    Classic problems: 190m
      activity selection: 35m | MEDIUM | VERY_HIGH
      Huffman coding: 45m | MEDIUM | HIGH
      fractional knapsack: 35m | MEDIUM | HIGH
      job sequencing basics: 35m | MEDIUM | MEDIUM
      MST as greedy bridge: 40m | MEDIUM | VERY_HIGH
    Practice/PYQ: 90m
      proof/style questions: 30m | HARD | HIGH
      algorithm application: 30m | HARD | VERY_HIGH
      PYQ: 30m | HARD | VERY_HIGH

  Dynamic Programming: 520m
    DP foundations: 110m
      overlapping subproblems: 25m | MEDIUM | HIGH
      optimal substructure: 25m | MEDIUM | HIGH
      memoization vs tabulation: 30m | MEDIUM | HIGH
      state design basics: 30m | HARD | VERY_HIGH
    Standard problems: 290m
      0/1 knapsack: 60m | HARD | VERY_HIGH
      LCS: 60m | HARD | VERY_HIGH
      matrix chain multiplication: 60m | HARD | VERY_HIGH
      coin change intro: 35m | HARD | HIGH
      LIS intuition: 35m | HARD | HIGH
      traceback/basic reconstruction: 40m | HARD | MEDIUM
    DP practice/PYQ: 120m
      table construction drill: 40m | HARD | VERY_HIGH
      recurrence design drill: 40m | HARD | VERY_HIGH
      PYQ: 40m | HARD | VERY_HIGH

  Graph Algorithms: 620m
    Traversals and topological sort: 160m
      BFS review: 30m | MEDIUM | HIGH
      DFS review: 30m | MEDIUM | HIGH
      topo sort mechanisms: 50m | MEDIUM | VERY_HIGH
      DAG questions: 50m | HARD | HIGH
    MST: 180m
      cut property intuition: 30m | HARD | HIGH
      Kruskal: 55m | MEDIUM | VERY_HIGH
      Prim: 55m | MEDIUM | VERY_HIGH
      MST comparison/practice: 40m | HARD | VERY_HIGH
    Shortest Paths: 210m
      Dijkstra: 60m | MEDIUM | VERY_HIGH
      Bellman-Ford: 55m | MEDIUM | VERY_HIGH
      Floyd-Warshall: 55m | HARD | HIGH
      negative edges/relaxation drill: 40m | HARD | VERY_HIGH
    Graph algorithm PYQ: 70m
      mixed graph set: 40m | HARD | VERY_HIGH
      PYQ: 30m | HARD | VERY_HIGH

  NP Completeness: 190m
    Complexity classes: 80m
      P and NP: 25m | MEDIUM | HIGH
      NP-hard and NP-complete: 30m | MEDIUM | HIGH
      verification intuition: 25m | MEDIUM | HIGH
    Reductions and recognition: 110m
      reduction pattern basics: 45m | HARD | HIGH
      classic statements: 35m | HARD | MEDIUM
      exam-style recognition questions: 30m | HARD | HIGH



Discrete Mathematics: 2880m total
  Logic: 420m
    Propositional Logic: 180m
      syntax and connectives: 30m | EASY | HIGH
      truth tables: 35m | EASY | HIGH
      equivalence and implication: 35m | MEDIUM | VERY_HIGH
      normal forms basics: 35m | MEDIUM | HIGH
      practice set: 45m | MEDIUM | VERY_HIGH
    Predicate/First-order Logic: 150m
      quantifiers: 35m | MEDIUM | HIGH
      negation with quantifiers: 35m | MEDIUM | VERY_HIGH
      translation to statements: 30m | MEDIUM | HIGH
      practice: 50m | HARD | VERY_HIGH
    Logic PYQ/revision: 90m
      mixed drill: 50m | HARD | VERY_HIGH
      PYQ: 40m | HARD | VERY_HIGH

  Sets, Relations, Functions: 520m
    Sets: 110m
      operations and identities: 30m | EASY | HIGH
      power set/cartesian product: 35m | MEDIUM | HIGH
      practice: 45m | MEDIUM | HIGH
    Relations: 190m
      reflexive/symmetric/transitive: 45m | MEDIUM | VERY_HIGH
      equivalence relations: 35m | MEDIUM | HIGH
      partial orders: 35m | MEDIUM | HIGH
      closure questions: 30m | HARD | HIGH
      practice: 45m | HARD | VERY_HIGH
    Functions: 130m
      one-one, onto, bijection: 35m | MEDIUM | HIGH
      composition and inverse: 35m | MEDIUM | HIGH
      counting-based questions: 25m | HARD | HIGH
      practice: 35m | MEDIUM | HIGH
    Mixed drill: 90m
      sets-relations-functions practice: 50m | HARD | VERY_HIGH
      PYQ: 40m | HARD | VERY_HIGH

  Posets and Lattices: 300m
    Partial orders and Hasse diagrams: 140m
      comparability and chains: 40m | MEDIUM | HIGH
      Hasse diagram construction: 45m | MEDIUM | VERY_HIGH
      max/min and lub/glb: 55m | HARD | VERY_HIGH
    Lattices: 100m
      lattice properties: 35m | HARD | HIGH
      distributive/complemented basics: 30m | HARD | HIGH
      practice: 35m | HARD | HIGH
    PYQ/revision: 60m
      mixed drill: 30m | HARD | HIGH
      PYQ: 30m | HARD | HIGH

  Algebraic Structures: 230m
    Monoids/Semigroups: 80m
      binary operation and closure: 25m | MEDIUM | MEDIUM
      associativity and identity: 25m | MEDIUM | HIGH
      examples/non-examples: 30m | MEDIUM | HIGH
    Groups: 100m
      group axioms: 30m | MEDIUM | HIGH
      cyclic groups basics: 20m | HARD | MEDIUM
      examples and tests: 50m | HARD | HIGH
    Drill: 50m
      quick classification questions: 50m | HARD | HIGH

  Graph Theory: 560m
    Graph basics: 120m
      simple/multigraph/digraph ideas: 30m | EASY | MEDIUM
      degree and handshake lemma: 35m | MEDIUM | HIGH
      paths/cycles/connectivity: 55m | MEDIUM | VERY_HIGH
    Trees and spanning basics: 110m
      tree properties: 40m | MEDIUM | HIGH
      basic spanning tree questions: 35m | MEDIUM | HIGH
      counting edges/nodes drills: 35m | MEDIUM | HIGH
    Matching and Colouring: 140m
      matching intuition: 45m | HARD | HIGH
      bipartite basics: 45m | HARD | HIGH
      vertex colouring basics: 50m | HARD | HIGH
    Planarity and special drills: 80m
      planar intuition/Euler formula basics: 40m | HARD | MEDIUM
      small-planarity questions: 40m | HARD | MEDIUM
    Graph theory PYQ: 110m
      mixed set: 60m | HARD | VERY_HIGH
      PYQ: 50m | HARD | VERY_HIGH

  Combinatorics and Recurrences: 610m
    Counting: 180m
      permutations: 40m | EASY | HIGH
      combinations: 40m | EASY | HIGH
      occupancy/basic counting: 35m | MEDIUM | HIGH
      pigeonhole principle: 25m | MEDIUM | HIGH
      practice: 40m | MEDIUM | VERY_HIGH
    Inclusion-Exclusion and Generating Functions: 140m
      inclusion-exclusion basics: 50m | HARD | HIGH
      generating functions intro: 40m | HARD | MEDIUM
      quick applications: 50m | HARD | HIGH
    Recurrence relations: 190m
      linear recurrences: 50m | HARD | HIGH
      homogeneous cases: 50m | HARD | HIGH
      simple non-homogeneous cases: 40m | HARD | HIGH
      practice: 50m | HARD | VERY_HIGH
    Checkpoint/PYQ: 100m
      mixed combinatorics-recurrence set: 60m | HARD | VERY_HIGH
      PYQ: 40m | HARD | VERY_HIGH

Theory of Computation: 3360m total
  Regular Languages and Finite Automata: 820m
    DFA Fundamentals: 180m
      automaton model and acceptance: 35m | EASY | HIGH
      DFA construction: 55m | MEDIUM | VERY_HIGH
      language tracing: 45m | MEDIUM | VERY_HIGH
      practice: 45m | HARD | VERY_HIGH
    NFA and ε-NFA: 190m
      NFA intuition: 35m | MEDIUM | HIGH
      ε-transitions: 35m | MEDIUM | HIGH
      NFA to DFA conversion: 70m | HARD | VERY_HIGH
      practice: 50m | HARD | VERY_HIGH
    Regular Expressions and Equivalence: 190m
      regex syntax: 45m | MEDIUM | HIGH
      regex to FA: 55m | HARD | VERY_HIGH
      FA to regex basics: 40m | HARD | HIGH
      practice: 50m | HARD | VERY_HIGH
    Minimisation and Properties: 170m
      distinguishability: 45m | HARD | VERY_HIGH
      minimisation procedure: 65m | HARD | VERY_HIGH
      equivalence questions: 60m | HARD | VERY_HIGH
    Drill/PYQ: 90m
      mixed regular-language set: 50m | HARD | VERY_HIGH
      PYQ: 40m | HARD | VERY_HIGH

  Regular Grammar and Pumping Lemma: 330m
    Regular Grammar: 120m
      right-linear grammar: 40m | MEDIUM | HIGH
      left-linear grammar: 30m | MEDIUM | MEDIUM
      grammar-FA relation: 50m | HARD | HIGH
    Pumping lemma for regular languages: 210m
      statement and parameters: 45m | HARD | VERY_HIGH
      choosing decomposition strategy: 65m | HARD | VERY_HIGH
      proving non-regularity examples: 60m | HARD | VERY_HIGH
      PYQ drill: 40m | HARD | VERY_HIGH

  Context-Free Grammar and CFL: 760m
    CFG Basics: 190m
      variables/terminals/rules: 35m | MEDIUM | HIGH
      derivations and sentential forms: 50m | MEDIUM | VERY_HIGH
      parse trees: 45m | MEDIUM | HIGH
      ambiguity basics: 60m | HARD | VERY_HIGH
    Grammar Simplification and Normal Forms intro: 160m
      useless/unit/epsilon removal: 60m | HARD | HIGH
      CNF basics: 50m | HARD | HIGH
      GNF note: 20m | HARD | LOW
      practice: 30m | HARD | HIGH
    CFL properties and pumping lemma: 180m
      CFL closure intuition: 35m | HARD | MEDIUM
      pumping lemma for CFL: 75m | HARD | VERY_HIGH
      non-CFL proofs examples: 70m | HARD | VERY_HIGH
    CFG drill/PYQ: 230m
      derivation practice: 60m | HARD | VERY_HIGH
      ambiguity/normal-form questions: 60m | HARD | HIGH
      pumping lemma practice: 60m | HARD | VERY_HIGH
      PYQ: 50m | HARD | VERY_HIGH

  Pushdown Automata: 420m
    PDA basics: 130m
      stack-based computation model: 35m | MEDIUM | HIGH
      acceptance by final state/empty stack: 35m | MEDIUM | HIGH
      simple PDA construction: 60m | HARD | VERY_HIGH
    PDA-CFG relation: 140m
      PDA from CFG intuition: 40m | HARD | HIGH
      CFG from PDA intuition: 40m | HARD | HIGH
      comparison questions: 60m | HARD | VERY_HIGH
    Practice/PYQ: 150m
      design drills: 70m | HARD | VERY_HIGH
      acceptance tracing: 40m | HARD | HIGH
      PYQ: 40m | HARD | VERY_HIGH

  Turing Machines and Undecidability: 1030m
    Turing Machine basics: 270m
      TM model and moves: 45m | MEDIUM | HIGH
      language acceptance by TM: 60m | HARD | HIGH
      construction of simple TMs: 75m | HARD | VERY_HIGH
      decidable vs recognisable intuition: 45m | HARD | VERY_HIGH
      work-tape/state design practice: 45m | HARD | VERY_HIGH
    Decidability: 230m
      recursive vs RE languages: 60m | HARD | VERY_HIGH
      closure/basic results: 50m | HARD | HIGH
      decidability examples: 60m | HARD | HIGH
      drill: 60m | HARD | VERY_HIGH
    Undecidability and reductions: 350m
      halting problem: 75m | HARD | VERY_HIGH
      mapping reductions basics: 90m | HARD | VERY_HIGH
      standard undecidable-problem pattern: 85m | HARD | HIGH
      problem-classification drill: 100m | HARD | VERY_HIGH
    Review/PYQ: 180m
      mixed TM-undecidability set: 100m | HARD | VERY_HIGH
      PYQ: 80m | HARD | VERY_HIGH


Engineering Mathematics: 3360m total
  Discrete Mathematics bridge block: 420m
    logic quick revision: 120m | MEDIUM | HIGH
    sets/relations/functions quick revision: 140m | MEDIUM | HIGH
    combinatorics quick revision: 160m | MEDIUM | HIGH

  Linear Algebra: 840m
    Matrices and operations: 170m
      matrix ops: 40m | EASY | HIGH
      inverse and rank basics: 50m | MEDIUM | VERY_HIGH
      practice: 80m | MEDIUM | VERY_HIGH
    Determinants and linear systems: 210m
      determinant properties: 55m | MEDIUM | HIGH
      system of linear equations: 60m | MEDIUM | VERY_HIGH
      echelon intuition/basic elimination: 45m | MEDIUM | HIGH
      practice: 50m | HARD | VERY_HIGH
    Eigenvalues and Eigenvectors: 250m
      characteristic polynomial: 65m | HARD | VERY_HIGH
      eigenvector computation: 65m | HARD | VERY_HIGH
      diagonalisation intuition: 45m | HARD | HIGH
      practice: 75m | HARD | VERY_HIGH
    LU decomposition and PYQ: 210m
      LU basics: 60m | HARD | MEDIUM
      worked problems: 70m | HARD | HIGH
      PYQ set: 80m | HARD | VERY_HIGH

  Calculus: 720m
    Limits/Continuity/Differentiability: 220m
      standard limits: 60m | MEDIUM | HIGH
      continuity and differentiability tests: 70m | MEDIUM | VERY_HIGH
      practice: 90m | HARD | VERY_HIGH
    Maxima/Minima and MVT: 220m
      derivatives quick facts: 50m | MEDIUM | HIGH
      maxima/minima problems: 90m | HARD | VERY_HIGH
      mean value theorem basics: 40m | MEDIUM | MEDIUM
      practice: 40m | HARD | HIGH
    Integration: 280m
      standard integrals: 70m | MEDIUM | HIGH
      substitution/parts basics: 80m | MEDIUM | HIGH
      definite integrals intuition: 50m | MEDIUM | MEDIUM
      practice/PYQ: 80m | HARD | VERY_HIGH

  Probability and Statistics: 1020m
    Random Variables and Distributions: 340m
      RV basics: 60m | MEDIUM | HIGH
      expectation/variance basics: 70m | MEDIUM | VERY_HIGH
      Bernoulli/binomial/Poisson: 80m | MEDIUM | VERY_HIGH
      uniform/exponential/normal: 90m | MEDIUM | VERY_HIGH
      practice: 40m | HARD | HIGH
    Conditional Probability and Bayes: 220m
      sample space/events refresher: 40m | EASY | HIGH
      conditional probability: 60m | MEDIUM | VERY_HIGH
      Bayes theorem: 60m | MEDIUM | VERY_HIGH
      practice: 60m | HARD | VERY_HIGH
    Statistics: 250m
      mean/median/mode: 50m | EASY | HIGH
      variance and std dev: 70m | MEDIUM | VERY_HIGH
      descriptive-statistics drill: 50m | MEDIUM | HIGH
      practice/PYQ: 80m | HARD | VERY_HIGH
    Mixed maths review: 210m
      formula-sheet creation: 60m | MEDIUM | HIGH
      mixed problem set: 90m | HARD | VERY_HIGH
      PYQ set: 60m | HARD | VERY_HIGH



DBMS: 2880m total
  ER Model: 280m
    entities/attributes/relationships: 80m
    weak entities and cardinality: 90m
    ER diagram conversion drill: 110m

  Relational Model and Keys: 360m
    relation/tuple/domain/schema: 90m
    super/candidate/primary/foreign keys: 120m
    integrity constraints overview: 70m
    design drill: 80m

  SQL: 520m
    DDL/DML basics: 110m
    selection/projection/order/group basics: 120m
    joins: 130m
    nested queries: 80m
    aggregate/group-by/having drill: 80m

  Relational Algebra and Tuple Calculus: 380m
    RA operators basics: 120m
    joins/division/set ops: 130m
    tuple calculus basics: 60m
    translation drill: 70m

  Normalisation: 520m
    functional dependencies: 120m
    1NF/2NF/3NF: 150m
    BCNF: 90m
    decomposition and lossless/dependency preservation: 110m
    practice/PYQ: 50m

  File Organisation and Indexing: 320m
    file organisation basics: 70m
    primary/secondary index: 70m
    B-tree/B+ tree: 120m
    hashing basics: 60m

  Transactions and Concurrency Control: 500m
    ACID/schedules: 100m
    serializability: 110m
    recoverability/cascadelessness: 90m
    locking and 2PL: 100m
    timestamp ordering basics: 40m
    practice/PYQ: 60m


Digital Logic: 1680m total
  Number Systems and Arithmetic: 300m
    binary/octal/decimal/hex conversion: 80m
    signed representations and complements: 90m
    fixed/floating-point basics: 70m
    practice: 60m

  Boolean Algebra and Minimisation: 420m
    boolean laws: 110m
    de Morgan and identities: 90m
    SOP/POS forms: 80m
    K-map minimisation: 140m

  Combinational Circuits: 420m
    adders/subtractors: 100m
    mux/demux: 100m
    encoder/decoder: 80m
    comparator and design drill: 70m
    practice/PYQ: 70m

  Sequential Circuits: 420m
    latches and flip-flops: 130m
    registers: 70m
    counters: 100m
    timing/state basics: 60m
    practice/PYQ: 60m

  Revision/checkpoint: 120m
    formula/concept sheet: 30m
    mixed drill: 50m
    test review: 40m


Computer Organization and Architecture: 2880m total
  Machine Instructions and Addressing Modes: 420m
    instruction format: 100m
    addressing modes: 130m
    instruction cycle basics: 90m
    drill: 100m

  ALU, Datapath, and Control Unit: 460m
    ALU operations: 90m
    datapath flow: 120m
    control signals: 90m
    hardwired vs microprogrammed control: 90m
    practice: 70m

  Pipelining and Hazards: 620m
    pipeline basics and speedup: 130m
    data hazards: 130m
    control hazards: 110m
    forwarding/stalls: 120m
    pipeline problems/PYQ: 130m

  Memory Hierarchy: 760m
    locality and hierarchy intuition: 90m
    cache basics: 120m
    mapping techniques: 170m
    replacement/write policies: 120m
    main memory and secondary storage basics: 90m
    memory numericals/PYQ: 170m

  I/O Interface: 300m
    programmed I/O: 60m
    interrupt I/O: 100m
    DMA: 90m
    comparison drill: 50m

  Performance and Review: 320m
    CPI/MIPS/execution time basics: 120m
    mixed numericals: 120m
    checkpoint/PYQ: 80m


Operating Systems: 3360m total
  OS Basics and System Calls: 300m
    OS role/types/kernel-user mode: 120m
    system calls and traps: 100m
    drill: 80m

  Processes and Threads: 520m
    process concept and PCB: 130m
    states and transitions: 100m
    threads and multithreading basics: 120m
    context switching/IPC basics: 100m
    practice: 70m

  CPU Scheduling: 520m
    FCFS/SJF/SRTF: 160m
    priority/RR: 140m
    metrics and scheduling numericals: 150m
    PYQ: 70m

  Synchronisation: 620m
    race condition and critical section: 120m
    Peterson and software/hardware basics: 90m
    semaphores: 170m
    monitors: 90m
    synchronisation problems/PYQ: 150m

  Deadlocks: 320m
    necessary conditions: 70m
    RAG basics: 60m
    prevention/avoidance basics: 80m
    banker algorithm/drill: 110m

  Memory Management and Virtual Memory: 680m
    contiguous allocation basics: 80m
    paging: 140m
    segmentation: 110m
    virtual memory and TLB basics: 100m
    page replacement algorithms: 170m
    numericals/PYQ: 80m

  File Systems and Disk Scheduling: 400m
    file allocation and directories: 140m
    free-space basics: 60m
    disk scheduling algorithms: 140m
    review/PYQ: 60m


Computer Networks: 3360m total
  Layering and Switching Basics: 340m
    OSI/TCP-IP models: 140m
    packet/circuit/virtual-circuit switching: 120m
    drill: 80m

  Data Link Layer and Ethernet: 580m
    framing: 110m
    error detection and CRC: 140m
    flow control basics: 90m
    MAC protocols: 120m
    Ethernet bridging: 120m

  Routing and Network Layer: 940m
    shortest path and flooding: 170m
    distance vector: 130m
    link state: 130m
    IPv4 addressing and CIDR: 180m
    fragmentation: 80m
    ARP/DHCP/ICMP basics: 120m
    NAT: 50m
    practice/PYQ: 80m

  Transport Layer: 620m
    UDP basics: 80m
    TCP basics: 120m
    reliability/windowing intuition: 140m
    flow control: 100m
    congestion control: 120m
    sockets basics: 60m

  Application Layer: 520m
    DNS: 100m
    SMTP/Email: 120m
    HTTP: 130m
    FTP basics: 70m
    application-layer drill/PYQ: 100m

  Review/checkpoint: 360m
    mixed numericals: 140m
    mixed conceptual PYQ: 140m
    subject checkpoint: 80m


Compiler Design: 1680m total
  Lexical Analysis: 220m
    tokens/patterns/lexemes: 60m
    regular expressions in lexing: 70m
    lexer design basics: 50m
    drill: 40m

  Syntax Analysis: 390m
    grammar and parse tree basics: 90m
    ambiguity basics: 60m
    top-down parsing intro: 80m
    bottom-up parsing intro: 80m
    drill: 80m

  LL/LR Parsing: 420m
    FIRST/FOLLOW: 110m
    LL(1) table construction: 110m
    shift-reduce/LR basics: 110m
    parser action drills: 90m

  Syntax-directed Translation and Intermediate Code: 300m
    attributes and annotated parse tree: 90m
    three-address code: 110m
    quadruples/triples basics: 50m
    drill: 50m

  Optimisation and Runtime Environment: 250m
    common subexpression elimination: 50m
    dead code elimination: 40m
    liveness/constant propagation overview: 80m
    activation records/runtime stack: 80m

  Review/PYQ: 100m
    mixed compiler set: 60m
    PYQ: 40m



General Aptitude: 2400m total, distributed across both phases
  Quantitative Aptitude: 900m
    percentages/ratios/proportion: 240m
    time-work/speed-distance: 220m
    number system/exponents/logs/series: 220m
    DI tables/graphs: 220m
  Analytical Aptitude: 520m
    deduction/induction: 180m
    analogy and relations: 160m
    logical mini-sets: 180m
  Spatial Aptitude: 300m
    transformation of shapes: 120m
    paper folding/cutting: 90m
    patterns in 2D/3D: 90m
  GA test drills and revision: 680m
    mixed timed sets: 420m
    checkpoint and review: 260m

English: 1680m total, distributed across both phases
  Grammar: 420m
    tenses/articles/prepositions: 150m
    modifiers/conjunctions/agreement: 150m
    error spotting practice: 120m
  Vocabulary in context: 240m
    high-frequency words: 90m
    idioms and phrases: 70m
    context usage drills: 80m
  Reading and Comprehension: 420m
    passage reading strategy: 120m
    fact/inference/tone questions: 180m
    timed RC drills: 120m
  Narrative sequencing and verbal reasoning: 240m
    para arrangement: 120m
    sentence ordering and coherence: 120m
  Review and mixed verbal sets: 360m
    grammar-verbal mixed tests: 260m
    error notebook and revision: 100m
`;

const subjectDefaults: Record<string, { defaultDays: number; priority: GatePriority; weightage: number }> = {
  "C Programming": { defaultDays: 8, priority: "MEDIUM", weightage: 6 },
  "Data Structures": { defaultDays: 14, priority: "VERY_HIGH", weightage: 10 },
  Algorithms: { defaultDays: 12, priority: "VERY_HIGH", weightage: 9 },
  "Discrete Mathematics": { defaultDays: 12, priority: "HIGH", weightage: 8 },
  DBMS: { defaultDays: 12, priority: "VERY_HIGH", weightage: 8 },
  "Digital Logic": { defaultDays: 7, priority: "MEDIUM", weightage: 6 },
  "Computer Organization and Architecture": { defaultDays: 12, priority: "HIGH", weightage: 8 },
  "Operating Systems": { defaultDays: 14, priority: "VERY_HIGH", weightage: 10 },
  "Computer Networks": { defaultDays: 14, priority: "VERY_HIGH", weightage: 9 },
  "Theory of Computation": { defaultDays: 14, priority: "HIGH", weightage: 9 },
  "Compiler Design": { defaultDays: 7, priority: "MEDIUM", weightage: 6 },
  "Engineering Mathematics": { defaultDays: 14, priority: "VERY_HIGH", weightage: 15 },
  "General Aptitude": { defaultDays: 0, priority: "VERY_HIGH", weightage: 15 },
  English: { defaultDays: 0, priority: "HIGH", weightage: 0 },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferDifficulty(name: string): GateDifficulty {
  const text = name.toLowerCase();
  if (
    text.includes("proof") ||
    text.includes("undecid") ||
    text.includes("reduction") ||
    text.includes("normal form") ||
    text.includes("serializability") ||
    text.includes("pipeline") ||
    text.includes("synchronisation") ||
    text.includes("synchronization") ||
    text.includes("virtual memory") ||
    text.includes("cidr") ||
    text.includes("parsing") ||
    text.includes("eigen") ||
    text.includes("dp") ||
    text.includes("dynamic programming") ||
    text.includes("np")
  ) {
    return "HARD";
  }
  if (
    text.includes("practice") ||
    text.includes("pyq") ||
    text.includes("drill") ||
    text.includes("numerical") ||
    text.includes("problem") ||
    text.includes("construction") ||
    text.includes("conversion") ||
    text.includes("join") ||
    text.includes("transaction") ||
    text.includes("normalisation") ||
    text.includes("normalization") ||
    text.includes("cache") ||
    text.includes("routing") ||
    text.includes("tcp")
  ) {
    return "MEDIUM";
  }
  return "EASY";
}

function inferPriority(name: string): GatePriority {
  const text = name.toLowerCase();
  if (
    text.includes("pyq") ||
    text.includes("test") ||
    text.includes("checkpoint") ||
    text.includes("practice") ||
    text.includes("drill") ||
    text.includes("revision") ||
    text.includes("review") ||
    text.includes("serializability") ||
    text.includes("normalisation") ||
    text.includes("normalization") ||
    text.includes("b+ tree") ||
    text.includes("semaphore") ||
    text.includes("page replacement") ||
    text.includes("cidr") ||
    text.includes("tcp") ||
    text.includes("first/follow")
  ) {
    return "VERY_HIGH";
  }
  if (
    text.includes("basics") ||
    text.includes("overview") ||
    text.includes("intro") ||
    text.includes("intuition") ||
    text.includes("comparison")
  ) {
    return "MEDIUM";
  }
  return "HIGH";
}

function parseLeaf(value: string) {
  const [nameAndMinutes, difficulty, priority] = value.split("|").map((part) => part.trim());
  const match = nameAndMinutes.match(/^(.*): (\d+)m(?: .*)?$/);
  if (!match) {
    throw new Error(`Invalid roadmap leaf: ${value}`);
  }

  const name = match[1].trim();
  return {
    name,
    estimatedMinutes: Number(match[2]),
    difficulty: (difficulty as GateDifficulty | undefined) ?? inferDifficulty(name),
    priority: (priority as GatePriority | undefined) ?? inferPriority(name),
  };
}

function summarizeDifficulty(items: Array<{ difficulty: GateDifficulty }>): GateDifficulty {
  if (items.some((item) => item.difficulty === "HARD")) return "HARD";
  if (items.some((item) => item.difficulty === "MEDIUM")) return "MEDIUM";
  return "EASY";
}

function summarizePriority(items: Array<{ priority: GatePriority }>): GatePriority {
  const order: GatePriority[] = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];
  return items.reduce<GatePriority>((max, item) => (order.indexOf(item.priority) > order.indexOf(max) ? item.priority : max), "LOW");
}

export function flattenGateParts(subject: GateSubject) {
  return subject.topics.flatMap((topic) =>
    topic.subtopics.flatMap((subtopic) => {
      const parts = subtopic.parts?.length
        ? subtopic.parts
        : [
            {
              name: subtopic.name,
              estimatedMinutes: subtopic.estimatedMinutes,
              difficulty: subtopic.difficulty,
              priority: subtopic.priority,
            },
          ];

      return parts.map((part) => ({
        subjectName: subject.name,
        topicName: topic.name,
        subtopicName: subtopic.name,
        partName: part.name,
        estimatedMinutes: part.estimatedMinutes,
        difficulty: part.difficulty,
        priority: part.priority,
      }));
    }),
  );
}

function parseGateCseRoadmap(): GateSubject[] {
  const subjects: GateSubject[] = [];
  const subjectTargetMinutes = new Map<string, number>();
  let currentSubject: GateSubject | undefined;
  let currentTopic: GateTopic | undefined;
  let currentSubtopic: GateSubtopic | undefined;

  for (const rawLine of rawGateCseRoadmap.split("\n")) {
    if (!rawLine.trim()) continue;

    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();

    if (indent === 0) {
      const match = line.match(/^(.*): (\d+)m total/);
      if (!match) continue;

      const name = match[1].trim();
      subjectTargetMinutes.set(name, Number(match[2]));
      const defaults = subjectDefaults[name] ?? { defaultDays: 0, priority: "MEDIUM" as GatePriority, weightage: 0 };
      currentSubject = {
        name,
        slug: slugify(name),
        defaultDays: defaults.defaultDays,
        priority: defaults.priority,
        weightage: defaults.weightage,
        topics: [],
      };
      subjects.push(currentSubject);
      currentTopic = undefined;
      currentSubtopic = undefined;
      continue;
    }

    if (!currentSubject) continue;

    if (indent === 2) {
      const match = line.match(/^(.*): (\d+)m$/);
      if (!match) continue;

      currentTopic = {
        name: match[1].trim(),
        estimatedHours: Number(match[2]) / 60,
        difficulty: "EASY",
        priority: "LOW",
        subtopics: [],
      };
      currentSubject.topics.push(currentTopic);
      currentSubtopic = undefined;
      continue;
    }

    if (!currentTopic) continue;

    if (indent === 4) {
      const parsed = parseLeaf(line);
      currentSubtopic = { ...parsed, parts: [] };
      currentTopic.subtopics.push(currentSubtopic);
      continue;
    }

    if (indent === 6 && currentSubtopic) {
      currentSubtopic.parts ??= [];
      currentSubtopic.parts.push(parseLeaf(line));
    }
  }

  for (const subject of subjects) {
    const parsedMinutes = flattenGateParts(subject).reduce((total, part) => total + part.estimatedMinutes, 0);
    const targetMinutes = subjectTargetMinutes.get(subject.name) ?? parsedMinutes;
    const gapMinutes = targetMinutes - parsedMinutes;
    if (gapMinutes > 0) {
      subject.topics.push({
        name: "Subject Checkpoint",
        estimatedHours: gapMinutes / 60,
        difficulty: "HARD",
        priority: "VERY_HIGH",
        subtopics: [
          {
            name: "Mixed review and PYQ checkpoint",
            estimatedMinutes: gapMinutes,
            difficulty: "HARD",
            priority: "VERY_HIGH",
          },
        ],
      });
    }

    for (const topic of subject.topics) {
      for (const subtopic of topic.subtopics) {
        if (subtopic.parts?.length) {
          subtopic.difficulty = summarizeDifficulty(subtopic.parts);
          subtopic.priority = summarizePriority(subtopic.parts);
        } else {
          delete subtopic.parts;
        }
      }
      topic.difficulty = summarizeDifficulty(topic.subtopics);
      topic.priority = summarizePriority(topic.subtopics);
    }
  }

  return subjects;
}

export const gateCseSyllabus: GateSubject[] = parseGateCseRoadmap();
export const distributedSubjectNames: Set<string> = new Set(["General Aptitude", "English"]);

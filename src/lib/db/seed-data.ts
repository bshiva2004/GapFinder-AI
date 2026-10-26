import { chunkDocumentText } from '../rag/chunker';
import { generateLocalEmbedding } from '../rag/embeddings';
import { UserProfile } from '../types';

export const DEMO_USER: UserProfile = {
  id: 'usr-demo-judge-sphoorthy',
  email: 'judge@sphoorthy.edu',
  fullName: 'Dr. Ramesh Kumar (Hackathon Judge)',
  institution: 'Sphoorthy Engineering College',
  role: 'judge',
  isDemoUser: true,
};

export const SAMPLE_SYLLABUS_TEXT = `SPHOORTHY ENGINEERING COLLEGE
DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
COURSE SYLLABUS: DATA STRUCTURES & ALGORITHMS (CS301PC)
ACADEMIC YEAR 2025-2026 | B.TECH II YEAR I SEMESTER

COURSE OBJECTIVES:
1. Understand basic data structures including arrays, linked lists, stacks, and queues.
2. Explore non-linear data structures such as trees, binary search trees, and graphs.
3. Master algorithm design paradigms including sorting and searching techniques.
4. Analyze time and space complexity using Asymptotic notations.

UNIT I: LINEAR DATA STRUCTURES - ARRAYS AND LINKED LISTS
- Introduction to Data Structures: Primitive vs Non-primitive, Linear vs Non-linear.
- Asymptotic Notations: Big O, Omega, Theta notations and complexity analysis.
- Arrays: Single and Multi-dimensional arrays, Memory representation (Row-major and Column-major order).
- Singly Linked Lists: Node structure, Dynamic memory allocation, Insertion at beginning, middle, and end, Deletion operations, Traversal.
- Doubly Linked Lists: Two-way traversal, Node definition with prev and next pointers, Insertion and Deletion.
- Circular Linked Lists: Structure, Boundary conditions, Applications in round-robin CPU scheduling.

UNIT II: STACKS AND QUEUES
- Stacks: Abstract Data Type (ADT), LIFO principle, Array implementation and Linked List implementation.
- Stack Operations: Push, Pop, Peek, IsEmpty, IsFull, Overflow and Underflow conditions.
- Applications of Stacks: Infix to Postfix conversion, Evaluation of Postfix expressions, Balanced parenthesis verification.
- Queues: Abstract Data Type (ADT), FIFO principle, Array implementation and Linked List implementation.
- Queue Variations: Linear Queue and boundary problem, Circular Queue implementation using modulo arithmetic, Deque, Priority Queue.

UNIT III: NON-LINEAR DATA STRUCTURES - TREES
- Tree Terminology: Root, Parent, Child, Siblings, Leaf node, Depth, Height, Degree of a tree.
- Binary Trees: Types (Full, Complete, Perfect, Degenerate), Array and Pointer representations.
- Tree Traversals: In-order (LVR), Pre-order (VLR), Post-order (LRV), Level-order traversal.
- Binary Search Trees (BST): Definition, BST property, Search operation (O(h)), Insertion and Deletion of nodes.
- Balanced Trees: Introduction to AVL Trees, Balance factor calculation, Rotations (LL, RR, LR, RL) for balancing.

UNIT IV: GRAPHS AND SHORTEST PATHS
- Graph Terminology: Directed vs Undirected graphs, Weighted vs Unweighted graphs, Degree, Path, Cycle.
- Graph Representations: Adjacency Matrix (O(V^2)) and Adjacency List (O(V+E)).
- Graph Traversals: Breadth First Search (BFS) using queue, Depth First Search (DFS) using recursion or stack.
- Minimum Spanning Trees (MST): Prim's Algorithm (greedy vertex-based), Kruskal's Algorithm (greedy edge-based using Disjoint Set Union).
- Shortest Path Algorithms: Dijkstra's Algorithm for single-source shortest path with non-negative edge weights.

UNIT V: SORTING, SEARCHING AND HASHING
- Searching Techniques: Linear Search (O(n)), Binary Search on sorted arrays (O(log n)).
- Comparison Sorting Algorithms: Bubble Sort, Insertion Sort, Selection Sort.
- Advanced Sorting: Quick Sort (Partitioning, Pivot selection, O(n log n) average, O(n^2) worst case), Merge Sort (Divide and Conquer, O(n log n)).
- Hashing & Hash Tables: Hash functions (Division, Mid-square, Multiplication), Load factor.
- Collision Resolution Techniques: Separate Chaining (Open Hashing) and Open Addressing (Linear Probing, Quadratic Probing, Double Hashing).`;

export const SAMPLE_NOTES_TEXT = `SPHOORTHY ENGINEERING COLLEGE
DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
LECTURE STUDY NOTES: DATA STRUCTURES & ALGORITHMS (CS301PC)

[Document: Notes_Data_Structures_CS301PC | Page: 3 | Section: 1.1 Array Fundamentals]
An array is a linear collection of homogeneous data elements stored in contiguous memory locations. Elements are accessed in constant time O(1).
In Row-Major order for 2D array A[M][N]: Address(A[i][j]) = B + w * (i * N + j).
In Column-Major order: Address(A[i][j]) = B + w * (j * M + i).
Static arrays have fixed size, whereas dynamic arrays double capacity when full to maintain amortized O(1) push time.

[Document: Notes_Data_Structures_CS301PC | Page: 8 | Section: 1.2 Singly Linked Lists]
A Singly Linked List consists of dynamic nodes where each node has data and next pointer.
- Insertion at beginning: O(1) time.
- Insertion at end: O(n) without tail pointer, or O(1) with tail pointer.
- Deletion of key: O(n) time.
- Traversal & Search: O(n) sequential access. Random access is impossible.

[Document: Notes_Data_Structures_CS301PC | Page: 14 | Section: 1.3 Doubly and Circular Linked Lists]
A Doubly Linked List (DLL) has data, prev, and next pointers.
It allows bidirectional traversal and deletion of a known node in O(1) time because prev->next = next and next->prev = prev.
A Circular Linked List connects the last node's next pointer back to the head node. It is used in operating systems for round-robin CPU scheduling.

[Document: Notes_Data_Structures_CS301PC | Page: 22 | Section: 2.1 Stack Architecture and Operations]
A Stack operates under the LIFO (Last In First Out) principle. All operations occur at Top.
- Push(x): O(1) time. Overflow occurs when top == MAX - 1.
- Pop(): O(1) time. Underflow occurs when top == -1.
- Peek(): O(1) time.
The operating system maintains a call stack for function activations and recursive execution frames.

[Document: Notes_Data_Structures_CS301PC | Page: 28 | Section: 2.2 Expression Parsing and Evaluation]
Stacks evaluate postfix expressions: scan left to right, push operands; on encountering operator, pop two operands, apply operator, push result back. Operates in O(n) linear time.

[Document: Notes_Data_Structures_CS301PC | Page: 34 | Section: 2.3 Queue Data Structures]
Queues operate under FIFO (First In First Out) discipline. Enqueue at Rear, Dequeue at Front.
Linear Queue boundary limitation is solved by Circular Queue using modulo arithmetic:
rear = (rear + 1) % CAPACITY. Queue is full when (rear + 1) % CAPACITY == front.
Priority queues dequeue highest priority elements first, implemented efficiently with binary heaps (O(log n)).

[Document: Notes_Data_Structures_CS301PC | Page: 45 | Section: 3.1 Binary Tree Properties and Traversals]
A Binary Tree has at most two children per node.
Maximum nodes at level i is 2^i. Maximum nodes in height h tree is 2^(h+1) - 1.
Traversals:
- Pre-order (VLR)
- In-order (LVR): In-order traversal of a valid Binary Search Tree produces values in strictly sorted ascending order.
- Post-order (LRV)
- Level-order (BFS via Queue)

[Document: Notes_Data_Structures_CS301PC | Page: 52 | Section: 3.2 Binary Search Trees (BST)]
A BST satisfies: left subtree keys < node key < right subtree keys.
Average search/insert/delete is O(log n); worst case is O(n) for degenerate skewed trees.
Deletion of node with two children requires replacing key with in-order successor or in-order predecessor.

[Document: Notes_Data_Structures_CS301PC | Page: 61 | Section: 3.3 AVL Balanced Trees]
An AVL Tree is self-balancing BST where Balance Factor BF = Height(Left) - Height(Right) must be in {-1, 0, +1}.
Rotations for balancing:
- LL (Single Right Rotation)
- RR (Single Left Rotation)
- LR (Left-Right Double Rotation)
- RL (Right-Left Double Rotation)
Guarantees strictly worst-case O(log n) performance.

[Document: Notes_Data_Structures_CS301PC | Page: 72 | Section: 4.1 Graph Representations and Traversals]
Graphs G = (V, E).
Adjacency Matrix: O(V^2) space, fast for dense graphs.
Adjacency List: O(V + E) space, preferred for sparse graphs.
BFS uses queue (O(V+E)), finds shortest path in unweighted graphs.
DFS uses stack or recursion (O(V+E)), used in cycle detection and topological sorting.

[Document: Notes_Data_Structures_CS301PC | Page: 80 | Section: 4.2 Minimum Spanning Trees (MST)]
For connected undirected graph with V vertices, MST has exactly V - 1 edges.
Prim's Algorithm: Greedy vertex-based algorithm, starts from root and grows tree by picking minimum weight edge. O(E log V).
Kruskal's Algorithm: Greedy edge-based algorithm, sorts edges and adds them avoiding cycles using Disjoint Set Union (DSU). O(E log E).

[Document: Notes_Data_Structures_CS301PC | Page: 89 | Section: 4.3 Dijkstra's Shortest Path Algorithm]
Dijkstra's Algorithm finds Single Source Shortest Path on non-negative weighted graphs in O((V+E) log V) with min-heap.
Limitation: Fails on graphs containing negative edge weights because greedy choices assume distance cannot decrease after visit.

[Document: Notes_Data_Structures_CS301PC | Page: 98 | Section: 5.1 Sorting Algorithms Comparison]
Bubble Sort: O(n^2), O(1) space, Stable.
Insertion Sort: O(n^2) worst, O(n) best for nearly sorted, Stable.
Merge Sort: Divide and conquer, strictly O(n log n) in all cases, O(n) auxiliary space, Stable.
Quick Sort: Partitioning around pivot, O(n log n) average, O(n^2) worst case on bad pivot. In-place.

[Document: Notes_Data_Structures_CS301PC | Page: 110 | Section: 5.2 Hashing and Collision Resolution]
Separate Chaining: Array of linked lists, open hashing.
Open Addressing:
- Linear Probing suffers from Primary Clustering.
- Quadratic Probing eliminates primary clustering.
- Double Hashing uses second hash function, minimizing clustering.`;

export function getInitialSeedData() {
  const syllabusDocId = 'doc-seed-syllabus-cs301pc';
  const notesDocId = 'doc-seed-notes-cs301pc';

  const documents = [
    {
      id: syllabusDocId,
      userId: DEMO_USER.id,
      title: 'Course Syllabus: Data Structures & Algorithms (CS301PC)',
      category: 'syllabus',
      fileName: 'syllabus-data-structures-cs301pc.txt',
      fileSize: SAMPLE_SYLLABUS_TEXT.length,
      fileType: 'text/plain',
      status: 'ready',
      pageCount: 3,
      chunkCount: 3,
      contentSummary: 'Official Sphoorthy Engineering College syllabus covering Units I to V.',
      createdAt: '2026-10-25T09:00:00Z',
      updatedAt: '2026-10-25T09:00:00Z',
    },
    {
      id: notesDocId,
      userId: DEMO_USER.id,
      title: 'Lecture Study Notes: CS301PC Data Structures',
      category: 'notes',
      fileName: 'notes-data-structures-cs301pc.txt',
      fileSize: SAMPLE_NOTES_TEXT.length,
      fileType: 'text/plain',
      status: 'ready',
      pageCount: 12,
      chunkCount: 14,
      contentSummary: 'Comprehensive lecture notes covering linear structures, stacks, queues, trees, graphs, sorting, and hashing.',
      createdAt: '2026-10-25T09:15:00Z',
      updatedAt: '2026-10-25T09:15:00Z',
    },
  ];

  const syllabusChunks = chunkDocumentText({
    documentId: syllabusDocId,
    documentTitle: documents[0].title,
    text: SAMPLE_SYLLABUS_TEXT,
  });

  const notesChunks = chunkDocumentText({
    documentId: notesDocId,
    documentTitle: documents[1].title,
    text: SAMPLE_NOTES_TEXT,
  });

  const allChunks = [...syllabusChunks, ...notesChunks].map((c) => ({
    ...c,
    embedding: generateLocalEmbedding(c.content),
  }));

  const topics = [
    {
      id: 'top-1',
      userId: DEMO_USER.id,
      documentId: syllabusDocId,
      name: 'Linear Data Structures - Arrays & Linked Lists',
      unit: 'Unit I',
      subtopics: ['Row-Major and Column-Major Mapping', 'Singly Linked Lists', 'Doubly Linked Lists', 'Circular Linked Lists'],
      sourcePassageExcerpt: 'Static and dynamic memory representation, node structure, pointer updates.',
      sourceDocTitle: documents[1].title,
      sourcePage: 3,
      createdAt: '2026-10-25T09:20:00Z',
    },
    {
      id: 'top-2',
      userId: DEMO_USER.id,
      documentId: syllabusDocId,
      name: 'Stacks and Queues',
      unit: 'Unit II',
      subtopics: ['LIFO Stack Operations', 'Infix to Postfix Conversion', 'Circular Queue Modulo Arithmetic', 'Priority Queues'],
      sourcePassageExcerpt: 'A Stack is a linear data structure that operates under the LIFO principle. Circular Queue uses modulo arithmetic.',
      sourceDocTitle: documents[1].title,
      sourcePage: 22,
      createdAt: '2026-10-25T09:20:00Z',
    },
    {
      id: 'top-3',
      userId: DEMO_USER.id,
      documentId: syllabusDocId,
      name: 'Non-Linear Structures - Trees & AVL',
      unit: 'Unit III',
      subtopics: ['Binary Tree Traversals (In/Pre/Post)', 'Binary Search Trees (BST)', 'AVL Self-Balancing Rotations', 'Balance Factor'],
      sourcePassageExcerpt: 'In-order traversal of BST gives sorted order. AVL balance factor must be in {-1, 0, +1}.',
      sourceDocTitle: documents[1].title,
      sourcePage: 45,
      createdAt: '2026-10-25T09:20:00Z',
    },
    {
      id: 'top-4',
      userId: DEMO_USER.id,
      documentId: syllabusDocId,
      name: 'Graphs and Shortest Paths',
      unit: 'Unit IV',
      subtopics: ['Adjacency Matrix vs List', 'BFS & DFS Traversals', 'Prim and Kruskal MST', "Dijkstra's Algorithm"],
      sourcePassageExcerpt: "Dijkstra solves single-source shortest path for non-negative edge weights in O((V+E) log V).",
      sourceDocTitle: documents[1].title,
      sourcePage: 72,
      createdAt: '2026-10-25T09:20:00Z',
    },
    {
      id: 'top-5',
      userId: DEMO_USER.id,
      documentId: syllabusDocId,
      name: 'Sorting, Searching and Hashing',
      unit: 'Unit V',
      subtopics: ['Binary Search (O(log n))', 'Merge Sort (O(n log n))', 'Quick Sort Partitioning', 'Collision Resolution & Probing'],
      sourcePassageExcerpt: 'Linear Probing suffers from Primary Clustering. Merge Sort guarantees O(n log n) with O(n) space.',
      sourceDocTitle: documents[1].title,
      sourcePage: 98,
      createdAt: '2026-10-25T09:20:00Z',
    },
  ];

  return {
    user: DEMO_USER,
    documents,
    chunks: allChunks,
    topics,
  };
}

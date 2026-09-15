export type Category = 'all' | 'foundations' | 'algorithms' | 'data-structures' | 'contest';
export type Illustration = 'blocks' | 'tree' | 'orbit' | 'steps' | 'grid' | 'trophy';
export interface Product {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'all'>;
  level: string;
  problemCount: number;
  duration: string;
  illustration: Illustration;
  tone: 'mint' | 'lavender' | 'sand';
  badge?: string;
  topics: readonly string[];
}

export const filters: readonly { id: Category; label: string }[] = [
  { id: 'all', label: 'All collections' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'data-structures', label: 'Data structures' },
  { id: 'contest', label: 'Contest practice' },
];

// Illustrative collections, separate from the user's real queue and progress.
export const products: readonly Product[] = [
  { id: 'foundations', title: 'Small steps. Solid foundations.', description: 'Build the instincts that make every next problem a little easier.', category: 'foundations', level: '800–1200', problemCount: 24, duration: '15–30 min / session', illustration: 'blocks', tone: 'mint', badge: 'Start here', topics: ['implementation', 'math', 'brute force'] },
  { id: 'graphs', title: 'Find your way through graphs.', description: 'From your first traversal to seeing the shortest path forward.', category: 'algorithms', level: '1200–1800', problemCount: 18, duration: '30–45 min / session', illustration: 'tree', tone: 'lavender', badge: 'Popular', topics: ['graphs', 'dfs and similar', 'shortest paths'] },
  { id: 'dynamic', title: 'Think in smaller problems.', description: 'Make dynamic programming click, one state at a time.', category: 'algorithms', level: '1400–2000', problemCount: 20, duration: '30–60 min / session', illustration: 'steps', tone: 'sand', topics: ['dp', 'combinatorics'] },
  { id: 'structures', title: 'A place for every piece.', description: 'Meet the data structures that turn a good idea into a fast solution.', category: 'data-structures', level: '1200–1900', problemCount: 16, duration: '25–45 min / session', illustration: 'grid', tone: 'sand', topics: ['data structures', 'trees'] },
  { id: 'search', title: 'Less searching. More finding.', description: 'Discover the patterns behind binary search and two pointers.', category: 'foundations', level: '1000–1600', problemCount: 15, duration: '20–40 min / session', illustration: 'orbit', tone: 'mint', topics: ['binary search', 'two pointers', 'sortings'] },
  { id: 'contest', title: 'Ready for your next round.', description: 'Bring it all together with focused, contest-style practice.', category: 'contest', level: '1400–2200', problemCount: 12, duration: '60–90 min / session', illustration: 'trophy', tone: 'lavender', topics: ['greedy', 'math', 'constructive algorithms'] },
];

export function filterProducts(items: readonly Product[], category: Category) {
  return category === 'all' ? items : items.filter(item => item.category === category);
}

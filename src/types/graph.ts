export type NodeState = 'unvisited' | 'in-frontier' | 'current' | 'visited';

export type EdgeState = 'unvisited' | 'examining' | 'tree' | 'back' | 'cross' | 'forward';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
}

export type AlgorithmType = 'bfs' | 'dfs';

export interface TraversalStep {
  stepIndex: number;
  title: string;
  description: string;
  currentNodeId: string | null;
  examiningEdgeId: string | null;
  
  // Data structure state
  dataStructureType: 'Queue' | 'Stack';
  dataStructureItems: string[]; // Node IDs in queue or stack
  
  // Sets and ordering
  visitedOrder: string[]; // Node IDs in order of visit completion
  visitedSet: Record<string, boolean>;
  frontierSet: Record<string, boolean>; // Node IDs currently in queue/stack
  
  // Graph visual states
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, EdgeState>;
  
  // Algorithm tracking
  codeLine: number; // Line number in pseudocode to highlight
  explanation: string;
  
  // Traversal tree parents
  parentMap: Record<string, string | null>; // childId -> parentId
}

export interface TraversalResult {
  algorithm: AlgorithmType;
  startNodeId: string;
  steps: TraversalStep[];
  traversalOrder: string[];
  totalSteps: number;
}

export interface PresetGraph {
  id: string;
  name: string;
  description: string;
  isDirected: boolean;
  graph: GraphData;
}

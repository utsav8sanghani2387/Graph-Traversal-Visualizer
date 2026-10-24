import { describe, it, expect } from 'vitest';
import { runBFS } from '../algorithms/bfs';
import { runDFS } from '../algorithms/dfs';
import { PRESET_GRAPHS } from '../utils/presets';
import { parseMatrixText, matrixToGraph, graphToMatrix } from '../utils/matrix';

describe('Graph Traversal Algorithms', () => {
  const binaryTreePreset = PRESET_GRAPHS.find(g => g.id === 'binary-tree')!;
  const complexPreset = PRESET_GRAPHS.find(g => g.id === 'complex-network')!;

  it('runs BFS on binary tree and visits level by level', () => {
    const result = runBFS(binaryTreePreset.graph, 'tree_1');
    expect(result.algorithm).toBe('bfs');
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.traversalOrder[0]).toBe('tree_1');
    // In binary tree with 1 -> 2, 3; 2 -> 4, 5; 3 -> 6, 7
    // BFS visited order must have children of root before grandchildren:
    const idx2 = result.traversalOrder.indexOf('tree_2');
    const idx3 = result.traversalOrder.indexOf('tree_3');
    const idx4 = result.traversalOrder.indexOf('tree_4');
    const idx7 = result.traversalOrder.indexOf('tree_7');
    
    expect(idx2).toBeLessThan(idx4);
    expect(idx3).toBeLessThan(idx7);
    expect(result.traversalOrder.length).toBe(7);
  });

  it('runs DFS on binary tree and visits branch depth first', () => {
    const result = runDFS(binaryTreePreset.graph, 'tree_1');
    expect(result.algorithm).toBe('dfs');
    expect(result.traversalOrder[0]).toBe('tree_1');
    // In pre-order DFS with 1->2->4, 4 should be visited before 3
    const idx4 = result.traversalOrder.indexOf('tree_4');
    const idx3 = result.traversalOrder.indexOf('tree_3');
    expect(idx4).toBeLessThan(idx3);
    expect(result.traversalOrder.length).toBe(7);
  });

  it('ensures at most one node is marked current in any traversal step', () => {
    const result = runDFS(binaryTreePreset.graph, 'tree_1');
    for (const step of result.steps) {
      const currentNodes = Object.entries(step.nodeStates).filter(([, state]) => state === 'current');
      expect(currentNodes.length).toBeLessThanOrEqual(1);
    }
  });

  it('handles complex network with cycles and cross edges in BFS and DFS', () => {
    const bfsRes = runBFS(complexPreset.graph, 'node_A');
    const dfsRes = runDFS(complexPreset.graph, 'node_A');

    expect(bfsRes.traversalOrder.length).toBe(10);
    expect(dfsRes.traversalOrder.length).toBe(10);

    // Check that every step has valid data structures
    for (const step of bfsRes.steps) {
      expect(step.dataStructureType).toBe('Queue');
      expect(Array.isArray(step.dataStructureItems)).toBe(true);
    }

    for (const step of dfsRes.steps) {
      expect(step.dataStructureType).toBe('Stack');
      expect(Array.isArray(step.dataStructureItems)).toBe(true);
    }
  });

  it('handles single node graph without crashing', () => {
    const singleGraph = {
      isDirected: false,
      nodes: [{ id: 'n1', label: 'Solo', x: 100, y: 100 }],
      edges: []
    };
    const bfs = runBFS(singleGraph, 'n1');
    expect(bfs.traversalOrder).toEqual(['n1']);

    const dfs = runDFS(singleGraph, 'n1');
    expect(dfs.traversalOrder).toEqual(['n1']);
  });

  it('handles non-existent start node gracefully', () => {
    const singleGraph = {
      isDirected: false,
      nodes: [{ id: 'n1', label: 'Solo', x: 100, y: 100 }],
      edges: []
    };
    const bfs = runBFS(singleGraph, 'invalid_id');
    expect(bfs.steps.length).toBe(0);
    expect(bfs.traversalOrder.length).toBe(0);
  });
  it('handles disconnected graphs correctly', () => {
    const disconnected = PRESET_GRAPHS.find(g => g.id === 'disconnected-clusters')!;
    const bfs = runBFS(disconnected.graph, 'isc_1');
    // Only Island A nodes should be visited (4 nodes)
    expect(bfs.traversalOrder.length).toBe(4);
    expect(bfs.traversalOrder).toContain('isc_1');
    expect(bfs.traversalOrder).toContain('isc_2');
    expect(bfs.traversalOrder).toContain('isc_3');
    expect(bfs.traversalOrder).toContain('isc_4');
    expect(bfs.traversalOrder).not.toContain('isc_5');

    const dfs = runDFS(disconnected.graph, 'isc_1');
    expect(dfs.traversalOrder.length).toBe(4);
    expect(dfs.traversalOrder).not.toContain('isc_6');

    // With traverseAllComponents = true, all 7 nodes across both islands must be visited
    const bfsFull = runBFS(disconnected.graph, 'isc_1', true);
    expect(bfsFull.traversalOrder.length).toBe(7);
    expect(bfsFull.traversalOrder).toContain('isc_5');
    expect(bfsFull.traversalOrder).toContain('isc_6');
    expect(bfsFull.traversalOrder).toContain('isc_7');

    const dfsFull = runDFS(disconnected.graph, 'isc_1', true);
    expect(dfsFull.traversalOrder.length).toBe(7);
    expect(dfsFull.traversalOrder).toContain('isc_5');
    expect(dfsFull.traversalOrder).toContain('isc_6');
    expect(dfsFull.traversalOrder).toContain('isc_7');
  });

  it('handles complete graph K4 with dense connections', () => {
    const k4Matrix = [
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 0, 1],
      [1, 1, 1, 0],
    ];
    const k4Graph = matrixToGraph(k4Matrix, ['A', 'B', 'C', 'D'], false);
    const bfs = runBFS(k4Graph, k4Graph.nodes[0].id);
    expect(bfs.traversalOrder.length).toBe(4);
    // Tree edges must be exactly 3 (V - 1)
    const treeEdgesInFinal = Object.values(bfs.steps[bfs.steps.length - 1].edgeStates).filter(s => s === 'tree');
    expect(treeEdgesInFinal.length).toBe(3);

    const dfs = runDFS(k4Graph, k4Graph.nodes[0].id);
    expect(dfs.traversalOrder.length).toBe(4);
    const dfsTreeEdges = Object.values(dfs.steps[dfs.steps.length - 1].edgeStates).filter(s => s === 'tree');
    expect(dfsTreeEdges.length).toBe(3);
  });
});

describe('Adjacency Matrix Utilities', () => {
  it('parses valid square matrix text (space-separated)', () => {
    const text = `
      0 1 0
      1 0 1
      0 1 0
    `;
    const res = parseMatrixText(text);
    expect(res.success).toBe(true);
    expect(res.matrix).toEqual([
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ]);
  });

  it('parses matrix with comma-separated and irregular spaces', () => {
    const text = `
      0,  1,  1
      1, 0 ,0
      1,0, 0
    `;
    const res = parseMatrixText(text);
    expect(res.success).toBe(true);
    expect(res.matrix?.length).toBe(3);
    expect(res.matrix?.[0]).toEqual([0, 1, 1]);
  });

  it('parses matrix with headers / custom node labels', () => {
    const text = `
      Alpha Beta Gamma
      0 1 1
      1 0 0
      1 0 0
    `;
    const res = parseMatrixText(text);
    expect(res.success).toBe(true);
    expect(res.labels).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(res.matrix?.length).toBe(3);
  });

  it('parses JSON format matrix', () => {
    const text = `[[0, 1], [1, 0]]`;
    const res = parseMatrixText(text);
    expect(res.success).toBe(true);
    expect(res.matrix).toEqual([
      [0, 1],
      [1, 0]
    ]);
  });

  it('parses markdown table formatted adjacency matrix', () => {
    const md = `
      |   | A | B |
      |---|---|---|
      | A | 0 | 1 |
      | B | 1 | 0 |
    `;
    const res = parseMatrixText(md);
    expect(res.success).toBe(true);
    expect(res.labels).toEqual(['A', 'B']);
    expect(res.matrix).toEqual([
      [0, 1],
      [1, 0]
    ]);
  });

  it('parses table with corner symbol header', () => {
    const text = `
      \\ A B C
      A 0 1 1
      B 1 0 0
      C 1 0 0
    `;
    const res = parseMatrixText(text);
    expect(res.success).toBe(true);
    expect(res.labels).toEqual(['A', 'B', 'C']);
    expect(res.matrix?.length).toBe(3);
  });

  it('rejects non-square matrix text with meaningful error', () => {
    const text = `
      0 1 0
      1 0 1
    `;
    const res = parseMatrixText(text);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Matrix is not square');
  });

  it('converts matrix to graph and back to matrix accurately', () => {
    const originalMatrix = [
      [0, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ];
    const graph = matrixToGraph(originalMatrix, ['A', 'B', 'C'], false);
    expect(graph.nodes.length).toBe(3);
    expect(graph.edges.length).toBe(2); // undirected

    const { matrix } = graphToMatrix(graph);
    expect(matrix).toEqual(originalMatrix);
  });
});

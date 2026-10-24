import { GraphData, TraversalResult, TraversalStep, NodeState, EdgeState } from '../types/graph';

export const DFS_PSEUDOCODE = [
  "DFS(Graph, startNode):",
  "  create a Call Stack S",
  "  DFS_Visit(startNode):",
  "    push u to S, mark u visited",
  "    for each neighbor v of u:",
  "      if v is not visited:",
  "        mark edge (u, v) as Tree Edge",
  "        DFS_Visit(v)",
  "      else if v is on Stack:",
  "        mark edge (u, v) as Back Edge (Cycle)",
  "    pop u from S (backtrack)"
];

export function runDFS(graph: GraphData, startNodeId: string, traverseAllComponents: boolean = false): TraversalResult {
  const steps: TraversalStep[] = [];
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));

  if (!nodeMap.has(startNodeId)) {
    return {
      algorithm: 'dfs',
      startNodeId,
      steps: [],
      traversalOrder: [],
      totalSteps: 0,
    };
  }

  // Build adjacency list
  const adj = new Map<string, { neighborId: string; edgeId: string }[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of graph.edges) {
    adj.get(edge.source)?.push({ neighborId: edge.target, edgeId: edge.id });
    if (!graph.isDirected) {
      adj.get(edge.target)?.push({ neighborId: edge.source, edgeId: edge.id });
    }
  }

  // Sort neighbors deterministically
  for (const [nodeId, neighbors] of adj.entries()) {
    neighbors.sort((a, b) => {
      const labelA = nodeMap.get(a.neighborId)?.label || a.neighborId;
      const labelB = nodeMap.get(b.neighborId)?.label || b.neighborId;
      return labelA.localeCompare(labelB);
    });
  }

  // State trackers
  const nodeStates: Record<string, NodeState> = {};
  for (const node of graph.nodes) {
    nodeStates[node.id] = 'unvisited';
  }

  const edgeStates: Record<string, EdgeState> = {};
  for (const edge of graph.edges) {
    edgeStates[edge.id] = 'unvisited';
  }

  const visitedSet: Record<string, boolean> = {};
  const frontierSet: Record<string, boolean> = {}; // Nodes currently on the call stack
  const visitedOrder: string[] = [];
  const parentMap: Record<string, string | null> = {};
  for (const node of graph.nodes) {
    parentMap[node.id] = null;
  }

  const callStack: string[] = [];
  const startLabel = nodeMap.get(startNodeId)?.label || startNodeId;

  // Step 0: Initial state before start
  steps.push({
    stepIndex: 0,
    title: `Initialize DFS from Node ${startLabel}`,
    description: `Ready to begin Depth-First Search. Call stack is initialized.`,
    currentNodeId: null,
    examiningEdgeId: null,
    dataStructureType: 'Stack',
    dataStructureItems: [],
    visitedOrder: [],
    visitedSet: { ...visitedSet },
    frontierSet: { ...frontierSet },
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    codeLine: 2,
    explanation: `Call Stack created. Starting recursive traversal at root ${startLabel}.`,
    parentMap: { ...parentMap },
  });

  function dfsVisit(u: string, parentOfU: string | null) {
    const uLabel = nodeMap.get(u)?.label || u;

    // Push to stack and mark as active current
    callStack.push(u);
    frontierSet[u] = true;
    visitedSet[u] = true;
    visitedOrder.push(u);
    nodeStates[u] = 'current';

    steps.push({
      stepIndex: steps.length,
      title: `Visit Node ${uLabel} (Push to Stack)`,
      description: `Entering DFS frame for node "${uLabel}". Pushed to Call Stack.`,
      currentNodeId: u,
      examiningEdgeId: null,
      dataStructureType: 'Stack',
      dataStructureItems: [...callStack],
      visitedOrder: [...visitedOrder],
      visitedSet: { ...visitedSet },
      frontierSet: { ...frontierSet },
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      codeLine: 4,
      explanation: `DFS_Visit(${uLabel}). Stack depth: ${callStack.length}. Active stack: [${callStack.map(id => nodeMap.get(id)?.label).join(' → ')}]`,
      parentMap: { ...parentMap },
    });

    const neighbors = adj.get(u) || [];

    for (const { neighborId: v, edgeId } of neighbors) {
      // In undirected graph, don't immediately treat edge back to immediate parent as cycle
      if (!graph.isDirected && v === parentOfU) {
        continue;
      }

      const vLabel = nodeMap.get(v)?.label || v;

      // Inspecting edge (u, v)
      const inspectingEdgeStates = { ...edgeStates, [edgeId]: 'examining' as EdgeState };
      steps.push({
        stepIndex: steps.length,
        title: `Examine Edge (${uLabel} → ${vLabel})`,
        description: `Checking connection from "${uLabel}" to neighbor "${vLabel}".`,
        currentNodeId: u,
        examiningEdgeId: edgeId,
        dataStructureType: 'Stack',
        dataStructureItems: [...callStack],
        visitedOrder: [...visitedOrder],
        visitedSet: { ...visitedSet },
        frontierSet: { ...frontierSet },
        nodeStates: { ...nodeStates },
        edgeStates: inspectingEdgeStates,
        codeLine: 5,
        explanation: `Checking neighbor ${vLabel}. Visited? ${visitedSet[v] ? 'Yes' : 'No'}. On Stack? ${frontierSet[v] ? 'Yes' : 'No'}.`,
        parentMap: { ...parentMap },
      });

      if (!visitedSet[v]) {
        // Unvisited: tree edge, recurse deeper!
        parentMap[v] = u;
        edgeStates[edgeId] = 'tree';

        steps.push({
          stepIndex: steps.length,
          title: `Traverse Tree Edge (${uLabel} → ${vLabel})`,
          description: `Node "${vLabel}" is unvisited. Marking (${uLabel} → ${vLabel}) as a Tree Edge and diving deeper.`,
          currentNodeId: u,
          examiningEdgeId: edgeId,
          dataStructureType: 'Stack',
          dataStructureItems: [...callStack],
          visitedOrder: [...visitedOrder],
          visitedSet: { ...visitedSet },
          frontierSet: { ...frontierSet },
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          codeLine: 7,
          explanation: `Recurse into ${vLabel} via Tree Edge.`,
          parentMap: { ...parentMap },
        });

        // Set u to in-frontier (active ancestor on stack) while visiting descendant v
        nodeStates[u] = 'in-frontier';

        dfsVisit(v, u);

        // Resumed u after returning from recursion
        nodeStates[u] = 'current';
        steps.push({
          stepIndex: steps.length,
          title: `Return to Node ${uLabel}`,
          description: `Backtracked from child "${vLabel}" back to parent node "${uLabel}". Continuing remaining neighbors.`,
          currentNodeId: u,
          examiningEdgeId: null,
          dataStructureType: 'Stack',
          dataStructureItems: [...callStack],
          visitedOrder: [...visitedOrder],
          visitedSet: { ...visitedSet },
          frontierSet: { ...frontierSet },
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          codeLine: 5,
          explanation: `Resuming exploration of ${uLabel}'s neighbors.`,
          parentMap: { ...parentMap },
        });
      } else if (frontierSet[v]) {
        // Node v is currently on stack -> Back Edge (Cycle detected in directed graph or cycle in undirected)
        edgeStates[edgeId] = 'back';
        steps.push({
          stepIndex: steps.length,
          title: `Cycle / Back Edge Detected (${uLabel} → ${vLabel})`,
          description: `Node "${vLabel}" is currently active on the Call Stack! (${uLabel} → ${vLabel}) is a Back Edge (cycle).`,
          currentNodeId: u,
          examiningEdgeId: edgeId,
          dataStructureType: 'Stack',
          dataStructureItems: [...callStack],
          visitedOrder: [...visitedOrder],
          visitedSet: { ...visitedSet },
          frontierSet: { ...frontierSet },
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          codeLine: 10,
          explanation: `Cycle detected! ${vLabel} is an ancestor in the active DFS path.`,
          parentMap: { ...parentMap },
        });
      } else {
        // Node v was already visited and finished
        if (edgeStates[edgeId] !== 'tree') {
          edgeStates[edgeId] = 'cross';
        }
        steps.push({
          stepIndex: steps.length,
          title: `Cross / Forward Edge (${uLabel} → ${vLabel})`,
          description: `Node "${vLabel}" was already visited and completed in an earlier branch.`,
          currentNodeId: u,
          examiningEdgeId: edgeId,
          dataStructureType: 'Stack',
          dataStructureItems: [...callStack],
          visitedOrder: [...visitedOrder],
          visitedSet: { ...visitedSet },
          frontierSet: { ...frontierSet },
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          codeLine: 8,
          explanation: `${vLabel} already finished. Skipping recursion.`,
          parentMap: { ...parentMap },
        });
      }
    }

    // Done exploring neighbors: pop from stack and backtrack
    callStack.pop();
    delete frontierSet[u];
    nodeStates[u] = 'visited';

    steps.push({
      stepIndex: steps.length,
      title: `Pop Node ${uLabel} (Backtrack)`,
      description: `All outgoing connections of "${uLabel}" have been explored. Popping from Call Stack.`,
      currentNodeId: u,
      examiningEdgeId: null,
      dataStructureType: 'Stack',
      dataStructureItems: [...callStack],
      visitedOrder: [...visitedOrder],
      visitedSet: { ...visitedSet },
      frontierSet: { ...frontierSet },
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      codeLine: 11,
      explanation: `Finished DFS_Visit(${uLabel}). Stack depth now: ${callStack.length}.`,
      parentMap: { ...parentMap },
    });
  }

  // Launch DFS from start node
  dfsVisit(startNodeId, null);

  // If traverseAllComponents is enabled, discover unreachable components
  if (traverseAllComponents) {
    const remainingNodes = graph.nodes
      .filter(n => !visitedSet[n.id])
      .sort((a, b) => a.label.localeCompare(b.label));

    for (const remNode of remainingNodes) {
      if (!visitedSet[remNode.id]) {
        steps.push({
          stepIndex: steps.length,
          title: `Discover Unvisited Component at Node ${remNode.label}`,
          description: `Node "${remNode.label}" is in a disconnected component. Starting new DFS branch.`,
          currentNodeId: remNode.id,
          examiningEdgeId: null,
          dataStructureType: 'Stack',
          dataStructureItems: [],
          visitedOrder: [...visitedOrder],
          visitedSet: { ...visitedSet },
          frontierSet: { ...frontierSet },
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          codeLine: 2,
          explanation: `Restarting DFS on disconnected vertex ${remNode.label}.`,
          parentMap: { ...parentMap },
        });
        dfsVisit(remNode.id, null);
      }
    }
  }

  // Traversal Complete step
  steps.push({
    stepIndex: steps.length,
    title: 'DFS Traversal Complete',
    description: `All reachable nodes explored from "${startLabel}". Total nodes visited: ${visitedOrder.length} of ${graph.nodes.length}.`,
    currentNodeId: null,
    examiningEdgeId: null,
    dataStructureType: 'Stack',
    dataStructureItems: [],
    visitedOrder: [...visitedOrder],
    visitedSet: { ...visitedSet },
    frontierSet: {},
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    codeLine: 11,
    explanation: `Traversal finished. Order: ${visitedOrder.map(id => nodeMap.get(id)?.label).join(' → ')}`,
    parentMap: { ...parentMap },
  });

  return {
    algorithm: 'dfs',
    startNodeId,
    steps,
    traversalOrder: visitedOrder,
    totalSteps: steps.length,
  };
}

import { GraphData, TraversalResult, TraversalStep, NodeState, EdgeState } from '../types/graph';

export const BFS_PSEUDOCODE = [
  "BFS(Graph, startNode):",
  "  create a Queue Q",
  "  mark startNode as discovered, Q.enqueue(startNode)",
  "  while Q is not empty:",
  "    u = Q.dequeue()",
  "    process / visit u",
  "    for each neighbor v of u:",
  "      if v is not visited and not in Q:",
  "        mark v discovered, parent[v] = u",
  "        Q.enqueue(v)",
  "  return traversal order"
];

export function runBFS(graph: GraphData, startNodeId: string, traverseAllComponents: boolean = false): TraversalResult {
  const steps: TraversalStep[] = [];
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  
  if (!nodeMap.has(startNodeId)) {
    return {
      algorithm: 'bfs',
      startNodeId,
      steps: [],
      traversalOrder: [],
      totalSteps: 0,
    };
  }

  // Build adjacency list
  // Map from node id to array of { neighborId, edgeId }
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

  // Sort neighbors by node label/id for deterministic and clean order
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
  const frontierSet: Record<string, boolean> = {};
  const visitedOrder: string[] = [];
  const parentMap: Record<string, string | null> = {};
  for (const node of graph.nodes) {
    parentMap[node.id] = null;
  }

  const queue: string[] = [];
  const startLabel = nodeMap.get(startNodeId)?.label || startNodeId;

  // Step 0: Initial state before start
  steps.push({
    stepIndex: 0,
    title: `Initialize BFS from Node ${startLabel}`,
    description: `Ready to begin Breadth-First Search. Enqueuing root node "${startLabel}".`,
    currentNodeId: null,
    examiningEdgeId: null,
    dataStructureType: 'Queue',
    dataStructureItems: [],
    visitedOrder: [],
    visitedSet: { ...visitedSet },
    frontierSet: { ...frontierSet },
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    codeLine: 2,
    explanation: `Queue is initialized. Node ${startLabel} is chosen as the starting point.`,
    parentMap: { ...parentMap },
  });

  const processQueue = () => {
    while (queue.length > 0) {
      const u = queue.shift()!;
      delete frontierSet[u];
      visitedSet[u] = true;
      visitedOrder.push(u);
      nodeStates[u] = 'current';

      const uLabel = nodeMap.get(u)?.label || u;

      // Step: Dequeue and set as current node
      steps.push({
        stepIndex: steps.length,
        title: `Dequeue Node ${uLabel}`,
        description: `Dequeued node "${uLabel}" from front of Queue. Exploring its outgoing connections.`,
        currentNodeId: u,
        examiningEdgeId: null,
        dataStructureType: 'Queue',
        dataStructureItems: [...queue],
        visitedOrder: [...visitedOrder],
        visitedSet: { ...visitedSet },
        frontierSet: { ...frontierSet },
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        codeLine: 5,
        explanation: `Processing node ${uLabel}. Remaining queue: [${queue.map(id => nodeMap.get(id)?.label).join(', ')}]`,
        parentMap: { ...parentMap },
      });

      const neighbors = adj.get(u) || [];

      for (const { neighborId: v, edgeId } of neighbors) {
        const vLabel = nodeMap.get(v)?.label || v;

        // Step: Inspecting edge (u, v)
        const inspectingEdgeStates = { ...edgeStates, [edgeId]: 'examining' as EdgeState };
        steps.push({
          stepIndex: steps.length,
          title: `Examine Edge (${uLabel} → ${vLabel})`,
          description: `Inspecting connection from "${uLabel}" to neighbor "${vLabel}".`,
          currentNodeId: u,
          examiningEdgeId: edgeId,
          dataStructureType: 'Queue',
          dataStructureItems: [...queue],
          visitedOrder: [...visitedOrder],
          visitedSet: { ...visitedSet },
          frontierSet: { ...frontierSet },
          nodeStates: { ...nodeStates },
          edgeStates: inspectingEdgeStates,
          codeLine: 7,
          explanation: `Checking neighbor ${vLabel}. Visited? ${visitedSet[v] ? 'Yes' : 'No'}. In Queue? ${frontierSet[v] ? 'Yes' : 'No'}.`,
          parentMap: { ...parentMap },
        });

        if (!visitedSet[v] && !frontierSet[v]) {
          // Unvisited node: enqueue
          parentMap[v] = u;
          frontierSet[v] = true;
          queue.push(v);
          nodeStates[v] = 'in-frontier';
          edgeStates[edgeId] = 'tree';

          steps.push({
            stepIndex: steps.length,
            title: `Discover & Enqueue Node ${vLabel}`,
            description: `Node "${vLabel}" has not been visited yet. Edge (${uLabel} → ${vLabel}) is a Tree Edge. Added to Queue.`,
            currentNodeId: u,
            examiningEdgeId: edgeId,
            dataStructureType: 'Queue',
            dataStructureItems: [...queue],
            visitedOrder: [...visitedOrder],
            visitedSet: { ...visitedSet },
            frontierSet: { ...frontierSet },
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            codeLine: 9,
            explanation: `Mark ${vLabel} discovered with parent ${uLabel}. Queue now: [${queue.map(id => nodeMap.get(id)?.label).join(', ')}]`,
            parentMap: { ...parentMap },
          });
        } else {
          // Already visited or already in queue
          if (edgeStates[edgeId] !== 'tree') {
            edgeStates[edgeId] = 'cross';
          }
          steps.push({
            stepIndex: steps.length,
            title: `Neighbor ${vLabel} Already Discovered`,
            description: `Node "${vLabel}" is already visited or in the queue. Skipping duplicate enqueue.`,
            currentNodeId: u,
            examiningEdgeId: edgeId,
            dataStructureType: 'Queue',
            dataStructureItems: [...queue],
            visitedOrder: [...visitedOrder],
            visitedSet: { ...visitedSet },
            frontierSet: { ...frontierSet },
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            codeLine: 8,
            explanation: `${vLabel} already explored. Edge marked as non-tree cross edge.`,
            parentMap: { ...parentMap },
          });
        }
      }

      // Done with node u
      nodeStates[u] = 'visited';
    }
  };

  // Enqueue root start node
  queue.push(startNodeId);
  frontierSet[startNodeId] = true;
  nodeStates[startNodeId] = 'in-frontier';

  steps.push({
    stepIndex: steps.length,
    title: `Enqueue Root Node ${startLabel}`,
    description: `Node "${startLabel}" is pushed to the Queue and marked as discovered.`,
    currentNodeId: startNodeId,
    examiningEdgeId: null,
    dataStructureType: 'Queue',
    dataStructureItems: [...queue],
    visitedOrder: [],
    visitedSet: { ...visitedSet },
    frontierSet: { ...frontierSet },
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    codeLine: 3,
    explanation: `Mark ${startLabel} as discovered and push to Queue: [${queue.map(id => nodeMap.get(id)?.label).join(', ')}]`,
    parentMap: { ...parentMap },
  });

  processQueue();

  // If traverseAllComponents is true, process remaining unreachable components
  if (traverseAllComponents) {
    const remainingNodes = graph.nodes
      .filter(n => !visitedSet[n.id] && !frontierSet[n.id])
      .sort((a, b) => a.label.localeCompare(b.label));

    for (const remNode of remainingNodes) {
      if (!visitedSet[remNode.id] && !frontierSet[remNode.id]) {
        queue.push(remNode.id);
        frontierSet[remNode.id] = true;
        nodeStates[remNode.id] = 'in-frontier';

        steps.push({
          stepIndex: steps.length,
          title: `Discover Unvisited Component at Node ${remNode.label}`,
          description: `Node "${remNode.label}" is in a disconnected component. Enqueuing as new BFS root.`,
          currentNodeId: remNode.id,
          examiningEdgeId: null,
          dataStructureType: 'Queue',
          dataStructureItems: [...queue],
          visitedOrder: [...visitedOrder],
          visitedSet: { ...visitedSet },
          frontierSet: { ...frontierSet },
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          codeLine: 2,
          explanation: `Restarting BFS on disconnected vertex ${remNode.label}.`,
          parentMap: { ...parentMap },
        });

        processQueue();
      }
    }
  }

  // Traversal Complete step
  steps.push({
    stepIndex: steps.length,
    title: 'BFS Traversal Complete',
    description: `All reachable nodes explored from "${startLabel}". Total nodes visited: ${visitedOrder.length} of ${graph.nodes.length}.`,
    currentNodeId: null,
    examiningEdgeId: null,
    dataStructureType: 'Queue',
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
    algorithm: 'bfs',
    startNodeId,
    steps,
    traversalOrder: visitedOrder,
    totalSteps: steps.length,
  };
}

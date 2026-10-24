import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  GraphData, 
  GraphNode, 
  GraphEdge, 
  TraversalStep, 
  NodeState, 
  EdgeState 
} from '../types/graph';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Play, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Link,
  Edit2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { sound } from '../utils/audio';

interface GraphCanvasProps {
  graph: GraphData;
  setGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  currentStep: TraversalStep | null;
  startNodeId: string;
  setStartNodeId: (id: string) => void;
  isTraversing: boolean;
  onGraphEdited: () => void;
  onOpenMatrixModal?: () => void;
  onResetGraph?: () => void;
}

const NODE_RADIUS = 24;

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  setGraph,
  currentStep,
  startNodeId,
  setStartNodeId,
  isTraversing,
  onGraphEdited,
  onOpenMatrixModal,
  onResetGraph,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  
  // Arrow key builder mode: 'spawn' = arrow keys create connected node; 'navigate' = jump to adjacent node; 'move' = shift position
  const [arrowMode, setArrowMode] = useState<'spawn' | 'navigate' | 'move'>('spawn');
  const [targetToConnect, setTargetToConnect] = useState<string>('');
  const [isPadCollapsed, setIsPadCollapsed] = useState<boolean>(false);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan and Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node editing state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');

  // Auto-select start node if none selected
  useEffect(() => {
    if (!selectedNodeId && graph.nodes.length > 0) {
      if (graph.nodes.some(n => n.id === startNodeId)) {
        setSelectedNodeId(startNodeId);
      } else {
        setSelectedNodeId(graph.nodes[0].id);
      }
    }
  }, [graph.nodes, startNodeId, selectedNodeId]);

  // Helper to get node by ID
  const getNode = useCallback((id: string) => graph.nodes.find(n => n.id === id), [graph.nodes]);

  // Directional navigation between existing nodes
  const navigateInDirection = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedNodeId) {
      if (graph.nodes.length > 0) setSelectedNodeId(graph.nodes[0].id);
      return;
    }
    const current = getNode(selectedNodeId);
    if (!current) return;

    let bestCandidate: GraphNode | null = null;
    let minDistance = Infinity;

    for (const node of graph.nodes) {
      if (node.id === current.id) continue;
      const dx = node.x - current.x;
      const dy = node.y - current.y;
      const dist = Math.hypot(dx, dy);

      let isCandidate = false;
      if (dir === 'up' && dy < -10 && Math.abs(dx) <= Math.abs(dy) * 2.0) isCandidate = true;
      if (dir === 'down' && dy > 10 && Math.abs(dx) <= Math.abs(dy) * 2.0) isCandidate = true;
      if (dir === 'left' && dx < -10 && Math.abs(dy) <= Math.abs(dx) * 2.0) isCandidate = true;
      if (dir === 'right' && dx > 10 && Math.abs(dy) <= Math.abs(dx) * 2.0) isCandidate = true;

      if (isCandidate && dist < minDistance) {
        minDistance = dist;
        bestCandidate = node;
      }
    }

    if (bestCandidate) {
      setSelectedNodeId(bestCandidate.id);
      setSelectedEdgeId(null);
      sound.playStep(440, 'sine');
    }
  }, [selectedNodeId, graph.nodes, getNode]);

  // Keyboard navigation & node movement with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tab key cycles Arrow Builder Mode: Spawn -> Navigate -> Move
      if (e.key === 'Tab') {
        e.preventDefault();
        setArrowMode(m => m === 'spawn' ? 'navigate' : m === 'navigate' ? 'move' : 'spawn');
        return;
      }

      // Handle Arrow keys (Spawn, Navigate, or Move)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        // If canvas has 0 nodes, any arrow key spawns initial node
        if (graph.nodes.length === 0) {
          addNewNode(400, 260);
          return;
        }

        // If Alt key is held OR in 'spawn' mode: spawn & connect in direction!
        if (e.altKey || arrowMode === 'spawn') {
          if (e.key === 'ArrowUp') spawnNodeInDirection('up');
          if (e.key === 'ArrowDown') spawnNodeInDirection('down');
          if (e.key === 'ArrowLeft') spawnNodeInDirection('left');
          if (e.key === 'ArrowRight') spawnNodeInDirection('right');
          return;
        }

        // If in 'navigate' mode: jump selection to closest node in that direction
        if (arrowMode === 'navigate') {
          if (e.key === 'ArrowUp') navigateInDirection('up');
          if (e.key === 'ArrowDown') navigateInDirection('down');
          if (e.key === 'ArrowLeft') navigateInDirection('left');
          if (e.key === 'ArrowRight') navigateInDirection('right');
          return;
        }

        // If in 'move' mode: shift the coordinates
        if (arrowMode === 'move' && selectedNodeId) {
          const stepSize = e.shiftKey ? 32 : 14;
          setGraph(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => {
              if (n.id !== selectedNodeId) return n;
              let nx = n.x;
              let ny = n.y;
              if (e.key === 'ArrowUp') ny -= stepSize;
              if (e.key === 'ArrowDown') ny += stepSize;
              if (e.key === 'ArrowLeft') nx -= stepSize;
              if (e.key === 'ArrowRight') nx += stepSize;
              return { ...n, x: Math.max(30, nx), y: Math.max(30, ny) };
            })
          }));
          onGraphEdited();
        }
      }

      // Delete key removes selected node or edge
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }

      // 'N' key adds a node near the selected node or center
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey) {
          addNewNode();
        }
      }

      // 'C' key toggles connect mode
      if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey) {
          if (connectingSourceId) {
            setConnectingSourceId(null);
          } else if (selectedNodeId) {
            setConnectingSourceId(selectedNodeId);
          }
        }
      }

      // Escape key cancels connect or closes selection
      if (e.key === 'Escape') {
        setConnectingSourceId(null);
        setSelectedEdgeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, connectingSourceId, graph.nodes, arrowMode, navigateInDirection]);

  // Spawn node in direction and connect
  const spawnNodeInDirection = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedNodeId) return;
    const parentNode = getNode(selectedNodeId);
    if (!parentNode) return;

    const offsetDistance = 120;
    let newX = parentNode.x;
    let newY = parentNode.y;

    if (dir === 'up') newY -= offsetDistance;
    if (dir === 'down') newY += offsetDistance;
    if (dir === 'left') newX -= offsetDistance;
    if (dir === 'right') newX += offsetDistance;

    // Generate label
    const existingLabels = new Set(graph.nodes.map(n => n.label));
    let nextChar = 65; // 'A'
    while (existingLabels.has(String.fromCharCode(nextChar)) && nextChar <= 90) {
      nextChar++;
    }
    const newLabel = nextChar <= 90 ? String.fromCharCode(nextChar) : `N${graph.nodes.length + 1}`;
    const newId = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newNode: GraphNode = {
      id: newId,
      label: newLabel,
      x: Math.max(40, newX),
      y: Math.max(40, newY),
    };

    const newEdge: GraphEdge = {
      id: `edge_${parentNode.id}_${newId}`,
      source: parentNode.id,
      target: newId,
    };

    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      edges: [...prev.edges, newEdge],
    }));

    setSelectedNodeId(newId);
    sound.playEnqueue();
    onGraphEdited();
  };

  // Add arbitrary new node
  const addNewNode = (x?: number, y?: number) => {
    const existingLabels = new Set(graph.nodes.map(n => n.label));
    let nextChar = 65;
    while (existingLabels.has(String.fromCharCode(nextChar)) && nextChar <= 90) {
      nextChar++;
    }
    const label = nextChar <= 90 ? String.fromCharCode(nextChar) : `N${graph.nodes.length + 1}`;
    const id = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const posX = x ?? (containerRef.current ? containerRef.current.clientWidth / 2 - pan.x : 400);
    const posY = y ?? (containerRef.current ? containerRef.current.clientHeight / 2 - pan.y : 250);

    const newNode: GraphNode = {
      id,
      label,
      x: Math.round(posX),
      y: Math.round(posY),
    };

    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));

    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    sound.playEnqueue();
    onGraphEdited();
  };

  // Connect two nodes
  const connectNodes = (srcId: string, tgtId: string) => {
    if (srcId === tgtId) return; // Disallow simple self loops for clean traversal
    const exists = graph.edges.some(e => 
      (e.source === srcId && e.target === tgtId) ||
      (!graph.isDirected && e.source === tgtId && e.target === srcId)
    );

    if (exists) {
      setConnectingSourceId(null);
      return;
    }

    const newEdge: GraphEdge = {
      id: `edge_${srcId}_${tgtId}_${Date.now()}`,
      source: srcId,
      target: tgtId,
    };

    setGraph(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));

    setConnectingSourceId(null);
    sound.playEnqueue();
    onGraphEdited();
  };

  // Delete node
  const deleteNode = (id: string) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.source !== id && e.target !== id),
    }));
    if (selectedNodeId === id) setSelectedNodeId(null);
    if (startNodeId === id && graph.nodes.length > 1) {
      const remaining = graph.nodes.filter(n => n.id !== id);
      setStartNodeId(remaining[0].id);
    }
    onGraphEdited();
  };

  // Delete edge
  const deleteEdge = (edgeId: string) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId),
    }));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
    onGraphEdited();
  };

  // Fit to screen
  const fitToScreen = () => {
    if (!containerRef.current || graph.nodes.length === 0) return;
    const { clientWidth: width, clientHeight: height } = containerRef.current;

    const xs = graph.nodes.map(n => n.x);
    const ys = graph.nodes.map(n => n.y);
    const minX = Math.min(...xs) - 60;
    const maxX = Math.max(...xs) + 60;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 60;

    const graphWidth = Math.max(maxX - minX, 200);
    const graphHeight = Math.max(maxY - minY, 200);

    const scaleX = width / graphWidth;
    const scaleY = height / graphHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.85, 0.5), 1.5);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: width / 2 - centerX * newZoom,
      y: height / 2 - centerY * newZoom,
    });
  };

  // Mouse handlers for dragging nodes
  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    if (connectingSourceId) {
      connectNodes(connectingSourceId, node.id);
      return;
    }

    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setDraggingNodeId(node.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left - pan.x) / zoom - node.x,
        y: (e.clientY - rect.top - pan.y) / zoom - node.y,
      });
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setConnectingSourceId(null);
      setEditingNodeId(null);

      // Start panning canvas
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => 
          n.id === draggingNodeId
            ? { ...n, x: Math.round(mouseX - dragOffset.x), y: Math.round(mouseY - dragOffset.y) }
            : n
        )
      }));
      onGraphEdited();
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  // Edge click
  const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setConnectingSourceId(null);
  };

  // Node label submit
  const handleSaveNodeLabel = (nodeId: string) => {
    if (editLabel.trim()) {
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, label: editLabel.trim() } : n),
      }));
      onGraphEdited();
    }
    setEditingNodeId(null);
  };

  // Helper for computing clean line/bezier paths and arrow offsets
  const calculateEdgePath = (src: GraphNode, tgt: GraphNode, isCurved: boolean = false) => {
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Source boundary point
    const sx = src.x + (dx / dist) * NODE_RADIUS;
    const sy = src.y + (dy / dist) * NODE_RADIUS;

    // Target boundary point (with small gap for arrow marker)
    const arrowOffset = graph.isDirected ? NODE_RADIUS + 7 : NODE_RADIUS;
    const tx = tgt.x - (dx / dist) * arrowOffset;
    const ty = tgt.y - (dy / dist) * arrowOffset;

    if (!isCurved) {
      return `M ${sx} ${sy} L ${tx} ${ty}`;
    }

    // Curved quadratic bezier for bidirectional pairs
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const normX = -dy / dist;
    const normY = dx / dist;
    const curveAmount = 24;
    const cx = midX + normX * curveAmount;
    const cy = midY + normY * curveAmount;

    return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
  };

  // Check if reciprocal edge exists in directed graph
  const hasReciprocalEdge = (e: GraphEdge) => {
    return graph.isDirected && graph.edges.some(other => other.source === e.target && other.target === e.source);
  };

  const selectedNode = selectedNodeId ? getNode(selectedNodeId) : null;

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          addNewNode(x, y);
        }
      }}
      className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-[#090d16] canvas-grid cursor-crosshair"
    >
      {/* SVG Canvas Layer */}
      <svg
        className="w-full h-full absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Arrow markers for directed edges */}
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
          </marker>

          <marker
            id="arrow-tree"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
          </marker>

          <marker
            id="arrow-examining"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
          </marker>

          <marker
            id="arrow-back"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
          </marker>

          <marker
            id="arrow-cross"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
          </marker>

          {/* Glow filter for active elements */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        <g className="edges-layer pointer-events-auto">
          {graph.edges.map(edge => {
            const src = getNode(edge.source);
            const tgt = getNode(edge.target);
            if (!src || !tgt) return null;

            const isCurved = hasReciprocalEdge(edge);
            const pathData = calculateEdgePath(src, tgt, isCurved);
            const isSelected = selectedEdgeId === edge.id;
            
            // Dynamic edge traversal state
            const edgeState: EdgeState = currentStep?.edgeStates[edge.id] || 'unvisited';

            let strokeColor = '#334155'; // default slate-700
            let strokeWidth = 2;
            let strokeDasharray = 'none';
            let markerEnd = graph.isDirected ? 'url(#arrow-default)' : undefined;
            let filter: string | undefined = undefined;

            if (edgeState === 'examining') {
              strokeColor = '#f59e0b'; // amber
              strokeWidth = 3.5;
              strokeDasharray = '6 4';
              markerEnd = 'url(#arrow-examining)';
              filter = 'url(#glow)';
            } else if (edgeState === 'tree') {
              strokeColor = '#10b981'; // emerald
              strokeWidth = 3.5;
              markerEnd = 'url(#arrow-tree)';
              filter = 'url(#glow)';
            } else if (edgeState === 'back') {
              strokeColor = '#f43f5e'; // rose (cycle)
              strokeWidth = 2.5;
              strokeDasharray = '5 3';
              markerEnd = 'url(#arrow-back)';
            } else if (edgeState === 'cross') {
              strokeColor = '#818cf8'; // indigo
              strokeWidth = 2.5;
              strokeDasharray = '4 4';
              markerEnd = 'url(#arrow-cross)';
            }

            if (isSelected) {
              strokeColor = '#06b6d4'; // cyan
              strokeWidth = 3;
            }

            return (
              <g key={edge.id} className="cursor-pointer group" onClick={(e) => handleEdgeClick(e, edge.id)}>
                {/* Fat invisible hit area */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                  className="cursor-pointer"
                />
                {/* Visible stroke path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  markerEnd={markerEnd}
                  filter={filter}
                  className="transition-colors duration-200"
                />
              </g>
            );
          })}

          {/* Line preview when actively connecting a node */}
          {connectingSourceId && (() => {
            const src = getNode(connectingSourceId);
            if (!src) return null;
            return (
              <line
                x1={src.x}
                y1={src.y}
                x2={src.x}
                y2={src.y}
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            );
          })()}
        </g>

        {/* Nodes */}
        <g className="nodes-layer pointer-events-auto">
          {graph.nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isStart = startNodeId === node.id;
            const isConnecting = connectingSourceId === node.id;
            const nodeState: NodeState = currentStep?.nodeStates[node.id] || 'unvisited';

            // Visited sequence index (e.g. #1, #2...)
            const visitOrderIndex = currentStep?.visitedOrder.indexOf(node.id);
            const hasBeenVisited = visitOrderIndex !== undefined && visitOrderIndex !== -1;

            let bgColor = '#0f172a'; // slate-900
            let borderColor = '#334155'; // slate-700
            let borderWidth = 2;
            let textColor = '#f1f5f9';
            let filter: string | undefined = undefined;

            if (nodeState === 'current') {
              bgColor = '#78350f'; // amber-900
              borderColor = '#f59e0b'; // amber-500
              borderWidth = 3.5;
              textColor = '#fef3c7';
              filter = 'url(#glow)';
            } else if (nodeState === 'in-frontier') {
              bgColor = '#3b0764'; // purple-950
              borderColor = '#a855f7'; // purple-500
              borderWidth = 3;
              textColor = '#f3e8ff';
              filter = 'url(#glow)';
            } else if (nodeState === 'visited') {
              bgColor = '#064e3b'; // emerald-900
              borderColor = '#10b981'; // emerald-500
              borderWidth = 2.5;
              textColor = '#d1fae5';
            }

            if (isSelected) {
              borderColor = '#06b6d4'; // cyan
              borderWidth = 3.5;
            }

            if (isConnecting) {
              borderColor = '#f59e0b';
              borderWidth = 3.5;
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingNodeId(node.id);
                  setEditLabel(node.label);
                }}
                className="cursor-grab active:cursor-grabbing group"
              >
                {/* Active current pulse beacon */}
                {nodeState === 'current' && (
                  <circle
                    r={NODE_RADIUS + 8}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Frontier breathing ring */}
                {nodeState === 'in-frontier' && (
                  <circle
                    r={NODE_RADIUS + 5}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    className="animate-pulse opacity-80"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={NODE_RADIUS}
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth={borderWidth}
                  filter={filter}
                  className="transition-colors duration-200"
                />

                {/* Node Label */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize={node.label.length > 3 ? "11" : "13"}
                  fontWeight="600"
                  fontFamily="'JetBrains Mono', monospace"
                  className="pointer-events-none select-none tracking-tight"
                >
                  {node.label}
                </text>

                {/* Start Node Badge (flag or root indicator) */}
                {isStart && (
                  <g transform={`translate(0, ${-NODE_RADIUS - 6})`}>
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="13"
                      rx="3"
                      fill="#0284c7"
                      className="shadow-sm"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="700"
                      className="pointer-events-none uppercase tracking-wider"
                    >
                      ROOT
                    </text>
                  </g>
                )}

                {/* Visit sequence number pill (#1, #2...) */}
                {hasBeenVisited && nodeState !== 'current' && (
                  <g transform={`translate(${NODE_RADIUS - 4}, ${-NODE_RADIUS + 4})`}>
                    <circle r="8.5" fill="#10b981" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#022c22"
                      fontSize="8.5"
                      fontWeight="800"
                      fontFamily="'JetBrains Mono', monospace"
                      className="pointer-events-none"
                    >
                      {visitOrderIndex + 1}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Canvas Action Dock (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1 rounded-xl shadow-lg">
          <button
            type="button"
            onClick={() => addNewNode()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-700/50 transition-colors"
            title="Add Node ('N' or double-click canvas)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedNodeId) {
                if (connectingSourceId) {
                  setConnectingSourceId(null);
                } else {
                  setConnectingSourceId(selectedNodeId);
                }
              }
            }}
            disabled={!selectedNodeId}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              connectingSourceId 
                ? 'bg-amber-500 text-slate-950 font-bold' 
                : selectedNodeId
                  ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                  : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Select target node to connect ('C')"
          >
            <Link className="w-3.5 h-3.5" />
            <span>{connectingSourceId ? 'Click Target Node' : 'Connect Edge'}</span>
          </button>

          {selectedNodeId && (
            <button
              type="button"
              onClick={() => setStartNodeId(selectedNodeId)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Set as Traversal Root"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Set Root</span>
            </button>
          )}

          {graph.nodes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Clear canvas to create a brand new custom graph?")) {
                  setGraph({ nodes: [], edges: [], isDirected: graph.isDirected });
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                  setConnectingSourceId(null);
                  onGraphEdited();
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
              title="Clear Canvas / Start Fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {(selectedNodeId || selectedEdgeId) && (
            <button
              type="button"
              onClick={() => {
                if (selectedNodeId) deleteNode(selectedNodeId);
                else if (selectedEdgeId) deleteEdge(selectedEdgeId);
              }}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
              title="Delete Selected ('Del')"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Directional Arrow Pad for Node Creation & Navigation (Bottom Left) */}
      {/* Satisfies requirement: "using just arrow key, means they must able to create node and any connection they want" */}
      <div className="absolute bottom-20 left-4 z-20 flex flex-col bg-slate-900/95 border border-slate-800 backdrop-blur-md p-3 rounded-2xl shadow-xl min-w-[210px] max-w-[240px]">
        {/* Header & Mode Switch */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Arrow Builder</span>
            {selectedNode && (
              <span className="text-xs font-bold text-cyan-300 font-mono bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/60">
                {selectedNode.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsPadCollapsed(c => !c)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isPadCollapsed ? "Expand D-Pad" : "Minimize D-Pad"}
          >
            {isPadCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isPadCollapsed && (
          <>
            {/* Mode Segmented Controls */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl mb-2.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setArrowMode('spawn')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  arrowMode === 'spawn'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Arrow keys spawn connected node"
              >
                ➕ Spawn
              </button>
              <button
                type="button"
                onClick={() => setArrowMode('navigate')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  arrowMode === 'navigate'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Arrow keys select nearest node in direction"
              >
                🧭 Nav
              </button>
              <button
                type="button"
                onClick={() => setArrowMode('move')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  arrowMode === 'move'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Arrow keys move selected node position"
              >
                ✥ Move
              </button>
            </div>

            {/* D-Pad Buttons */}
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-1 w-28">
                <div />
                <button
                  type="button"
                  onClick={() => {
                    if (graph.nodes.length === 0) addNewNode(400, 260);
                    else if (arrowMode === 'navigate') navigateInDirection('up');
                    else spawnNodeInDirection('up');
                  }}
                  className="h-8 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-200 hover:text-cyan-300 flex items-center justify-center border border-slate-700/80 active:scale-95 transition-all"
                  title="UP (↑)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div />

                <button
                  type="button"
                  onClick={() => {
                    if (graph.nodes.length === 0) addNewNode(400, 260);
                    else if (arrowMode === 'navigate') navigateInDirection('left');
                    else spawnNodeInDirection('left');
                  }}
                  className="h-8 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-200 hover:text-cyan-300 flex items-center justify-center border border-slate-700/80 active:scale-95 transition-all"
                  title="LEFT (←)"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center text-[10px] text-slate-500 font-mono select-none">
                  PAD
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (graph.nodes.length === 0) addNewNode(400, 260);
                    else if (arrowMode === 'navigate') navigateInDirection('right');
                    else spawnNodeInDirection('right');
                  }}
                  className="h-8 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-200 hover:text-cyan-300 flex items-center justify-center border border-slate-700/80 active:scale-95 transition-all"
                  title="RIGHT (→)"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div />
                <button
                  type="button"
                  onClick={() => {
                    if (graph.nodes.length === 0) addNewNode(400, 260);
                    else if (arrowMode === 'navigate') navigateInDirection('down');
                    else spawnNodeInDirection('down');
                  }}
                  className="h-8 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-200 hover:text-cyan-300 flex items-center justify-center border border-slate-700/80 active:scale-95 transition-all"
                  title="DOWN (↓)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <div />
              </div>
            </div>

            {/* Quick Connect: make ANY connection the user wants */}
            {selectedNode && graph.nodes.length > 1 && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-medium">Connect "{selectedNode.label}" to:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={targetToConnect}
                    onChange={(e) => setTargetToConnect(e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 text-cyan-300 text-xs rounded-lg px-2 py-1 flex-1 focus:outline-none"
                  >
                    <option value="">Select node...</option>
                    {graph.nodes
                      .filter(n => n.id !== selectedNodeId)
                      .map(n => (
                        <option key={n.id} value={n.id}>
                          {n.label}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={!targetToConnect}
                    onClick={() => {
                      if (selectedNodeId && targetToConnect) {
                        connectNodes(selectedNodeId, targetToConnect);
                        setTargetToConnect('');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Link
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-400 mt-2 text-center leading-tight">
              {arrowMode === 'spawn' && <>Tap <kbd className="font-mono text-cyan-300 font-bold">↑↓←→</kbd> to create & connect nodes</>}
              {arrowMode === 'navigate' && <>Tap <kbd className="font-mono text-cyan-300 font-bold">↑↓←→</kbd> to navigate selection</>}
              {arrowMode === 'move' && <>Tap <kbd className="font-mono text-cyan-300 font-bold">↑↓←→</kbd> to nudge node position</>}
              <span className="block text-[9px] text-slate-500 mt-0.5">(Tab to switch mode)</span>
            </p>
          </>
        )}
      </div>

      {/* Empty Canvas Overlay */}
      {graph.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-[#090d16]/80 backdrop-blur-sm z-10 p-4">
          <div className="p-8 max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Custom Graph Canvas
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                The canvas is empty. Start building your custom graph using just arrow keys, clicking below, or importing from an adjacency matrix.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => addNewNode(400, 260)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Root Node (or press any Arrow Key)</span>
              </button>
            </div>
            <div className="flex items-center gap-2 w-full pt-2 border-t border-slate-800/80">
              {onOpenMatrixModal && (
                <button
                  type="button"
                  onClick={onOpenMatrixModal}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Import Matrix
                </button>
              )}
              {onResetGraph && (
                <button
                  type="button"
                  onClick={onResetGraph}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Load Demo Preset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Canvas Navigation & Zoom Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1.5 rounded-xl shadow-lg">
        <button
          type="button"
          onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={fitToScreen}
          className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          title="Fit Graph to Viewport"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Inline Node Label Rename Modal/Popover */}
      {editingNodeId && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-2xl w-80">
            <h4 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-cyan-400" />
              <span>Rename Node</span>
            </h4>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNodeLabel(editingNodeId);
                if (e.key === 'Escape') setEditingNodeId(null);
              }}
              autoFocus
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:border-cyan-500 focus:outline-none mb-4"
              placeholder="Enter node label (e.g. A, B, Home)"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNodeId(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveNodeLabel(editingNodeId)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

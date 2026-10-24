import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GraphData, 
  AlgorithmType, 
  PresetGraph, 
  TraversalResult 
} from './types/graph';
import { PRESET_GRAPHS } from './utils/presets';
import { runBFS } from './algorithms/bfs';
import { runDFS } from './algorithms/dfs';
import { Navbar } from './components/Navbar';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlHUD } from './components/ControlHUD';
import { DataPanel } from './components/DataPanel';
import { MatrixModal } from './components/MatrixModal';
import { KeyboardModal } from './components/KeyboardModal';
import { sound } from './utils/audio';

export function App() {
  // Default to the complex network demo preset
  const defaultPreset = PRESET_GRAPHS[0];
  const [graph, setGraph] = useState<GraphData>(() => JSON.parse(JSON.stringify(defaultPreset.graph)));
  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bfs');
  
  // Starting node for traversal
  const [startNodeId, setStartNodeId] = useState<string>(() => defaultPreset.graph.nodes[0]?.id || 'node_A');

  // Traversal execution state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(650); // delay in ms
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Modals state
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [traverseAllComponents, setTraverseAllComponents] = useState<boolean>(false);

  // Synchronize startNodeId if nodes change
  useEffect(() => {
    if (graph.nodes.length > 0 && !graph.nodes.some(n => n.id === startNodeId)) {
      setStartNodeId(graph.nodes[0].id);
    }
  }, [graph.nodes, startNodeId]);

  // Compute traversal result deterministically
  const traversalResult: TraversalResult = useMemo(() => {
    if (graph.nodes.length === 0 || !startNodeId) {
      return {
        algorithm,
        startNodeId,
        steps: [],
        traversalOrder: [],
        totalSteps: 0,
      };
    }
    return algorithm === 'bfs' 
      ? runBFS(graph, startNodeId, traverseAllComponents) 
      : runDFS(graph, startNodeId, traverseAllComponents);
  }, [graph, startNodeId, algorithm, traverseAllComponents]);

  const totalSteps = traversalResult.steps.length;
  const currentStep = traversalResult.steps[currentStepIndex] || null;

  // Auto-step timer when playing
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      sound.playComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        // Trigger subtle sound blip if enabled
        const nextStep = traversalResult.steps[next];
        if (nextStep?.examiningEdgeId) {
          sound.playStep(480, 'sine');
        } else if (nextStep?.dataStructureItems?.length) {
          sound.playEnqueue();
        }
        return next;
      });
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, speed, traversalResult.steps]);

  // Handle graph structural changes
  const handleGraphEdited = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSelectedPresetId('custom');
  }, []);

  // Load a preset graph
  const loadPreset = useCallback((preset: PresetGraph) => {
    setIsPlaying(false);
    setGraph(JSON.parse(JSON.stringify(preset.graph)));
    setSelectedPresetId(preset.id);
    if (preset.graph.nodes.length > 0) {
      setStartNodeId(preset.graph.nodes[0].id);
    }
    setCurrentStepIndex(0);
  }, []);

  // Toggle directed / undirected
  const toggleDirected = useCallback(() => {
    setGraph(prev => ({
      ...prev,
      isDirected: !prev.isDirected,
    }));
    handleGraphEdited();
  }, [handleGraphEdited]);

  // Reset playback to step 0
  const handleJumpToStart = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  // Jump directly to finished traversal
  const handleJumpToEnd = useCallback(() => {
    setIsPlaying(false);
    if (totalSteps > 0) {
      setCurrentStepIndex(totalSteps - 1);
    }
  }, [totalSteps]);

  // Step forward
  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      sound.playStep(520, 'triangle');
    }
  }, [currentStepIndex, totalSteps]);

  // Step backward
  const handleStepBackward = useCallback(() => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      sound.playStep(380, 'sine');
    }
  }, [currentStepIndex]);

  // Scrubbing
  const handleScrub = useCallback((index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(Math.max(0, Math.min(index, totalSteps - 1)));
  }, [totalSteps]);

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If at end, start from 0
      if (currentStepIndex >= totalSteps - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentStepIndex, totalSteps]);

  // Keyboard hotkey handler
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        isMatrixModalOpen ||
        isHelpModalOpen
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          handleJumpToStart();
        }
      } else if (e.key === 'j' || e.key === 'J' || e.key === '[') {
        handleStepBackward();
      } else if (e.key === 'k' || e.key === 'K' || e.key === ']') {
        handleStepForward();
      } else if (e.key === '1') {
        setAlgorithm('bfs');
        setCurrentStepIndex(0);
      } else if (e.key === '2') {
        setAlgorithm('dfs');
        setCurrentStepIndex(0);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [
    handleTogglePlay, 
    handleJumpToStart, 
    handleStepBackward, 
    handleStepForward, 
    isMatrixModalOpen, 
    isHelpModalOpen
  ]);

  // Generate a random connected graph
  const handleRandomizeGraph = useCallback(() => {
    const nodeCount = 7;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 180;

    const newNodes = labels.map((label, idx) => {
      const angle = (2 * Math.PI * idx) / nodeCount - Math.PI / 2;
      return {
        id: `node_${label}`,
        label,
        x: Math.round(centerX + radius * Math.cos(angle) + (Math.random() * 40 - 20)),
        y: Math.round(centerY + radius * Math.sin(angle) + (Math.random() * 40 - 20)),
      };
    });

    // Generate random edges ensuring connectivity
    const newEdges = [];
    for (let i = 0; i < nodeCount - 1; i++) {
      newEdges.push({
        id: `e_${newNodes[i].id}_${newNodes[i + 1].id}`,
        source: newNodes[i].id,
        target: newNodes[i + 1].id,
      });
    }

    // Add extra random edges
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 2; j < nodeCount; j++) {
        if (Math.random() < 0.28) {
          newEdges.push({
            id: `e_${newNodes[i].id}_${newNodes[j].id}`,
            source: newNodes[i].id,
            target: newNodes[j].id,
          });
        }
      }
    }

    setGraph({
      nodes: newNodes,
      edges: newEdges,
      isDirected: graph.isDirected,
    });
    setStartNodeId(newNodes[0].id);
    handleGraphEdited();
  }, [graph.isDirected, handleGraphEdited]);

  // Reset to default preset
  const handleResetGraph = useCallback(() => {
    loadPreset(defaultPreset);
  }, [loadPreset, defaultPreset]);

  // Add a new node at canvas
  const handleAddNode = useCallback(() => {
    const existingLabels = new Set(graph.nodes.map(n => n.label));
    let nextChar = 65;
    while (existingLabels.has(String.fromCharCode(nextChar)) && nextChar <= 90) {
      nextChar++;
    }
    const label = nextChar <= 90 ? String.fromCharCode(nextChar) : `N${graph.nodes.length + 1}`;
    const id = `node_${Date.now()}`;

    setGraph(prev => ({
      ...prev,
      nodes: [
        ...prev.nodes,
        {
          id,
          label,
          x: 400 + (Math.random() * 100 - 50),
          y: 250 + (Math.random() * 100 - 50),
        }
      ]
    }));
    handleGraphEdited();
  }, [graph.nodes, handleGraphEdited]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar
        algorithm={algorithm}
        setAlgorithm={(algo) => {
          setAlgorithm(algo);
          setCurrentStepIndex(0);
          setIsPlaying(false);
        }}
        isDirected={graph.isDirected}
        toggleDirected={toggleDirected}
        selectedPresetId={selectedPresetId}
        loadPreset={loadPreset}
        onOpenMatrixModal={() => setIsMatrixModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onAddNode={handleAddNode}
        onRandomize={handleRandomizeGraph}
        onResetGraph={handleResetGraph}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        traverseAllComponents={traverseAllComponents}
        setTraverseAllComponents={setTraverseAllComponents}
      />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden">
        {/* Left: Canvas Area */}
        <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
          <GraphCanvas
            graph={graph}
            setGraph={setGraph}
            currentStep={currentStep}
            startNodeId={startNodeId}
            setStartNodeId={(id) => {
              setStartNodeId(id);
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            isTraversing={isPlaying}
            onGraphEdited={handleGraphEdited}
            onOpenMatrixModal={() => setIsMatrixModalOpen(true)}
            onResetGraph={handleResetGraph}
          />

          {/* Bottom Traversal Control HUD */}
          <ControlHUD
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onJumpToStart={handleJumpToStart}
            onJumpToEnd={handleJumpToEnd}
            onScrub={handleScrub}
            speed={speed}
            setSpeed={setSpeed}
            nodes={graph.nodes}
            startNodeId={startNodeId}
            setStartNodeId={(id) => {
              setStartNodeId(id);
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
          />
        </div>

        {/* Right: Data Panel (Queue/Stack, Pseudocode, Complexity) */}
        <DataPanel
          algorithm={algorithm}
          currentStep={currentStep}
          graph={graph}
        />
      </div>

      {/* Adjacency Matrix & Import/Export Modal */}
      <MatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        graph={graph}
        setGraph={setGraph}
        onGraphUpdated={handleGraphEdited}
      />

      {/* Keyboard Shortcuts & Theory Modal */}
      <KeyboardModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}

export default App;

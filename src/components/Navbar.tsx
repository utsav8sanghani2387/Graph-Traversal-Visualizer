import React from 'react';
import { 
  Network, 
  GitFork, 
  Layers, 
  Grid3X3, 
  RotateCcw, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  PlusCircle,
  ArrowRightLeft,
  Share2
} from 'lucide-react';
import { AlgorithmType, PresetGraph } from '../types/graph';
import { PRESET_GRAPHS } from '../utils/presets';
import { sound } from '../utils/audio';

interface NavbarProps {
  algorithm: AlgorithmType;
  setAlgorithm: (algo: AlgorithmType) => void;
  isDirected: boolean;
  toggleDirected: () => void;
  selectedPresetId: string;
  loadPreset: (preset: PresetGraph) => void;
  onOpenMatrixModal: () => void;
  onOpenHelpModal: () => void;
  onAddNode: () => void;
  onRandomize: () => void;
  onResetGraph: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  traverseAllComponents: boolean;
  setTraverseAllComponents: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  algorithm,
  setAlgorithm,
  isDirected,
  toggleDirected,
  selectedPresetId,
  loadPreset,
  onOpenMatrixModal,
  onOpenHelpModal,
  onAddNode,
  onRandomize,
  onResetGraph,
  soundEnabled,
  setSoundEnabled,
  traverseAllComponents,
  setTraverseAllComponents,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-[1px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
            <Network className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
              GraphSense
            </span>
            <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
              Studio
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400 font-medium">
            Interactive BFS & DFS Traversal Visualizer
          </p>
        </div>
      </div>

      {/* Center Controls: Algorithm Switch & Presets */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Algorithm Segmented Button */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => setAlgorithm('bfs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              algorithm === 'bfs'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Breadth-First Search (Queue FIFO)"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>BFS</span>
          </button>

          <button
            type="button"
            onClick={() => setAlgorithm('dfs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              algorithm === 'dfs'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Depth-First Search (Stack LIFO)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>DFS</span>
          </button>
        </div>

        {/* Preset Selector */}
        <div className="relative hidden lg:block">
          <select
            value={selectedPresetId}
            onChange={(e) => {
              const preset = PRESET_GRAPHS.find(p => p.id === e.target.value);
              if (preset) loadPreset(preset);
            }}
            className="bg-slate-900/90 text-slate-200 border border-slate-800 text-xs font-medium rounded-xl px-3 py-2 pr-8 appearance-none hover:border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            {PRESET_GRAPHS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
            <option value="custom">✦ Custom Graph</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Directed / Undirected Toggle */}
        <button
          type="button"
          onClick={toggleDirected}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            isDirected 
              ? 'bg-amber-950/40 border-amber-800/70 text-amber-300' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
          title={isDirected ? "Currently Directed graph (edges have arrows)" : "Currently Undirected graph (bidirectional)"}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isDirected ? 'Directed' : 'Undirected'}</span>
        </button>

        {/* Component Traversal Mode */}
        <button
          type="button"
          onClick={() => setTraverseAllComponents(!traverseAllComponents)}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            traverseAllComponents 
              ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-300' 
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={traverseAllComponents ? "Forest Mode: Traverses all disconnected components" : "Single Component: Traverses only nodes reachable from start node"}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{traverseAllComponents ? 'All Components' : 'Single Component'}</span>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Matrix Editor / Import Button */}
        <button
          type="button"
          onClick={onOpenMatrixModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-sm shadow-cyan-500/10 transition-all active:scale-95"
          title="Open Custom Graph Adjacency Matrix Studio & Importer"
        >
          <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Matrix Studio</span>
        </button>

        {/* Add Node quick button */}
        <button
          type="button"
          onClick={onAddNode}
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
          title="Add New Node ('N')"
        >
          <PlusCircle className="w-4 h-4" />
        </button>

        {/* Randomize graph */}
        <button
          type="button"
          onClick={onRandomize}
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-400 transition-colors hidden sm:flex items-center justify-center"
          title="Generate Random Graph"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.enabled = next;
            if (next) sound.playVisit();
          }}
          className={`p-2 rounded-xl border transition-colors ${
            soundEnabled 
              ? 'bg-cyan-950/30 border-cyan-800 text-cyan-400' 
              : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? "Mute audio synthesizer" : "Enable sound synthesis"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Keyboard Help Modal */}
        <button
          type="button"
          onClick={onOpenHelpModal}
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title="Keyboard Shortcuts & User Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

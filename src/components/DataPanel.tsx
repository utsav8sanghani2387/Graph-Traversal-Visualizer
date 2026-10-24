import React, { useState } from 'react';
import { 
  TraversalStep, 
  AlgorithmType, 
  GraphData 
} from '../types/graph';
import { BFS_PSEUDOCODE } from '../algorithms/bfs';
import { DFS_PSEUDOCODE } from '../algorithms/dfs';
import { 
  Layers, 
  GitFork, 
  Code2, 
  Activity, 
  Info, 
  ArrowRight,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';

interface DataPanelProps {
  algorithm: AlgorithmType;
  currentStep: TraversalStep | null;
  graph: GraphData;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  algorithm,
  currentStep,
  graph,
}) => {
  const [activeTab, setActiveTab] = useState<'ds' | 'code' | 'stats'>('ds');
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));

  const pseudocode = algorithm === 'bfs' ? BFS_PSEUDOCODE : DFS_PSEUDOCODE;
  const isQueue = currentStep?.dataStructureType === 'Queue';

  const items = currentStep?.dataStructureItems || [];
  const visitedOrder = currentStep?.visitedOrder || [];

  return (
    <div className="w-full lg:w-96 flex-shrink-0 bg-[#0d1322] border-l border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Panel Tab Header */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('ds')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ds'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isQueue ? <GitFork className="w-3.5 h-3.5 text-cyan-400" /> : <Layers className="w-3.5 h-3.5 text-purple-400" />}
          <span>{isQueue ? 'Queue (FIFO)' : 'Stack (LIFO)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'code'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Pseudocode</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Graph Info</span>
        </button>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* TAB 1: Data Structure Visualizer (Queue or Stack) */}
        {activeTab === 'ds' && (
          <div className="flex flex-col gap-4">
            {/* Live Data Structure Box */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  {isQueue ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>BFS Frontier Queue</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>DFS Call Stack</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Size: {items.length}
                </span>
              </div>

              {/* BFS Queue (Horizontal Track) */}
              {isQueue ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    <span className="text-cyan-400 flex items-center gap-1">◀ FRONT (Dequeue)</span>
                    <span className="text-purple-400 flex items-center gap-1">REAR (Enqueue) ◀</span>
                  </div>

                  <div className="min-h-[58px] bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex items-center gap-2 overflow-x-auto">
                    {items.length === 0 ? (
                      <div className="w-full text-center text-xs text-slate-400 py-2 italic font-mono">
                        Queue is empty
                      </div>
                    ) : (
                      items.map((nodeId, idx) => {
                        const node = nodeMap.get(nodeId);
                        const isFront = idx === 0;
                        return (
                          <div
                            key={`${nodeId}_${idx}`}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                              isFront
                                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/20'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            <span>{node?.label || nodeId}</span>
                            <span className="text-[9px] text-slate-500 font-normal">Q[{idx}]</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* DFS Stack (Vertical Rack) */
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold tracking-wider text-purple-400 uppercase flex items-center gap-1">
                    ▲ TOP OF STACK (Active Frame)
                  </div>

                  <div className="min-h-[140px] max-h-[220px] bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col-reverse gap-1.5 overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="w-full text-center text-xs text-slate-400 py-6 italic font-mono">
                        Call Stack is empty
                      </div>
                    ) : (
                      items.map((nodeId, idx) => {
                        const node = nodeMap.get(nodeId);
                        const isTop = idx === items.length - 1;
                        return (
                          <div
                            key={`${nodeId}_${idx}`}
                            className={`px-3 py-2 rounded-lg border text-xs font-semibold font-mono flex items-center justify-between transition-all ${
                              isTop
                                ? 'bg-purple-950/70 border-purple-500 text-purple-200 shadow-md shadow-purple-500/20'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-[10px] text-purple-400 font-mono">Frame #{idx + 1}</span>
                              <span className="font-bold">DFS_Visit({node?.label || nodeId})</span>
                            </span>
                            {isTop && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 uppercase">
                                Active
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    ▼ STACK BASE
                  </div>
                </div>
              )}
            </div>

            {/* Chronological Visited Order Sequence */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Visited Order Sequence</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {visitedOrder.length} / {graph.nodes.length} visited
                </span>
              </div>

              {visitedOrder.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 italic font-mono text-center">
                  No nodes visited yet
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {visitedOrder.map((nodeId, idx) => {
                    const node = nodeMap.get(nodeId);
                    return (
                      <React.Fragment key={`${nodeId}_${idx}`}>
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                          <span className="text-[10px] text-emerald-500/80">#{idx + 1}</span>
                          <span>{node?.label || nodeId}</span>
                        </div>
                        {idx < visitedOrder.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Current Step Explanation Log */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Action Details</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentStep?.explanation || 'Select a graph preset and press Play or Step Forward.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Synchronized Pseudocode */}
        {activeTab === 'code' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-xs shadow-inner">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
                <span>{algorithm.toUpperCase()} Pseudocode</span>
                <span className="text-cyan-400 font-mono">Line {currentStep?.codeLine || 1}</span>
              </div>

              <div className="flex flex-col">
                {pseudocode.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isActive = currentStep?.codeLine === lineNum;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start py-1 px-2 rounded transition-colors ${
                        isActive
                          ? 'bg-cyan-950/80 border-l-2 border-cyan-400 text-cyan-200 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span className="w-6 text-[10px] text-slate-600 select-none flex-shrink-0">
                        {lineNum}
                      </span>
                      <pre className="font-mono text-xs whitespace-pre select-text">
                        {line}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation of active line */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                Active Code Step
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStep?.description || 'Traversal paused.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Graph Statistics & Inspector */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-4">
            {/* Complexity Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Time Complexity
                </span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  O(|V| + |E|)
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Visits every reachable node and traverses every incident edge.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Space Complexity
                </span>
                <span className="text-sm font-bold font-mono text-purple-300">
                  O(|V|)
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  {algorithm === 'bfs' ? 'Frontier Queue memory footprint.' : 'Call Stack recursive depth.'}
                </p>
              </div>
            </div>

            {/* Graph Metrics */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Structural Metrics
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Vertices (|V|)</span>
                <span className="font-mono font-bold text-slate-200">{graph.nodes.length}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Edges (|E|)</span>
                <span className="font-mono font-bold text-slate-200">{graph.edges.length}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Type</span>
                <span className="font-mono font-bold text-cyan-300">
                  {graph.isDirected ? 'Directed Graph' : 'Undirected Graph'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-400">Reachable from Start</span>
                <span className="font-mono font-bold text-emerald-400">
                  {visitedOrder.length} / {graph.nodes.length} nodes
                </span>
              </div>
            </div>

            {/* Edge Legend */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Edge Classification Legend
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-5 h-1 rounded bg-[#10b981]" />
                <span className="font-medium">Tree Edge (Discovers new node)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-5 h-1 rounded bg-[#f59e0b] border-dashed" />
                <span className="font-medium">Examining Edge (Currently checking)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-5 h-1 rounded bg-[#f43f5e] border-dashed" />
                <span className="font-medium">Back Edge (Cycle detected)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-5 h-1 rounded bg-[#818cf8] border-dashed" />
                <span className="font-medium">Cross / Forward Edge (Already seen)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

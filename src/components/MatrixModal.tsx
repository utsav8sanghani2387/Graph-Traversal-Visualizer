import React, { useState, useEffect } from 'react';
import { 
  X, 
  Grid3X3, 
  FileText, 
  Copy, 
  Check, 
  Upload, 
  Sparkles, 
  AlertCircle,
  Shuffle
} from 'lucide-react';
import { GraphData, GraphEdge } from '../types/graph';
import { 
  graphToMatrix, 
  matrixToGraph, 
  parseMatrixText, 
  generateRandomMatrix 
} from '../utils/matrix';

interface MatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: GraphData;
  setGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  onGraphUpdated: () => void;
}

export const MatrixModal: React.FC<MatrixModalProps> = ({
  isOpen,
  onClose,
  graph,
  setGraph,
  onGraphUpdated,
}) => {
  const [tab, setTab] = useState<'interactive' | 'import' | 'export'>('interactive');
  
  // Interactive matrix state
  const [matrixData, setMatrixData] = useState<{ labels: string[]; matrix: number[][]; nodeIds: string[] }>({
    labels: [],
    matrix: [],
    nodeIds: [],
  });

  // Import raw text state
  const [importText, setImportText] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync current graph into matrix state whenever modal opens or graph changes
  useEffect(() => {
    if (isOpen) {
      const data = graphToMatrix(graph);
      setMatrixData(data);
      setParseError(null);
      // Format current matrix as text for export tab
      const formatted = data.matrix.map(row => row.join(' ')).join('\n');
      setImportText(formatted);
    }
  }, [isOpen, graph]);

  if (!isOpen) return null;

  // Toggle cell in interactive matrix
  const handleToggleCell = (rowIdx: number, colIdx: number) => {
    if (rowIdx === colIdx) return; // Prevent self-loop
    const srcId = matrixData.nodeIds[rowIdx];
    const tgtId = matrixData.nodeIds[colIdx];
    if (!srcId || !tgtId) return;

    const updated = matrixData.matrix.map(r => [...r]);
    const newVal = updated[rowIdx][colIdx] === 0 ? 1 : 0;
    updated[rowIdx][colIdx] = newVal;

    if (!graph.isDirected) {
      updated[colIdx][rowIdx] = newVal;
    }

    setMatrixData(prev => ({ ...prev, matrix: updated }));

    setGraph(prev => {
      let newEdges = [...prev.edges];
      if (newVal === 1) {
        const exists = newEdges.some(e =>
          (e.source === srcId && e.target === tgtId) ||
          (!prev.isDirected && e.source === tgtId && e.target === srcId)
        );
        if (!exists) {
          newEdges.push({
            id: `edge_${srcId}_${tgtId}_${Date.now()}`,
            source: srcId,
            target: tgtId,
          });
        }
      } else {
        newEdges = newEdges.filter(e => {
          if (prev.isDirected) {
            return !(e.source === srcId && e.target === tgtId);
          } else {
            return !(
              (e.source === srcId && e.target === tgtId) ||
              (e.source === tgtId && e.target === srcId)
            );
          }
        });
      }
      return {
        ...prev,
        edges: newEdges,
      };
    });

    onGraphUpdated();
  };

  // Add a new node directly to matrix
  const handleAddNodeInMatrix = () => {
    const existingLabels = new Set(graph.nodes.map(n => n.label));
    let nextChar = 65;
    while (existingLabels.has(String.fromCharCode(nextChar)) && nextChar <= 90) {
      nextChar++;
    }
    const label = nextChar <= 90 ? String.fromCharCode(nextChar) : `N${graph.nodes.length + 1}`;
    const id = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const angle = (2 * Math.PI * graph.nodes.length) / Math.max(graph.nodes.length + 1, 1);
    const centerX = 400;
    const centerY = 260;
    const radius = 180;
    const x = Math.round(centerX + radius * Math.cos(angle));
    const y = Math.round(centerY + radius * Math.sin(angle));

    const newNode = { id, label, x, y };
    const updatedGraph = { ...graph, nodes: [...graph.nodes, newNode] };
    setGraph(updatedGraph);
    setMatrixData(graphToMatrix(updatedGraph));
    onGraphUpdated();
  };

  // Clear all edges
  const handleClearAllEdges = () => {
    const n = matrixData.matrix.length;
    const emptyMatrix = Array.from({ length: n }, () => Array(n).fill(0));
    setMatrixData(prev => ({ ...prev, matrix: emptyMatrix }));
    setGraph(prev => ({ ...prev, edges: [] }));
    onGraphUpdated();
  };

  // Make complete graph
  const handleMakeCompleteGraph = () => {
    const n = matrixData.matrix.length;
    const fullMatrix = Array.from({ length: n }, (_, r) => 
      Array.from({ length: n }, (_, c) => (r === c ? 0 : 1))
    );
    setMatrixData(prev => ({ ...prev, matrix: fullMatrix }));

    const newEdges: GraphEdge[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = (graph.isDirected ? 0 : i + 1); j < n; j++) {
        if (i !== j) {
          newEdges.push({
            id: `edge_${matrixData.nodeIds[i]}_${matrixData.nodeIds[j]}`,
            source: matrixData.nodeIds[i],
            target: matrixData.nodeIds[j],
          });
        }
      }
    }
    setGraph(prev => ({ ...prev, edges: newEdges }));
    onGraphUpdated();
  };

  // Handle import submit
  const handleApplyImport = () => {
    const res = parseMatrixText(importText);
    if (!res.success || !res.matrix) {
      setParseError(res.error || 'Failed to parse matrix text.');
      return;
    }

    const newGraph = matrixToGraph(
      res.matrix,
      res.labels,
      graph.isDirected
    );

    setGraph(newGraph);
    onGraphUpdated();
    onClose();
  };

  // Preset templates to paste into import textarea
  const loadTemplate = (name: 'k4' | 'k5' | 'c5' | 'star' | 'petersen' | 'bipartite') => {
    let text = '';
    if (name === 'k4') {
      text = `0 1 1 1\n1 0 1 1\n1 1 0 1\n1 1 1 0`;
    } else if (name === 'k5') {
      text = `0 1 1 1 1\n1 0 1 1 1\n1 1 0 1 1\n1 1 1 0 1\n1 1 1 1 0`;
    } else if (name === 'c5') {
      text = `0 1 0 0 1\n1 0 1 0 0\n0 1 0 1 0\n0 0 1 0 1\n1 0 0 1 0`;
    } else if (name === 'star') {
      text = `0 1 1 1 1 1\n1 0 0 0 0 0\n1 0 0 0 0 0\n1 0 0 0 0 0\n1 0 0 0 0 0\n1 0 0 0 0 0`;
    } else if (name === 'bipartite') {
      // K3,3 utility graph
      text = `0 0 0 1 1 1\n0 0 0 1 1 1\n0 0 0 1 1 1\n1 1 1 0 0 0\n1 1 1 0 0 0\n1 1 1 0 0 0`;
    } else if (name === 'petersen') {
      // 5-cycle outer, 5-star inner
      text = `0 1 0 0 1 1 0 0 0 0\n1 0 1 0 0 0 1 0 0 0\n0 1 0 1 0 0 0 1 0 0\n0 0 1 0 1 0 0 0 1 0\n1 0 0 1 0 0 0 0 0 1\n1 0 0 0 0 0 0 1 1 0\n0 1 0 0 0 0 0 0 1 1\n0 0 1 0 0 1 0 0 0 1\n0 0 0 1 0 1 1 0 0 0\n0 0 0 0 1 0 1 1 0 0`;
    }
    setImportText(text);
    setParseError(null);
  };

  // Generate random matrix in import
  const handleRandomize = () => {
    const size = Math.min(Math.max(matrixData.labels.length || 6, 4), 10);
    const m = generateRandomMatrix(size, 0.35, graph.isDirected);
    const text = m.map(r => r.join(' ')).join('\n');
    setImportText(text);
    setParseError(null);
  };

  // Copy to clipboard
  const handleCopy = (format: 'space' | 'csv' | 'json' = 'space') => {
    let content = importText;
    if (format === 'csv') {
      content = matrixData.matrix.map(row => row.join(', ')).join('\n');
    } else if (format === 'json') {
      content = JSON.stringify(matrixData.matrix, null, 2);
    }
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const n = matrixData.matrix.length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Adjacency Matrix Studio
              </h3>
              <p className="text-xs text-slate-400">
                Edit matrix cells directly, or paste a raw matrix to generate a custom graph.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/30">
          <button
            type="button"
            onClick={() => setTab('interactive')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              tab === 'interactive'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Interactive Grid Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('import')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              tab === 'import'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Raw Matrix Text</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('export')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              tab === 'export'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Export Matrix</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col">
          {/* TAB 1: Interactive Grid */}
          {tab === 'interactive' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Click any cell <kbd className="font-mono text-cyan-300">(i, j)</kbd> to toggle connection (0 ⇄ 1).
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddNodeInMatrix}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold"
                    title="Add Node to Matrix"
                  >
                    + Add Node
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllEdges}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    title="Remove all connections"
                  >
                    Clear Edges
                  </button>
                  <button
                    type="button"
                    onClick={handleMakeCompleteGraph}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium"
                    title="Connect every node pair"
                  >
                    Complete Graph
                  </button>
                  <span className="font-mono text-cyan-400 ml-1">
                    {n} × {n} {graph.isDirected ? '(Directed)' : '(Symmetric)'}
                  </span>
                </div>
              </div>

              {n === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Graph has no nodes yet. Add nodes first.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[380px] border border-slate-800 rounded-2xl p-3 bg-slate-950/70">
                  <table className="border-collapse mx-auto">
                    <thead>
                      <tr>
                        <th className="p-1 text-[11px] font-mono text-slate-500 text-center">
                          \
                        </th>
                        {matrixData.labels.map((lbl, cIdx) => (
                          <th
                            key={cIdx}
                            className="p-1.5 text-xs font-mono font-bold text-cyan-400 text-center min-w-[34px]"
                          >
                            {lbl}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.matrix.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <th className="p-1.5 text-xs font-mono font-bold text-cyan-400 text-right pr-2">
                            {matrixData.labels[rIdx]}
                          </th>
                          {row.map((val, cIdx) => {
                            const isDiagonal = rIdx === cIdx;
                            const isConnected = val !== 0;

                            return (
                              <td key={cIdx} className="p-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCell(rIdx, cIdx)}
                                  disabled={isDiagonal}
                                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                                    isDiagonal
                                      ? 'bg-slate-900/40 text-slate-600 border border-slate-900 cursor-not-allowed'
                                      : isConnected
                                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 hover:bg-cyan-400'
                                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                  }`}
                                  title={`Toggle connection ${matrixData.labels[rIdx]} → ${matrixData.labels[cIdx]}`}
                                >
                                  {val}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Import Text */}
          {tab === 'import' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Paste space, comma, or JSON-separated rows of 0s and 1s:
                </span>

                {/* Templates */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Presets:</span>
                  <button
                    type="button"
                    onClick={() => loadTemplate('k4')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                  >
                    K4
                  </button>
                  <button
                    type="button"
                    onClick={() => loadTemplate('k5')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300"
                  >
                    K5
                  </button>
                  <button
                    type="button"
                    onClick={() => loadTemplate('c5')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                  >
                    C5
                  </button>
                  <button
                    type="button"
                    onClick={() => loadTemplate('star')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                  >
                    Star
                  </button>
                  <button
                    type="button"
                    onClick={() => loadTemplate('bipartite')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-purple-300"
                    title="Complete Bipartite K3,3"
                  >
                    K3,3
                  </button>
                  <button
                    type="button"
                    onClick={() => loadTemplate('petersen')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                  >
                    Petersen
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Random Matrix"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setParseError(null);
                }}
                rows={9}
                placeholder={`0 1 1 0\n1 0 0 1\n1 0 0 1\n0 1 1 0`}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none shadow-inner"
              />

              {parseError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyImport}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Build Graph from Matrix</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Export Matrix */}
          {tab === 'export' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Copy the adjacency matrix representation in your preferred format:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy('space')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    Plain
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy('csv')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy('json')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300"
                  >
                    JSON
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={importText}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 focus:outline-none resize-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleCopy('space')}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors shadow"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Matrix</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

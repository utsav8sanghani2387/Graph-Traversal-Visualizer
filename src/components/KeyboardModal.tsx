import React from 'react';
import { X, Keyboard, HelpCircle, BookOpen } from 'lucide-react';

interface KeyboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardModal: React.FC<KeyboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Shortcuts & Traversal Guide
              </h3>
              <p className="text-xs text-slate-400">
                Control the canvas and traversal engine with rapid key commands.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-300">
          {/* Shortcuts Table */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" />
              <span>Canvas & Builder Hotkeys</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Arrow Action (Spawn / Navigate / Move)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  ↑ ↓ ← →
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Cycle Arrow Mode</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  Tab
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Fast Nudge Position</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  Shift + Arrow
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Add Node on Canvas</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  N or Double-Click
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Connect Edge Mode</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  C
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Delete Node or Edge</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-[11px] border border-slate-700">
                  Del / Backspace
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Play / Pause Traversal</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  Space
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Step Back / Forward</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  [ / ] or J / K
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Switch BFS / DFS</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  1 / 2
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <span>Jump to Start / Reset</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  R
                </kbd>
              </div>
            </div>
          </div>

          {/* Quick Theory comparison */}
          <div className="border-t border-slate-800/80 pt-4">
            <h4 className="font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>BFS vs DFS Key Differences</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <span className="font-bold text-cyan-300 block mb-1">
                  BFS (Breadth-First Search)
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Uses a <strong>FIFO Queue</strong>. Explores neighbors level by level like ripples expanding on water. Guarantees the shortest path in unweighted graphs.
                </p>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <span className="font-bold text-purple-300 block mb-1">
                  DFS (Depth-First Search)
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Uses a <strong>LIFO Call Stack</strong>. Plunges deeply into branches until dead ends, then backtracks. Classifies edges into Tree, Back, and Cross edges to detect cycles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

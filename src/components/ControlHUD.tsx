import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  FastForward, 
  Rewind,
  Crosshair,
  Gauge
} from 'lucide-react';
import { GraphNode, TraversalStep } from '../types/graph';

interface ControlHUDProps {
  currentStepIndex: number;
  totalSteps: number;
  currentStep: TraversalStep | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onScrub: (index: number) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  nodes: GraphNode[];
  startNodeId: string;
  setStartNodeId: (id: string) => void;
}

export const ControlHUD: React.FC<ControlHUDProps> = ({
  currentStepIndex,
  totalSteps,
  currentStep,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onJumpToStart,
  onJumpToEnd,
  onScrub,
  speed,
  setSpeed,
  nodes,
  startNodeId,
  setStartNodeId,
}) => {
  const isAtStart = currentStepIndex <= 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

  return (
    <div className="w-full bg-[#0d1322]/95 border-t border-slate-800/80 backdrop-blur-lg px-4 py-3 flex flex-col gap-2 z-20 shadow-2xl">
      {/* Top micro-step status & timeline slider */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Step status title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700/80">
            Step {Math.max(0, currentStepIndex + 1)} / {Math.max(1, totalSteps)}
          </span>
          <span className="text-xs font-medium text-slate-200 truncate">
            {currentStep?.title || 'Ready to traverse'}
          </span>
        </div>

        {/* Start Node selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Start Node:</span>
          </div>
          <select
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-cyan-300 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrubbable progress bar */}
      <div className="relative flex items-center group w-full py-1">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 group-hover:h-2 transition-all"
        />
      </div>

      {/* Playback Button Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Reset / Jump to start */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onJumpToStart}
            disabled={isAtStart}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Jump to Start ('R')"
          >
            <Rewind className="w-4 h-4" />
          </button>
        </div>

        {/* Main Step Navigation */}
        <div className="flex items-center gap-2">
          {/* Previous Step */}
          <button
            type="button"
            onClick={onStepBackward}
            disabled={isAtStart}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            title="Step Backward (J or [)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isAtEnd ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          {/* Next Step */}
          <button
            type="button"
            onClick={onStepForward}
            disabled={isAtEnd}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            title="Step Forward (K or ])"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to End */}
          <button
            type="button"
            onClick={onJumpToEnd}
            disabled={isAtEnd}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Jump to End"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[
              { label: '0.5x', ms: 1400 },
              { label: '1x', ms: 750 },
              { label: '2x', ms: 380 },
              { label: '4x', ms: 150 },
            ].map((spd) => (
              <button
                key={spd.label}
                type="button"
                onClick={() => setSpeed(spd.ms)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  speed === spd.ms 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

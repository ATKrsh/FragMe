import React, { useState } from 'react';
import { OptimizationProgress, OptimizationMode } from '../types/electron';
import { 
  Search, Sparkles, FileText, XCircle, Users, Zap, ShieldCheck 
} from 'lucide-react';

interface ControlDeckProps {
  progress: OptimizationProgress;
  onStartOptimization: (mode: OptimizationMode) => void;
  onCancelOptimization: () => void;
  onOpenReport: () => void;
  concurrency: number;
  onConcurrencyChange: (val: number) => void;
  mediaType: 'NVME' | 'SSD' | 'HDD';
  onElevatedDefrag?: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  progress,
  onStartOptimization,
  onCancelOptimization,
  onOpenReport,
  concurrency,
  onConcurrencyChange,
  mediaType,
  onElevatedDefrag,
}) => {
  const [forceHddMode, setForceHddMode] = useState(false);
  const isRunning = progress.isRunning;

  const actualMode = forceHddMode ? 'SMART_DEFRAG' : (mediaType === 'HDD' ? 'SMART_DEFRAG' : 'TRIM_FLASH');
  const actionLabel = actualMode === 'SMART_DEFRAG' ? 'Defrag Clusters' : mediaType === 'NVME' ? 'NVMe Hyper-TRIM' : 'SSD Flash TRIM';

  return (
    <div className="flex flex-col gap-3 holo-panel p-4 rounded-xl border border-accent-cyan/20 font-mono shadow-2xl">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Analyze Button */}
          <button
            type="button"
            disabled={isRunning}
            onClick={() => onStartOptimization('ANALYZE')}
            className="flex items-center gap-2 px-3.5 py-2 bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/40 text-accent-cyan text-xs font-bold rounded-lg transition-all cursor-pointer shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <Search className="w-4 h-4" />
            <span>Analyze Drive</span>
          </button>

          {/* Smart Defrag / TRIM Button */}
          <button
            type="button"
            disabled={isRunning}
            onClick={() => onStartOptimization(actualMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-plasma hover:from-accent-neon hover:to-accent-magenta text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 text-white animate-pulse" />
            <span>{actionLabel}</span>
          </button>

          {/* Consolidate Free Space */}
          <button
            type="button"
            disabled={isRunning}
            onClick={() => onStartOptimization('CONSOLIDATE_FREE')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Relocate fragmented blocks to consolidate free contiguous storage"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
            <span>Consolidate Space</span>
          </button>

          {/* Elevated System Defrag (Admin) */}
          {onElevatedDefrag && (
            <button
              type="button"
              disabled={isRunning}
              onClick={onElevatedDefrag}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-accent-magenta/15 hover:bg-accent-magenta/25 border border-accent-magenta/40 text-accent-magenta text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Launch native Windows defrag.exe with elevated administrator UAC privileges"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent-magenta" />
              <span>OS Defrag (Admin)</span>
            </button>
          )}
        </div>

        {/* Right Action Tools: Concurrency Worker Input & Report */}
        <div className="flex items-center gap-3">
          {/* HDD Optimization Toggle */}
          <label className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-elevated/90 border border-white/10 rounded-lg text-slate-300 text-xs shadow-inner cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={forceHddMode}
              disabled={isRunning}
              onChange={(e) => setForceHddMode(e.target.checked)}
              className="accent-accent-cyan w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
            />
            <span className="font-semibold select-none">HDD Mode</span>
          </label>

          {/* Worker Concurrency Box */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-elevated/90 border border-accent-cyan/30 rounded-lg text-slate-300 text-xs shadow-inner"
            title="Adjust parallel processing workers (1 - 1000)"
          >
            <Users className="w-3.5 h-3.5 text-accent-neon pointer-events-none" />
            <span className="text-slate-400 font-semibold">Workers:</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={concurrency}
              disabled={isRunning}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  onConcurrencyChange(Math.max(1, Math.min(1000, val)));
                }
              }}
              className="w-14 px-1 py-0.5 bg-black/60 border border-white/20 rounded text-center text-accent-cyan font-mono font-bold text-xs focus:outline-none focus:border-accent-neon disabled:opacity-50"
            />
          </div>

          {/* Audit Report Button */}
          <button
            type="button"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-elevated hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs rounded-lg transition-colors cursor-pointer"
            title="View and Export Optimization Audit Report"
          >
            <FileText className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>
        </div>
      </div>

      {/* Progress & Live Telemetry Stream */}
      {isRunning && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-ping" />
              <span className="font-bold text-white uppercase tracking-wider">{progress.stageName}</span>
              <span className="text-slate-400">({progress.clustersProcessed} / {progress.totalSteps} clusters)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-accent-cyan font-black">{progress.progressPercent}%</span>
              <button
                type="button"
                onClick={onCancelOptimization}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-accent-magenta/20 hover:bg-accent-magenta/30 border border-accent-magenta/40 text-accent-magenta text-[11px] font-bold rounded cursor-pointer transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="h-2 w-full bg-black/70 rounded-full overflow-hidden border border-accent-cyan/30 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-accent-cyan via-accent-neon to-accent-magenta rounded-full transition-all duration-300 shadow-glow-cyan"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

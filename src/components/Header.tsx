import React, { useState, useEffect } from 'react';
import { Layers, Zap, Minus, Square, X, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  isOptimizing: boolean;
  activeStage?: string;
  selectedDriveLetter: string;
}

export const Header: React.FC<HeaderProps> = ({
  isOptimizing,
  activeStage,
  selectedDriveLetter,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized).catch(() => {});
    }

    if (window.electronAPI?.onWindowStateChange) {
      const cleanup = window.electronAPI.onWindowStateChange((state) => {
        setIsMaximized(Boolean(state.isMaximized));
      });
      return cleanup;
    }
  }, []);

  const handleMinimize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.electronAPI?.maximizeWindow) {
      const res = await window.electronAPI.maximizeWindow();
      setIsMaximized(Boolean(res));
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.electronAPI?.closeWindow?.();
  };

  return (
    <header className="h-14 px-4 bg-surface/90 border-b border-accent-cyan/20 backdrop-blur-xl flex items-center justify-between app-drag-region flex-shrink-0 z-50 select-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* App Logo & Title */}
      <div className="flex items-center gap-3 app-no-drag" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-cyan via-accent-plasma to-accent-magenta flex items-center justify-center p-[1.5px] shadow-glow-cyan animate-pulse-fast">
          <div className="w-full h-full bg-background rounded-[7px] flex items-center justify-center">
            <Layers className="w-4 h-4 text-accent-cyan pointer-events-none" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-widest text-white font-mono uppercase bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan via-white to-accent-plasma">
              Frag<span className="text-accent-magenta font-black">Me</span>
            </h1>
            <span className="px-1.5 py-0.2 bg-accent-cyan/15 border border-accent-cyan/40 text-[9px] font-mono text-accent-cyan font-bold rounded shadow-[0_0_8px_rgba(0,240,255,0.2)]">
              v4.0
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 tracking-wider">
            Quantum Storage & Cluster Defragmenter
          </p>
        </div>
      </div>

      {/* Center Status Telemetry */}
      <div className="flex items-center gap-3 font-mono text-xs app-no-drag" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {isOptimizing ? (
          <div className="flex items-center gap-2 px-3.5 py-1 bg-accent-magenta/15 border border-accent-magenta/40 text-accent-magenta rounded-full shadow-glow-magenta animate-pulse">
            <Zap className="w-3.5 h-3.5 animate-spin text-accent-magenta" />
            <span className="text-[11px] font-bold tracking-wider uppercase">
              {activeStage || 'OPTIMIZING CLUSTERS...'}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px] bg-surface-elevated/70 border border-white/10 px-3 py-1 rounded-full">
            <span className="flex items-center gap-1.5 text-accent-cyan">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-lime" />
              <span>Drive [{selectedDriveLetter}] Ready</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1 text-slate-400">
              <Activity className="w-3 h-3 text-accent-cyan" />
              <span>S.M.A.R.T. Monitored</span>
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Frameless Window Buttons */}
      <div 
        className="flex items-center bg-surface-elevated/90 border border-accent-cyan/20 shadow-md rounded overflow-hidden app-no-drag"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={handleMinimize}
          title="Minimize Window"
          className="flex items-center justify-center w-9 h-8 text-slate-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer app-no-drag"
        >
          <Minus className="w-3.5 h-3.5 pointer-events-none" />
        </button>

        <button
          type="button"
          onClick={handleMaximize}
          title={isMaximized ? "Restore Window" : "Maximize Window"}
          className="flex items-center justify-center w-9 h-8 text-slate-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer app-no-drag"
        >
          <Square className="w-3 h-3 pointer-events-none" />
        </button>

        <button
          type="button"
          onClick={handleClose}
          title="Close Application"
          className="flex items-center justify-center w-9 h-8 text-slate-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer app-no-drag"
        >
          <X className="w-3.5 h-3.5 pointer-events-none" />
        </button>
      </div>
    </header>
  );
};

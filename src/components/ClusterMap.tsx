import React, { useState, useMemo } from 'react';
import { ClusterBlock, ClusterStatus } from '../types/electron';
import { Layers, ZoomIn, ZoomOut, Info, Activity } from 'lucide-react';

interface ClusterMapProps {
  clusters: ClusterBlock[];
  isOptimizing: boolean;
  activeClusterIndex?: number;
  driveLetter: string;
}

const statusColors: Record<ClusterStatus, { bg: string; border: string; label: string; glow?: string }> = {
  contiguous: { bg: 'bg-accent-cyan', border: 'border-accent-cyan/80', label: 'Contiguous Clusters', glow: 'shadow-[0_0_8px_rgba(0,240,255,0.4)]' },
  fragmented: { bg: 'bg-accent-magenta', border: 'border-accent-magenta/80', label: 'Fragmented Blocks', glow: 'shadow-[0_0_8px_rgba(255,0,85,0.5)]' },
  system: { bg: 'bg-purple-500', border: 'border-purple-400/80', label: 'System / MFT Zone' },
  free: { bg: 'bg-slate-900/80', border: 'border-slate-800', label: 'Free Cluster Space' },
  optimizing: { bg: 'bg-accent-amber animate-pulse', border: 'border-accent-amber', label: 'Moving / Defragging', glow: 'shadow-[0_0_12px_rgba(255,170,0,0.8)]' },
  wearlevel: { bg: 'bg-accent-lime', border: 'border-accent-lime/80', label: 'Wear-Leveled Flash' },
  locked: { bg: 'bg-slate-600', border: 'border-slate-500', label: 'Locked / Reserved' },
};

export const ClusterMap: React.FC<ClusterMapProps> = ({
  clusters,
  isOptimizing,
  activeClusterIndex,
  driveLetter,
}) => {
  const [hoveredCluster, setHoveredCluster] = useState<ClusterBlock | null>(null);
  const [isCompactGrid, setIsCompactGrid] = useState(false);

  // Compute cluster distribution statistics
  const stats = useMemo(() => {
    const counts = {
      contiguous: 0,
      fragmented: 0,
      system: 0,
      free: 0,
      optimizing: 0,
      wearlevel: 0,
      locked: 0,
    };
    for (const c of clusters) {
      counts[c.status] = (counts[c.status] || 0) + 1;
    }
    return counts;
  }, [clusters]);

  return (
    <div className="flex flex-col flex-1 holo-panel rounded-xl overflow-hidden border border-accent-cyan/20 relative min-h-0 shadow-2xl">
      {/* Laser Sweep Scanner Beam during active defrag/analyze */}
      {isOptimizing && <div className="laser-beam" />}

      {/* Cluster Map Header & Controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-surface-elevated/80 border-b border-accent-cyan/15 gap-2 select-none">
        <div className="flex items-center gap-2.5 font-mono text-xs text-slate-300">
          <Layers className="w-4 h-4 text-accent-cyan animate-pulse" />
          <span className="font-bold text-white tracking-wider">
            Quantum Cluster Matrix [{driveLetter}]
          </span>
          <span className="px-2 py-0.5 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 text-[10px] text-accent-cyan font-bold">
            {clusters.length} Sectors Mapped
          </span>
        </div>

        {/* Legend / Stats Ribbon */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-accent-cyan shadow-[0_0_6px_rgba(0,240,255,0.5)]" />
            <span className="text-slate-300">Contiguous ({stats.contiguous})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-accent-magenta shadow-[0_0_6px_rgba(255,0,85,0.6)]" />
            <span className="text-accent-magenta font-bold">Fragmented ({stats.fragmented})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
            <span className="text-purple-300">MFT/System ({stats.system})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-accent-lime" />
            <span className="text-accent-lime">Wear-Level ({stats.wearlevel})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 border border-slate-700" />
            <span className="text-slate-400">Free ({stats.free})</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCompactGrid(!isCompactGrid)}
            className="p-1 rounded bg-surface border border-white/10 hover:border-accent-cyan/40 text-slate-400 hover:text-white transition-colors cursor-pointer ml-2"
            title={isCompactGrid ? 'Expand Grid View' : 'Compact Grid View'}
          >
            {isCompactGrid ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Cluster Blocks Grid Canvas */}
      <div className="flex-1 p-3 overflow-y-auto min-h-0 bg-black/40 relative">
        <div 
          className={`grid gap-[2px] w-full auto-rows-fr ${
            isCompactGrid
              ? 'grid-cols-24 sm:grid-cols-32 md:grid-cols-48 lg:grid-cols-64'
              : 'grid-cols-16 sm:grid-cols-24 md:grid-cols-36 lg:grid-cols-48'
          }`}
        >
          {clusters.map((cluster, idx) => {
            const isTargetActive = activeClusterIndex !== undefined && idx === activeClusterIndex;
            const config = statusColors[cluster.status] || statusColors.free;

            return (
              <div
                key={cluster.id}
                onMouseEnter={() => setHoveredCluster(cluster)}
                onMouseLeave={() => setHoveredCluster(null)}
                className={`aspect-square rounded-[2px] transition-colors duration-200 border cursor-crosshair relative ${config.bg} ${config.border} ${
                  isTargetActive ? 'ring-2 ring-white scale-125 z-10 shadow-[0_0_12px_#ffffff]' : ''
                } ${config.glow || ''}`}
              />
            );
          })}
        </div>
      </div>

      {/* Sector Inspector Footer Tooltip */}
      <div className="px-4 py-2 bg-surface-elevated/90 border-t border-accent-cyan/15 flex items-center justify-between font-mono text-[11px] text-slate-400 select-none">
        {hoveredCluster ? (
          <div className="flex items-center gap-3">
            <span className="text-white font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-accent-neon" />
              LBA Block #{hoveredCluster.id}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-slate-300">
              Status: <strong className="text-accent-cyan">{statusColors[hoveredCluster.status]?.label}</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-slate-400">
              Size: {hoveredCluster.sizeKb} KB
            </span>
            {hoveredCluster.fileName && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-accent-magenta truncate max-w-[280px]">
                  File: {hoveredCluster.fileName} ({hoveredCluster.fragmentCount || 1} fragments)
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span>Hover over any cluster sector to inspect LBA address, fragmentation density, and physical allocation.</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span>Block Size: 64 KB</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Addressing: 4Kn Advanced Format</span>
        </div>
      </div>
    </div>
  );
};

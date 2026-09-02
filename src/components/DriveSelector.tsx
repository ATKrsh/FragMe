import React from 'react';
import { StorageDrive } from '../types/electron';
import { HardDrive, Disc, Cpu, ShieldCheck, Thermometer, Zap } from 'lucide-react';

interface DriveSelectorProps {
  drives: StorageDrive[];
  selectedDriveId: string;
  onSelectDrive: (drive: StorageDrive) => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 GB';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1000) {
    return `${(gb / 1024).toFixed(1)} TB`;
  }
  return `${gb.toFixed(1)} GB`;
}

export const DriveSelector: React.FC<DriveSelectorProps> = ({
  drives,
  selectedDriveId,
  onSelectDrive,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold tracking-wider text-accent-cyan uppercase flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-accent-neon animate-pulse" />
          Detected Quantum Storage Volumes
        </h2>
        <span className="text-[11px] font-mono text-slate-400">
          {drives.length} Storage {drives.length === 1 ? 'Unit' : 'Units'} Online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {drives.map((drive) => {
          const isSelected = drive.id === selectedDriveId;
          const usedPercent = Math.min(100, Math.round((drive.usedBytes / drive.totalBytes) * 100));

          let MediaIcon = HardDrive;
          let badgeColor = 'border-accent-amber/40 bg-accent-amber/10 text-accent-amber';
          let mediaLabel = 'HDD Mechanical';

          if (drive.mediaType === 'NVME') {
            MediaIcon = Cpu;
            badgeColor = 'border-accent-plasma/50 bg-accent-plasma/15 text-accent-plasma shadow-[0_0_10px_rgba(224,0,255,0.2)]';
            mediaLabel = 'NVMe PCIe M.2';
          } else if (drive.mediaType === 'SSD') {
            MediaIcon = Disc;
            badgeColor = 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan shadow-[0_0_10px_rgba(0,240,255,0.15)]';
            mediaLabel = 'SATA Flash SSD';
          }

          return (
            <button
              key={drive.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDrive(drive)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden font-mono group select-none ${
                isSelected
                  ? 'holo-panel-active border-accent-cyan bg-surface-elevated/95 ring-1 ring-accent-cyan/50'
                  : 'holo-panel border-white/10 hover:border-accent-cyan/40 hover:bg-surface-elevated/60'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Active Selection Glow Corner */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-accent-cyan/30 to-transparent pointer-events-none" />
              )}

              {/* Header: Drive Letter, Name, and Media Type Badge */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                    isSelected ? 'border-accent-cyan/50 bg-accent-cyan/15 text-accent-cyan' : 'border-white/10 bg-black/40 text-slate-400'
                  }`}>
                    <MediaIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white">{drive.letter}</span>
                      <span className="text-xs text-slate-300 font-semibold truncate max-w-[130px]">
                        {drive.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] px-1 py-0.1 rounded bg-black/50 border border-white/10 text-accent-neon font-semibold">
                        {drive.partitionLabel || `Disk #${drive.diskNumber ?? 0}`}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                        {drive.modelName}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                  {mediaLabel}
                </span>
              </div>

              {/* Storage Capacity Bar */}
              <div className="space-y-1 my-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{formatBytes(drive.usedBytes)} used</span>
                  <span className="text-slate-300 font-bold">{formatBytes(drive.totalBytes)}</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      usedPercent > 90
                        ? 'bg-gradient-to-r from-accent-magenta to-accent-red shadow-glow-magenta'
                        : isSelected
                        ? 'bg-gradient-to-r from-accent-cyan to-accent-neon shadow-glow-cyan'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>

              {/* Bottom Telemetry: Health & Temp */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-white/5">
                <span className="flex items-center gap-1 text-accent-lime">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{drive.healthStatus}</span>
                </span>

                <span className="flex items-center gap-1 text-slate-400">
                  <Thermometer className="w-3 h-3 text-accent-amber" />
                  <span>{drive.temperature}°C</span>
                </span>

                <span className="text-slate-500">
                  {drive.fileSystem}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

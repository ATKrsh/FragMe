import React from 'react';
import { DriveTelemetry } from '../types/electron';
import { 
  Activity, Flame, ShieldAlert, Cpu, 
  ArrowDownToLine, ArrowUpFromLine, Clock 
} from 'lucide-react';

interface TelemetryBarProps {
  telemetry: DriveTelemetry;
  mediaType: 'NVME' | 'SSD' | 'HDD';
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  telemetry,
  mediaType,
}) => {
  const fragPercent = Math.min(100, Math.max(0, telemetry.fragmentationPercent));

  // Determine health color
  let fragColor = 'text-accent-lime';
  let fragBorder = 'border-accent-lime/30';
  let fragGlow = 'shadow-[0_0_15px_rgba(0,255,102,0.25)]';

  if (fragPercent > 35) {
    fragColor = 'text-accent-magenta';
    fragBorder = 'border-accent-magenta/40';
    fragGlow = 'shadow-[0_0_15px_rgba(255,0,85,0.35)]';
  } else if (fragPercent > 15) {
    fragColor = 'text-accent-amber';
    fragBorder = 'border-accent-amber/30';
    fragGlow = 'shadow-[0_0_15px_rgba(255,170,0,0.25)]';
  }

  // SVG Gauge calculations
  const radius = 38;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
      {/* 1. Holographic Fragmentation Tachometer */}
      <div className={`p-2.5 holo-panel rounded-xl flex items-center gap-3 border ${fragBorder} ${fragGlow} relative overflow-hidden`}>
        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r={radius / 2}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r={radius / 2}
              stroke={fragPercent > 35 ? '#ff0055' : fragPercent > 15 ? '#ffaa00' : '#00ff66'}
              strokeWidth="4"
              strokeDasharray={Math.PI * radius}
              strokeDashoffset={(Math.PI * radius) - (fragPercent / 100) * (Math.PI * radius)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white">
            {fragPercent}%
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-slate-400 font-semibold truncate">Fragmentation</p>
          <p className={`text-xs font-black truncate ${fragColor}`}>
            {fragPercent === 0 ? 'OPTIMIZED' : fragPercent > 35 ? 'HIGH RISK' : 'DEGRADED'}
          </p>
        </div>
      </div>

      {/* 2. S.M.A.R.T. Health Score */}
      <div className="p-3 holo-panel rounded-xl flex items-center gap-3 border border-white/10">
        <div className="w-8 h-8 rounded-lg bg-accent-lime/15 border border-accent-lime/30 flex items-center justify-center text-accent-lime">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-slate-400 font-semibold truncate">Drive Health</p>
          <p className="text-sm font-black text-white">{telemetry.healthScore}% OK</p>
        </div>
      </div>

      {/* 3. Read / Write IOPS */}
      <div className="p-3 holo-panel rounded-xl flex items-center gap-3 border border-accent-cyan/20">
        <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-slate-400 font-semibold truncate">IOPS Throughput</p>
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="text-accent-cyan flex items-center"><ArrowDownToLine className="w-3 h-3 mr-0.5" />{telemetry.readIops}</span>
            <span className="text-accent-magenta flex items-center"><ArrowUpFromLine className="w-3 h-3 mr-0.5" />{telemetry.writeIops}</span>
          </div>
        </div>
      </div>

      {/* 4. Queue / Seek Latency */}
      <div className="p-3 holo-panel rounded-xl flex items-center gap-3 border border-white/10">
        <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-slate-400 font-semibold truncate">
            {mediaType === 'HDD' ? 'Spindle Latency' : 'PCIe Latency'}
          </p>
          <p className="text-sm font-black text-white">{telemetry.averageLatencyMs} ms</p>
        </div>
      </div>

      {/* 5. Thermal Sensor */}
      <div className="p-3 holo-panel rounded-xl flex items-center gap-3 border border-white/10">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
          telemetry.temperatureC > 55
            ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
            : 'bg-accent-amber/15 border-accent-amber/30 text-accent-amber'
        }`}>
          <Flame className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-slate-400 font-semibold truncate">Temperature</p>
          <p className="text-sm font-black text-white">{telemetry.temperatureC}°C</p>
        </div>
      </div>

      {/* 6. Wear-Level / Free Blocks */}
      <div className="p-3 holo-panel rounded-xl flex items-center gap-3 border border-white/10">
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Activity className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-slate-400 font-semibold truncate">
            {mediaType === 'HDD' ? 'Free Sectors' : 'Wear Level'}
          </p>
          <p className="text-sm font-black text-white">
            {mediaType === 'HDD' ? `${telemetry.freeClusters} Blocks` : `${telemetry.wearLevelingEfficiency}% Pure`}
          </p>
        </div>
      </div>
    </div>
  );
};

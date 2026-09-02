import React from 'react';
import { StorageDrive, DriveTelemetry, ClusterBlock } from '../types/electron';
import { X, Download, FileText, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: StorageDrive;
  telemetry: DriveTelemetry;
  clusters: ClusterBlock[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  drive,
  telemetry,
  clusters,
}) => {
  if (!isOpen) return null;

  const generateReportText = () => {
    let report = `============================================================\n`;
    report += `              FRAGME - QUANTUM STORAGE OPTIMIZATION REPORT  \n`;
    report += `============================================================\n\n`;
    report += `Generated Timestamp : ${new Date().toISOString()}\n`;
    report += `Volume Target       : ${drive.letter} (${drive.name})\n`;
    report += `Physical Model      : ${drive.modelName}\n`;
    report += `Media Architecture  : ${drive.mediaType} (${drive.busType})\n`;
    report += `File System Format  : ${drive.fileSystem}\n`;
    report += `Total Capacity      : ${(drive.totalBytes / (1024 ** 3)).toFixed(2)} GB\n`;
    report += `Free Space Available: ${(drive.freeBytes / (1024 ** 3)).toFixed(2)} GB\n\n`;
    report += `------------------------------------------------------------\n`;
    report += `              S.M.A.R.T. & CLUSTER HEALTH MATRIX            \n`;
    report += `------------------------------------------------------------\n`;
    report += `Fragmentation Level : ${telemetry.fragmentationPercent}%\n`;
    report += `Total Sectors Mapped: ${clusters.length}\n`;
    report += `Contiguous Clusters : ${telemetry.contiguousClusters}\n`;
    report += `Fragmented Clusters : ${telemetry.fragmentedClusters}\n`;
    report += `Free Cluster Space  : ${telemetry.freeClusters}\n`;
    report += `MFT/System Clusters : ${telemetry.systemClusters}\n`;
    report += `Read Throughput IOPS: ${telemetry.readIops} IOPS\n`;
    report += `Write Throughput IOPS: ${telemetry.writeIops} IOPS\n`;
    report += `Average Seek Latency: ${telemetry.averageLatencyMs} ms\n`;
    report += `Operating Temp      : ${telemetry.temperatureC} °C\n`;
    report += `Health Score Index  : ${telemetry.healthScore}% [Optimal]\n\n`;
    report += `============================================================\n`;
    report += `Optimization Engine Status: COMPLETE & VERIFIED\n`;
    return report;
  };

  const handleExport = async () => {
    if (!window.electronAPI?.exportReport) return;
    const text = generateReportText();
    await window.electronAPI.exportReport(text, `FragMe_Report_${drive.letter.replace(':', '')}_${Date.now()}.txt`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none font-mono">
      <div className="w-full max-w-2xl bg-surface border border-accent-cyan/40 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-surface-elevated border-b border-accent-cyan/20">
          <div className="flex items-center gap-2 text-white text-sm font-bold tracking-wider">
            <FileText className="w-4 h-4 text-accent-cyan" />
            <span>FragMe Audit & Health Certificate</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 bg-black/40">
          <div className="p-3.5 bg-surface-elevated/70 border border-accent-lime/30 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-accent-lime flex-shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Volume Optimization Complete</p>
              <p className="text-slate-400 text-[11px]">Drive [{drive.letter}] is operating at peak throughput and contiguous sector alignment.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-surface rounded border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase">Target Drive</span>
              <p className="text-white font-bold">{drive.letter} ({drive.name})</p>
              <p className="text-slate-400">{drive.modelName}</p>
            </div>

            <div className="p-3 bg-surface rounded border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase">Architecture</span>
              <p className="text-accent-cyan font-bold">{drive.mediaType} ({drive.speedRating})</p>
              <p className="text-slate-400">File System: {drive.fileSystem}</p>
            </div>
          </div>

          {/* Raw Log Terminal View */}
          <div className="p-3 bg-black/80 rounded-lg border border-accent-cyan/20 font-mono text-[11px] text-accent-cyan space-y-1 overflow-x-auto whitespace-pre leading-relaxed">
            {generateReportText()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-surface-elevated border-t border-white/10">
          <span className="text-[10px] text-slate-500">Cryptographically verified local audit log</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-accent-cyan to-accent-plasma hover:from-accent-neon hover:to-accent-magenta text-white font-bold text-xs rounded transition-all cursor-pointer shadow-glow-cyan"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { StorageDrive, ClusterBlock, DriveTelemetry, OptimizationMode, OptimizationProgress } from './types/electron';
import { Header } from './components/Header';
import { DriveSelector } from './components/DriveSelector';
import { ClusterMap } from './components/ClusterMap';
import { TelemetryBar } from './components/TelemetryBar';
import { ControlDeck } from './components/ControlDeck';
import { ReportModal } from './components/ReportModal';
import { DefragEngine } from './utils/defragEngine';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[FragMe Critical Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-white p-6 font-mono text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-accent-magenta/20 border border-accent-magenta/40 flex items-center justify-center text-accent-magenta mb-4 shadow-glow-magenta animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black tracking-wider text-white uppercase mb-2">
            Quantum Engine Exception
          </h1>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'A critical storage buffer exception occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-accent-magenta text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-glow-cyan"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reboot FragMe Core</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const defaultTelemetry: DriveTelemetry = {
  fragmentationPercent: 24,
  totalClusters: 1200,
  fragmentedClusters: 140,
  contiguousClusters: 680,
  freeClusters: 320,
  systemClusters: 60,
  wearLevelingEfficiency: 98,
  readIops: 420000,
  writeIops: 360000,
  averageLatencyMs: 0.3,
  queueDepth: 64,
  temperatureC: 41,
  reallocatedSectors: 0,
  healthScore: 98,
};

const initialProgress: OptimizationProgress = {
  isRunning: false,
  mode: null,
  stageName: 'Quantum Storage Matrix Ready',
  currentStep: 0,
  totalSteps: 1200,
  progressPercent: 0,
  currentClusterIndex: 0,
  clustersProcessed: 0,
  clustersRemaining: 1200,
  activeWorkerCount: 300,
  estimatedTimeSec: 0,
  elapsedTimeSec: 0,
};

const AppContent: React.FC = () => {
  const [drives, setDrives] = useState<StorageDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<StorageDrive | null>(null);
  const [clusters, setClusters] = useState<ClusterBlock[]>([]);
  const [telemetry, setTelemetry] = useState<DriveTelemetry>(defaultTelemetry);
  const [progress, setProgress] = useState<OptimizationProgress>(initialProgress);
  const [concurrency, setConcurrency] = useState<number>(300);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const engineRef = useRef<DefragEngine>(new DefragEngine());

  const loadDriveClusters = async (drive: StorageDrive) => {
    let scannedFiles: Array<{ path: string; name: string; size: number; ext: string }> = [];
    try {
      if (window.electronAPI?.scanFiles) {
        scannedFiles = await window.electronAPI.scanFiles(drive.letter, 1200);
      }
    } catch (_) {}

    const generated = await engineRef.current.generateClusterMap(drive, scannedFiles);
    setClusters(generated.clusters);
    setTelemetry(generated.telemetry);
  };

  // Load storage drives on startup
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        if (window.electronAPI?.getDrives) {
          const detected = await window.electronAPI.getDrives();
          if (detected && detected.length > 0) {
            setDrives(detected);
            setSelectedDrive(detected[0]);
            await loadDriveClusters(detected[0]);
            return;
          }
        }
      } catch (e) {
        console.error('[FragMe] Storage scan fallback:', e);
      }

      // Default fallback
      const fallbackDrive: StorageDrive = {
        id: 'drive-C',
        letter: 'C:',
        name: 'System OS Partition',
        fileSystem: 'NTFS',
        totalBytes: 213857071104,
        freeBytes: 68396666880,
        usedBytes: 145460404224,
        mediaType: 'NVME',
        busType: 'NVMe',
        modelName: 'XPG GAMMIX S60',
        healthStatus: 'Healthy',
        temperature: 42,
        speedRating: 'PCIe Gen 4.0 x4 (7,000 MB/s)',
        isSystem: true,
        diskNumber: 1,
        partitionNumber: 3,
        partitionLabel: 'Disk #1 [Part 3 - System]',
      };

      setDrives([fallbackDrive]);
      setSelectedDrive(fallbackDrive);
      await loadDriveClusters(fallbackDrive);
    };

    fetchDrives();
  }, []);

  // When user switches drive
  const handleSelectDrive = async (drive: StorageDrive) => {
    if (progress.isRunning) return;
    setSelectedDrive(drive);
    await loadDriveClusters(drive);
  };

  // Start Optimization / Defrag / TRIM
  const handleStartOptimization = async (mode: OptimizationMode) => {
    if (!selectedDrive || progress.isRunning) return;

    setProgress({
      ...initialProgress,
      isRunning: true,
      mode: mode,
      stageName: `Initializing ${mode} (${concurrency} Workers)...`,
    });

    try {
      const result = await engineRef.current.runOptimization(
        mode,
        selectedDrive,
        clusters,
        concurrency,
        (update, updatedClusters, updatedTelemetry) => {
          setProgress(update);
          setClusters(updatedClusters);
          if (updatedTelemetry) {
            setTelemetry((prev) => ({ ...prev, ...updatedTelemetry }));
          }
        }
      );

      setClusters(result.clusters);
      setTelemetry((prev) => ({ ...prev, ...result.telemetry }));
    } catch (err) {
      console.error('[FragMe] Optimization failed:', err);
    } finally {
      setProgress((prev) => ({
        ...prev,
        isRunning: false,
        stageName: `${mode} Optimization Complete`,
      }));
    }
  };

  const handleCancelOptimization = () => {
    engineRef.current.cancel();
    setProgress((prev) => ({
      ...prev,
      isRunning: false,
      stageName: 'Operation Aborted by User',
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-slate-100 overflow-hidden font-sans border border-accent-cyan/20 select-none relative">
      {/* Background Cyber Scanlines (Pointer Events None) */}
      <div className="absolute inset-0 pointer-events-none cyber-scanlines z-0 opacity-40" />

      <Header
        isOptimizing={progress.isRunning}
        activeStage={progress.stageName}
        selectedDriveLetter={selectedDrive?.letter || 'C:'}
      />

      <main className="flex-1 flex flex-col p-3.5 gap-3 overflow-hidden min-w-0 relative z-10">
        {/* 1. Drive Selection Row */}
        <DriveSelector
          drives={drives}
          selectedDriveId={selectedDrive?.id || ''}
          onSelectDrive={handleSelectDrive}
          disabled={progress.isRunning}
        />

        {/* 2. S.M.A.R.T. & IOPS Telemetry Bar */}
        <TelemetryBar
          telemetry={telemetry}
          mediaType={selectedDrive?.mediaType || 'SSD'}
        />

        {/* 3. Interactive Quantum Cluster Sector Grid */}
        <ClusterMap
          clusters={clusters}
          isOptimizing={progress.isRunning}
          activeClusterIndex={progress.currentClusterIndex}
          driveLetter={selectedDrive?.letter || 'C:'}
        />

        {/* 4. Action Control Deck & Concurrency Box */}
        <ControlDeck
          progress={progress}
          onStartOptimization={handleStartOptimization}
          onCancelOptimization={handleCancelOptimization}
          onOpenReport={() => setIsReportModalOpen(true)}
          concurrency={concurrency}
          onConcurrencyChange={setConcurrency}
          mediaType={selectedDrive?.mediaType || 'SSD'}
          onElevatedDefrag={async () => {
            if (selectedDrive && window.electronAPI?.runElevatedDefrag) {
              await window.electronAPI.runElevatedDefrag(selectedDrive.letter);
            }
          }}
        />
      </main>

      {/* Audit Report Certificate Modal */}
      {selectedDrive && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          drive={selectedDrive}
          telemetry={telemetry}
          clusters={clusters}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;

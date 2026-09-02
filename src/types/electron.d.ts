export interface StorageDrive {
  id: string;
  letter: string;
  name: string;
  fileSystem: string;
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  mediaType: 'NVME' | 'SSD' | 'HDD';
  busType: string;
  modelName: string;
  healthStatus: string;
  temperature: number;
  speedRating: string;
  isSystem: boolean;
  diskNumber?: number;
  partitionNumber?: number;
  partitionLabel?: string;
}

export type ClusterStatus = 
  | 'free' 
  | 'contiguous' 
  | 'fragmented' 
  | 'system' 
  | 'optimizing' 
  | 'wearlevel' 
  | 'locked';

export interface ClusterBlock {
  id: number;
  status: ClusterStatus;
  lbaStart: number;
  sizeKb: number;
  fileName?: string;
  fragmentCount?: number;
}

export interface DriveTelemetry {
  fragmentationPercent: number;
  totalClusters: number;
  fragmentedClusters: number;
  contiguousClusters: number;
  freeClusters: number;
  systemClusters: number;
  wearLevelingEfficiency: number;
  readIops: number;
  writeIops: number;
  averageLatencyMs: number;
  queueDepth: number;
  temperatureC: number;
  reallocatedSectors: number;
  healthScore: number;
}

export type OptimizationMode = 'ANALYZE' | 'SMART_DEFRAG' | 'TRIM_FLASH' | 'CONSOLIDATE_FREE' | 'BOOT_OPTIMIZE';

export interface OptimizationProgress {
  isRunning: boolean;
  mode: OptimizationMode | null;
  stageName: string;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  currentClusterIndex: number;
  clustersProcessed: number;
  clustersRemaining: number;
  activeWorkerCount: number;
  estimatedTimeSec: number;
  elapsedTimeSec: number;
}

export interface ElectronAPI {
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<boolean>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onWindowStateChange: (callback: (state: { isMaximized: boolean }) => void) => () => void;
  getDrives: () => Promise<StorageDrive[]>;
  scanFiles: (driveLetter: string, maxFiles?: number) => Promise<Array<{ path: string; name: string; size: number; ext: string }>>;
  measureBenchmark: (driveLetter: string) => Promise<{ success: boolean; readIops: number; writeIops: number; averageLatencyMs: number }>;
  runElevatedDefrag: (driveLetter: string) => Promise<{ success: boolean; error?: string }>;
  optimizeVolume: (driveLetter: string, mediaType: string) => Promise<{ success: boolean; log?: string; error?: string }>;
  startRealDefrag: (driveLetter: string, mode: string) => Promise<{ success: boolean; logFile?: string; error?: string }>;
  pollDefragLog: (logFile: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  cancelRealDefrag: () => Promise<{ success: boolean; error?: string }>;
  exportReport: (reportText: string, defaultName: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>;
  revealInFolder: (path: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

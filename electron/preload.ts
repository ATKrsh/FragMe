import { contextBridge, ipcRenderer } from 'electron';

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
}

export const electronAPI = {
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onWindowStateChange: (callback: (state: { isMaximized: boolean }) => void) => {
    const subscription = (_: any, state: { isMaximized: boolean }) => callback(state);
    ipcRenderer.on('window:state-changed', subscription);
    return () => ipcRenderer.removeListener('window:state-changed', subscription);
  },
  getDrives: (): Promise<StorageDrive[]> => ipcRenderer.invoke('storage:getDrives'),
  scanFiles: (driveLetter: string, maxFiles?: number): Promise<Array<{ path: string; name: string; size: number; ext: string }>> =>
    ipcRenderer.invoke('storage:scanFiles', driveLetter, maxFiles),
  measureBenchmark: (driveLetter: string): Promise<{ success: boolean; readIops: number; writeIops: number; averageLatencyMs: number }> =>
    ipcRenderer.invoke('storage:measureBenchmark', driveLetter),
  runElevatedDefrag: (driveLetter: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('storage:runElevatedDefrag', driveLetter),
  optimizeVolume: (driveLetter: string, mediaType: string): Promise<{ success: boolean; log?: string; error?: string }> => 
    ipcRenderer.invoke('storage:optimizeVolume', driveLetter, mediaType),
  startRealDefrag: (driveLetter: string, mode: string): Promise<{ success: boolean; logFile?: string; error?: string }> =>
    ipcRenderer.invoke('storage:startRealDefrag', driveLetter, mode),
  pollDefragLog: (logFile: string): Promise<{ success: boolean; content?: string; error?: string }> =>
    ipcRenderer.invoke('storage:pollDefragLog', logFile),
  cancelRealDefrag: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('storage:cancelRealDefrag'),
  exportReport: (reportText: string, defaultName: string) => 
    ipcRenderer.invoke('storage:exportReport', reportText, defaultName),
  revealInFolder: (path: string) => ipcRenderer.invoke('system:revealInFolder', path),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

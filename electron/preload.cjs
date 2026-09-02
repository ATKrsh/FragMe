const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onWindowStateChange: (callback) => {
    const subscription = (_, state) => callback(state);
    ipcRenderer.on('window:state-changed', subscription);
    return () => ipcRenderer.removeListener('window:state-changed', subscription);
  },
  getDrives: () => ipcRenderer.invoke('storage:getDrives'),
  scanFiles: (driveLetter, maxFiles) => ipcRenderer.invoke('storage:scanFiles', driveLetter, maxFiles),
  measureBenchmark: (driveLetter) => ipcRenderer.invoke('storage:measureBenchmark', driveLetter),
  runElevatedDefrag: (driveLetter) => ipcRenderer.invoke('storage:runElevatedDefrag', driveLetter),
  optimizeVolume: (driveLetter, mediaType) => ipcRenderer.invoke('storage:optimizeVolume', driveLetter, mediaType),
  startRealDefrag: (driveLetter, mode) => ipcRenderer.invoke('storage:startRealDefrag', driveLetter, mode),
  pollDefragLog: (logFile) => ipcRenderer.invoke('storage:pollDefragLog', logFile),
  cancelRealDefrag: () => ipcRenderer.invoke('storage:cancelRealDefrag'),
  exportReport: (reportText, defaultName) => ipcRenderer.invoke('storage:exportReport', reportText, defaultName),
  revealInFolder: (path) => ipcRenderer.invoke('system:revealInFolder', path),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

const { contextBridge, ipcRenderer } = require("electron");

// Expose IPC methods safely through contextBridge
contextBridge.exposeInMainWorld("ipc", {
  enableDevelopMode: () => ipcRenderer.invoke("enable-develop-mode"),
  disableDevelopMode: () => ipcRenderer.invoke("disable-develop-mode"),
  getDevelopMode: () => ipcRenderer.invoke("get-develop-mode"),
  addLog: (entry) => ipcRenderer.invoke("add-log", entry),
  getLogs: (limit) => ipcRenderer.invoke("get-logs", limit),
  getRecentLogs: (limit) => ipcRenderer.invoke("get-logs", limit),
  listSandboxFiles: () => ipcRenderer.invoke("list-sandbox-files"),
  readSandboxFile: (filename) =>
    ipcRenderer.invoke("read-sandbox-file", filename),
});
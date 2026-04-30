const { contextBridge, ipcRenderer } = require("electron");

// Expose IPC methods safely through contextBridge
contextBridge.exposeInMainWorld("ipc", {
  enableDevelopMode: () => ipcRenderer.invoke("enable-develop-mode"),
  disableDevelopMode: () => ipcRenderer.invoke("disable-develop-mode"),
  addLog: (entry) => ipcRenderer.invoke("add-log", entry),
  getLogs: () => ipcRenderer.invoke("get-logs")
});

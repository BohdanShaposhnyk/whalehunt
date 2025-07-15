const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    showNotification: (options) => ipcRenderer.invoke('show-notification', options)
}); 
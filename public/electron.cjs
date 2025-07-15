const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production (ASAR), use app.getAppPath() to resolve the path
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    console.log('Loading:', indexPath);
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle notification requests from renderer
ipcMain.handle('show-notification', async (event, options) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: options.title || 'Whale Alert',
      body: options.body || 'New swap detected!',
      icon: path.join(__dirname, 'vite.svg'), // Use your app icon
      silent: false, // Allow sound
      ...options
    });

    notification.show();

    // Handle notification click
    notification.on('click', () => {
      // Focus the window when notification is clicked
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        windows[0].focus();
      }
    });

    return true;
  }
  return false;
}); 
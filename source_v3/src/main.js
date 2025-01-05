import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'node:path';
import fs from 'fs';

import Log from './Helpers/LoggingHelper.js';
import fileHelper from './Helpers/FileHelper'; 
import settingsHelper from './Helpers/SettingsHelper.js'; 
import ini from './Helpers/IniHelper.js'; 
import Tmanager from './Helpers/ThemeHelper.js'; 

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: false, 
      nodeIntegration: true,
      webSecurity: false
    },
    icon: path.join(__dirname, 'images/icon.png')
  });
  //log.info('Loading main window content...');
  mainWindow.loadURL(
    MAIN_WINDOW_VITE_DEV_SERVER_URL || path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
  ).catch(err => {
    Log.Error('Failed to load main window content:', err);
  });

  // Disable the menu bar
 // Menu.setApplicationMenu(null);

  mainWindow.webContents.on('did-finish-load', () => {
    // Open the DevTools.
    //mainWindow.webContents.openDevTools(); 
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
   // log.error('Failed to load:', errorCode, errorDescription);
   Log.Error(errorCode, errorDescription);
  });

  mainWindow.webContents.on('crashed', () => {
    //log.error('Window crashed');
    Log.Error('Window crashed');
  });
}

app.on('ready', () => {
  //log.info('App is ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle errors in main process
process.on('uncaughtException', (err) => {
  Log.Error(`Uncaught Exception: ${err.message}`, err.stack);
  // Handle the error gracefully (e.g., display an error message to the user)
});

process.on('unhandledRejection', (reason, promise) => {
  Log.Error(`Uncaught Exception: ${reason}`, '');
});


/* ==================================================================================================*/

/*--------- Expose Methods via IPC Handlers: ---------------------*/
//  they can be accesed like this:   const files = await window.api.getThemes(dirPath);



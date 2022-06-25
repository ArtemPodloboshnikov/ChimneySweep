const { app, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const {
  getFileStructure,
  searchDependencies,
  replaceDataDependent,
  deleteDependents,
  showFileInFileManager
} = require('./utils');
const {
  WIDTH,
  HEIGHT,
  CHANNEL_FILE_STRUCTURE,
  CHANNEL_SEARCH_DEPENDENTS,
  CHANNEL_REPLACE_DEPENDENT,
  CHANNEL_DELETE_DEPENDENT,
  CHANNEL_CLOSE_APP,
  CHANNEL_SHOW_FILE
} = require('./constants');

app.whenReady().then(()=>{
  ipcMain.handle(CHANNEL_FILE_STRUCTURE, getFileStructure);
  ipcMain.handle(CHANNEL_SEARCH_DEPENDENTS, searchDependencies);
  ipcMain.handle(CHANNEL_REPLACE_DEPENDENT, replaceDataDependent);
  ipcMain.handle(CHANNEL_DELETE_DEPENDENT, deleteDependents);
  ipcMain.on(CHANNEL_SHOW_FILE, showFileInFileManager);
  ipcMain.on(CHANNEL_CLOSE_APP, () => {
    app.quit();
  })
  main()
});

function main () {
    const win = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        icon: join(__dirname, "../public/icon64x64.png"),
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, 'preload.js'),
            // devTools: false
        },
        autoHideMenuBar: true,
        vibrancy: 'ultra-dark',
        transparent: true,
        frame: false
    })

    win.loadFile(join(__dirname, "../public/index.html"));
}

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
      // On macOS it's common to re-create a window in the
      // app when the dock icon is clicked and there are no
      // other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
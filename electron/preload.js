const { contextBridge, ipcRenderer } = require('electron');
const {
    CHANNEL_FILE_STRUCTURE,
    CHANNEL_SEARCH_DEPENDENTS,
    CHANNEL_REPLACE_DEPENDENT,
    CHANNEL_DELETE_DEPENDENT,
    CHANNEL_CLOSE_APP,
    CHANNEL_SHOW_FILE,
    CHANNEL_DOCUMENT_ORIENTATION
} = require('./constants');

contextBridge.exposeInMainWorld('electronAPI', {
    getFileStructure: (currentDirPath) => ipcRenderer.invoke(CHANNEL_FILE_STRUCTURE, currentDirPath),
    getIndexDependent: (dependentFile, folderFiles) => ipcRenderer.invoke(CHANNEL_SEARCH_DEPENDENTS, dependentFile, folderFiles),
    replaceDependent: (filesPath, dependentPath, oldName, newName, isOnlyFolder) => ipcRenderer.invoke(CHANNEL_REPLACE_DEPENDENT, filesPath, dependentPath, oldName, newName, isOnlyFolder),
    deleteDependents: (dependents) => ipcRenderer.invoke(CHANNEL_DELETE_DEPENDENT, dependents),
    documentOrientation: (path, isDirectory) => ipcRenderer.invoke(CHANNEL_DOCUMENT_ORIENTATION, path, isDirectory),
    showFile: (filePath) => ipcRenderer.send(CHANNEL_SHOW_FILE, filePath),
    closeApp: () => ipcRenderer.send(CHANNEL_CLOSE_APP)
})
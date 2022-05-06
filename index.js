const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, dialog } = require('electron');
const path = require('path');

// DesktopCapturer ipcMain agent
ipcMain.handle(
    'DESKTOP_CAPTURER_GET_SOURCES',
    async (event, opts) => desktopCapturer.getSources(opts)
);

// Menu creator ipcMain agent
ipcMain.handle(
    'CREATE_DEVICE_LIST_MENU',
    async (event, inputSources, callbackChannel) => {
        const videoOptionsMenu = Menu.buildFromTemplate(
            inputSources.map(source => {
                return {
                    label: source.name,
                    click: (menuItem, mainWindow, event) => {
                        mainWindow.webContents.send(callbackChannel, source)
                    }
                };
            })
        );
        videoOptionsMenu.popup();
    });

// File dialog
ipcMain.handle(
    'SELECT_SAVE_FILE',
    async (event, opts) => {
        const { filePath } = await dialog.showSaveDialog(opts);
        return filePath;
    }
);

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // nodeIntegration: true,
            contextIsolation: true,
            // contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    window.loadFile(path.join(__dirname, 'index.html'));
    // window.webContents.openDevTools()
};

try {
    require('electron-reloader')(module)
} catch (_) {
}

app.whenReady().then(() => createWindow());

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


const { app, BrowserWindow, ipcMain, desktopCapturer ,Menu} = require('electron');
const path = require('path');

app.disableHardwareAcceleration();


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    createMenu()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 提供可用的屏幕源
ipcMain.handle('get-sources', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
    return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
    }));
});

function createMenu() {
    const defautlMenu = Menu.getApplicationMenu();
    const viewMenu = defautlMenu.items.find(item => item.label === 'View');
    if (viewMenu && viewMenu.submenu) {
        const submenuItems = Array.from(viewMenu.submenu.items);
        submenuItems.push({
            label: 'Open DevTools',
            click: () => mainWindow.webContents.openDevTools(),
        });
        viewMenu.submenu.items = submenuItems;
    }
    Menu.setApplicationMenu(defautlMenu);
}

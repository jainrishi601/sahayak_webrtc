const { app, BrowserWindow, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');
const ioClient = require('socket.io-client');

let socket;
let interval;

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 150,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false  // Consider setting to true for better security
        }
    });

    win.removeMenu();
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

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

ipcMain.on('start-share', async (event) => {
    try {
        // Generate a unique room ID
        const uuid = uuidv4();

        // Establish socket connection and join room
        socket = ioClient.connect('https://sahayk-server.onrender.com');
        socket.emit('join-message', uuid);

        // Send room code back to client for display
        event.reply('uuid', uuid);

        // Start screen capture and emit screen data at intervals
        interval = setInterval(async () => {
            try {
                const img = await screenshot();
                const imgStr = Buffer.from(img).toString('base64');
                const obj = { room: uuid, image: imgStr };
                socket.emit('screen-data', JSON.stringify(obj));
            } catch (error) {
                console.error("Screenshot or socket error:", error);
                event.reply('error-message', 'Error capturing or sending screen data');
            }
        }, 100);  // Adjusted interval for performance

    } catch (error) {
        console.error("Error starting screen sharing:", error);
        event.reply('error-message', 'Error initiating screen sharing');
    }
});

ipcMain.on('stop-share', (event) => {
    // Stop screen sharing interval and disconnect socket
    clearInterval(interval);
    if (socket) {
        socket.disconnect();
    }
    console.log("Screen sharing stopped");
    event.reply('uuid', 'Screen sharing stopped');
});


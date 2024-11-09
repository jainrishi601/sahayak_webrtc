const { ipcRenderer } = require('electron');

window.onload = function() {
    // Display Room ID or messages received from the main process
    ipcRenderer.on('uuid', (event, data) => {
        document.getElementById("code").innerHTML = `Room ID: ${data}`;
    });

    // Display errors received from the main process
    ipcRenderer.on('error-message', (event, message) => {
        document.getElementById("errorDisplay").innerHTML = `Error: ${message}`;
    });
};

// Function to start screen sharing
function startShare() {
    ipcRenderer.send('start-share');
    toggleButtons();
    clearErrorDisplay();
}

// Function to stop screen sharing
function stopShare() {
    ipcRenderer.send('stop-share');
    toggleButtons();
    document.getElementById("code").innerHTML = "Screen sharing stopped";
}

// Helper function to toggle the visibility of start/stop buttons
function toggleButtons() {
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    startButton.style.display = startButton.style.display === 'none' ? 'block' : 'none';
    stopButton.style.display = stopButton.style.display === 'none' ? 'block' : 'none';
}

// Helper function to clear the error display
function clearErrorDisplay() {
    document.getElementById("errorDisplay").innerHTML = "";
}

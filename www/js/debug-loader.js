// Debug Logger
const debugLog = document.createElement('div');
debugLog.id = 'debug-log';
debugLog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-height: 50%;
    background: black;
    color: lime;
    font-family: monospace;
    font-size: 10px;
    overflow-y: auto;
    z-index: 99999;
    padding: 10px;
    border-bottom: 2px solid lime;
`;

window.addEventListener('load', () => {
    document.body.appendChild(debugLog);
});

function log(msg, isError = false) {
    const line = document.createElement('div');
    line.style.color = isError ? 'red' : 'lime';
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    debugLog.appendChild(line);
    debugLog.scrollTop = debugLog.scrollHeight;
    console.log(msg);
}

// Override console
const originalError = console.error;
console.error = function(...args) {
    log('❌ ERROR: ' + args.join(' '), true);
    originalError.apply(console, args);
};

const originalLog = console.log;
console.log = function(...args) {
    log('📝 ' + args.join(' '));
    originalLog.apply(console, args);
};

// Track script loading
log('🚀 Debug logger started');

window.addEventListener('error', (e) => {
    log(`❌ Error: ${e.message} at ${e.filename}:${e.lineno}`, true);
});

// Cordova events
document.addEventListener('deviceready', () => {
    log('✅ Cordova deviceready');
});

document.addEventListener('DOMContentLoaded', () => {
    log('✅ DOM loaded');
});

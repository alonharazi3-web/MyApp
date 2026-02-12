const versionDiv = document.createElement('div');
versionDiv.id = 'version-display';
versionDiv.style.cssText = `
    position: fixed;
    bottom: calc(50px + env(safe-area-inset-bottom));
    left: calc(2px + env(safe-area-inset-left));
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.5);
    font-family: monospace;
    font-size: 8px;
    padding: 1px 3px;
    border-radius: 2px;
    z-index: 99998;
    pointer-events: none;
`;
versionDiv.textContent = 'v5.7.0';

window.addEventListener('load', () => {
    document.body.appendChild(versionDiv);
});

const versionDiv = document.createElement('div');
versionDiv.id = 'version-display';
versionDiv.style.cssText = `
    position: fixed;
    bottom: calc(5px + env(safe-area-inset-bottom));
    left: calc(5px + env(safe-area-inset-left));
    background: rgba(0, 0, 0, 0.5);
    color: rgba(255, 255, 255, 0.7);
    font-family: monospace;
    font-size: 11px;
    padding: 3px 6px;
    border-radius: 3px;
    z-index: 99998;
    pointer-events: none;
`;
versionDiv.textContent = 'v5.3';

window.addEventListener('load', () => {
    document.body.appendChild(versionDiv);
});

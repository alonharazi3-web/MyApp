const versionDiv = document.createElement('div');
versionDiv.id = 'version-display';
versionDiv.style.cssText = `
    position: fixed;
    bottom: 5px;
    left: 5px;
    background: rgba(0, 0, 0, 0.5);
    color: rgba(255, 255, 255, 0.7);
    font-family: monospace;
    font-size: 11px;
    padding: 3px 6px;
    border-radius: 3px;
    z-index: 99998;
    pointer-events: none;
`;
versionDiv.textContent = 'v4.0 - Final';

window.addEventListener('load', () => {
    document.body.appendChild(versionDiv);
});

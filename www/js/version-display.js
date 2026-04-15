const versionDiv = document.createElement('div');
versionDiv.id = 'version-display';
versionDiv.style.cssText = `
    position: fixed;
    bottom: 50px;
    left: 2px;
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.5);
    font-family: monospace;
    font-size: 8px;
    padding: 1px 3px;
    border-radius: 2px;
    z-index: 99998;
    pointer-events: none;
`;
versionDiv.textContent = 'v6.2.0';

window.addEventListener('load', () => {
    document.body.appendChild(versionDiv);
});

/**
 * Document Scanner Module v5.5
 * Camera capture → Image enhancement → PDF generation
 * Uses cordova-plugin-camera + built-in PDF generator (no CDN needed)
 * Max file size: 1MB per scanned document
 */

import { PDFGenerator } from './pdf-generator.js';

export class DocScanner {
    constructor() {
        this.storageKey = 'scannedDocs';
        this.MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
        this.docTypes = [
            'שרטוטים ותוכניות חנויות',
            'סיכום חנויות',
            'שרטוטים ותוכניות קורקינט',
            'סיכום קורקינט',
            'שרטוטים ותוכניות לילה',
            'סיכום לילה',
            'סיכום יום',
            'שרטוטים ותוכניות מכתב',
            'סיכום מכתב',
            'סיכום רחוב',
            'יום עבודתי',
            'החלטות',
            'משוב עמיתים',
            'סיכום כללי',
            'אחר'
        ];

        this.exercisePriority = {
            0: [],
            1: ['שרטוטים ותוכניות חנויות', 'סיכום חנויות'],
            2: ['שרטוטים ותוכניות קורקינט', 'סיכום קורקינט'],
            3: [],
            4: ['שרטוטים ותוכניות לילה', 'סיכום לילה'],
            5: ['שרטוטים ותוכניות מכתב', 'סיכום מכתב'],
            6: ['סיכום רחוב', 'יום עבודתי']
        };

        this.summaryPriority = [
            'סיכום כללי', 'משוב עמיתים', 'החלטות', 'יום עבודתי', 'סיכום יום'
        ];
    }

    initStorage() {
        if (!window.app.data.scannedDocs) {
            window.app.data.scannedDocs = {};
        }
    }

    getOrderedDocTypes(context) {
        let priority = [];
        if (context === 'summary') {
            priority = this.summaryPriority;
        } else if (typeof context === 'number' && this.exercisePriority[context]) {
            priority = this.exercisePriority[context];
        }
        const rest = this.docTypes.filter(dt => !priority.includes(dt));
        return [...priority, ...rest];
    }

    generateDocName(traineeIndex, docType) {
        this.initStorage();
        const traineeName = window.getTraineeName(traineeIndex);
        const docs = window.app.data.scannedDocs;
        let count = 0;
        Object.keys(docs).forEach(key => {
            if (docs[key].traineeIndex === traineeIndex && docs[key].docType === docType) {
                count++;
            }
        });
        const serial = count + 1;
        const id = `${traineeIndex}_${docType}_${serial}_${Date.now()}`;
        const displayName = serial > 1
            ? `${traineeName} - ${docType} (${serial})`
            : `${traineeName} - ${docType}`;
        return { id, displayName };
    }

    /** Show trainee selector modal for export/view actions */
    showTraineeSelector(title) {
        return new Promise((resolve, reject) => {
            const existing = document.getElementById('traineeSelectorModal');
            if (existing) existing.remove();

            let buttonsHtml = '';
            for (let i = 0; i < 4; i++) {
                const name = window.getTraineeName(i);
                const color = window.app.traineeColors[i];
                const docCount = this.getTraineeDocs(i).length;
                buttonsHtml += `<button class="doc-type-option trainee-select-btn" data-index="${i}" style="border-right: 4px solid ${color};">
                    ${window.escapeHtml(name)}
                    <span style="font-size: 12px; color: #666; margin-right: 8px;">(${docCount} מסמכים)</span>
                </button>`;
            }

            const modal = document.createElement('div');
            modal.id = 'traineeSelectorModal';
            modal.className = 'scanner-modal show';
            modal.innerHTML = `
                <div class="scanner-modal-content">
                    <h3 style="text-align:center; margin-bottom:15px;">${title}</h3>
                    <div class="doc-type-list">${buttonsHtml}</div>
                    <button class="btn btn-back" style="width:100%; margin-top:10px;" id="traineeSelectCancelBtn">ביטול</button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelectorAll('.trainee-select-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.getAttribute('data-index'));
                    modal.remove();
                    resolve(idx);
                };
            });

            document.getElementById('traineeSelectCancelBtn').onclick = () => {
                modal.remove();
                reject('cancelled');
            };

            modal.onclick = (e) => {
                if (e.target === modal) { modal.remove(); reject('cancelled'); }
            };
        });
    }

    showDocTypeSelector(traineeIndex, context) {
        return new Promise((resolve, reject) => {
            const orderedTypes = this.getOrderedDocTypes(context);
            const existing = document.getElementById('docTypeSelectorModal');
            if (existing) existing.remove();

            let optionsHtml = '';
            orderedTypes.forEach(type => {
                optionsHtml += `<button class="doc-type-option" data-type="${type}">${type}</button>`;
            });

            const modal = document.createElement('div');
            modal.id = 'docTypeSelectorModal';
            modal.className = 'scanner-modal show';
            modal.innerHTML = `
                <div class="scanner-modal-content">
                    <h3 style="text-align:center; margin-bottom:15px;">📄 בחר סוג מסמך</h3>
                    <div class="doc-type-list">${optionsHtml}</div>
                    <button class="btn btn-back" style="width:100%; margin-top:10px;" id="docTypeCancelBtn">ביטול</button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelectorAll('.doc-type-option').forEach(btn => {
                btn.onclick = () => {
                    const selectedType = btn.getAttribute('data-type');
                    modal.remove();
                    resolve(selectedType);
                };
            });

            document.getElementById('docTypeCancelBtn').onclick = () => { modal.remove(); reject('cancelled'); };
            modal.onclick = (e) => { if (e.target === modal) { modal.remove(); reject('cancelled'); } };
        });
    }

    /** Capture image - reduced resolution for 1MB limit */
    captureImage() {
        return new Promise((resolve, reject) => {
            if (!navigator.camera) {
                this.captureViaFileInput().then(resolve).catch(reject);
                return;
            }
            navigator.camera.getPicture(
                (imageData) => {
                    if (imageData.startsWith('data:')) {
                        resolve(imageData.split(',')[1]);
                    } else {
                        resolve(imageData);
                    }
                },
                (error) => {
                    if (error === 'No Image Selected' || error === 'Camera cancelled.' || error === 'Selection cancelled.') {
                        reject('cancelled');
                    } else {
                        reject(error);
                    }
                },
                {
                    quality: 70,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    encodingType: Camera.EncodingType.JPEG,
                    correctOrientation: true,
                    targetWidth: 1240,
                    targetHeight: 1754
                }
            );
        });
    }

    captureViaFileInput() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) { reject('cancelled'); return; }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const base64 = ev.target.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = () => reject('Failed to read file');
                reader.readAsDataURL(file);
            };
            input.click();
        });
    }

    enhanceImage(base64Data) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const contrast = 1.4;
                const brightness = 10;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
                    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
                    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
                }
                ctx.putImageData(imageData, 0, 0);
                const enhanced = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
                resolve(enhanced);
            };
            img.src = 'data:image/jpeg;base64,' + base64Data;
        });
    }

    /** Compress image to fit within 1MB limit */
    compressToLimit(base64Data) {
        return new Promise((resolve) => {
            const currentSize = Math.ceil(base64Data.length * 3 / 4);
            if (currentSize <= this.MAX_FILE_SIZE) {
                resolve(base64Data);
                return;
            }
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const ratio = this.MAX_FILE_SIZE / currentSize;
                const scale = Math.min(1, Math.sqrt(ratio) * 0.9);
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                let quality = 0.7;
                let result = canvas.toDataURL('image/jpeg', quality).split(',')[1];
                let resultSize = Math.ceil(result.length * 3 / 4);
                while (resultSize > this.MAX_FILE_SIZE && quality > 0.2) {
                    quality -= 0.1;
                    result = canvas.toDataURL('image/jpeg', quality).split(',')[1];
                    resultSize = Math.ceil(result.length * 3 / 4);
                }
                console.log(`📐 Compressed: ${(currentSize/1024).toFixed(0)}KB → ${(resultSize/1024).toFixed(0)}KB (q:${quality.toFixed(1)})`);
                resolve(result);
            };
            img.src = 'data:image/jpeg;base64,' + base64Data;
        });
    }

    /** Generate PDF from image base64 (built-in, no CDN) */
    generatePDF(base64Image) {
        return new Promise((resolve, reject) => {
            try {
                const pdfBase64 = PDFGenerator.generate(base64Image);
                resolve(pdfBase64);
            } catch (error) {
                reject(new Error('שגיאה ביצירת PDF: ' + error.message));
            }
        });
    }

    /** Main scan flow */
    async startScan(traineeIndex, context) {
        try {
            this.initStorage();
            const docType = await this.showDocTypeSelector(traineeIndex, context);
            let finalDocType = docType;
            if (docType === 'אחר') {
                const customName = prompt('הזן שם למסמך:');
                if (!customName) return;
                finalDocType = customName;
            }
            const imageData = await this.captureImage();
            const enhanced = await this.enhanceImage(imageData);
            const compressed = await this.compressToLimit(enhanced);
            const pdfBase64 = await this.generatePDF(compressed);
            const { id, displayName } = this.generateDocName(traineeIndex, finalDocType);

            window.app.data.scannedDocs[id] = {
                id, traineeIndex,
                traineeName: window.getTraineeName(traineeIndex),
                docType: finalDocType, displayName,
                imageBase64: compressed, pdfBase64,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('he-IL')
            };
            window.storage.saveData();
            alert('✅ המסמך נסרק ונשמר בהצלחה!\n' + displayName);
            return id;
        } catch (error) {
            if (error === 'cancelled') return null;
            console.error('Scan error:', error);
            alert('❌ שגיאה בסריקה: ' + error);
            return null;
        }
    }

    getTraineeDocs(traineeIndex) {
        this.initStorage();
        return Object.values(window.app.data.scannedDocs)
            .filter(d => d.traineeIndex === traineeIndex)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    getAllDocs() {
        this.initStorage();
        return Object.values(window.app.data.scannedDocs)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    deleteDoc(docId) {
        this.initStorage();
        if (window.app.data.scannedDocs[docId]) {
            const name = window.app.data.scannedDocs[docId].displayName;
            if (confirm(`למחוק את "${name}"?`)) {
                delete window.app.data.scannedDocs[docId];
                window.storage.saveData();
                return true;
            }
        }
        return false;
    }

    viewDocument(docId) {
        this.initStorage();
        const doc = window.app.data.scannedDocs[docId];
        if (!doc) { alert('מסמך לא נמצא'); return; }
        const existing = document.getElementById('docViewerModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'docViewerModal';
        modal.className = 'scanner-modal show';
        modal.innerHTML = `
            <div class="doc-viewer-container">
                <div class="doc-viewer-header">
                    <span class="doc-viewer-title">${window.escapeHtml(doc.displayName)}</span>
                    <button class="doc-viewer-close" id="docViewerCloseBtn">✕</button>
                </div>
                <div class="doc-viewer-controls">
                    <button id="zoomInBtn" class="doc-viewer-ctrl-btn">🔍+</button>
                    <button id="zoomOutBtn" class="doc-viewer-ctrl-btn">🔍-</button>
                    <button id="zoomResetBtn" class="doc-viewer-ctrl-btn">↺</button>
                </div>
                <div class="doc-viewer-body" id="docViewerBody">
                    <img src="data:image/jpeg;base64,${doc.imageBase64}" class="doc-viewer-image" id="docViewerImage" draggable="false" />
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        let scale = 1, translateX = 0, translateY = 0, isDragging = false, startX, startY;
        const image = document.getElementById('docViewerImage');
        const body = document.getElementById('docViewerBody');
        const updateTransform = () => { image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`; };
        document.getElementById('zoomInBtn').onclick = () => { scale = Math.min(5, scale + 0.5); updateTransform(); };
        document.getElementById('zoomOutBtn').onclick = () => { scale = Math.max(0.5, scale - 0.5); updateTransform(); };
        document.getElementById('zoomResetBtn').onclick = () => { scale = 1; translateX = 0; translateY = 0; updateTransform(); };
        body.addEventListener('touchstart', (e) => { if (e.touches.length === 1 && scale > 1) { isDragging = true; startX = e.touches[0].clientX - translateX; startY = e.touches[0].clientY - translateY; e.preventDefault(); } }, { passive: false });
        body.addEventListener('touchmove', (e) => { if (isDragging && e.touches.length === 1) { translateX = e.touches[0].clientX - startX; translateY = e.touches[0].clientY - startY; updateTransform(); e.preventDefault(); } }, { passive: false });
        body.addEventListener('touchend', () => { isDragging = false; });
        body.addEventListener('mousedown', (e) => { if (scale > 1) { isDragging = true; startX = e.clientX - translateX; startY = e.clientY - translateY; } });
        body.addEventListener('mousemove', (e) => { if (isDragging) { translateX = e.clientX - startX; translateY = e.clientY - startY; updateTransform(); } });
        body.addEventListener('mouseup', () => { isDragging = false; });
        document.getElementById('docViewerCloseBtn').onclick = () => modal.remove();
    }

    showDocsList(traineeIndex) {
        const docs = this.getTraineeDocs(traineeIndex);
        const existing = document.getElementById('docsListModal');
        if (existing) existing.remove();
        let listHtml = '';
        if (docs.length === 0) {
            listHtml = '<p style="text-align:center; color:#666; padding:20px;">אין מסמכים סרוקים</p>';
        } else {
            docs.forEach(doc => {
                listHtml += `
                    <div class="docs-list-item">
                        <div class="docs-list-item-info">
                            <strong>${window.escapeHtml(doc.displayName)}</strong>
                            <span class="docs-list-item-date">${doc.date}</span>
                        </div>
                        <div class="docs-list-item-actions">
                            <button class="btn-doc-view" data-id="${doc.id}">👁️ צפה</button>
                            <button class="btn-doc-delete" data-id="${doc.id}">🗑️</button>
                        </div>
                    </div>`;
            });
        }
        const modal = document.createElement('div');
        modal.id = 'docsListModal';
        modal.className = 'scanner-modal show';
        modal.innerHTML = `
            <div class="scanner-modal-content">
                <h3 style="text-align:center; margin-bottom:15px;">📋 מסמכים סרוקים - ${window.getTraineeName(traineeIndex)}</h3>
                <div class="docs-list-container">${listHtml}</div>
                <button class="btn btn-back" style="width:100%; margin-top:10px;" id="docsListCloseBtn">סגור</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelectorAll('.btn-doc-view').forEach(btn => { btn.onclick = () => { modal.remove(); this.viewDocument(btn.getAttribute('data-id')); }; });
        modal.querySelectorAll('.btn-doc-delete').forEach(btn => { btn.onclick = () => { const deleted = this.deleteDoc(btn.getAttribute('data-id')); if (deleted) { modal.remove(); this.showDocsList(traineeIndex); } }; });
        document.getElementById('docsListCloseBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

    /** Export with trainee picker */
    async exportDocsZipWithPicker() {
        try { const idx = await this.showTraineeSelector('📤 שתף מסמכים - בחר חניך'); this.exportDocsZip(idx); } catch(e) { if (e !== 'cancelled') console.error(e); }
    }

    exportDocsZip(traineeIndex) {
        const docs = this.getTraineeDocs(traineeIndex);
        if (docs.length === 0) { alert('אין מסמכים לייצוא'); return; }
        if (!window.cordova || !window.cordova.file) { alert('❌ File Plugin לא זמין'); return; }
        if (!window.plugins || !window.plugins.socialsharing) { alert('❌ Social Sharing Plugin לא זמין'); return; }
        try {
            const traineeName = window.getTraineeName(traineeIndex);
            const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
            const files = [];
            let filesWritten = 0;
            const cacheDir = window.cordova.file.cacheDirectory;
            const folderName = `${traineeName}_docs_${dateStr}`;
            window.resolveLocalFileSystemURL(cacheDir, function(dirEntry) {
                dirEntry.getDirectory(folderName, { create: true }, function(subDir) {
                    docs.forEach((doc) => {
                        const safeName = doc.displayName.replace(/[\/\\:*?"<>|]/g, '_');
                        const filename = `${safeName}.pdf`;
                        const byteCharacters = atob(doc.pdfBase64);
                        const byteArrays = [];
                        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
                            const slice = byteCharacters.slice(offset, offset + 1024);
                            const byteNumbers = new Array(slice.length);
                            for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
                            byteArrays.push(new Uint8Array(byteNumbers));
                        }
                        const blob = new Blob(byteArrays, { type: 'application/pdf' });
                        subDir.getFile(filename, { create: true }, function(fileEntry) {
                            fileEntry.createWriter(function(writer) {
                                writer.onwriteend = function() {
                                    files.push(fileEntry.nativeURL);
                                    filesWritten++;
                                    if (filesWritten === docs.length) {
                                        window.plugins.socialsharing.shareWithOptions({ message: `מסמכים סרוקים - ${traineeName}`, files: files, chooserTitle: 'שתף מסמכים' }, function() { console.log('✅ Share success'); }, function(err) { console.error('Share error:', err); alert('❌ שיתוף נכשל'); });
                                    }
                                };
                                writer.write(blob);
                            });
                        });
                    });
                });
            });
        } catch (error) { alert('❌ שגיאה: ' + error.message); }
    }

    async exportDocsLocalWithPicker() {
        try { const idx = await this.showTraineeSelector('💾 שמור לתיקייה - בחר חניך'); this.exportDocsLocal(idx); } catch(e) { if (e !== 'cancelled') console.error(e); }
    }

    exportDocsLocal(traineeIndex) {
        const docs = this.getTraineeDocs(traineeIndex);
        if (docs.length === 0) { alert('אין מסמכים לייצוא'); return; }
        if (!window.cordova || !window.cordova.file) { alert('❌ File Plugin לא זמין'); return; }
        try {
            const traineeName = window.getTraineeName(traineeIndex);
            const folderName = `${traineeName} מסמכים`;
            let savedCount = 0;
            window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Download/', function(dlDir) {
                dlDir.getDirectory(folderName, { create: true }, function(subDir) {
                    docs.forEach((doc) => {
                        const safeName = doc.displayName.replace(/[\/\\:*?"<>|]/g, '_');
                        const filename = `${safeName}.pdf`;
                        const byteCharacters = atob(doc.pdfBase64);
                        const byteArrays = [];
                        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
                            const slice = byteCharacters.slice(offset, offset + 1024);
                            const byteNumbers = new Array(slice.length);
                            for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
                            byteArrays.push(new Uint8Array(byteNumbers));
                        }
                        const blob = new Blob(byteArrays, { type: 'application/pdf' });
                        subDir.getFile(filename, { create: true }, function(fileEntry) {
                            fileEntry.createWriter(function(writer) {
                                writer.onwriteend = function() { savedCount++; if (savedCount === docs.length) alert(`✅ ${savedCount} מסמכים נשמרו בהצלחה!\n\nתיקייה: Download/${folderName}`); };
                                writer.onerror = function(e) { console.error('Write error:', e); };
                                writer.write(blob);
                            });
                        });
                    });
                }, function(err) { alert('❌ שגיאה ביצירת תיקייה: ' + err); });
            }, function(err) { alert('❌ לא ניתן לגשת ל-Downloads: ' + err); });
        } catch (error) { alert('❌ שגיאה: ' + error.message); }
    }

    async showDocsListWithPicker() {
        try { const idx = await this.showTraineeSelector('👁️ צפייה במסמכים - בחר חניך'); this.showDocsList(idx); } catch(e) { if (e !== 'cancelled') console.error(e); }
    }

    getCameraButtonHtml(position) {
        const cls = position === 'top' ? 'scan-btn-top' : 'scan-btn-bottom';
        return `<button class="btn-scan ${cls}" onclick="window.startDocScan()">📷 סרוק מסמך</button>`;
    }

    getSummaryCameraButtonHtml() {
        return `<button class="btn-scan scan-btn-summary" onclick="window.startDocScanSummary()">📷 סרוק מסמך</button>`;
    }
}

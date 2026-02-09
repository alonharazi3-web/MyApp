/**
 * Document Scanner Module v5.4
 * Camera capture → Image enhancement → PDF generation
 * Uses cordova-plugin-camera + built-in PDF generator (no CDN needed)
 */

import { PDFGenerator } from './pdf-generator.js';

export class DocScanner {
    constructor() {
        this.storageKey = 'scannedDocs';
        // Document type definitions
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

        // Exercise-to-priority mapping (exercise index → preferred doc types first)
        this.exercisePriority = {
            0: [], // בלון - default order
            1: ['שרטוטים ותוכניות חנויות', 'סיכום חנויות'], // טיח
            2: ['שרטוטים ותוכניות קורקינט', 'סיכום קורקינט'], // דולירה
            3: [], // דויד
            4: ['שרטוטים ותוכניות לילה', 'סיכום לילה'], // לילה
            5: ['שרטוטים ותוכניות מכתב', 'סיכום מכתב'], // מכתב
            6: ['סיכום רחוב', 'יום עבודתי'] // יומינט
        };

        // Summary page priority
        this.summaryPriority = [
            'סיכום כללי', 'משוב עמיתים', 'החלטות', 'יום עבודתי', 'סיכום יום'
        ];
    }

    /**
     * Initialize scanned docs storage
     */
    initStorage() {
        if (!window.app.data.scannedDocs) {
            window.app.data.scannedDocs = {};
        }
    }

    /**
     * Get ordered doc types based on context
     */
    getOrderedDocTypes(context) {
        let priority = [];

        if (context === 'summary') {
            priority = this.summaryPriority;
        } else if (typeof context === 'number' && this.exercisePriority[context]) {
            priority = this.exercisePriority[context];
        }

        // Put priority items first, then the rest in original order
        const rest = this.docTypes.filter(dt => !priority.includes(dt));
        return [...priority, ...rest];
    }

    /**
     * Generate unique document name
     */
    generateDocName(traineeIndex, docType) {
        this.initStorage();
        const traineeName = window.getTraineeName(traineeIndex);
        const docs = window.app.data.scannedDocs;

        // Count existing docs of this type for this trainee
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

    /**
     * Open document type selector modal
     */
    showDocTypeSelector(traineeIndex, context) {
        return new Promise((resolve, reject) => {
            const orderedTypes = this.getOrderedDocTypes(context);

            // Remove existing modal if any
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

            // Attach events
            modal.querySelectorAll('.doc-type-option').forEach(btn => {
                btn.onclick = () => {
                    const selectedType = btn.getAttribute('data-type');
                    modal.remove();
                    resolve(selectedType);
                };
            });

            document.getElementById('docTypeCancelBtn').onclick = () => {
                modal.remove();
                reject('cancelled');
            };

            // Close on backdrop click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                    reject('cancelled');
                }
            };
        });
    }

    /**
     * Capture image using camera
     */
    captureImage() {
        return new Promise((resolve, reject) => {
            if (!navigator.camera) {
                // Fallback: use file input
                this.captureViaFileInput().then(resolve).catch(reject);
                return;
            }

            navigator.camera.getPicture(
                (imageData) => {
                    // Camera v8 returns full data URI, v7 returns raw base64
                    // Normalize to raw base64
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
                    quality: 85,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    encodingType: Camera.EncodingType.JPEG,
                    correctOrientation: true,
                    targetWidth: 2480,
                    targetHeight: 3508
                }
            );
        });
    }

    /**
     * Fallback: capture via file input (for browser testing)
     */
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
                    // Return base64 without data: prefix
                    const base64 = ev.target.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = () => reject('Failed to read file');
                reader.readAsDataURL(file);
            };

            input.click();
        });
    }

    /**
     * Enhance image to look like scanned document
     */
    enhanceImage(base64Data) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original
                ctx.drawImage(img, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Enhance: increase contrast and brightness for scan look
                const contrast = 1.4;
                const brightness = 10;

                for (let i = 0; i < data.length; i += 4) {
                    // Apply contrast and brightness
                    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
                    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
                    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
                }

                ctx.putImageData(imageData, 0, 0);

                // Return as base64 JPEG
                const enhanced = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
                resolve(enhanced);
            };
            img.src = 'data:image/jpeg;base64,' + base64Data;
        });
    }

    /**
     * Generate PDF from image base64 (built-in, no external dependency)
     */
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

    /**
     * Main scan flow: type selector → camera → enhance → PDF → save
     */
    async startScan(traineeIndex, context) {
        try {
            this.initStorage();

            // Step 1: Select document type
            const docType = await this.showDocTypeSelector(traineeIndex, context);

            // Step 2: Custom name for "אחר"
            let finalDocType = docType;
            if (docType === 'אחר') {
                const customName = prompt('הזן שם למסמך:');
                if (!customName) return;
                finalDocType = customName;
            }

            // Step 3: Capture image
            const imageData = await this.captureImage();

            // Step 4: Enhance
            const enhanced = await this.enhanceImage(imageData);

            // Step 5: Generate PDF
            const pdfBase64 = await this.generatePDF(enhanced);

            // Step 6: Save
            const { id, displayName } = this.generateDocName(traineeIndex, finalDocType);

            window.app.data.scannedDocs[id] = {
                id: id,
                traineeIndex: traineeIndex,
                traineeName: window.getTraineeName(traineeIndex),
                docType: finalDocType,
                displayName: displayName,
                imageBase64: enhanced,
                pdfBase64: pdfBase64,
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

    /**
     * Get all scanned docs for a trainee
     */
    getTraineeDocs(traineeIndex) {
        this.initStorage();
        const docs = window.app.data.scannedDocs;
        return Object.values(docs)
            .filter(d => d.traineeIndex === traineeIndex)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Get all scanned docs
     */
    getAllDocs() {
        this.initStorage();
        return Object.values(window.app.data.scannedDocs)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Delete a scanned document
     */
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

    /**
     * Show document viewer with zoom and pan
     */
    viewDocument(docId) {
        this.initStorage();
        const doc = window.app.data.scannedDocs[docId];
        if (!doc) { alert('מסמך לא נמצא'); return; }

        // Remove existing viewer
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
                    <img src="data:image/jpeg;base64,${doc.imageBase64}" 
                         class="doc-viewer-image" id="docViewerImage" 
                         draggable="false" />
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Zoom & Pan logic
        let scale = 1;
        let translateX = 0, translateY = 0;
        let isDragging = false;
        let startX, startY;
        const image = document.getElementById('docViewerImage');
        const body = document.getElementById('docViewerBody');

        const updateTransform = () => {
            image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        };

        document.getElementById('zoomInBtn').onclick = () => { scale = Math.min(5, scale + 0.5); updateTransform(); };
        document.getElementById('zoomOutBtn').onclick = () => { scale = Math.max(0.5, scale - 0.5); updateTransform(); };
        document.getElementById('zoomResetBtn').onclick = () => { scale = 1; translateX = 0; translateY = 0; updateTransform(); };

        // Touch/mouse pan
        body.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && scale > 1) {
                isDragging = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
                e.preventDefault();
            }
        }, { passive: false });

        body.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                translateX = e.touches[0].clientX - startX;
                translateY = e.touches[0].clientY - startY;
                updateTransform();
                e.preventDefault();
            }
        }, { passive: false });

        body.addEventListener('touchend', () => { isDragging = false; });

        // Mouse fallback
        body.addEventListener('mousedown', (e) => {
            if (scale > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
            }
        });
        body.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                updateTransform();
            }
        });
        body.addEventListener('mouseup', () => { isDragging = false; });

        document.getElementById('docViewerCloseBtn').onclick = () => modal.remove();
    }

    /**
     * Show docs list for a trainee with view capability
     */
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
                    </div>
                `;
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

        // Attach events
        modal.querySelectorAll('.btn-doc-view').forEach(btn => {
            btn.onclick = () => {
                modal.remove();
                this.viewDocument(btn.getAttribute('data-id'));
            };
        });

        modal.querySelectorAll('.btn-doc-delete').forEach(btn => {
            btn.onclick = () => {
                const deleted = this.deleteDoc(btn.getAttribute('data-id'));
                if (deleted) {
                    modal.remove();
                    this.showDocsList(traineeIndex);
                }
            };
        });

        document.getElementById('docsListCloseBtn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

    /**
     * Export all docs for a trainee as ZIP via social sharing
     */
    exportDocsZip(traineeIndex) {
        const docs = this.getTraineeDocs(traineeIndex);
        if (docs.length === 0) {
            alert('אין מסמכים לייצוא');
            return;
        }

        if (!window.cordova || !window.cordova.file) {
            alert('❌ File Plugin לא זמין');
            return;
        }

        if (!window.plugins || !window.plugins.socialsharing) {
            alert('❌ Social Sharing Plugin לא זמין');
            return;
        }

        try {
            const traineeName = window.getTraineeName(traineeIndex);
            const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');

            // Collect all PDF files
            const files = [];
            let filesWritten = 0;

            const cacheDir = window.cordova.file.cacheDirectory;
            const folderName = `${traineeName}_docs_${dateStr}`;

            window.resolveLocalFileSystemURL(cacheDir, function(dirEntry) {
                dirEntry.getDirectory(folderName, { create: true }, function(subDir) {
                    docs.forEach((doc, idx) => {
                        const safeName = doc.displayName.replace(/[\/\\:*?"<>|]/g, '_');
                        const filename = `${safeName}.pdf`;

                        // Convert base64 to blob
                        const byteCharacters = atob(doc.pdfBase64);
                        const byteArrays = [];
                        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
                            const slice = byteCharacters.slice(offset, offset + 1024);
                            const byteNumbers = new Array(slice.length);
                            for (let i = 0; i < slice.length; i++) {
                                byteNumbers[i] = slice.charCodeAt(i);
                            }
                            byteArrays.push(new Uint8Array(byteNumbers));
                        }
                        const blob = new Blob(byteArrays, { type: 'application/pdf' });

                        subDir.getFile(filename, { create: true }, function(fileEntry) {
                            fileEntry.createWriter(function(writer) {
                                writer.onwriteend = function() {
                                    files.push(fileEntry.nativeURL);
                                    filesWritten++;
                                    if (filesWritten === docs.length) {
                                        // All files written, share
                                        window.plugins.socialsharing.shareWithOptions({
                                            message: `מסמכים סרוקים - ${traineeName}`,
                                            files: files,
                                            chooserTitle: 'שתף מסמכים'
                                        }, function() {
                                            console.log('✅ Share success');
                                        }, function(err) {
                                            console.error('Share error:', err);
                                            alert('❌ שיתוף נכשל');
                                        });
                                    }
                                };
                                writer.write(blob);
                            });
                        });
                    });
                });
            });

        } catch (error) {
            alert('❌ שגיאה: ' + error.message);
        }
    }

    /**
     * Export all docs for a trainee as PDFs to local folder
     */
    exportDocsLocal(traineeIndex) {
        const docs = this.getTraineeDocs(traineeIndex);
        if (docs.length === 0) {
            alert('אין מסמכים לייצוא');
            return;
        }

        if (!window.cordova || !window.cordova.file) {
            alert('❌ File Plugin לא זמין');
            return;
        }

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
                            for (let i = 0; i < slice.length; i++) {
                                byteNumbers[i] = slice.charCodeAt(i);
                            }
                            byteArrays.push(new Uint8Array(byteNumbers));
                        }
                        const blob = new Blob(byteArrays, { type: 'application/pdf' });

                        subDir.getFile(filename, { create: true }, function(fileEntry) {
                            fileEntry.createWriter(function(writer) {
                                writer.onwriteend = function() {
                                    savedCount++;
                                    if (savedCount === docs.length) {
                                        alert(`✅ ${savedCount} מסמכים נשמרו בהצלחה!\n\nתיקייה: Download/${folderName}`);
                                    }
                                };
                                writer.onerror = function(e) {
                                    console.error('Write error:', e);
                                };
                                writer.write(blob);
                            });
                        });
                    });
                }, function(err) {
                    alert('❌ שגיאה ביצירת תיקייה: ' + err);
                });
            }, function(err) {
                alert('❌ לא ניתן לגשת ל-Downloads: ' + err);
            });

        } catch (error) {
            alert('❌ שגיאה: ' + error.message);
        }
    }

    /**
     * Get camera button HTML for exercises
     */
    getCameraButtonHtml(position) {
        const cls = position === 'top' ? 'scan-btn-top' : 'scan-btn-bottom';
        return `<button class="btn-scan ${cls}" onclick="window.startDocScan()">📷 סרוק מסמך</button>`;
    }

    /**
     * Get camera button HTML for summary page
     */
    getSummaryCameraButtonHtml() {
        return `<button class="btn-scan scan-btn-summary" onclick="window.startDocScanSummary()">📷 סרוק מסמך</button>`;
    }
}

/**
 * Document Scanner Module v5.4
 * Handles document scanning via camera, storage, and export
 */

export class DocumentScanner {
    constructor() {
        this.STORAGE_KEY = 'scannedDocuments';
        
        // All document type options
        this.allDocTypes = [
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
        
        // Context-based ordering: which doc types come first per exercise
        this.contextOrder = {
            // Exercise index -> prioritized doc types
            0: [], // בלון - no specific priority
            1: ['שרטוטים ותוכניות חנויות', 'סיכום חנויות'], // טיח
            2: ['שרטוטים ותוכניות קורקינט', 'סיכום קורקינט'], // דולירה
            3: ['סיכום רחוב'], // דויד
            4: ['שרטוטים ותוכניות לילה', 'סיכום לילה'], // לילה
            5: ['שרטוטים ותוכניות מכתב', 'סיכום מכתב'], // מכתב
            6: ['יום עבודתי', 'סיכום יום'], // יומינט
            'summary': ['סיכום כללי', 'משוב עמיתים', 'החלטות', 'יום עבודתי', 'סיכום יום']
        };
    }

    /**
     * Get all scanned documents from storage
     */
    getAllScans() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading scans:', e);
            return [];
        }
    }

    /**
     * Save all scans to storage
     */
    saveAllScans(scans) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scans));
        } catch (e) {
            console.error('Error saving scans:', e);
            alert('❌ שגיאה בשמירת סריקה. ייתכן שהזיכרון מלא.');
        }
    }

    /**
     * Get scans for a specific trainee
     */
    getScansForTrainee(traineeIndex) {
        return this.getAllScans().filter(s => s.traineeIndex === traineeIndex);
    }

    /**
     * Get ordered doc types based on context
     */
    getOrderedDocTypes(context) {
        const priority = this.contextOrder[context] || [];
        const rest = this.allDocTypes.filter(dt => !priority.includes(dt));
        return [...priority, ...rest];
    }

    /**
     * Generate unique filename for a scan
     */
    generateFilename(traineeIndex, docType) {
        const traineeName = window.getTraineeName(traineeIndex);
        const scans = this.getAllScans();
        
        // Count existing scans with same trainee + docType
        const existing = scans.filter(
            s => s.traineeIndex === traineeIndex && s.docType === docType
        );
        const seqNum = existing.length + 1;
        
        const safeName = traineeName.replace(/[^א-תa-zA-Z0-9]/g, '_');
        const safeType = docType.replace(/[^א-תa-zA-Z0-9]/g, '_');
        
        if (seqNum === 1) {
            return `${safeName}_${safeType}`;
        }
        return `${safeName}_${safeType}_${seqNum}`;
    }

    /**
     * Open the scan dialog - shows document type picker then camera
     */
    openScanDialog(context) {
        const traineeIndex = window.app.currentTrainee;
        const traineeName = window.getTraineeName(traineeIndex);
        const orderedTypes = this.getOrderedDocTypes(context);
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'scanner-overlay';
        overlay.id = 'scannerOverlay';
        
        let typesHtml = orderedTypes.map((dt, i) => `
            <button class="scan-type-btn" onclick="window.documentScanner.selectDocTypeAndScan(${traineeIndex}, '${dt}')">
                ${dt}
            </button>
        `).join('');
        
        overlay.innerHTML = `
            <div class="scanner-modal">
                <div class="scanner-modal-header">
                    <h3>📷 סריקת מסמך</h3>
                    <p style="font-size: 13px; color: #666; margin-top: 4px;">חניך: <strong>${window.escapeHtml(traineeName)}</strong></p>
                    <button class="scanner-close-btn" onclick="window.documentScanner.closeDialog()">✕</button>
                </div>
                <div class="scanner-modal-body">
                    <p style="margin-bottom: 12px; font-weight: 600;">בחר סוג מסמך:</p>
                    <div class="scan-types-list">
                        ${typesHtml}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeDialog();
        });
    }

    /**
     * Close the scan dialog
     */
    closeDialog() {
        const overlay = document.getElementById('scannerOverlay');
        if (overlay) overlay.remove();
    }

    /**
     * User selected a doc type - now open camera
     */
    selectDocTypeAndScan(traineeIndex, docType) {
        this.closeDialog();
        this.captureWithCamera(traineeIndex, docType);
    }

    /**
     * Capture image with device camera
     */
    captureWithCamera(traineeIndex, docType) {
        if (!navigator.camera) {
            alert('❌ המצלמה לא זמינה. ודא שהאפליקציה מותקנת כ-APK.');
            return;
        }
        
        navigator.camera.getPicture(
            (imageData) => {
                this.processAndSave(traineeIndex, docType, imageData);
            },
            (error) => {
                if (error !== 'No Image Selected' && error !== 'Camera cancelled.') {
                    console.error('Camera error:', error);
                    alert('❌ שגיאה בצילום: ' + error);
                }
            },
            {
                quality: 85,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG,
                correctOrientation: true,
                targetWidth: 2000,
                targetHeight: 2800
            }
        );
    }

    /**
     * Process captured image and save
     */
    processAndSave(traineeIndex, docType, base64Data) {
        const filename = this.generateFilename(traineeIndex, docType);
        const traineeName = window.getTraineeName(traineeIndex);
        
        const scan = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            traineeIndex: traineeIndex,
            traineeName: traineeName,
            docType: docType,
            filename: filename,
            imageData: base64Data, // base64 JPEG
            timestamp: new Date().toISOString(),
            dateStr: new Date().toLocaleDateString('he-IL')
        };
        
        const scans = this.getAllScans();
        scans.push(scan);
        this.saveAllScans(scans);
        
        // Show success feedback
        this.showToast(`✅ נסרק: ${docType}`);
        
        // Ask if user wants to scan another
        setTimeout(() => {
            if (confirm('המסמך נשמר בהצלחה!\nלסרוק מסמך נוסף?')) {
                this.openScanDialog(window.app.currentExercise !== undefined ? window.app.currentExercise : 'summary');
            }
        }, 300);
    }

    /**
     * Show a brief toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'scanner-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('scanner-toast-fade');
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }

    /**
     * Delete a specific scan
     */
    deleteScan(scanId) {
        if (!confirm('למחוק סריקה זו?')) return;
        
        let scans = this.getAllScans();
        scans = scans.filter(s => s.id !== scanId);
        this.saveAllScans(scans);
        this.showToast('🗑️ סריקה נמחקה');
    }

    /**
     * Get scan count for a trainee (for badge display)
     */
    getScanCount(traineeIndex) {
        return this.getScansForTrainee(traineeIndex).length;
    }

    /**
     * Render the camera button HTML
     */
    renderCameraButton(context) {
        const traineeIndex = window.app.currentTrainee;
        const count = this.getScanCount(traineeIndex);
        const badge = count > 0 ? `<span class="scan-badge">${count}</span>` : '';
        
        return `
            <div class="scan-btn-container">
                <button class="scan-camera-btn" onclick="window.documentScanner.openScanDialog(${typeof context === 'string' ? "'" + context + "'" : context})" title="סרוק מסמך">
                    📷${badge}
                </button>
            </div>
        `;
    }

    /**
     * Open document viewer for a specific trainee
     */
    openDocViewer(traineeIndex) {
        const scans = this.getScansForTrainee(traineeIndex);
        
        if (scans.length === 0) {
            alert('אין מסמכים סרוקים עבור חניך זה.');
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'scanner-overlay';
        overlay.id = 'docViewerOverlay';
        
        let listHtml = scans.map(scan => `
            <div class="doc-list-item" onclick="window.documentScanner.viewSingleDoc('${scan.id}')">
                <div class="doc-list-icon">📄</div>
                <div class="doc-list-info">
                    <div class="doc-list-name">${window.escapeHtml(scan.filename)}</div>
                    <div class="doc-list-meta">${scan.docType} · ${scan.dateStr}</div>
                </div>
                <button class="doc-delete-btn" onclick="event.stopPropagation(); window.documentScanner.deleteScanAndRefresh('${scan.id}', ${traineeIndex})">🗑️</button>
            </div>
        `).join('');
        
        overlay.innerHTML = `
            <div class="scanner-modal doc-viewer-modal">
                <div class="scanner-modal-header">
                    <h3>📋 מסמכים סרוקים</h3>
                    <p style="font-size: 13px; color: #666; margin-top: 4px;">${window.escapeHtml(window.getTraineeName(traineeIndex))} · ${scans.length} מסמכים</p>
                    <button class="scanner-close-btn" onclick="window.documentScanner.closeDocViewer()">✕</button>
                </div>
                <div class="scanner-modal-body">
                    <div class="doc-list">
                        ${listHtml}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeDocViewer();
        });
    }

    /**
     * Close document viewer
     */
    closeDocViewer() {
        const overlay = document.getElementById('docViewerOverlay');
        if (overlay) overlay.remove();
    }

    /**
     * Delete scan and refresh the viewer
     */
    deleteScanAndRefresh(scanId, traineeIndex) {
        if (!confirm('למחוק סריקה זו?')) return;
        
        let scans = this.getAllScans();
        scans = scans.filter(s => s.id !== scanId);
        this.saveAllScans(scans);
        
        this.closeDocViewer();
        
        // Reopen if there are still scans
        const remaining = this.getScansForTrainee(traineeIndex);
        if (remaining.length > 0) {
            setTimeout(() => this.openDocViewer(traineeIndex), 100);
        } else {
            this.showToast('🗑️ כל הסריקות נמחקו');
        }
    }

    /**
     * View a single scanned document with zoom/pan
     */
    viewSingleDoc(scanId) {
        const scans = this.getAllScans();
        const scan = scans.find(s => s.id === scanId);
        if (!scan) return;
        
        // Close the list view
        this.closeDocViewer();
        
        const overlay = document.createElement('div');
        overlay.className = 'scanner-overlay doc-view-overlay';
        overlay.id = 'singleDocOverlay';
        
        overlay.innerHTML = `
            <div class="doc-view-header">
                <button class="doc-view-back" onclick="window.documentScanner.closeSingleDoc(${scan.traineeIndex})">⬅ חזרה</button>
                <span class="doc-view-title">${window.escapeHtml(scan.filename)}</span>
                <button class="doc-view-close" onclick="window.documentScanner.closeSingleDocFull()">✕</button>
            </div>
            <div class="doc-view-container" id="docViewContainer">
                <img src="data:image/jpeg;base64,${scan.imageData}" 
                     id="docViewImage"
                     class="doc-view-image"
                     alt="${window.escapeHtml(scan.filename)}">
            </div>
            <div class="doc-view-controls">
                <button onclick="window.documentScanner.zoomDoc(-1)">➖</button>
                <span id="docZoomLevel">100%</span>
                <button onclick="window.documentScanner.zoomDoc(1)">➕</button>
                <button onclick="window.documentScanner.resetZoomDoc()">↺</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Setup pinch-to-zoom
        this._setupDocZoom();
    }

    /**
     * Close single doc view and go back to list
     */
    closeSingleDoc(traineeIndex) {
        const overlay = document.getElementById('singleDocOverlay');
        if (overlay) overlay.remove();
        setTimeout(() => this.openDocViewer(traineeIndex), 100);
    }

    /**
     * Close single doc view completely
     */
    closeSingleDocFull() {
        const overlay = document.getElementById('singleDocOverlay');
        if (overlay) overlay.remove();
    }

    /**
     * Setup zoom/pan for document viewer
     */
    _setupDocZoom() {
        this._docZoom = 1;
        this._docPanX = 0;
        this._docPanY = 0;
        
        const container = document.getElementById('docViewContainer');
        const img = document.getElementById('docViewImage');
        if (!container || !img) return;
        
        let startDistance = 0;
        let startZoom = 1;
        let isDragging = false;
        let startX = 0, startY = 0;
        let startPanX = 0, startPanY = 0;
        
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                startDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                startZoom = this._docZoom;
            } else if (e.touches.length === 1 && this._docZoom > 1) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startPanX = this._docPanX;
                startPanY = this._docPanY;
            }
        }, { passive: false });
        
        container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                this._docZoom = Math.min(5, Math.max(0.5, startZoom * (dist / startDistance)));
                this._applyDocTransform();
            } else if (isDragging && e.touches.length === 1) {
                e.preventDefault();
                this._docPanX = startPanX + (e.touches[0].clientX - startX);
                this._docPanY = startPanY + (e.touches[0].clientY - startY);
                this._applyDocTransform();
            }
        }, { passive: false });
        
        container.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    /**
     * Apply zoom/pan transform to doc image
     */
    _applyDocTransform() {
        const img = document.getElementById('docViewImage');
        const label = document.getElementById('docZoomLevel');
        if (img) {
            img.style.transform = `translate(${this._docPanX}px, ${this._docPanY}px) scale(${this._docZoom})`;
        }
        if (label) {
            label.textContent = Math.round(this._docZoom * 100) + '%';
        }
    }

    /**
     * Zoom doc via buttons
     */
    zoomDoc(direction) {
        this._docZoom = Math.min(5, Math.max(0.5, this._docZoom + direction * 0.25));
        this._applyDocTransform();
    }

    /**
     * Reset zoom
     */
    resetZoomDoc() {
        this._docZoom = 1;
        this._docPanX = 0;
        this._docPanY = 0;
        this._applyDocTransform();
    }

    // ===== EXPORT FUNCTIONS =====

    /**
     * Export all scans for a trainee as ZIP via social sharing
     */
    exportAsZip(traineeIndex) {
        const scans = this.getScansForTrainee(traineeIndex);
        if (scans.length === 0) {
            alert('אין מסמכים לייצוא.');
            return;
        }
        
        if (typeof JSZip === 'undefined') {
            alert('❌ ספריית ZIP לא זמינה.');
            return;
        }
        
        if (!window.cordova || !window.cordova.file) {
            alert('❌ File Plugin לא זמין.');
            return;
        }
        
        if (!window.plugins || !window.plugins.socialsharing) {
            alert('❌ Social Sharing Plugin לא זמין.');
            return;
        }
        
        const traineeName = window.getTraineeName(traineeIndex);
        const zip = new JSZip();
        
        scans.forEach(scan => {
            // Convert base64 to binary
            const byteChars = atob(scan.imageData);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            zip.file(`${scan.filename}.jpg`, byteArray);
        });
        
        zip.generateAsync({ type: 'blob' }).then(blob => {
            const filename = `${traineeName}_מסמכים.zip`;
            
            window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
                dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                    fileEntry.createWriter(function(writer) {
                        writer.onwriteend = function() {
                            window.plugins.socialsharing.shareWithOptions({
                                message: `מסמכים סרוקים - ${traineeName}`,
                                files: [fileEntry.nativeURL],
                                chooserTitle: 'שתף מסמכים'
                            }, function() {
                                console.log('✅ ZIP shared');
                            }, function(err) {
                                console.error('Share error:', err);
                                alert('❌ שיתוף נכשל');
                            });
                        };
                        writer.onerror = function(e) {
                            alert('❌ שגיאה ביצירת ZIP');
                        };
                        writer.write(blob);
                    });
                });
            });
        }).catch(err => {
            console.error('ZIP error:', err);
            alert('❌ שגיאה ביצירת ZIP: ' + err.message);
        });
    }

    /**
     * Export all scans as PDFs to a trainee folder in Downloads
     */
    exportAsPdfs(traineeIndex) {
        const scans = this.getScansForTrainee(traineeIndex);
        if (scans.length === 0) {
            alert('אין מסמכים לייצוא.');
            return;
        }
        
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined' && typeof window.jspdf === 'undefined') {
            alert('❌ ספריית PDF לא זמינה.');
            return;
        }
        
        if (!window.cordova || !window.cordova.file) {
            alert('❌ File Plugin לא זמין.');
            return;
        }
        
        const traineeName = window.getTraineeName(traineeIndex);
        const folderName = `${traineeName}_מסמכים`;
        
        // Get Downloads directory
        window.resolveLocalFileSystemURL(
            cordova.file.externalRootDirectory + 'Download/',
            (downloadDir) => {
                // Create subfolder
                downloadDir.getDirectory(folderName, { create: true }, (subDir) => {
                    let completed = 0;
                    let errors = 0;
                    
                    scans.forEach(scan => {
                        this._createPdfFromScan(scan, subDir, () => {
                            completed++;
                            if (completed + errors === scans.length) {
                                alert(`✅ נשמרו ${completed} מסמכים ב-Downloads/${folderName}/` + 
                                      (errors > 0 ? `\n⚠️ ${errors} שגיאות` : ''));
                            }
                        }, () => {
                            errors++;
                            if (completed + errors === scans.length) {
                                alert(`✅ נשמרו ${completed} מסמכים ב-Downloads/${folderName}/\n⚠️ ${errors} שגיאות`);
                            }
                        });
                    });
                }, (err) => {
                    alert('❌ שגיאה ביצירת תיקייה: ' + JSON.stringify(err));
                });
            },
            (err) => {
                alert('❌ לא ניתן לגשת ל-Downloads');
            }
        );
    }

    /**
     * Create a single PDF from a scan and save to directory
     */
    _createPdfFromScan(scan, dirEntry, onSuccess, onError) {
        try {
            const JsPDF = window.jspdf ? window.jspdf.jsPDF : (typeof jsPDF !== 'undefined' ? jsPDF : null);
            if (!JsPDF) {
                onError();
                return;
            }
            
            const doc = new JsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Add image to fill the page
            const imgData = 'data:image/jpeg;base64,' + scan.imageData;
            doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            
            const pdfBlob = doc.output('blob');
            const pdfFilename = scan.filename + '.pdf';
            
            dirEntry.getFile(pdfFilename, { create: true, exclusive: false }, (fileEntry) => {
                fileEntry.createWriter((writer) => {
                    writer.onwriteend = onSuccess;
                    writer.onerror = onError;
                    writer.write(pdfBlob);
                }, onError);
            }, onError);
        } catch (e) {
            console.error('PDF creation error:', e);
            onError();
        }
    }

    /**
     * Export all scans as a single ZIP via social sharing (all trainees)
     */
    exportAllAsZip() {
        const scans = this.getAllScans();
        if (scans.length === 0) {
            alert('אין מסמכים לייצוא.');
            return;
        }
        
        if (typeof JSZip === 'undefined') {
            alert('❌ ספריית ZIP לא זמינה.');
            return;
        }
        
        const zip = new JSZip();
        
        // Group by trainee
        const byTrainee = {};
        scans.forEach(scan => {
            const name = scan.traineeName || 'unknown';
            if (!byTrainee[name]) byTrainee[name] = [];
            byTrainee[name].push(scan);
        });
        
        // Add files in trainee folders
        Object.keys(byTrainee).forEach(name => {
            const folder = zip.folder(name);
            byTrainee[name].forEach(scan => {
                const byteChars = atob(scan.imageData);
                const byteNumbers = new Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteNumbers[i] = byteChars.charCodeAt(i);
                }
                folder.file(`${scan.filename}.jpg`, new Uint8Array(byteNumbers));
            });
        });
        
        zip.generateAsync({ type: 'blob' }).then(blob => {
            const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
            const filename = `מסמכים_סרוקים_${dateStr}.zip`;
            
            window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
                dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                    fileEntry.createWriter(function(writer) {
                        writer.onwriteend = function() {
                            window.plugins.socialsharing.shareWithOptions({
                                files: [fileEntry.nativeURL],
                                chooserTitle: 'שתף מסמכים סרוקים'
                            }, () => console.log('✅ All ZIP shared'), 
                            (err) => alert('❌ שיתוף נכשל'));
                        };
                        writer.write(blob);
                    });
                });
            });
        });
    }
}

/**
 * Storage Module
 * Handles all localStorage operations for data persistence
 */

export class Storage {
    constructor() {
        this.storageKey = 'feedbackAppData';
        this.primaryKey = 'primaryTrainees';
    }

    /**
     * Sync current DOM input values into app.data
     * Call this before persisting when on a page with form fields
     */
    syncFromDOM() {
        const fields = [
            'assessmentName',
            'trainee1',
            'trainee2',
            'trainee3',
            'trainee4',
            'highlights',
            'evaluatorName'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                window.app.data[field] = element.value;
            }
        });

        window.app.data.primaryTrainees = window.app.primaryTrainees;
    }

    /**
     * Save current app data to localStorage
     * @param {boolean} skipDomSync - if true, skip reading from DOM (use after programmatic data changes)
     */
    saveData(skipDomSync = false) {
        // Block saves during data clearing to prevent race conditions
        if (window._clearingData) {
            console.log('🚫 Save blocked - clearing in progress');
            return false;
        }

        try {
            if (!skipDomSync) {
                this.syncFromDOM();
            }

            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(window.app.data));
            localStorage.setItem(this.primaryKey, JSON.stringify(window.app.primaryTrainees));

            console.log('💾 Data saved successfully');
            return true;
        } catch (error) {
            // Handle QuotaExceededError silently for auto-save
            if (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014) {
                console.warn('⚠️ localStorage quota exceeded - trying to save without scanned docs...');
                return this._saveWithoutLargeData();
            }
            console.error('❌ Error saving data:', error);
            return false;
        }
    }

    /**
     * Fallback: save essential data without large base64 scanned docs
     * Keeps scannedDocs metadata but removes image/PDF data from localStorage
     */
    _saveWithoutLargeData() {
        try {
            // Create a copy without the heavy base64 fields
            const lightData = JSON.parse(JSON.stringify(window.app.data));
            
            if (lightData.scannedDocs) {
                Object.keys(lightData.scannedDocs).forEach(key => {
                    const doc = lightData.scannedDocs[key];
                    // Keep metadata, remove heavy data
                    doc.imageBase64 = '[saved-in-memory]';
                    doc.pdfBase64 = '[saved-in-memory]';
                });
            }

            localStorage.setItem(this.storageKey, JSON.stringify(lightData));
            localStorage.setItem(this.primaryKey, JSON.stringify(window.app.primaryTrainees));
            console.log('💾 Data saved (light mode - scanned docs in memory only)');
            return true;
        } catch (error) {
            console.error('❌ Error saving even light data:', error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            const savedPrimary = localStorage.getItem(this.primaryKey);

            if (savedData) {
                window.app.data = JSON.parse(savedData);

                // Ensure all required fields exist
                if (!window.app.data.storeHistory) window.app.data.storeHistory = [];
                if (!window.app.data.hotelHistory) window.app.data.hotelHistory = [];
                if (!window.app.data.exerciseData) window.app.data.exerciseData = {};
                if (!window.app.data.summaryData) window.app.data.summaryData = {};
                if (!window.app.data.scannedDocs) window.app.data.scannedDocs = {};

                // Populate form fields
                const fields = [
                    'assessmentName',
                    'trainee1',
                    'trainee2',
                    'trainee3',
                    'trainee4',
                    'highlights',
                    'evaluatorName'
                ];

                fields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element && window.app.data[field]) {
                        element.value = window.app.data[field];
                    }
                });
            }

            if (savedPrimary) {
                window.app.primaryTrainees = JSON.parse(savedPrimary);
            }

            console.log('📂 Data loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error loading data:', error);
            return false;
        }
    }

    /**
     * Get exercise data for specific trainee and exercise
     */
    getExerciseData(traineeId, exerciseId, field) {
        const key = `${traineeId}-${exerciseId}`;
        if (window.app.data.exerciseData[key] && window.app.data.exerciseData[key][field]) {
            return window.app.data.exerciseData[key][field];
        }
        return '';
    }

    /**
     * Set exercise data for specific trainee and exercise
     */
    setExerciseData(traineeId, exerciseId, field, value) {
        const key = `${traineeId}-${exerciseId}`;
        if (!window.app.data.exerciseData[key]) {
            window.app.data.exerciseData[key] = {};
        }
        window.app.data.exerciseData[key][field] = value;
        this.saveData();
    }

    /**
     * Get summary data for specific trainee and criterion
     */
    getSummaryData(key, field) {
        if (window.app.data.summaryData[key] && window.app.data.summaryData[key][field]) {
            return window.app.data.summaryData[key][field];
        }
        return '';
    }

    /**
     * Set summary data for specific trainee and criterion
     */
    setSummaryData(key, field, value) {
        if (!window.app.data.summaryData[key]) {
            window.app.data.summaryData[key] = {};
        }
        window.app.data.summaryData[key][field] = value;
        this.saveData();
    }

    /**
     * Export all data as JSON
     */
    exportJSON() {
        const exportData = {
            highlights: window.app.data.highlights,
            storeHistory: window.app.data.storeHistory,
            hotelHistory: window.app.data.hotelHistory,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `config_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Import JSON configuration
     */
    importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    
                    if (jsonData.highlights !== undefined) {
                        window.app.data.highlights = jsonData.highlights;
                        const highlightsEl = document.getElementById('highlights');
                        if (highlightsEl) highlightsEl.value = jsonData.highlights;
                    }
                    
                    if (jsonData.storeHistory && Array.isArray(jsonData.storeHistory)) {
                        window.app.data.storeHistory = jsonData.storeHistory;
                    }
                    
                    if (jsonData.hotelHistory && Array.isArray(jsonData.hotelHistory)) {
                        window.app.data.hotelHistory = jsonData.hotelHistory;
                    }
                    
                    this.saveData();
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Clear all data (with confirmation)
     * Phase 1: Block saves and clear in-memory data
     * Phase 2: Nuke all localStorage
     * Phase 3: Delete physical files from device filesystem (cache + Downloads)
     */
    clearAllData() {
        if (!confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים כולל מסמכים סרוקים?\n\nפעולה זו אינה ניתנת לביטול!')) {
            return;
        }

        console.log('🗑️ === CLEARING ALL DATA ===');

        // ===== PHASE 1: Block all saves immediately =====
        window._clearingData = true;
        console.log('🗑️ Phase 1: Blocking saves, clearing memory...');

        // Clear in-memory data completely
        window.app.data = {
            assessmentName: '', trainee1: '', trainee2: '',
            trainee3: '', trainee4: '', highlights: '',
            evaluatorName: '', primaryTrainees: [],
            exerciseData: {}, summaryData: {},
            storeHistory: [], hotelHistory: [],
            scannedDocs: {}
        };
        window.app.primaryTrainees = [];

        // ===== PHASE 2: Nuke all localStorage =====
        console.log('🗑️ Phase 2: Clearing localStorage...');
        try {
            // Remove known keys first
            localStorage.removeItem(this.storageKey);   // feedbackAppData
            localStorage.removeItem(this.primaryKey);    // primaryTrainees
            localStorage.removeItem('scannedDocs');      // legacy key

            // Sweep ALL remaining keys - this app owns this WebView
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) keysToRemove.push(key);
            }
            keysToRemove.forEach(k => {
                try { localStorage.removeItem(k); } catch(e) {}
            });
            console.log('🗑️ localStorage cleared (' + keysToRemove.length + ' keys removed)');
        } catch (e) {
            console.error('localStorage clear error:', e);
        }

        // ===== PHASE 3: Delete physical files from device =====
        console.log('🗑️ Phase 3: Cleaning device filesystem...');
        this._cleanFilesystem().then(() => {
            console.log('🗑️ === ALL CLEAR COMPLETE ===');
            window.location.reload();
        }).catch((err) => {
            console.warn('Filesystem cleanup partial:', err);
            window.location.reload();
        });
    }

    /**
     * Delete cached and exported scanned document files from device
     * Cleans: cacheDirectory (temp share files) + Download folders (exported PDFs)
     */
    _cleanFilesystem() {
        return new Promise((resolve) => {
            if (!window.cordova || !window.cordova.file) {
                console.log('No Cordova file API - skipping filesystem cleanup');
                resolve();
                return;
            }

            let pending = 0;
            let completed = 0;
            const checkDone = () => { if (++completed >= pending) resolve(); };

            // --- Clean cache directory (temp files from sharing) ---
            pending++;
            try {
                window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(cacheDir) {
                    const reader = cacheDir.createReader();
                    reader.readEntries(function(entries) {
                        if (entries.length === 0) { checkDone(); return; }
                        let done = 0;
                        entries.forEach(function(entry) {
                            if (entry.isDirectory && (entry.name.includes('_docs_') || entry.name.includes('מסמכים'))) {
                                entry.removeRecursively(
                                    function() { console.log('🗑️ Cache dir removed:', entry.name); if (++done >= entries.length) checkDone(); },
                                    function() { if (++done >= entries.length) checkDone(); }
                                );
                            } else if (entry.isFile && entry.name.endsWith('.pdf')) {
                                entry.remove(
                                    function() { console.log('🗑️ Cache file removed:', entry.name); if (++done >= entries.length) checkDone(); },
                                    function() { if (++done >= entries.length) checkDone(); }
                                );
                            } else {
                                if (++done >= entries.length) checkDone();
                            }
                        });
                    }, function() { checkDone(); });
                }, function() { checkDone(); });
            } catch(e) { checkDone(); }

            // --- Clean Download directory (exported PDF folders) ---
            pending++;
            try {
                window.resolveLocalFileSystemURL(window.cordova.file.externalRootDirectory + 'Download/', function(dlDir) {
                    const reader = dlDir.createReader();
                    reader.readEntries(function(entries) {
                        if (entries.length === 0) { checkDone(); return; }
                        let done = 0;
                        entries.forEach(function(entry) {
                            if (entry.isDirectory && entry.name.includes('מסמכים')) {
                                entry.removeRecursively(
                                    function() { console.log('🗑️ Download dir removed:', entry.name); if (++done >= entries.length) checkDone(); },
                                    function() { if (++done >= entries.length) checkDone(); }
                                );
                            } else {
                                if (++done >= entries.length) checkDone();
                            }
                        });
                    }, function() { checkDone(); });
                }, function() { checkDone(); });
            } catch(e) { checkDone(); }

            // Safety timeout - don't hang if filesystem ops stall
            setTimeout(() => {
                console.warn('Filesystem cleanup timeout - proceeding');
                resolve();
            }, 5000);
        });
    }

    /**
     * Add store to history
     */
    addStore(name, address, notes = '') {
        window.app.data.storeHistory.push({
            name,
            address,
            date: new Date().toLocaleDateString('he-IL'),
            notes
        });
        this.saveData();
    }

    /**
     * Update store in history
     */
    updateStore(index, field, value) {
        if (window.app.data.storeHistory[index]) {
            window.app.data.storeHistory[index][field] = value;
            this.saveData();
        }
    }

    /**
     * Delete store from history
     */
    deleteStore(index) {
        window.app.data.storeHistory.splice(index, 1);
        this.saveData();
    }

    /**
     * Add hotel to history
     */
    addHotel(name, address, notes = '') {
        window.app.data.hotelHistory.push({
            name,
            address,
            date: new Date().toLocaleDateString('he-IL'),
            notes
        });
        this.saveData();
    }

    /**
     * Update hotel in history
     */
    updateHotel(index, field, value) {
        if (window.app.data.hotelHistory[index]) {
            window.app.data.hotelHistory[index][field] = value;
            this.saveData();
        }
    }

    /**
     * Delete hotel from history
     */
    deleteHotel(index) {
        window.app.data.hotelHistory.splice(index, 1);
        this.saveData();
    }
}

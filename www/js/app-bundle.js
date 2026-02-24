// MyApp v5.7.0 - Bundled for old WebView compatibility
// Auto-generated - do not edit


// ===== js/storage.js =====
/**
 * Storage Module
 * Handles all localStorage operations for data persistence
 */

class Storage {
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


// ===== js/router.js =====
/**
 * Router Module
 * Handles page navigation and rendering
 */

class Router {
    constructor() {
        this.pages = {};
        this.currentPage = null;
    }

    /**
     * Register a page with the router
     */
    register(name, page) {
        this.pages[name] = page;
        console.log(`📄 Page registered: ${name}`);
    }

    /**
     * Navigate to a specific page
     */
    navigate(pageName) {
        if (!this.pages[pageName]) {
            console.error(`❌ Page not found: ${pageName}`);
            return;
        }

        // Save data before navigation
        if (this.currentPage && this.pages[this.currentPage].onLeave) {
            this.pages[this.currentPage].onLeave();
        }

        // Update current page
        window.app.currentPage = pageName;
        this.currentPage = pageName;

        // Render new page
        const appContainer = document.getElementById('app');
        const html = this.pages[pageName].render();
        appContainer.innerHTML = html;

        // Call onEnter hook if exists
        if (this.pages[pageName].onEnter) {
            setTimeout(() => {
                this.pages[pageName].onEnter();
            }, 0);
        }

        console.log(`🔀 Navigated to: ${pageName}`);
    }

    /**
     * Get current page name
     */
    getCurrentPage() {
        return this.currentPage;
    }
}


// ===== js/export.js =====
/**
 * Export Manager Module
 * Handles JSON, Excel, and WhatsApp exports
 */

class ExportManager {
    /**
     * Add completed exercises to history
     */
    addToHistory() {
        for (let t = 0; t < 4; t++) {
            // Add stores from Tiach exercise
            const tiachKey = `${t}-1`;
            const tiachData = window.app.data.exerciseData[tiachKey];
            if (tiachData) {
                // Tiach 1 store
                if (tiachData.tiach1_store_name_input && tiachData.tiach1_address_input) {
                    this.addUniqueStore(
                        tiachData.tiach1_store_name_input, 
                        tiachData.tiach1_address_input,
                        tiachData.tiach1_date || ''
                    );
                }
                // Tiach 2 store
                if (tiachData.tiach2_store_name_input && tiachData.tiach2_address_input) {
                    this.addUniqueStore(
                        tiachData.tiach2_store_name_input, 
                        tiachData.tiach2_address_input,
                        tiachData.tiach2_date || ''
                    );
                }
            }

            // Add hotels from Laila exercise
            const lailaKey = `${t}-4`;
            const lailaData = window.app.data.exerciseData[lailaKey];
            if (lailaData) {
                if (lailaData.hotel_name_input && lailaData.hotel_address_input) {
                    this.addUniqueHotel(
                        lailaData.hotel_name_input, 
                        lailaData.hotel_address_input,
                        lailaData.hotel_date || ''
                    );
                }
            }

            // Add hotels from Yominet exercise
            const yominetKey = `${t}-6`;
            const yominetData = window.app.data.exerciseData[yominetKey];
            if (yominetData) {
                // New hotel input field
                if (yominetData.hotel_name_input && yominetData.hotel_address_input) {
                    this.addUniqueHotel(
                        yominetData.hotel_name_input, 
                        yominetData.hotel_address_input,
                        yominetData.hotel_date || ''
                    );
                }
                // Old fields (keeping for backwards compatibility)
                if (yominetData.hotel1_name && yominetData.hotel1_address) {
                    this.addUniqueHotel(yominetData.hotel1_name, yominetData.hotel1_address);
                }
                if (yominetData.hotel2_name && yominetData.hotel2_address) {
                    this.addUniqueHotel(yominetData.hotel2_name, yominetData.hotel2_address);
                }
            }
        }
        window.storage.saveData();
    }

    addUniqueStore(name, address, date = '') {
        const exists = window.app.data.storeHistory.some(
            s => s.name === name && s.address === address
        );
        if (!exists) {
            window.storage.addStore(name, address, date);
        }
    }

    addUniqueHotel(name, address, date = '') {
        const exists = window.app.data.hotelHistory.some(
            h => h.name === name && h.address === address
        );
        if (!exists) {
            window.storage.addHotel(name, address, date);
        }
    }

    /**
     * Export complete data to JSON using File System Access API with fallback
     */
    async exportToJSON() {
        this.addToHistory();
        
        // Build complete export object
        const exportData = {
            metadata: {
                assessmentName: window.app.data.assessmentName,
                evaluatorName: window.app.data.evaluatorName,
                exportDate: new Date().toISOString(),
                appVersion: '1.0'
            },
            trainees: [],
            highlights: window.app.data.highlights,
            storeHistory: window.app.data.storeHistory,
            hotelHistory: window.app.data.hotelHistory
        };

        // Add each trainee with their complete data
        for (let t = 0; t < 4; t++) {
            const traineeData = {
                id: t,
                name: window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`,
                exercises: {},
                summary: {}
            };

            // Add exercise data
            window.app.exercises.forEach((exerciseName, e) => {
                const key = `${t}-${e}`;
                const exData = window.app.data.exerciseData[key] || {};
                if (Object.keys(exData).length > 0) {
                    traineeData.exercises[exerciseName] = exData;
                }
            });

            // Add summary data
            window.app.criteria.forEach(criterion => {
                const key = `${t}-${criterion}`;
                const score = window.storage.getSummaryData(key, 'score');
                const text = window.storage.getSummaryData(key, 'text');
                const examples = window.storage.getSummaryData(key, 'examples');
                
                if (score || text || examples) {
                    traineeData.summary[criterion] = {
                        score: score || 'לא מולא',
                        text: text || 'לא מולא',
                        examples: examples || 'לא מולא'
                    };
                }
            });

            exportData.trainees.push(traineeData);
        }

        const jsonStr = JSON.stringify(exportData, null, 2);
        const filename = `הגדרות-מנהל_${new Date().toISOString().slice(0, 10)}.json`;

        // Try Method 1: File System Access API
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'JSON Files',
                        accept: {'application/json': ['.json']}
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(jsonStr);
                await writable.close();
                alert('✅ קובץ JSON נשמר בהצלחה!\n\nשם ההערכה, חניכים, דגשים, היסטוריית חנויות ומלונות נשמרו.');
                return;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('File System API failed:', error);
            }
        }

        // Fallback: Use FileSaver.js
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
        saveAs(blob, filename);
        alert('✅ קובץ JSON יוצא בהצלחה!\n\nשם ההערכה, חניכים, דגשים, היסטוריית חנויות ומלונות נשמרו.');
    }

    /**
     * Load data from JSON (for admin page)
     */
    async loadFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Detect format: structured (has metadata) vs raw (has trainee1 directly)
                    if (data.metadata) {
                        // Structured format
                        window.app.data.assessmentName = data.metadata.assessmentName || '';
                        window.app.data.evaluatorName = data.metadata.evaluatorName || '';
                    } else if (data.assessmentName !== undefined) {
                        // Raw app.data format
                        window.app.data.assessmentName = data.assessmentName || '';
                        window.app.data.evaluatorName = data.evaluatorName || '';
                    }
                    
                    // Update trainees
                    if (data.trainees && data.trainees.length > 0) {
                        for (let i = 0; i < Math.min(4, data.trainees.length); i++) {
                            window.app.data[`trainee${i + 1}`] = data.trainees[i].name || '';
                        }
                    } else {
                        // Raw format - trainee1..4 directly
                        for (let i = 1; i <= 4; i++) {
                            if (data[`trainee${i}`] !== undefined) {
                                window.app.data[`trainee${i}`] = data[`trainee${i}`];
                            }
                        }
                    }
                    
                    // Update highlights
                    if (data.highlights !== undefined) {
                        window.app.data.highlights = data.highlights || '';
                    }
                    
                    // Update histories
                    if (data.storeHistory) {
                        window.app.data.storeHistory = data.storeHistory;
                    }
                    if (data.hotelHistory) {
                        window.app.data.hotelHistory = data.hotelHistory;
                    }
                    
                    window.storage.saveData(true); // skipDomSync=true: don't read stale DOM values
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Export to Excel (CSV format with UTF-8 BOM) using File System Access API with fallback
     * Includes ALL fields, marks empty fields as "לא מולא"
     */
    async exportToExcel() {
        this.addToHistory();

        let csv = '\uFEFF'; // UTF-8 BOM for Excel
        csv += 'שם ההערכה,' + window.csvEscape(window.app.data.assessmentName || 'לא מולא') + '\n';
        csv += 'מעריך,' + window.csvEscape(window.app.data.evaluatorName || 'לא מולא') + '\n';
        csv += 'תאריך,' + new Date().toLocaleDateString('he-IL') + '\n\n';

        // Trainees
        csv += 'חניכים,';
        for (let i = 1; i <= 4; i++) {
            csv += window.csvEscape(window.app.data[`trainee${i}`] || 'לא מולא');
            if (i < 4) csv += ',';
        }
        csv += '\n';
        csv += 'דגשים,' + window.csvEscape(window.app.data.highlights || 'לא מולא') + '\n\n';

        // Store history
        csv += 'היסטוריית חנויות (טיח)\n';
        csv += 'שם,כתובת,תאריך,הערות\n';
        if (window.app.data.storeHistory.length > 0) {
            window.app.data.storeHistory.forEach(s => {
                csv += window.csvEscape(s.name || 'לא מולא') + ',';
                csv += window.csvEscape(s.address || 'לא מולא') + ',';
                csv += (s.date || 'לא מולא') + ',';
                csv += window.csvEscape(s.notes || 'לא מולא') + '\n';
            });
        } else {
            csv += 'לא מולא,לא מולא,לא מולא,לא מולא\n';
        }
        csv += '\n';

        // Hotel history
        csv += 'היסטוריית מלונות (לילה)\n';
        csv += 'שם,כתובת,תאריך,הערות\n';
        if (window.app.data.hotelHistory.length > 0) {
            window.app.data.hotelHistory.forEach(h => {
                csv += window.csvEscape(h.name || 'לא מולא') + ',';
                csv += window.csvEscape(h.address || 'לא מולא') + ',';
                csv += (h.date || 'לא מולא') + ',';
                csv += window.csvEscape(h.notes || 'לא מולא') + '\n';
            });
        } else {
            csv += 'לא מולא,לא מולא,לא מולא,לא מולא\n';
        }
        csv += '\n';

        // Exercise data for each trainee
        for (let t = 0; t < 4; t++) {
            const traineeName = window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`;
            csv += `\n=== ${window.csvEscape(traineeName)} ===\n\n`;

            window.app.exercises.forEach((exerciseName, e) => {
                csv += `תרגיל: ${exerciseName}\n`;
                const key = `${t}-${e}`;
                const exData = window.app.data.exerciseData[key] || {};
                
                if (Object.keys(exData).length > 0) {
                    for (const field in exData) {
                        if (exData.hasOwnProperty(field)) {
                            const value = exData[field];
                            csv += `${field}:,${window.csvEscape(value || 'לא מולא')}\n`;
                        }
                    }
                } else {
                    csv += 'לא מולא\n';
                }
                csv += '\n';
            });
        }

        // Summary data
        csv += '\n=== סיכום הערכה ===\n\n';
        for (let t = 0; t < 4; t++) {
            const traineeName = window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`;
            csv += `\n${window.csvEscape(traineeName)}\n`;
            csv += 'קריטריון,ציון,הערות,דוגמאות\n';

            window.app.criteria.forEach(criterion => {
                const key = `${t}-${criterion}`;
                const score = window.storage.getSummaryData(key, 'score') || 'לא מולא';
                const text = window.storage.getSummaryData(key, 'text') || 'לא מולא';
                const examples = window.storage.getSummaryData(key, 'examples') || 'לא מולא';

                csv += window.csvEscape(criterion) + ',';
                csv += window.csvEscape(score) + ',';
                csv += window.csvEscape(text) + ',';
                csv += window.csvEscape(examples) + '\n';
            });
        }

        const filename = `משוב-סדנה_${new Date().toISOString().slice(0, 10)}.csv`;

        // Try Method 1: File System Access API
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'CSV Files',
                        accept: {'text/csv': ['.csv']}
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(csv);
                await writable.close();
                alert('✅ קובץ Excel נשמר בהצלחה!\n\nהקובץ נשמר במיקום שבחרת.');
                return;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('File System API failed:', error);
            }
        }

        // Fallback: Use FileSaver.js for CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
        alert('✅ קובץ Excel יוצא!\n\nהקובץ נשמר בתיקיית ההורדות.');
    }

    /**
     * Share Excel via WhatsApp
     * Exports Excel file first, then shares it
     */
    async shareToWhatsApp() {
        // Export Excel file
        this.exportToExcel();
        
        // Wait a moment for file to download
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show instructions
        alert('📤 קובץ ה-Excel יוצא!\n\n' +
              '📱 כעת תוכל לשתף אותו בWhatsApp:\n\n' +
              '1. פתח את WhatsApp\n' +
              '2. בחר שיחה\n' +
              '3. לחץ על 📎 (קליפ)\n' +
              '4. בחר "מסמך"\n' +
              '5. מצא את הקובץ בהורדות\n' +
              '6. שלח!');
    }
}


// ===== js/doc-scanner.js =====
/**
 * Document Scanner Module v5.5
 * Camera capture → Image enhancement → PDF generation
 * Uses cordova-plugin-camera + built-in PDF generator (no CDN needed)
 * Max file size: 1MB per scanned document
 */


class DocScanner {
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


// ===== js/pdf-generator.js =====
/**
 * Lightweight PDF Generator v1.0
 * Creates PDF from JPEG image - NO external dependencies
 * Replaces jsPDF CDN dependency for offline Cordova use
 * 
 * Generates a valid PDF 1.4 with embedded JPEG on A4 page
 */

class PDFGenerator {
    /**
     * Generate a PDF containing a JPEG image fitted to A4 page
     * @param {string} base64Jpeg - Raw base64 JPEG data (no data: prefix)
     * @returns {string} Raw base64 PDF data
     */
    static generate(base64Jpeg) {
        // A4 dimensions in PDF points (1 point = 1/72 inch)
        const PAGE_W = 595.28; // 210mm
        const PAGE_H = 841.89; // 297mm
        const MARGIN = 14.17;  // 5mm margin

        // Decode base64 to binary
        const jpegBinary = atob(base64Jpeg);
        const jpegBytes = new Uint8Array(jpegBinary.length);
        for (let i = 0; i < jpegBinary.length; i++) {
            jpegBytes[i] = jpegBinary.charCodeAt(i);
        }

        // Parse JPEG dimensions from headers
        const { width, height } = PDFGenerator._getJpegDimensions(jpegBytes);

        // Calculate image placement (fit to page with margin)
        const maxW = PAGE_W - (MARGIN * 2);
        const maxH = PAGE_H - (MARGIN * 2);
        const ratio = width / height;
        let imgW, imgH;

        if (ratio > maxW / maxH) {
            imgW = maxW;
            imgH = maxW / ratio;
        } else {
            imgH = maxH;
            imgW = maxH * ratio;
        }

        // Center on page
        const x = (PAGE_W - imgW) / 2;
        const y = (PAGE_H - imgH) / 2;

        // Build PDF structure
        const objects = [];
        const offsets = [];

        // Helper to add an object
        const addObj = (content) => {
            const num = objects.length + 1;
            objects.push(content);
            return num;
        };

        // Object 1: Catalog
        addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

        // Object 2: Pages
        addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

        // Object 3: Page
        addObj(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Img 5 0 R >> >> >>\nendobj\n`);

        // Object 4: Content stream (draw image command)
        const contentStream = `q\n${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Img Do\nQ`;
        addObj(`4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

        // Object 5: Image XObject (JPEG)
        const imgObj = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
        addObj(imgObj); // Will append binary + endstream separately

        // Assemble PDF bytes
        const header = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';
        const headerBytes = PDFGenerator._strToBytes(header);

        // Calculate all parts
        const parts = [];
        parts.push(headerBytes);

        // Objects 1-4 (text only)
        for (let i = 0; i < 4; i++) {
            offsets.push(PDFGenerator._totalLength(parts));
            parts.push(PDFGenerator._strToBytes(objects[i]));
        }

        // Object 5 (image - mixed text and binary)
        offsets.push(PDFGenerator._totalLength(parts));
        parts.push(PDFGenerator._strToBytes(objects[4])); // header part
        parts.push(jpegBytes);                              // binary JPEG data
        parts.push(PDFGenerator._strToBytes('\nendstream\nendobj\n'));

        // Cross-reference table
        const xrefOffset = PDFGenerator._totalLength(parts);
        let xref = `xref\n0 ${objects.length + 1}\n`;
        xref += '0000000000 65535 f \n';
        for (let i = 0; i < offsets.length; i++) {
            xref += offsets[i].toString().padStart(10, '0') + ' 00000 n \n';
        }

        // Trailer
        xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
        xref += `startxref\n${xrefOffset}\n%%EOF`;

        parts.push(PDFGenerator._strToBytes(xref));

        // Merge all parts into single Uint8Array
        const totalLen = PDFGenerator._totalLength(parts);
        const pdf = new Uint8Array(totalLen);
        let offset = 0;
        for (const part of parts) {
            pdf.set(part, offset);
            offset += part.length;
        }

        // Convert to base64
        return PDFGenerator._bytesToBase64(pdf);
    }

    /**
     * Parse JPEG SOF marker to get image dimensions
     */
    static _getJpegDimensions(bytes) {
        // Verify JPEG magic bytes
        if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
            return { width: 1240, height: 1754 };
        }

        let i = 2;
        while (i < bytes.length - 1) {
            if (bytes[i] !== 0xFF) { i++; continue; }
            const marker = bytes[i + 1];

            // SOF markers (Start of Frame)
            if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
                const height = (bytes[i + 5] << 8) | bytes[i + 6];
                const width = (bytes[i + 7] << 8) | bytes[i + 8];
                return { width, height };
            }

            // Skip segment
            if (marker >= 0xD0 && marker <= 0xD9) {
                i += 2;
            } else {
                const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
                i += 2 + segLen;
            }
        }

        return { width: 1240, height: 1754 };
    }

    static _strToBytes(str) {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i) & 0xFF;
        }
        return bytes;
    }

    static _totalLength(parts) {
        let len = 0;
        for (const p of parts) len += p.length;
        return len;
    }

    static _bytesToBase64(bytes) {
        const CHUNK = 32768;
        let binary = '';
        for (let i = 0; i < bytes.length; i += CHUNK) {
            const chunk = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
            binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
    }
}


// ===== js/exercises/balloon.js =====
/**
 * Balloon Exercise Module - תרגיל בלון
 */

class BalloonExercise {
    constructor() {
        this.name = 'בלון';
        this.scores = [
            'גמישות מחשבתית',
            'יכולת תכנון',
            'תמודדות עם לחץ ועמימות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'עבודה בצוות',
            'ציון מסכם'
        ];
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                באמצעות הדינמיקה הקבוצתית לזהות יכולות של: חשיבה, ניתוח ופתרון בעיות, עבודה בצוות, הובלה ופיקוד.
            </div>
        `;
        
        html += `
            <div class="question-block">
                <div class="question-title">התרשמות חופשית</div>
                <textarea onchange="setExerciseData('${key}', 'impression', this.value)">${window.escapeHtml(this.getData(key, 'impression'))}</textarea>
            </div>
        `;
        
        html += '<div class="section-title">ציונים</div>';
        
        this.scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        html += `
            <div class="question-block">
                <div class="question-title">התייחסות חופשית</div>
                <textarea onchange="setExerciseData('${key}', 'free_comment', this.value)">${window.escapeHtml(this.getData(key, 'free_comment'))}</textarea>
            </div>
        `;
        
        return html;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר ציון...</option>${vals.map(v => `<option value="${v}" ${value == v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
    }

    getData(key, field) {
        return window.storage.getExerciseData(key.split('-')[0], key.split('-')[1], field);
    }

    onRender(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}


// ===== js/exercises/tiach.js =====
/**
 * Tiach Exercise Module - תרגיל טיח
 */

class TiachExercise {
    constructor() {
        this.name = 'טיח';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        // מטרות
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                מסגרת זמנים של שעה וחצי.<br>
                מדובר בתרגיל חימום להקניית מושגי יסוד.<br>
                למידה על בטחון עצמי, זיכרון, קשר בינאישי, בסיס להבנה מודיעינית.
            </div>
        `;
        
        // הנחיות למדריך
        html += `
            <div class="info-box">
                <strong>הנחיות למדריך:</strong><br>
                • בתדריך הראשון אין לפרט את המודיעין הנדרש, יש לאפשר למועמד לבחור את המידע הרלוונטי בעיניו.<br>
                • לא להכניס לחלפנים, חנויות תכשיטים או חנויות גדולות מידי/קטנות מידי.<br>
                • בכל אירוע חריג לעדכן את מנהל הסדנה.<br>
                • יש לחדד למועמד את הנהלים בדגש על שימוש בנייד, פנקס, ס"כ בפגישת מכר, שימוש בכסף, בטיחות.<br>
                • אין לאפשר חשיבה מחוץ לחנות.<br>
                • אין לענות על שאלות ספציפיות לגבי המידע הנדרש.
            </div>
        `;

        // היסטוריית חנויות
        html += `<div class="section-title">היסטוריית חנויות</div>`;
        html += `<div class="info-box">`;
        if (window.app.data.storeHistory && window.app.data.storeHistory.length > 0) {
            html += `<table style="width:100%; border-collapse: collapse;">`;
            html += `<tr><th style="border:1px solid #ddd; padding:5px;">שם</th><th style="border:1px solid #ddd; padding:5px;">כתובת</th><th style="border:1px solid #ddd; padding:5px;">תאריך</th></tr>`;
            window.app.data.storeHistory.forEach(store => {
                html += `<tr>`;
                html += `<td style="border:1px solid #ddd; padding:5px;">${window.escapeHtml(store.name)}</td>`;
                html += `<td style="border:1px solid #ddd; padding:5px;">${window.escapeHtml(store.address)}</td>`;
                html += `<td style="border:1px solid #ddd; padding:5px;">${store.date || ''}</td>`;
                html += `</tr>`;
            });
            html += `</table>`;
        } else {
            html += `אין חנויות שמורות בהיסטוריה`;
        }
        html += `</div>`;

        // טיח 1
        html += `<div class="section-title">טיח 1 - פרטי חנות</div>`;
        html += this.renderQuestion(key, 'שם חנות', 'tiach1_store_name_input', 'text');
        html += this.renderQuestion(key, 'כתובת חנות', 'tiach1_address_input', 'text');
        html += `<div class="question-block"><div class="question-title">תאריך</div><input type="text" value="${this.getData(key, 'tiach1_date') || new Date().toLocaleDateString('he-IL')}" readonly style="background:#f0f0f0;"></div>`;
        
        html += `<div class="section-title">טיח 1</div>`;
        
        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                עלייך לשהות בחנות בדיוק 8 דקות ובסיום לצאת ולהגיע לנק' הפגישה. בחנות ישנם כל מיני פרמטרים מודיעיניים שמעניינים את היחידה, עלייך לאסוף מקסימום מידע רלוונטי עבורנו. עלייך לחשוב לבד מה נחשב רלוונטי ומדוע.
            </div>
        `;

        html += this.renderQuestion(key, 'האם היו אירועים חריגים/תקלות', 'tiach1_incidents', 'textarea');
        
        html += `
            <div class="info-box">
                <strong>דגשים לתרגיל:</strong><br>
                • הנחיות שרטוט - רחובות, מיקום במרחב, חנויות סמוכות, חץ שמיים, שמות רחובות ואיתורים + שירטוט פנימי מדוייק.<br>
                • יש להסביר את העקרונות הבאים תו"כ התחקיר: הערכה מול עובדה, סיפור כיסוי, בטחון מול יעילות.
            </div>
        `;

        html += this.renderQuestion(key, 'איך היה לך (תחושות)', 'tiach1_feeling', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי', 'tiach1_cover_story', 'textarea');
        html += this.renderQuestion(key, 'איך היה האינטרקציה עם המוכר', 'tiach1_interaction', 'textarea');
        html += this.renderQuestion(key, 'מי יזם את השיחה', 'tiach1_initiator', 'textarea');
        html += this.renderQuestion(key, 'כמה זמן הית בחנות ואיך מדדת?', 'tiach1_time', 'textarea');
        html += this.renderQuestion(key, 'פרט את המל"מ שאספת, האם התמקד בעיקר ויש חשיבה מודיעינית?', 'tiach1_intel', 'textarea');
        
        html += this.renderYesNoQuestion(key, 'תיאור מדויק של המוכר', 'tiach1_seller_desc');
        html += this.renderYesNoQuestion(key, 'שם החנות', 'tiach1_store_name');
        html += this.renderYesNoQuestion(key, 'כתובת', 'tiach1_address');
        html += this.renderYesNoQuestion(key, 'יציאות נוספות', 'tiach1_exits');
        html += this.renderYesNoQuestion(key, 'כיוון פתיחת דלת', 'tiach1_door');
        html += this.renderYesNoQuestion(key, 'סורגים', 'tiach1_bars');
        html += this.renderYesNoQuestion(key, 'מנעולים', 'tiach1_locks');
        html += this.renderYesNoQuestion(key, 'מצלמות', 'tiach1_cameras');
        html += this.renderYesNoQuestion(key, 'אזעקה', 'tiach1_alarm');
        html += this.renderYesNoQuestion(key, 'קופה/מחשב', 'tiach1_register');
        html += this.renderYesNoQuestion(key, 'כרטיס ביקור', 'tiach1_card');
        html += this.renderYesNoQuestion(key, 'פתח לחזרה', 'tiach1_return_option');

        html += this.renderQuestion(key, 'מה אמרת כשיצאת מהחנות', 'tiach1_exit_words', 'textarea');
        html += this.renderQuestion(key, 'מדוע נראה לך שהחנות מעניינת אותנו', 'tiach1_why_interesting', 'textarea');

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                לאחר מעקב מודיעיני ממושך - עולה תובנה כי באזור תל אביב קיימת התארגנות חשאית של קבוצה אשר זהותם ומטרת התארגנותם לא ידועה.
                מידיעה סיגינטית עולה שחברי ההתארגנות מביעים עניין במספר אתרים בתל אביב. חלק מההתייחסויות נוגעת לחנות בלב תל אביב. לא ידוע בשלב זה מה הסיבה שהפעילים מתעניינים דווקא בחנות. כמו כן לא ידוע האם בעל החנות חלק מהתשתית, מודע לפעילות ו/או לזהות הפעילים.
            </div>
        `;

        html += this.renderQuestion(key, 'יש לנו עדיין פערים מודיעיניים, מה אפשר לעשות?', 'tiach1_gaps', 'textarea');
        html += this.renderQuestion(key, 'אם הוצע סיבוב נוסף להשלמת הפערים, מה השיקולים', 'tiach1_another_round', 'textarea');

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                משימתך - לחזור לחנות לעוד 8 דק' להשלמת המודיעין, לחלק מהשאלות לא היו תשובות וישנן עוד שאלות מודיעיניות שלא שאלנו. עלייך לחזור לחנות ולחשוב על מודיעין נוסף רלוונטי על החנות והמוכרים.
            </div>
        `;

        // כניסה שניה לחנות 1
        html += `<div class="section-title">כניסה שניה לחנות 1</div>`;
        
        html += this.renderQuestion(key, 'חריגים/תקלות?', 'tiach1_2_incidents', 'textarea');
        html += this.renderQuestion(key, 'איך היה לך?', 'tiach1_2_feeling', 'textarea');
        html += this.renderQuestion(key, 'איך הצגת את החזרה לחנות?', 'tiach1_2_return_presentation', 'textarea');
        html += this.renderQuestion(key, 'מה קרה כשנכנסת?', 'tiach1_2_entry', 'textarea');
        html += this.renderQuestion(key, 'איך הייתה האינטרקציה עם המוכר והסביבה?', 'tiach1_2_interaction', 'textarea');
        html += this.renderQuestion(key, 'מה אמרת כשחזרת?', 'tiach1_2_exit_words', 'textarea');
        html += this.renderQuestion(key, 'מה עידכנת בשרטוט (מעבר על שרטוט)', 'tiach1_2_sketch_update', 'textarea');
        html += this.renderQuestion(key, 'פרטים נוספים על המוכר?', 'tiach1_2_seller_details', 'textarea');

        html += this.renderYesNoQuestion(key, 'תיאור מדויק של המוכר', 'tiach1_2_seller_desc');
        html += this.renderYesNoQuestion(key, 'שם החנות', 'tiach1_2_store_name');
        html += this.renderYesNoQuestion(key, 'כתובת', 'tiach1_2_address');
        html += this.renderYesNoQuestion(key, 'יציאות נוספות', 'tiach1_2_exits');
        html += this.renderYesNoQuestion(key, 'כיוון פתיחת דלת', 'tiach1_2_door');
        html += this.renderYesNoQuestion(key, 'סורגים', 'tiach1_2_bars');
        html += this.renderYesNoQuestion(key, 'מנעולים', 'tiach1_2_locks');
        html += this.renderYesNoQuestion(key, 'מצלמות', 'tiach1_2_cameras');
        html += this.renderYesNoQuestion(key, 'אזעקה', 'tiach1_2_alarm');
        html += this.renderYesNoQuestion(key, 'קופה/מחשב', 'tiach1_2_register');
        html += this.renderYesNoQuestion(key, 'כרטיס ביקור', 'tiach1_2_card');
        html += this.renderYesNoQuestion(key, 'האם תיקן דיווחי טעות (הפרדה בין עובדה להערכה)', 'tiach1_2_corrections');
        
        html += this.renderQuestion(key, 'מדוע לא הבאת מל"מ נוסף?', 'tiach1_2_why_no_intel', 'textarea');
        html += this.renderQuestion(key, 'האם אפשר ונכון לחזור פעם שלישית? באיזה כיסוי?', 'tiach1_2_third_time', 'textarea');

        html += `
            <div class="info-box">
                <strong>דגשים למעריך:</strong><br>
                • לברר שהמועמד הפנים את העקרונות.<br>
                • להסביר מונחים של: הערכה/עובדה, סיפור כיסוי ומניעים, בטחון/יעילות.<br>
                • להסביר למועמד שאם ישנם שינויים מהדיווח הראשוני עליו לדווח על כך בתחילה.
            </div>
        `;

        html += this.renderQuestion(key, 'סיכום תרגיל - מלל חופשי', 'tiach1_summary', 'textarea');

        // טיח 2 - זמן בינוני + יומינט
        html += `<div class="section-title">טיח 2 - זמן בינוני + יומינט</div>`;
        
        html += `<div class="section-title">טיח 2 - פרטי חנות</div>`;
        html += this.renderQuestion(key, 'שם חנות', 'tiach2_store_name_input', 'text');
        html += this.renderQuestion(key, 'כתובת חנות', 'tiach2_address_input', 'text');
        html += `<div class="question-block"><div class="question-title">תאריך</div><input type="text" value="${this.getData(key, 'tiach2_date') || new Date().toLocaleDateString('he-IL')}" readonly style="background:#f0f0f0;"></div>`;
        
        html += `
            <div class="info-box">
                <strong>מסגרת זמנים:</strong> עד שעה<br>
                <strong>תיאור התרגיל:</strong> כניסה לחנות למשך 30 דק' (10 ד' הצגת ס"כ ומל"מ ו-20 ד' תצפית למדרכה הצמודה)
            </div>
        `;

        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                הפקת לקחים, שימוש סיפור כיסוי, זיכרון, קשר בינאישי, בסיס לחשיבה מבצעית, בטחון/יעילות, חלוקת קשב, יכולות משחק, אילתור וניצול הזדמנות.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                אנשי היחידה מתארגנים למהלך בחנות שביקרת. המידע שהבאת - סייע מאוד. ממודיעין עדכני עולה חנות נוספת שמעניינת את הפעילים ויתכן שהחנות מהווה מקום מפגש וחסות לפעילותיהם. בכוונת היחידה לממש מהלך טכנולוגי לפיקוח על הנעשה בחנות (ניתן לשאול את המועמד אילו מהלכים חושב שיתבצעו). עלייך לשהות בחנות 30 דק'.<br>
                ב-10 הדק' הראשונות הצג את סיפור הכיסוי ובצע איסוף מל"מ כפי שלמדת. ב-20 הדק' הנוספות עלייך לבצע תצפית מתוך החנות החוצה על המדרכה הצמודה ולזהות את מדריכי הקבוצה (זמן וכיוון).<br>
                בסיום הזמן או אם סומן לך ע"י מדריך ע"י גירוד בראש שלו - עלייך להוציא את המוכר החוצה מהחנות ששני רגליו יעברו את סף הדלת. אין שימוש במגע פיסי כלשהו!<br>
                בסיום הזמן עלייך לחזור לנק' המפגש.<br>
                לאחר ההוצאה עלייך לחזור לנק' המפגש.<br>
                מעתה והלאה עלייך לפתוח בכל תחקיר בהתייחסות לחריגים/חשדות/תקלות.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>הנחיות למעריך:</strong><br>
                1. ניתן לקצר עפ"י שיקולים לוגיסטיים או במידה וזוהה חשש לבטחון באינטרקציה.<br>
                2. יש לבחור חנות אחרת אך מאפשרת - מעט גדולה עם חלון ראווה.<br>
                3. לעדכן בכל חריג את מנהל הסדנה.
            </div>
        `;

        html += this.renderQuestion(key, 'חריגים/תקלות/חשדות?', 'tiach2_incidents', 'textarea');
        html += this.renderYesNoQuestion(key, 'קיבל קלסר לשירטוט?', 'tiach2_folder');
        html += this.renderQuestion(key, 'תיאור החוויה (2-3 ד)', 'tiach2_experience', 'textarea');
        html += this.renderQuestion(key, 'איך הייתה האינטרקציה?', 'tiach2_interaction', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי לכניסה לחנות?', 'tiach2_cover_entry', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי לתצפית למדרכה?', 'tiach2_cover_observation', 'textarea');
        html += this.renderQuestion(key, 'האם היו לך רעיונות נוספים לכיסויים?', 'tiach2_other_covers', 'textarea');
        html += this.renderQuestion(key, 'פרט את המל"מ שאספת (1-2 ד\' והאם ממוקד בפרטים מודיעיניים ובעיקר)', 'tiach2_intel', 'textarea');

        html += this.renderYesNoQuestion(key, 'מספר טלפון של החנות', 'tiach2_phone');
        html += this.renderYesNoQuestion(key, 'כתובת מדוייקת', 'tiach2_address');
        html += this.renderYesNoQuestion(key, 'שעות פתיחה', 'tiach2_hours');
        html += this.renderYesNoQuestion(key, 'כמה מוכרים', 'tiach2_sellers_count');
        
        html += `<div class="section-title" style="font-size: 16px; margin-top: 15px;">שאלות נוספות</div>`;
        
        html += this.renderYesNoQuestion(key, 'סוגי מצלמות', 'tiach2_camera_types');
        html += this.renderYesNoQuestion(key, 'פתחי יציאה', 'tiach2_exits');
        html += this.renderYesNoQuestion(key, 'מחשב/קופה', 'tiach2_computer');
        html += this.renderYesNoQuestion(key, 'טלפון קווי', 'tiach2_landline');
        html += this.renderYesNoQuestion(key, 'אזעקה', 'tiach2_alarm');
        html += this.renderYesNoQuestion(key, 'פרטים על המוכר או בעלים', 'tiach2_seller_details');
        html += this.renderYesNoQuestion(key, 'האם השארת פתח לחזרה?', 'tiach2_return_option');
        
        html += this.renderQuestion(key, 'כמה זמן ציפית?', 'tiach2_observation_time', 'textarea');
        html += this.renderQuestion(key, 'פרט את החליפות שבוצעו ע"י המדריכים', 'tiach2_instructors_passes', 'textarea');
        html += this.renderQuestion(key, 'האם יתכן שפיספסת?', 'tiach2_missed', 'textarea');
        html += this.renderQuestion(key, 'כמה % מהזמן ציפית ולמה?', 'tiach2_observation_percent', 'textarea');
        html += this.renderQuestion(key, 'האם הוצאת את המוכר?', 'tiach2_removal', 'textarea');
        html += this.renderQuestion(key, 'מה היה הסיפור כיסוי להוצאה?', 'tiach2_removal_cover', 'textarea');
        html += this.renderQuestion(key, 'מתי תכננת את הסיפור כיסוי? (אילתר/תכנן/ניצל הזדמנות)', 'tiach2_cover_planning', 'textarea');
        html += this.renderQuestion(key, 'האם עלו לדעתך חשדות?', 'tiach2_suspicions', 'textarea');

        html += this.renderQuestion(key, 'סיכום תרגיל - מלל חופשי', 'tiach2_summary', 'textarea');
        
        // ציונים טיח 2
        html += '<div class="section-title">ציונים</div>';
        const scores2 = [
            'גמישות מחשבתית',
            'יכולת תכנון',
            'התמודדות עם לחץ ועמימות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'יכולת דיווח',
            'ציון מסכם'
        ];
        scores2.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `tiach2_score_${i}`);
        });

        html += `<div class="question-block"><div class="question-title">התייחסות חופשית</div><textarea onchange="setExerciseData('${key}', 'free_comment', this.value)">${window.escapeHtml(this.getData(key, 'free_comment'))}</textarea></div>`;

        return html;
    }

    renderQuestion(key, title, field, type = 'text') {
        const value = window.escapeHtml(this.getData(key, field));
        if (type === 'textarea') {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <textarea onchange="setExerciseData('${key}', '${field}', this.value)">${value}</textarea>
                </div>
            `;
        } else {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <input type="text" value="${value}" onchange="setExerciseData('${key}', '${field}', this.value)">
                </div>
            `;
        }
    }

    renderYesNoQuestion(key, title, field) {
        const yesNo = this.getData(key, `${field}_yesno`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="יש" 
                            ${yesNo === 'יש' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        יש
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="אין" 
                            ${yesNo === 'אין' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        אין
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר ציון...</option>${vals.map(v => `<option value="${v}" ${value == v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field) || '';
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}


// ===== js/exercises/dolira.js =====
/**
 * Dolira Exercise Module - תרגיל דולירה
 */

class DoliraExercise {
    constructor() {
        this.name = 'דולירה';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">🛴 תרגיל 3: ${this.name}</h4>`;
        
        html += `
            <div class="info-box">
                <strong>מסגרת זמנים:</strong> עד 3 שעות ל-2 מועמדים<br>
                <strong>תיאור:</strong> ביצוע סיור שטח והתקנת אמצעי בתחתית הדולירה
            </div>
        `;
        
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                הטמעת התהליך המבצעי המלא, יכולת תכנון בסיסית, הטמעת לקחים, בטחון מול יעילות, מקתגים, יצירתיות, יכולות משחק ונכונות של המועמד "להתלכלך".
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>שלבי התרגיל:</strong><br>
                1. תדריך וסיוש<br>
                2. כתיבת תוכנית<br>
                3. ביצוע<br>
                4. עמידה בתחקירים
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                לוחמי היחידה ביצעו מעצר סמוי של החנות בה שהית בצהריים. בחקירה סיפר כי העביר לפעיל דיסאונקי מוצפן ובו מידע חשוב. הפעיל אינו מודע למידע על הכונן. הפעיל עתיד להחנות את הקורקינט בכתובת _______ בזמן שהוא יוצא לשייט במרינה בין 15 ל-19. מטרת היחידה למתקן את הקורקינט באמצעי איתור. עלייך להדביק את האמצעי בתחתית הקורקינט בצורה חשאית מבלי להשאיר סימן. יש להצמיד את האמצעי למשך 20 שניות. לרשותך 10 דק' להבהרת משימה.
            </div>
        `;

        // שלב הבהרת משימה
        html += `<div class="section-title">שלב הבהרת משימה</div>`;
        html += `<div style="margin-bottom: 10px; font-weight: bold;">האם המועמד שאל את השאלות הבאות:</div>`;
        
        html += this.renderYesNoQuestion(key, 'מיקום הקורקינט', 'clarify_location');
        html += this.renderYesNoQuestion(key, 'סוג/תיאור הקורקינט (אם שאל להציג תמונה)', 'clarify_scooter_type');
        html += this.renderYesNoQuestion(key, 'סוג האמצעי ואיך מדביקים (אם שאל אז לתת)', 'clarify_device');
        html += this.renderYesNoQuestion(key, 'תיאור האוביקט', 'clarify_object_desc');
        html += this.renderYesNoQuestion(key, 'חלון זמן לביצוע', 'clarify_time_window');
        html += this.renderQuestion(key, 'שאלות נוספות ששאל', 'clarify_other', 'textarea');

        html += `
            <div class="info-box">
                <strong>הנחייה:</strong> יש לשלוח את המועמד לסיוש של 20 דק' + 10 דק' לשרטוט ודפאות.<br>
                <strong>סיפור מעשה:</strong> עלייך לבצע סיוש לקראת ביצוע התרגיל. בסיום הסיור תתבקש להציג שרטוט וכן 2 דפאות רלוונטיות לביצוע. לרשותך 30 דק'.
            </div>
        `;

        // תחקיר לאחר סיוש
        html += `<div class="section-title">תחקיר לאחר סיוש</div>`;
        
        html += this.renderQuestion(key, 'חריגים/תקלות/חשדות', 'recon_incidents', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם המועמד זכר ושרטט נכון את סביבת היעד', 'recon_sketch');
        html += this.renderQuestion(key, 'מה עשית ממתי שעזבת ועד ההגעה למלון? תאר מסלול הליכה, רחובות, פרטים, תאורה, כיוונים', 'recon_route', 'textarea');
        html += this.renderQuestion(key, 'חיכוך מול בן אדם ברחוב (חלף/עמד והתרשם)', 'recon_street_interaction', 'textarea');
        html += this.renderQuestion(key, 'חיכוך מול הבית (נכנס/תצפית מרחוק)', 'recon_building_interaction', 'textarea');
        html += this.renderQuestion(key, 'מה השיקולים לנגד עינך בבחירות', 'recon_considerations', 'textarea');
        html += this.renderQuestion(key, 'האם היה לך סיפור כיסוי בסיור שטח', 'recon_cover_story', 'textarea');
        html += this.renderQuestion(key, 'פירוט המל"מ שנאסף בדגש על עיקר וטפל, מיקוד, חשיבה מודיעינית', 'recon_intel', 'textarea');
        html += this.renderQuestion(key, 'האם סיור השטח והמל"מ שאספת שיאת את ביצוע המשימה? האם היית נוהג אחרת', 'recon_sufficient', 'textarea');
        
        html += this.renderQuestion(key, 'מה הדפא הראשונה', 'plan_a', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא השניה', 'plan_b', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא שאתה מעדיף, ומהם השיקולים', 'plan_preference', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא 1</div>`;
        html += this.renderQuestion(key, 'מה היתרונות', 'plan_a_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות', 'plan_a_cons', 'textarea');
        html += this.renderQuestion(key, 'מה הציוד הנדרש', 'plan_a_equipment', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא 2</div>`;
        html += this.renderQuestion(key, 'מה היתרונות', 'plan_b_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות', 'plan_b_cons', 'textarea');
        html += this.renderQuestion(key, 'מה הציוד הנדרש', 'plan_b_equipment', 'textarea');

        html += `
            <div class="info-box">
                <strong>הנחייה:</strong> לרשותך 25 דק' לכתיבת תוכנית פעולה
            </div>
        `;

        // הצגת דפא ואישור תוכניות
        html += `<div class="section-title">הצגת דפא ואישור תוכניות (30 דק')</div>`;
        
        html += this.renderPlanQuestion(key, 'הצגת סיפור כיסוי', 'presentation_cover');
        html += this.renderPlanQuestion(key, 'שיטה - צירי תנועה ונסיגה', 'presentation_movement');
        html += this.renderPlanQuestion(key, 'מבצע תצפית מרחוק', 'presentation_observation');
        html += this.renderPlanQuestion(key, 'מתחשב במצב הרחוב או מתזמן את הביצוע', 'presentation_timing');
        html += this.renderPlanQuestion(key, 'מהם התנאים והמגבלות לביצוע', 'presentation_conditions');
        
        html += `<div class="section-title" style="font-size: 16px;">מקתגים</div>`;
        
        html += this.renderContingencyQuestion(key, 'קורקינט לא נעול', 'cont_unlocked');
        html += this.renderContingencyQuestion(key, 'יש אנשים ליד הקורקינט', 'cont_people_nearby');
        html += this.renderContingencyQuestion(key, 'שינוי מקום של הקורקינט', 'cont_location_change');
        html += this.renderContingencyQuestion(key, 'פגש מכר', 'cont_acquaintance');
        html += this.renderContingencyQuestion(key, 'פנה עובר אורח', 'cont_passerby');
        html += this.renderContingencyQuestion(key, 'הפלת את הקורקינט', 'cont_dropped');
        html += this.renderContingencyQuestion(key, 'כוח בטחון או משטרה', 'cont_security');
        html += this.renderQuestion(key, 'מקתגים נוספים', 'cont_additional', 'textarea');

        html += `
            <div class="info-box">
                <strong>הנחייה:</strong> יש לבצע עם המועמד סימולציות בחדר
            </div>
        `;

        html += this.renderYesNoQuestion(key, 'האם ביקש עזרים הנדרשים לכיסוי ולמשימה', 'simulation_aids');
        html += this.renderQuestion(key, 'איך אתה מרגיש עם הכיסוי', 'simulation_feeling', 'textarea');
        html += this.renderStressLevel(key, 'מה מידת הלחץ', 'simulation_stress');

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong> לרשותך 20 דק' לביצוע מרגע היציאה מהמלון ועד לחזרה אליו
            </div>
        `;

        // תחקיר אחרי ביצוע
        html += `<div class="section-title">תחקיר אחרי ביצוע (15 דק')</div>`;
        
        html += this.renderQuestion(key, 'חריגים/תקלות/חשדות', 'execution_incidents', 'textarea');
        html += this.renderQuestion(key, 'תיאור חופשי של הביצוע בפירוט, תאר לאן הלכת ומה עשית מרגע עזיבת הבית קפה ועד לחזרה. תיאור של 3 דק\'', 'execution_description', 'textarea');
        html += this.renderQuestion(key, 'איך הרגשת', 'execution_feeling', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם פעלת עפ"י תכנון', 'execution_as_planned');
        html += this.renderYesNoQuestion(key, 'האם הייתה הפרעה', 'execution_interference');

        html += this.renderQuestion(key, 'סיכום תרגיל - התרשמות כללית', 'summary_general', 'textarea');

        // ציונים
        html += '<div class="section-title">ציונים (1-7)</div>';
        const scores = [
            'יכולת למידה ויישום',
            'גמישות מחשבתית',
            'יכולת תכנון',
            'תמודדות עם לחץ ועמימות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'גמישות ביצועית',
            'בטחון מול יעילות',
            'יכולת דיווח',
            'ציון מסכם'
        ];
        
        scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        html += `<div class="question-block"><div class="question-title">התייחסות חופשית</div><textarea onchange="setExerciseData('${key}', 'free_comment', this.value)">${window.escapeHtml(this.getData(key, 'free_comment'))}</textarea></div>`;

        return html;
    }

    renderQuestion(key, title, field, type = 'text') {
        const value = window.escapeHtml(this.getData(key, field));
        if (type === 'textarea') {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <textarea onchange="setExerciseData('${key}', '${field}', this.value)">${value}</textarea>
                </div>
            `;
        } else {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <input type="text" value="${value}" onchange="setExerciseData('${key}', '${field}', this.value)">
                </div>
            `;
        }
    }

    renderYesNoQuestion(key, title, field) {
        const yesNo = this.getData(key, `${field}_yesno`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="כן" 
                            ${yesNo === 'כן' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        כן
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="לא" 
                            ${yesNo === 'לא' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        לא
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderPlanQuestion(key, title, field) {
        const status = this.getData(key, `${field}_status`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_status_${key}" value="תכנן" 
                            ${status === 'תכנן' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        תכנן
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_status_${key}" value="לא תכנן" 
                            ${status === 'לא תכנן' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        לא תכנן
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderContingencyQuestion(key, title, field) {
        const thought = this.getData(key, `${field}_thought`) || '';
        const solution = this.getData(key, `${field}_solution`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_thought_${key}" value="העלה את המקתג בעצמו" 
                            ${thought === 'העלה את המקתג בעצמו' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_thought', this.value)">
                        העלה את המקתג בעצמו
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_thought_${key}" value="לא חשב על המקתג" 
                            ${thought === 'לא חשב על המקתג' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_thought', this.value)">
                        לא חשב על המקתג
                    </label>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_solution_${key}" value="נתן פתרון מספק" 
                            ${solution === 'נתן פתרון מספק' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_solution', this.value)">
                        נתן פתרון מספק
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_solution_${key}" value="לא נתן פתרון מספק" 
                            ${solution === 'לא נתן פתרון מספק' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_solution', this.value)">
                        לא נתן פתרון מספק
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderStressLevel(key, title, field) {
        const value = this.getData(key, field) || '5';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}', this.value)" style="margin-bottom: 10px;">
                    ${[1,2,3,4,5,6,7,8,9,10].map(i => 
                        `<option value="${i}" ${value == i ? 'selected' : ''}>${i}</option>`
                    ).join('')}
                </select>
                <input type="text" placeholder="הערות..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר ציון...</option>${vals.map(v => `<option value="${v}" ${value == v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field) || '';
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}


// ===== js/exercises/david.js =====
/**
 * David Exercise Module - תרגיל דויד
 */

class DavidExercise {
    constructor() {
        this.name = 'דויד';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        html += `
            <div class="info-box">
                <strong>מסגרת זמנים:</strong> 45 דק' לשני המועמדים
            </div>
        `;
        
        html += `
            <div class="info-box">
                <strong>הנחייה למדריך:</strong><br>
                מסלול דויד בציר של 3-4 זיגים תוך האזנה להקלטה במשך 9 דק'. בזמן הדויד על החניך לתת תשומת לב למילים רלוונטיות בהקלטה כמו 6 והמילה קריפטון תוך כדי מודעות לרכבים אדומים. החניך ידרש לבצע עצירה של אדם זר ויבחן איך מתנהג כשאוביקט נכנס לאיתור. בסוף כל מסלול יתקיים תחקיר קצר והעלאת לקחים.
            </div>
        `;
        
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרת התרגיל:</h4>
                התנהגות רחוב, התמצאות במרחב, זיכרון, חלוקת קשב, עבודה עפי הנחיות, ביטחון עצמי, הקמת מגע ויכולת לתחקר ביצועים.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>הנחייה למדריך:</strong><br>
                1. יש לתחום את המסלול ב-10 דק'.<br>
                2. קובץ השמע נמצא בטלס של החניך והמדריך.<br>
                3. יש להפעיל את הקובץ בו זמנית על מנת להיות מסונכרנים.<br>
                4. אין לפרט לחניך כיצד לסמן את הרכב וכיצד לשאת את הטלס.<br>
                5. יש לשים לב לאופן ההליכה וההתנהגות ברחוב, אופן שימוש בסלולרי, אופן סימון שזיהה רכב אדום, התייחסות ל-6 וקריפטון.<br>
                6. כחלק מהציר החניך יתפקד כאוביקט שנכנס לאיתור. יש לוודא עם החניך איזה סיפור כיסוי מציג במידה ויקבל פנייה.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה:</strong><br>
                מטרתך כעת לבצע עיקוב אחרי אוביקט, ניתוח מיקומו ופעולותיו מבלי לעורר את חשד האוביקט או הסביבה.
                עלייך לשים לב לפעולות האוביקט תוך התייחסות לסביבה, כיווני שמיים, שמות רחובות, מספרי בתים ולכל פרט שקורה בדרכו של האוביקט. על כל אלו תישאל בתחקיר.
                חשוב שתהיה מרוכז ותשים לב לכל הפרטים שאתה נדרש אליהם.<br>
                לרשותך אוזניות וקובץ שמע בטלפון בעזרתם יתבצע התרגיל. בכל פעם שאתה שומע את המילה 6 או קריפטון עלייך לציין את מספר הרכב שנמצא בסמוך אלייך (בעבור פעולה זו תקבל נקודה) או לעכב בן אדם (בעבור מהלך זה תקבל 10 נקודות).<br>
                בכל פעם שתזהה רכב אדום עומד או נוסע עלייך לסמן זאת למדריך שלך.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה לאוביקט:</strong><br>
                עלייך ללכת בציר שהוגדר בעזר. במהלך ההליכה עלייך להיכנס ללובי או מבואת בניין שיוגדר לך למשך דקה בלבד. דיוק בציר ההליכה הוא קריטי ביותר.
                לרשותך יהיו 2 דק' ללמידת הציר.
            </div>
        `;

        // משוב לעוקב
        html += `<div class="section-title">משוב לעוקב</div>`;
        
        html += this.renderMultiChoiceQuestion(key, 'כמה דיווחי קריפטון או 6 היו (סהכ 6)', 'follower_reports', [
            '1', '2', '3', '4', '5', '6', 'סימן את כולם', 'פיספס'
        ]);
        
        html += this.renderMultiChoiceQuestion(key, 'עצירת בן אדם', 'follower_stopped', ['ביצע', 'לא ביצע']);
        
        html += this.renderMultiChoiceQuestion(key, 'העביר לוחיות זיהוי', 'follower_plates', [
            'כולם', 'חלקי'
        ], true);

        html += this.renderQuestion(key, 'איך היה לך', 'follower_feeling', 'textarea');
        
        html += this.renderMemoryQuestion(key, 'באיזה רחובות הלכת', 'follower_streets');
        html += this.renderMemoryQuestion(key, 'האם זכרת כיווני שמיים?', 'follower_directions');
        html += this.renderMemoryQuestion(key, 'מה הכתובת שנכנס אליה האוביקט?', 'follower_address');
        html += this.renderMemoryQuestion(key, 'על איזה מדרכה הלך?', 'follower_sidewalk');
        html += this.renderMemoryQuestion(key, 'האם היו כלי רכב אדומים שלא סימנת?', 'follower_red_cars');
        
        html += this.renderQuestion(key, 'במידה והיית צריך לעשות את התרגיל שוב, מה היית עושה אחרת?', 'follower_differently', 'textarea');
        html += this.renderQuestion(key, 'תיאור התנהלות החניך ברחוב', 'follower_behavior', 'textarea');

        // משוב אוביקט
        html += `<div class="section-title">משוב אוביקט</div>`;
        
        html += this.renderQuestion(key, 'איך היה לך?', 'object_feeling', 'textarea');
        html += this.renderMemoryQuestion(key, 'באיזה רחובות הלכת?', 'object_streets');
        html += this.renderMemoryQuestion(key, 'מה כיווני השמיים שהלכת בהם בציר?', 'object_directions');
        html += this.renderMemoryQuestion(key, 'מה הכתובת של הבית שנכנסת אליו?', 'object_address');
        html += this.renderQuestion(key, 'תיאור התנהלות החניך ברחוב', 'object_behavior', 'textarea');

        html += this.renderQuestion(key, 'סיכום תרגיל - מלל חופשי', 'summary', 'textarea');

        // ציונים
        html += '<div class="section-title">ציונים</div>';
        const scores = [
            'גמישות מחשבתית',
            'מיומנות - התמצאות במרחב',
            'תמודדות עם לחץ ועמימות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'כישורי שטח בינאישיים',
            'יכולת דיווח',
            'ציון מסכם'
        ];
        
        scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        html += `<div class="question-block"><div class="question-title">התייחסות חופשית</div><textarea onchange="setExerciseData('${key}', 'free_comment', this.value)">${window.escapeHtml(this.getData(key, 'free_comment'))}</textarea></div>`;

        return html;
    }

    renderQuestion(key, title, field, type = 'text') {
        const value = window.escapeHtml(this.getData(key, field));
        if (type === 'textarea') {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <textarea onchange="setExerciseData('${key}', '${field}', this.value)">${value}</textarea>
                </div>
            `;
        } else {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <input type="text" value="${value}" onchange="setExerciseData('${key}', '${field}', this.value)">
                </div>
            `;
        }
    }

    renderMultiChoiceQuestion(key, title, field, options, withText = false) {
        const value = this.getData(key, field) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        let html = `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}', this.value)">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
        `;
        
        if (withText) {
            html += `<input type="text" placeholder="פירוט..." value="${text}" 
                onchange="setExerciseData('${key}', '${field}_text', this.value)" style="margin-top: 10px;">`;
        }
        
        html += '</div>';
        return html;
    }

    renderMemoryQuestion(key, title, field) {
        const memory = this.getData(key, `${field}_memory`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        const options = ['זכר', 'זכר כמעט באופן מלא', 'חלקי', 'לא זכר'];
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}_memory', this.value)" style="margin-bottom: 10px;">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${memory === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר ציון...</option>${vals.map(v => `<option value="${v}" ${value == v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field) || '';
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}


// ===== js/exercises/laila.js =====
class LailaExercise {
    constructor() {
        this.name = 'Laila';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        html += `<div class="info-box"><strong>מסגרת זמנים:</strong> שעתיים וחצי לשני המתרגלים עד ליציאה<br><strong>תיאור התרגיל:</strong> ביצוע סיור שטח והתמקמות לזמן בינוני בלילה</div>`;
        
        html += `<div class="exercise-goals"><h4>🎯 מטרת התרגיל:</h4>ביצוע תהליך מבצעי מלא, יכולת תכנון, הטמעת לקחים בתחום הבטחון מול יעילות, חשיבה על מקתגים, יצירתיות, יכולות משחק, כניסה לדמות ובעיקר יציאה מאזור הנוחות.</div>`;
        
        html += `<div class="info-box"><strong>שלבי התרגיל:</strong><br>א. תדריך וביצוע סיוש<br>ב. כתיבת תוכנית פעולה ואישורה<br>ג. ביצוע<br>ד. ביצוע תחקירים</div>`;
        
        
        html += `<div class="info-box"><strong>סיפור המעשה לחניך:</strong><br>לוחמי היחידה ביצעו מעצר סמוי של מנהל החנות בו שהית בצהריים. בחקירתו סיפר כי העביר לפעיל הארד דיסק מוצפן ובו מידע חשוב לפעילות התשתית. השליח/פעיל אינו מודע למידע שנמצא על הכונן וציין בפניו כשנפגש עימו שידאג להעביר את הכונן לידי שאר הפעילים בתשתית לטובת תכנון הפעולה. הוא אינו מודע למהות הפעולה המתוכננת.<br>אנו מבינים שבנקודה האמורה עתיד להתקיים פגישה אשר עליה אנו מעוניינים לפקח מבלי לעורר את חשד הסביבה או הנפגשים.<br>עלייך לקיים תצפית רציפה, אפקטיבית, סטטית ולא בהסתר לעבר היעד שנמצא ב-_______ למשך פרק זמן של עד שעתיים.<br>בסיום התצפית עלייך לדווח בצורה מדוייקת ומפורטת את כל אשר ראית והתרחש סביבך ובנקודת המפגש האמורה.<br>לרשותך 70 דק מרגע סיום התדריך עמ לממש את סיור השטח ולהגיע חזרה למלון, לשרטט את האזור ולחשוב על 2 דפאות לביצוע. עלייך לאכול א. ערב בפרק הזמן הנל. שימוש במונית לחזרה למלון אפשרי באישור טלפוני מהמדריך.</div>`;

        html += `<div class="section-title">הבהרת משימה</div>`;
        html += `<div class="info-box">יש לתת למועמד 5 דק להתזהות על מפה ולשאלות הבהרה.</div>`;
        html += this.renderQuestion(key, 'שאלות הבהרה ששאל החניך', 'clarify_questions', 'textarea');

        html += `<div class="section-title">תחקיר סיור - יש להגיע עם שרטוט</div>`;
        html += this.renderQuestion(key, 'חריגים או תקלות או חשדות?', 'recon_incidents', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם המועמד זכר ושרטט נכון את סביבת היעד - רחובות, פריטים בולטים?', 'recon_sketch');
        html += this.renderYesNoQuestion(key, 'האם ניכר שהמועמד ביצע את הסיוש עם אוריינטציה למשימה? (התחשב בתאורה, הסתרות, נק כניסה לכיסוי, שימוש בסביבה)', 'recon_orientation');
        html += this.renderQuestion(key, 'מה עשית מרגע שעזבת ועד החזרה למלון - תאר במדוייק את מסלול ההליכה', 'recon_route', 'textarea');
        html += this.renderMultiChoiceQuestion(key, 'מימוש סיוש - האם ביצע נק תצפית מרוחקת?', 'recon_remote_observation', ['כן', 'לא']);
        html += this.renderMultiChoiceQuestion(key, 'מימוש סיוש - חיכוך בנקודה?', 'recon_friction', ['חלף', 'עמד והתרשם']);
        html += this.renderQuestion(key, 'מה היו השיקולים לבחירת אופן מימוש זה?', 'recon_considerations', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם היה לך סיפור כיסוי בסיור השטח?', 'recon_cover_story');
        html += this.renderQuestion(key, 'תאר את המלמ שאספת (ללא הכוונה 5 ד - תל לעיקר וטפל, מיקוד, חשיבה מודיעינית)', 'recon_intel', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם סיור השטח השיג את מטרותיו?', 'recon_achieved');
        html += this.renderYesNoQuestion(key, 'האם היית עושה משהו אחרת?', 'recon_differently');
        html += this.renderQuestion(key, 'התרשמות חופשית', 'recon_impression', 'textarea');

        html += `<div class="section-title">לרשות המועמד 15 דק לחשיבה על 2 דפאות ופירוט יתרונות וחסרונות</div>`;
        html += `<div class="info-box">מטרת השלב לבחון יצירתיות ולכן יש לזרום עם הרעיונות במידה והן רלוונטיות - בסיום ההצגה יש להכווין לדפא המתבקשת בהתאם למאפיינים המודיעיניים של התרחיש.</div>`;

        html += this.renderQuestion(key, 'מה הדפא הראשונה?', 'plan_a', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא השניה?', 'plan_b', 'textarea');
        html += this.renderMultiChoiceQuestion(key, 'מה הדפא הרלוונטית להבנתך?', 'plan_relevant', ['דפא א', 'דפא ב', 'לא יודע']);
        html += this.renderQuestion(key, 'דפאות נוספות שחשבת עליהן?', 'plan_additional', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא א</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_a_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_a_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_a_cons', 'textarea');
        
        html += `<div class="section-title" style="font-size: 16px;">עבור דפא ב</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_b_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_b_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_b_cons', 'textarea');

        html += `<div class="info-box"><strong>הנחייה למדריך:</strong> יש לוודא שהמועמד מציג דפאות ריאליות שיכול לממש בפרק הזמן ועומדות להגדרת המשימה ולאיום המודיעיני ולהישג הנדרש. בשלב זה יש להדגיש למועמד שאסור שהסביבה כולל המלון תחשוד או תחשוף את התרגיל ולכן יש לתכנן גם עליה/ירידה מכיסוי.</div>`;

        html += `<div class="section-title">לרשות המועמד 20 דק לכתיבת תוכנית פעולה</div>`;

        html += `<div class="section-title">הצגת דפא ואישור תוכניות (30 ד)</div>`;
        html += this.renderPlanQuestion(key, 'הצגת סיפור כיסוי', 'presentation_cover');
        html += this.renderPlanQuestion(key, 'צירי תנועה ונסיגה', 'presentation_movement');
        html += this.renderPlanQuestion(key, 'נק עליה על כיסוי', 'presentation_entry');
        html += this.renderPlanQuestion(key, 'הגעה לעמדה והתמקמות', 'presentation_positioning');
        html += this.renderPlanQuestion(key, 'מתי מקפל מהעמדה?', 'presentation_exit_timing');

        html += `<div class="section-title">מקתגים</div>`;
        html += this.renderContingencyQuestion(key, 'הנקודה תפוסה עי דר בית אחר', 'cont_occupied_resident');
        html += this.renderContingencyQuestion(key, 'הנקודה תפוסה עי אירוע תמים', 'cont_occupied_event');
        html += this.renderContingencyQuestion(key, 'ישנה הסתרה/נדרש לשנות מקום', 'cont_concealment');
        html += this.renderContingencyQuestion(key, 'פגש מכר', 'cont_acquaintance');
        html += this.renderContingencyQuestion(key, 'קבלת עזרה מעוברי אורח כמו מזון, לינה וכו', 'cont_help_offered');
        html += this.renderContingencyQuestion(key, 'אזרח ברע שדורש לעזוב את המקום', 'cont_hostile_citizen');
        html += this.renderContingencyQuestion(key, 'דר בית עויין', 'cont_hostile_resident');
        html += this.renderContingencyQuestion(key, 'אלימות מצד בני נוער/שיכורים', 'cont_violence');
        html += this.renderContingencyQuestion(key, 'כוח בטחון', 'cont_security');
        html += this.renderQuestion(key, 'מקתגים נוספים', 'cont_additional', 'textarea');

        html += `<div class="info-box"><strong>הנחייה למדריך:</strong> יש לבצע עם המועמד סימולציה תוך תשומת לב לאופן ההתמקמות ביחס לנקודה ומידול 2-3 מקתגים שכולל פגש מכר וכוח בטחון.</div>`;

        html += this.renderQuestion(key, 'התרשמות כללית', 'simulation_impression', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם ביקש עזרים?', 'simulation_aids');
        html += this.renderQuestion(key, 'איך מרגיש עם הכיסוי?', 'simulation_cover_feeling', 'textarea');
        html += this.renderStressLevel(key, 'מה מידת הלחץ מ-1 עד 10', 'simulation_stress');

        html += `<div class="section-title">תחקיר לאחר ביצוע (10 ד)</div>`;
        html += this.renderQuestion(key, 'חריגים או תקלות או חשדות?', 'execution_incidents', 'textarea');
        html += this.renderQuestion(key, 'תאר לי בפירוט איך הייתה לך החוויה?', 'execution_experience', 'textarea');
        html += this.renderQuestion(key, 'איך הרגשת?', 'execution_feeling', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם פעלת עפי תכנון?', 'execution_as_planned');
        html += this.renderYesNoQuestion(key, 'האם הייתה פגישה?', 'execution_meeting');
        html += this.renderYesNoQuestion(key, 'האם הייתה הפרעה? אם כן תאר מה היא, מי הבן אדם והאם חשד בך?', 'execution_interference');
        html += this.renderQuestion(key, 'כמה אחוז מהזמן ציפית?', 'execution_observation_percent', 'textarea');
        html += this.renderMemoryQuestion(key, 'מה המלמ שאספת על האוביקט והמפגש? מאין הגיעו, לאן הלכו? תיאור לבוש', 'execution_intel');
        html += this.renderYesNoQuestion(key, 'האם היה קיפול עפי תכנון? כולל נק יציאה מהכיסוי', 'execution_exit');

        html += this.renderQuestion(key, 'סיכום תרגיל - מלל חופשי', 'summary', 'textarea');

        html += '<div class="section-title">ציונים</div>';
        const scores = ['יכולות למידה ויישום','גמישות מחשבתית','יכולות תכנון','בטחון מול יעילות','יכולת דיווח','התמודדות עם לחץ ועמימות','התמקמות כלומד','בטחון עצמי','ציון מסכם'];
        scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        html += `<div class="question-block"><div class="question-title">התייחסות חופשית</div><textarea onchange="setExerciseData('${key}', 'free_comment', this.value)">${window.escapeHtml(this.getData(key, 'free_comment'))}</textarea></div>`;

        return html;
    }

    renderQuestion(key, title, field, type = 'text') {
        const value = window.escapeHtml(this.getData(key, field));
        if (type === 'textarea') {
            return `<div class="question-block"><div class="question-title">${title}</div><textarea onchange="setExerciseData('${key}', '${field}', this.value)">${value}</textarea></div>`;
        }
        return `<div class="question-block"><div class="question-title">${title}</div><input type="text" value="${value}" onchange="setExerciseData('${key}', '${field}', this.value)"></div>`;
    }

    renderYesNoQuestion(key, title, field) {
        const yesNo = this.getData(key, `${field}_yesno`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        return `<div class="question-block"><div class="question-title">${title}</div><div style="display: flex; gap: 10px; margin-bottom: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_yesno_${key}" value="כן" ${yesNo === 'כן' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_yesno', this.value)">כן</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_yesno_${key}" value="לא" ${yesNo === 'לא' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_yesno', this.value)">לא</label></div><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderMultiChoiceQuestion(key, title, field, options) {
        const value = this.getData(key, field) || '';
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר...</option>${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select></div>`;
    }

    renderMemoryQuestion(key, title, field) {
        const memory = this.getData(key, `${field}_memory`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        const options = ['מדוייק', 'לא מדוייק'];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}_memory', this.value)" style="margin-bottom: 10px;"><option value="">בחר...</option>${options.map(opt => `<option value="${opt}" ${memory === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderPlanQuestion(key, title, field) {
        const status = this.getData(key, `${field}_status`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        return `<div class="question-block"><div class="question-title">${title}</div><div style="display: flex; gap: 10px; margin-bottom: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_status_${key}" value="תכנן" ${status === 'תכנן' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_status', this.value)">תכנן</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_status_${key}" value="לא תכנן" ${status === 'לא תכנן' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_status', this.value)">לא תכנן</label></div><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderContingencyQuestion(key, title, field) {
        const thought = this.getData(key, `${field}_thought`) || '';
        const solution = this.getData(key, `${field}_solution`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        return `<div class="question-block"><div class="question-title">${title}</div><div style="margin-bottom: 10px;"><label style="display: block; margin-bottom: 5px; font-size: 14px;">תשובה א:</label><div style="display: flex; gap: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_thought_${key}" value="העלה את המקתג בעצמו" ${thought === 'העלה את המקתג בעצמו' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_thought', this.value)">העלה את המקתג בעצמו</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_thought_${key}" value="לא חשב על המקתג" ${thought === 'לא חשב על המקתג' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_thought', this.value)">לא חשב על המקתג</label></div></div><div style="margin-bottom: 10px;"><label style="display: block; margin-bottom: 5px; font-size: 14px;">תשובה ב:</label><div style="display: flex; gap: 10px;"><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_solution_${key}" value="נתן פתרון מספק" ${solution === 'נתן פתרון מספק' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_solution', this.value)">נתן פתרון מספק</label><label style="display: flex; align-items: center; gap: 5px;"><input type="radio" name="${field}_solution_${key}" value="לא נתן פתרון מספק" ${solution === 'לא נתן פתרון מספק' ? 'checked' : ''} onchange="setExerciseData('${key}', '${field}_solution', this.value)">לא נתן פתרון מספק</label></div></div><label style="display: block; margin-bottom: 5px; font-size: 14px;">תשובה ג - פירוט:</label><input type="text" placeholder="פירוט..." value="${text}" onchange="setExerciseData('${key}', '${field}_text', this.value)"></div>`;
    }

    renderStressLevel(key, title, field) {
        const value = this.getData(key, field) || '5';
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)">${[1,2,3,4,5,6,7,8,9,10].map(i => `<option value="${i}" ${value == i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>`;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר ציון...</option>${vals.map(v => `<option value="${v}" ${value == v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field) || '';
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}


// ===== js/exercises/michtav.js =====
/**
 * Michtav Exercise Module - תרגיל מכתב
 */

class MichtavExercise {
    constructor() {
        this.name = 'מכתב';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4 style="margin-bottom: 15px; font-size: 18px;">${this.name}</h4>`;
        
        html += `
            <div class="info-box">
                <strong>מסגרת זמנים לשני המועמדים:</strong> 3.5 שעות
            </div>
        `;
        
        html += this.renderQuestion(key, 'לקחים מיום קודם', 'lessons_previous_day', 'textarea');
        
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                ביצוע תהליך מבצעי מלא, הבנה ויישום של העקרונות שהועברו עד כה - יש לבחון את גרף הלמידה האישי של כל מועמד.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>סיפור מעשה לחניך:</strong><br>
                עקב מעצרו של אחד המחברים בהתארגנות החליטו חברי התשתית לנקוט במשנה זהירות ולשנות את דרכי פעולתם. המודיעין העדכני מצביע על כך שהפעילות נמצאת בבשלות וברמת מוכנות גבוהה וכי הכוח המבצע עתיד לקבל או לשלוח את פרטי התוכנית לפעילות.<br>
                היחידה קיבלה מידע כי הפעילות, על כל פרטיה תועבר לראש היעד ע"ג DOK אשר יונח במעטפה בתיבת דואר בכתובת __________.<br>
                עלייך לשלוף את המעטפה מתיבת הדואר, לקרוא את המידע ע"ג ה-DOK. במסמך יופיע מידע על הפעילות, מידע על השולח ופרטים נוספים.<br>
                מטרתך - להביא את מקסימום הפרטים הרלוונטיים לטובת איתור השולח ועל הפעילות עצמה.
            </div>
        `;

        html += `
            <div class="info-box">
                <strong>תנאים ומגבלות:</strong><br>
                1. על המעטפה לחזור לתיבה בדיוק 15 דק' מרגע ההוצאה שלה מהתיבה.<br>
                2. ה-DOK יוכל לשהות מחובר למחשב 10 דק' לכל היותר.<br>
                3. אין להשאיר סימנים על ה-DOK או על המעטפה.<br>
                4. אין לעורר את חשד הסביבה.<br>
                5. חל איסור לרשום או לצלם במהלך הפעילות באופן גורף.
            </div>
        `;

        // הבהרת משימה
        html += `<div class="section-title">הבהרת משימה (10 ד')</div>`;
        html += `
            <div class="info-box">
                <strong>הערה למדריך:</strong> יש לראות אם חושב קדימה על הביצוע כבר בהבהרת המשימה לקראת הסיוש.
            </div>
        `;

        html += this.renderYesNoQuestion(key, 'האם שאל כתובת?', 'clarify_address');
        html += this.renderYesNoQuestion(key, 'האם ביקש ת"ד?', 'clarify_target_file');
        html += this.renderYesNoQuestion(key, 'האם ביקש סוג מעטפה?', 'clarify_envelope_type');
        
        html += `
            <div class="info-box">
                במידה וביקש - יש לראות לו את הדמה, במידה ולא אז להכווין לנקודה.
            </div>
        `;

        html += this.renderYesNoQuestion(key, 'שאל על שם בעל הדירה?', 'clarify_apartment_owner');
        html += this.renderYesNoQuestion(key, 'ביקש מפה?', 'clarify_map');
        html += this.renderQuestion(key, 'נקודות נוספות שהתייחס אליהן בהבהרה?', 'clarify_additional', 'textarea');

        html += `
            <div class="info-box">
                <strong>הערה למדריך:</strong> להלן תשובות לגבי המחשב - במידה ויעלו בשלב הבהרת המשימה או לאחר הסיוש:<br>
                1. ה-DOK אינו מוצפן.<br>
                2. המסמך האמור נמצא בתיקיית מתכונים>עוגות> שם הקובץ הוא "מתכון לעוגה".<br>
                3. במידה והמחשב או המסמך מוצפנים - סיסמא תמיד תהיה 13579.
            </div>
        `;

        // סיוש
        html += `<div class="section-title">יש לתת למועמד 20 דק' לטובת חשיבה על 2 דפ"אות</div>`;
        
        html += this.renderQuestion(key, 'חריגים או תקלות או חשדות?', 'recon_incidents', 'textarea');
        html += this.renderQuestion(key, 'תיאור מסלול ההליכה', 'recon_route', 'textarea');
        html += this.renderYesNoQuestion(key, 'מימוש סיוש - אם ביצע תצפית מרוחקת?', 'recon_remote_observation');
        html += this.renderYesNoQuestion(key, 'מימוש הסיוש - חלף או עמד והתרשם בסמיכות ליעד?', 'recon_proximity');
        html += this.renderYesNoQuestion(key, 'מימוש סיוש - האם נכנס לחצר האיתור?', 'recon_entered_yard');
        html += this.renderQuestion(key, 'מה השיקולים שעמדו לנגד עינך במימוש הסיוש באופן זה?', 'recon_considerations', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם למועמד היה סיפור כיסוי?', 'recon_cover_story');
        html += this.renderQuestion(key, 'מה המל"מ שאספת? (ללא הכוונה ותשומת לב לחשיבה מודיעינית, עיקר וטפל, ביטחון מול יעילות)', 'recon_intel', 'textarea');

        html += `<div class="section-title" style="font-size: 16px;">נקודות נוספות להתייחסות</div>`;
        
        html += this.renderYesNoQuestion(key, 'זיהוי המעטפה?', 'recon_envelope_id');
        html += this.renderYesNoQuestion(key, 'כמות תיבות דואר?', 'recon_mailbox_count');
        html += this.renderYesNoQuestion(key, 'שביל גישה?', 'recon_access_path');
        html += this.renderYesNoQuestion(key, 'גורמים מפריעים?', 'recon_obstacles');
        html += this.renderYesNoQuestion(key, 'מצלמות?', 'recon_cameras');
        html += this.renderQuestion(key, 'כיצד שירת סיור השטח את המשימה העתידית?', 'recon_mission_support', 'textarea');
        html += this.renderQuestion(key, 'אם חישב זמנים?', 'recon_timing', 'textarea');
        html += this.renderQuestion(key, 'האם חשב על מקום לקריאה?', 'recon_reading_location', 'textarea');
        html += this.renderQuestion(key, 'האם חשב על דפאות ראשוניות? (הצפייה שבשלב זה יחזור עם כיווני פעולה)', 'recon_initial_plans', 'textarea');

        // דפאות
        html += `<div class="section-title">לרשותך 10 דק' לפיתוח ופירוט 2 דפ"אות שהצגת (במידה ולא הציג לאפשר לו מספר דק' לחשוב על כאלו)</div>`;
        
        html += this.renderQuestion(key, 'מה דפ"א א\'?', 'plan_a', 'textarea');
        html += this.renderQuestion(key, 'מהי דפ"א ב\'?', 'plan_b', 'textarea');
        html += this.renderQuestion(key, 'מה הדפא שאתה בוחר ומהן השיקולים?', 'plan_choice', 'textarea');
        html += this.renderQuestion(key, 'דפ"אות נוספות שחשבת עליהן?', 'plan_additional', 'textarea');

        html += `<div class="section-title" style="font-size: 16px;">עבור דפ"א א'</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_a_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_a_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_a_cons', 'textarea');
        html += this.renderQuestion(key, 'התייחסות לנקודת קריאה וס"כ לחזרה לתיבה?', 'plan_a_return', 'textarea');

        html += `<div class="section-title" style="font-size: 16px;">עבור דפ"א ב'</div>`;
        html += this.renderQuestion(key, 'מה הסיפור כיסוי?', 'plan_b_cover', 'textarea');
        html += this.renderQuestion(key, 'מה היתרונות?', 'plan_b_pros', 'textarea');
        html += this.renderQuestion(key, 'מה החסרונות?', 'plan_b_cons', 'textarea');
        html += this.renderQuestion(key, 'התייחסות לנקודת קריאה וס"כ לחזרה לתיבה?', 'plan_b_return', 'textarea');

        html += `<div class="info-box"><strong>הנחייה למועמד:</strong> לרשותך 15 דק' לכתיבת תוכנית פעולה.</div>`;

        // אישור תוכניות
        html += `<div class="section-title">אישור תוכניות (25 דק')</div>`;
        
        html += this.renderPlanQuestion(key, 'צירי תנועה וחזרה', 'approval_movement');
        html += this.renderPlanQuestion(key, 'ביסוס ס"כ לפני ואחרי', 'approval_cover_establish');
        html += this.renderQuestion(key, 'נק\' קריאה וכיסוי לחזרה לתיבה', 'approval_reading_return', 'textarea');
        html += this.renderQuestion(key, 'טיפול במחשב', 'approval_computer', 'textarea');

        // מקתגים
        html += `<div class="section-title">מקתגים</div>`;
        
        html += this.renderPlanQuestion(key, 'תיבת דואר סגורה', 'cont_mailbox_closed');
        html += this.renderPlanQuestion(key, 'שכן ראה מוציא/מחזיר מכתב?', 'cont_neighbor_saw');
        html += this.renderPlanQuestion(key, 'מעטפה סגורה?', 'cont_envelope_sealed');
        html += this.renderPlanQuestion(key, 'מחשב לא עובד', 'cont_computer_broken');
        html += this.renderPlanQuestion(key, 'DOK מוצפן', 'cont_dok_encrypted');
        html += this.renderPlanQuestion(key, 'ניזוק ה-DOK', 'cont_dok_damaged');
        html += this.renderPlanQuestion(key, 'לא זוכר את הסיסמא', 'cont_forgot_password');
        html += this.renderPlanQuestion(key, 'קושי למצוא את הקובץ הרלוונטי', 'cont_file_not_found');
        html += this.renderPlanQuestion(key, 'המעטפה נפגעה או נקרעה', 'cont_envelope_damaged');

        html += `
            <div class="info-box">
                <strong>הנחייה למדריך:</strong> החניך חייב לצאת עם: סוג המעטפה, סיסמא למחשב, מיקום הקובץ בתיקייה.<br>
                ניתן לתת למועמד לבצע מודל.<br>
                יש לתת 25-30 דק' למימוש כולל.<br>
                בסיום התרגיל יש לוודא שהמחשב חזר למצב אפס והקובץ אינו מוקרן.
            </div>
        `;

        // תחקיר מכתב
        html += `<div class="section-title">תחקיר מכתב</div>`;
        html += `<div class="section-title" style="font-size: 16px;">1. מידע על הפעולה</div>`;
        
        html += this.renderMemoryQuestion(key, 'תאריך האירוע 4.11.23', 'letter_date');
        html += this.renderMemoryQuestion(key, 'שעת פעילות 19:00', 'letter_time');
        html += this.renderMemoryQuestion(key, 'האנשים המשתתפים ותפקידיהם - הנפח יבצע, היהלום יאבטח והוקרא בקלפים ינהג', 'letter_participants');
        html += this.renderMemoryQuestion(key, 'רכב המשמש לפעילות - הונדה כחולה', 'letter_vehicle');
        html += this.renderMemoryQuestion(key, 'כיוון הגעת הרכב - יגיע ליעד מכיון מזרח', 'letter_direction');

        html += `<div class="section-title" style="font-size: 16px;">2. מידע ישיר על השולח</div>`;
        
        html += this.renderMemoryQuestion(key, 'מיקום הטמנת המעטפה - מעטפה אדומה אשר תוטמן עד הערב בשעה 21:45 מאחורי תיבת התקשורת המסומנת במפה המצורפת', 'letter_envelope_location');
        html += this.renderMemoryQuestion(key, 'כתובת מייל - TESA5812@GMAIL.COM', 'letter_email');
        html += this.renderMemoryQuestion(key, 'מועד ההתקשרות בין הצדדים - יום שלישי הרביעי בכל חודש, בין השעות 17:26-19:52', 'letter_communication_time');
        html += this.renderMemoryQuestion(key, 'פרטי חשבון בנק - דיסקונט, סניף 972, חשבון 774219', 'letter_bank');
        html += this.renderMemoryQuestion(key, 'בעל החשבון - LTD בע"מ', 'letter_account_owner');

        html += `<div class="section-title" style="font-size: 16px;">3. מידע עקיף על השולח</div>`;
        
        html += this.renderMemoryQuestion(key, 'התפקידים אותם יש לסדר לחמותו - אחראית על התקציב או אחראית על שניים מבין 5 סניפים של רשת הבגדים האופנתית', 'letter_mother_in_law_role');
        html += this.renderMemoryQuestion(key, 'מיקום הסניפים - דיזינגוף סנטר, גן העיר, קניון איילון, רמת אביב, תחנה מרכזית החדשה', 'letter_branches');
        html += this.renderMemoryQuestion(key, 'מועד הגעת החמות למשרדו של המכותב - בתחילת חודש הבא', 'letter_mother_in_law_arrival');
        html += this.renderMemoryQuestion(key, 'פריטי לבוש החמות - מעיל כתום ותיק עור שחור בידה', 'letter_mother_in_law_clothes');
        html += this.renderMemoryQuestion(key, 'פרטי הפגישה וקידוד - החמות תבקש לדבר עם אדון ביירנברג בקשר למודעה בעיתון', 'letter_meeting_code');

        html += `<div class="section-title" style="font-size: 16px;">4. מידע נוסף</div>`;
        
        html += this.renderMemoryQuestion(key, 'שער האירו - 3.9 שח', 'letter_euro_rate');
        html += this.renderMemoryQuestion(key, 'מועד הפגישה הקודמת - ד\' באייר תשפ"ג', 'letter_previous_meeting');
        html += this.renderMemoryQuestion(key, 'מיקום הפגישה האחרונה - ליד חנות המוזיקה הקלאסית', 'letter_previous_location');

        html += `<div class="section-title" style="font-size: 16px;">איתור וזכירת המידע הקריטי במשימה</div>`;
        
        html += this.renderMultiChoiceQuestion(key, 'האם העביר את המידע הקריטי במכתב על הפעולה? תאריך, שעה ורכב?', 'letter_critical_operation', ['כן', 'לא', 'חלקית']);
        html += this.renderMultiChoiceQuestion(key, 'האם הביא את המידע הקריטי על השולח? מייל, פרטי חשבון בנק?', 'letter_critical_sender', ['כן', 'לא', 'חלקית']);
        html += this.renderMultiChoiceQuestion(key, 'האם מבין מה המידע הקריטי במכתב?', 'letter_critical_understanding', ['כן', 'לא']);

        // כפתור תמונה
        html += `
            <div style="margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 2px solid #4ECDC4;">
                <button class="btn btn-save" onclick="showLetterImage()" style="width: 100%; font-size: 16px;">
                    📄 הצג הוראות תרגיל מכתב
                </button>
            </div>
        `;

        // תחקיר אחרי ביצוע
        html += `<div class="section-title">תחקיר אחרי ביצוע</div>`;
        
        html += this.renderYesNoQuestion(key, 'חריגים או תקלות או חשדות?', 'execution_incidents');
        html += this.renderQuestion(key, 'תיאור חופשי של החוויה בפירוט, תאר לאן הלכת ומה עשית מרגע עזיבת הבית קפה ועד לחזרה. תיאור של 3 דק\'', 'execution_description', 'textarea');
        html += this.renderYesNoQuestion(key, 'האם הצלחת במשימה?', 'execution_success');
        html += this.renderYesNoQuestion(key, 'האם עמדת בזמנים?', 'execution_timing');
        html += this.renderMultiChoiceWithText(key, 'איך נמדדו הזמנים?', 'execution_time_measurement', ['בוצע', 'לא בוצע']);
        html += this.renderYesNoQuestion(key, 'האם המעטפה חזרה בדיוק כפי שהייתה?', 'execution_envelope_returned');
        html += this.renderQuestion(key, 'מה הלקח המרכזי שלך מהתהליך המבצעי?', 'execution_lesson', 'textarea');

        html += this.renderQuestion(key, 'סיכום תרגיל', 'summary', 'textarea');

        // ציונים
        html += '<div class="section-title">ציונים</div>';
        const scores = [
            'יכולות למידה ויישום',
            'גמישות מחשבתית',
            'יכולת תכנון',
            'בטחון מול יעילות',
            'מיומנות - ניווט, זיכרון',
            'יכולת דיווח',
            'התמודדות במצבי לחץ, עמימות וחוסר וודאות',
            'בטחון עצמי',
            'ציון מסכם לתרגיל'
        ];
        
        scores.forEach((score, i) => {
            html += this.renderScoreQuestion(key, score, `score_${i}`);
        });

        html += this.renderQuestion(key, 'התייחסות חופשית', 'free_comment', 'textarea');

        return html;
    }

    renderQuestion(key, title, field, type = 'text') {
        const value = window.escapeHtml(this.getData(key, field));
        if (type === 'textarea') {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <textarea onchange="setExerciseData('${key}', '${field}', this.value)">${value}</textarea>
                </div>
            `;
        } else {
            return `
                <div class="question-block">
                    <div class="question-title">${title}</div>
                    <input type="text" value="${value}" onchange="setExerciseData('${key}', '${field}', this.value)">
                </div>
            `;
        }
    }

    renderYesNoQuestion(key, title, field) {
        const yesNo = this.getData(key, `${field}_yesno`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="כן" 
                            ${yesNo === 'כן' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        כן
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_yesno_${key}" value="לא" 
                            ${yesNo === 'לא' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_yesno', this.value)">
                        לא
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderMemoryQuestion(key, title, field) {
        const memory = this.getData(key, `${field}_memory`) || '';
        
        const options = ['זכר', 'לא זכר', 'זכר חלקית'];
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}_memory', this.value)">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${memory === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderPlanQuestion(key, title, field) {
        const status = this.getData(key, `${field}_status`) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_status_${key}" value="חשב" 
                            ${status === 'חשב' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        חשב
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="${field}_status_${key}" value="לא חשב" 
                            ${status === 'לא חשב' ? 'checked' : ''} 
                            onchange="setExerciseData('${key}', '${field}_status', this.value)">
                        לא חשב
                    </label>
                </div>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderMultiChoiceQuestion(key, title, field, options) {
        const value = this.getData(key, field) || '';
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}', this.value)">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderMultiChoiceWithText(key, title, field, options) {
        const value = this.getData(key, field) || '';
        const text = window.escapeHtml(this.getData(key, `${field}_text`));
        
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <select onchange="setExerciseData('${key}', '${field}', this.value)" style="margin-bottom: 10px;">
                    <option value="">בחר...</option>
                    ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
                <input type="text" placeholder="פירוט..." value="${text}" 
                    onchange="setExerciseData('${key}', '${field}_text', this.value)">
            </div>
        `;
    }

    renderScoreQuestion(key, title, field) {
        const value = this.getData(key, field) || '';
        const vals = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7];
        return `<div class="question-block"><div class="question-title">${title}</div><select onchange="setExerciseData('${key}', '${field}', this.value)"><option value="">בחר ציון...</option>${vals.map(v => `<option value="${v}" ${value == v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field) || '';
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}

// Global image viewer function
window.showLetterImage = function() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ סגור';
    closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        z-index: 10001;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    const container = document.createElement('div');
    container.style.cssText = `
        width: 100%;
        height: 100%;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 20px 20px 20px;
    `;
    
    const img = document.createElement('img');
    img.src = 'letter.jpg';
    img.style.cssText = `
        max-width: 100%;
        width: 100%;
        height: auto;
        cursor: zoom-in;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
    `;
    
    // Pinch-to-zoom support
    let initialDistance = 0;
    let currentScale = 1;
    let panning = false;
    let start = {x: 0, y: 0};
    let translate = {x: 0, y: 0};
    
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Pinch start
            initialDistance = getDistance(e.touches);
            e.preventDefault();
        } else if (e.touches.length === 1 && currentScale > 1) {
            // Pan start
            panning = true;
            start = {x: e.touches[0].clientX - translate.x, y: e.touches[0].clientY - translate.y};
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDistance > 0) {
            // Pinch zoom
            const currentDistance = getDistance(e.touches);
            currentScale = Math.min(Math.max(1, (currentDistance / initialDistance) * currentScale), 3);
            img.style.transform = `scale(${currentScale}) translate(${translate.x/currentScale}px, ${translate.y/currentScale}px)`;
            e.preventDefault();
        } else if (e.touches.length === 1 && panning && currentScale > 1) {
            // Pan
            translate.x = e.touches[0].clientX - start.x;
            translate.y = e.touches[0].clientY - start.y;
            img.style.transform = `scale(${currentScale}) translate(${translate.x/currentScale}px, ${translate.y/currentScale}px)`;
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialDistance = 0;
        }
        if (e.touches.length === 0) {
            panning = false;
            if (currentScale <= 1) {
                currentScale = 1;
                translate = {x: 0, y: 0};
                img.style.transform = '';
            }
        }
    });
    
    function getDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Click to toggle zoom
    let zoomed = false;
    img.onclick = () => {
        if (!zoomed) {
            img.style.width = 'auto';
            img.style.maxWidth = 'none';
            img.style.cursor = 'zoom-out';
            zoomed = true;
        } else {
            img.style.width = '100%';
            img.style.maxWidth = '100%';
            img.style.cursor = 'zoom-in';
            currentScale = 1;
            translate = {x: 0, y: 0};
            img.style.transform = '';
            zoomed = false;
        }
    };
    
    img.onerror = () => {
        img.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            color: white;
            text-align: center;
            font-size: 18px;
            padding: 20px;
        `;
        errorMsg.innerHTML = `
            <p style="margin-bottom: 20px;">❌ לא ניתן להציג את התמונה</p>
            <a href="letter.jpg" download style="color: #4ECDC4; text-decoration: underline;">לחץ כאן להורדה</a>
        `;
        container.appendChild(errorMsg);
    };
    
    container.appendChild(img);
    modal.appendChild(closeBtn);
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
        if (e.target === modal || e.target === container) {
            document.body.removeChild(modal);
        }
    };
};


// ===== js/exercises/yominet.js =====
/**
 * Yominet Exercise Module - תרגיל יומינט
 * Humintactic street challenges + hotel room infiltration
 */

class YominetExercise {
    constructor() {
        this.name = 'יומינט';
        
        // Bank of street challenges
        this.challenges = [
            'עצירת אדם ל2 דק\'',
            'עצירת בנאדם והוצאת פרטים אישיים',
            'השאלת פריט לבוש מאדם',
            'להצטלם עם אדם ברחוב',
            'החזרת אדם אחורה מספר צעדים ברחוב',
            'החזרת אדם אחורה במעבר חצייה',
            'עלייה על מונית ונסיעה מספר מטרים',
            'כניסה מאחורי דוכן אוכל',
            'קבלת אוכל/שתיה ללא תשלום',
            'קבלת שירות ללא תמורה - לק/לבוש ייחודי/תספורת',
            'הקמת מגע',
            'סיור שטח וצילום חדר מלון'
        ];
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4>${this.name}</h4>`;
        
        html += `
            <div class="info-box">מסגרת זמנים: שעה וחצי לשני המועמדים</div>
            
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                כישורי יומינטקטי, גמישות מחשבתית, תעוזה ובטחון עצמי, יציאה מאזור הנוחות
            </div>
            
            <div class="guidelines-box">
                <strong>הנחיות ודגשים לתרגיל:</strong><br>
                1. זמן התכנון הוא קצר ותו"כ תנועה<br>
                2. מתחילים בעיכוב אדם למס דק<br>
                3. יש לתת אוביקטים שונים לתרגיל<br>
                4. יש לבצע הפקת לקחים קצרה בין תרגילים<br>
                5. בפעם השניה יש "לזרוק למים" ללא הכוונה על אופן הפניה ולדרוש הוצאת יותר פרטים אישיים
            </div>
            
            <div class="story-box">
                <h4>📖 הנחיות לחניך:</h4>
                עלייך לעכב בנאדם למשך 2-3 דק'. יש לחשוב על סיפור גנרי המתאים לרוב סוגי האנשים 
                וניתן לבצע התאמות תו"כ.
            </div>
            
            <div class="section-title">בנק תרגילים</div>
        `;
        
        // Render all challenges with status
        this.challenges.forEach((challenge, i) => {
            html += `
                <div class="question-block">
                    <div class="question-title">${challenge}</div>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="${key}_task_${i}" value="ביצע" 
                                ${this.getData(key, `task_${i}`) === 'ביצע' ? 'checked' : ''}
                                onchange="setExerciseData('${key}', 'task_${i}', this.value)">ביצע
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="${key}_task_${i}" value="לא הצליח לבצע" 
                                ${this.getData(key, `task_${i}`) === 'לא הצליח לבצע' ? 'checked' : ''}
                                onchange="setExerciseData('${key}', 'task_${i}', this.value)">לא הצליח לבצע
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="${key}_task_${i}" value="לא הועבר לחניך" 
                                ${this.getData(key, `task_${i}`) === 'לא הועבר לחניך' ? 'checked' : ''}
                                onchange="setExerciseData('${key}', 'task_${i}', this.value)">לא הועבר לחניך
                        </label>
                    </div>
                </div>
            `;
        });
        
        html += '<div class="section-title">בנק שאלות לתרגילים</div>';
        
        const taskQuestions = [
            'איך היה לך?',
            'מה היה הסיפור כיסוי?',
            'האם האמינו לסיפור כיסוי שלך?',
            'כמה זמן הצלחת לעכב/לשהות/לבצע?',
            'למה לדעתך הצלחת או לא הצלחת במשימה?',
            'מה היית עושה אחרת?'
        ];
        
        taskQuestions.forEach((q, i) => {
            html += `
                <div class="question-block">
                    <div class="question-title">${q}</div>
                    <textarea onchange="setExerciseData('${key}', 'taskq_${i}', this.value)">${window.escapeHtml(this.getData(key, `taskq_${i}`))}</textarea>
                </div>
            `;
        });
        
        html += `
            <div class="section-title">משימת מלון - סיפור מעשה</div>
            
            <div class="story-box">
                <h4>📖 סיפור מעשה לחניך:</h4>
                היחידה קיבלה משימה לפקד אחר אדם שאמור להגיע לאזור. בסבירות גבוהה הוא ישהה במלון _____. 
                כחלק מהפיקוח ייתכן ונידרש לבצע פעולות במלון זה.<br><br>
                
                <strong>המשימה שלך:</strong><br>
                להגיע לחדר אקראי במלון בידיעת ואישור פקיד הקבלה במלון ולבצע צילום גלוי בעזרת הטלפון הנייד 
                של כל מה שנראה לך שעשוי לעניין אותנו.
            </div>
            
            <div class="guidelines-box">
                <strong>דגשים למדריך:</strong><br>
                1. לא מלון קטן מדי<br>
                2. עדיפות למלון ללא אבטחה<br>
                3. לא מלון מפואר מידי<br>
                4. המשימה היא כניסה לחדר סטנדרטי וצילום<br>
                5. הכניסה באישור פקיד הקבלה<br>
                6. החשיבה והתכנון יעשו בע"פ בלבד<br>
                7. אין להשאיר פרטים אישיים בקבלה<br>
                8. אם המועמד מרגיש שיש חשד או לא עובד עליו לנתק ולחזור למעריך
            </div>
            
            <div class="info-box">
                <strong>לוחות זמנים:</strong><br>
                • חשיבה על דפאות: 5 דק'<br>
                • תכנון ואישור תוכניות: 10 דק'<br>
                • ביצוע: 20 דק'<br>
                • תחקיר: 10 דק'
            </div>
            
            <button class="history-btn" onclick="toggleHotelHistory()">📜 היסטוריית מלונות</button>
            <div id="hotelHistoryPopup" class="history-popup">
        `;
        
        if (window.app.data.hotelHistory.length === 0) {
            html += '<p style="font-size: 13px; color: #666;">אין היסטוריה</p>';
        } else {
            window.app.data.hotelHistory.forEach(h => {
                html += `
                    <div class="history-item">
                        <div style="font-weight: 600;">${window.escapeHtml(h.name)}</div>
                        <div style="color: #666;">${window.escapeHtml(h.address)}</div>
                        <div style="font-size: 11px; color: #999;">${h.date}</div>
                        ${h.notes ? `<div style="font-size: 11px; color: #666;">${window.escapeHtml(h.notes)}</div>` : ''}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        
        // Hotel input fields
        html += `<div class="section-title">פרטי מלון</div>`;
        html += this.renderQuestion(key, 'שם מלון', 'hotel_name_input', 'text');
        html += this.renderQuestion(key, 'כתובת מלון', 'hotel_address_input', 'text');
        html += `<div class="question-block"><div class="question-title">תאריך</div><input type="text" value="${this.getData(key, 'hotel_date') || new Date().toLocaleDateString('he-IL')}" readonly style="background:#f0f0f0;"></div>`;
        
        html += '<div class="section-title">הצגת דפאות ותכנון</div>';
        
        const planningQuestions = [
            'הצג את דפא א\'',
            'הצג את דפא ב\'',
            'בדפא א\' איך הסיפור מביא אותך לחדר? האם יש משהו מהסביבה שישמש אותך דווקא לחדר זה?',
            'בדפא ב\' איך הסיפור מביא אותך לחדר? האם יש משהו מהסביבה שישמש אותך דווקא לחדר זה?',
            'בדפא א\' - האם הס"כ בדיק?',
            'בדפא ב\' - האם הס"כ בדיק?',
            'בדפא א\' - מה הפקיד יחשוב על הסיפור ואיזה מנוף אתה מפעיל מולו?',
            'בדפא ב\' - מה הפקיד יחשוב על הסיפור ואיזה מנוף אתה מפעיל מולו?'
        ];
        
        planningQuestions.forEach((q, i) => {
            html += `
                <div class="question-block">
                    <div class="question-title">${q}</div>
                    <textarea onchange="setExerciseData('${key}', 'plan_${i}', this.value)">${window.escapeHtml(this.getData(key, `plan_${i}`))}</textarea>
                </div>
            `;
        });
        
        html += '<div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">יש לתת זמן למועמד לתכנן, לאשר בע"פ ולצאת לביצוע</div>';
        
        html += '<div class="section-title">תחקיר אחרי ביצוע</div>';
        
        html += `
            <div class="question-block">
                <div class="question-title">חריגים או תקלות או חשדות?</div>
                <textarea onchange="setExerciseData('${key}', 'incidents', this.value)">${window.escapeHtml(this.getData(key, 'incidents'))}</textarea>
            </div>
            
            <div class="question-block">
                <div class="question-title">סקירת תוצרים מהנייד</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="${key}_reviewed" value="בוצע" 
                            ${this.getData(key, 'reviewed') === 'בוצע' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'reviewed', this.value)">בוצע
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${key}_reviewed" value="לא בוצע" 
                            ${this.getData(key, 'reviewed') === 'לא בוצע' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'reviewed', this.value)">לא בוצע
                    </label>
                </div>
            </div>
            
            <div class="question-block">
                <div class="question-title">האם ביצעת עפ"י תוכנית?</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="${key}_asplanned" value="כן" 
                            ${this.getData(key, 'asplanned') === 'כן' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'asplanned', this.value)">כן
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${key}_asplanned" value="לא" 
                            ${this.getData(key, 'asplanned') === 'לא' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'asplanned', this.value)">לא
                    </label>
                </div>
                <textarea onchange="setExerciseData('${key}', 'asplanned_notes', this.value)">${window.escapeHtml(this.getData(key, 'asplanned_notes'))}</textarea>
            </div>
            
            <div class="question-block">
                <div class="question-title">האם הצלחת להגיע לחדר? מה עזר או הכשיל?</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="${key}_success" value="כן" 
                            ${this.getData(key, 'success') === 'כן' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'success', this.value)">כן
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${key}_success" value="לא" 
                            ${this.getData(key, 'success') === 'לא' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'success', this.value)">לא
                    </label>
                </div>
                <textarea onchange="setExerciseData('${key}', 'success_notes', this.value)">${window.escapeHtml(this.getData(key, 'success_notes'))}</textarea>
            </div>
            
            <div class="question-block">
                <div class="question-title">מה המל"מ שאספת? ניתן להסתייע בסרטון. האם אספת מידע על פריסת חדרים? מעליות? אמצעים בחדר? זויות תצפית מבחוץ? פריסת לובי? אבטחה? מפתחות?</div>
                <textarea onchange="setExerciseData('${key}', 'intel', this.value)">${window.escapeHtml(this.getData(key, 'intel'))}</textarea>
            </div>
        `;
        
        html += '<div class="section-title">תחקיר תרגילי יומינט - ציונים</div>';
        
        const scores = [
            'גמישות מחשבתית',
            'גמישות ביצועית',
            'כישורי שטח בינאישיים',
            'התמודדות עם מצבי לחץ, עמימות וחוסר וודאות',
            'התמקמות כלומד',
            'בטחון עצמי',
            'ציון מסכם לתרגיל'
        ];
        
        scores.forEach((score, i) => {
            const val = this.getData(key, `score_${i}`) || '';
            const opts = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7].map(v => `<option value="${v}" ${val == v ? 'selected' : ''}>${v}</option>`).join('');
            html += `<div class="question-block"><div class="question-title">${score}</div><select onchange="setExerciseData('${key}', 'score_${i}', this.value)"><option value="">בחר ציון...</option>${opts}</select></div>`;
        });
        
        html += `
            <div class="question-block">
                <div class="question-title">התייחסות חופשית</div>
                <textarea onchange="setExerciseData('${key}', 'free_notes', this.value)">${window.escapeHtml(this.getData(key, 'free_notes'))}</textarea>
            </div>
        `;
        
        return html;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field);
    }
    
    renderQuestion(key, title, field, type = 'text') {
        const value = this.getData(key, field) || '';
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                ${type === 'textarea' 
                    ? `<textarea onchange="setExerciseData('${key}', '${field}', this.value)">${window.escapeHtml(value)}</textarea>`
                    : `<input type="${type}" value="${window.escapeHtml(value)}" onchange="setExerciseData('${key}', '${field}', this.value)">`
                }
            </div>
        `;
    }

    onRender() {
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
        
        window.toggleHotelHistory = () => {
            const popup = document.getElementById('hotelHistoryPopup');
            if (popup) {
                popup.classList.toggle('show');
            }
        };
    }
}


// ===== js/pages/landing.js =====
/**
 * Landing Page Module
 * Initial page with evaluator/admin selection
 */

class LandingPage {
    render() {
        return `
            <div class="container">
                <div style="text-align: center; margin: 30px 0;">
                    <img src="logo.png" alt="סדנת אימפרוב" style="max-width: 90%; height: auto; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                </div>
                <div class="landing-buttons">
                    <button class="btn-large btn-evaluator" onclick="goToPage('evaluator')">
                        מעריך
                    </button>
                    <button class="btn-large btn-admin" onclick="goToPage('admin')">
                        מנהל
                    </button>
                </div>
            </div>
        `;
    }

    onEnter() {
        console.log('📱 Landing page loaded');
    }
}


// ===== js/pages/admin.js =====
/**
 * Admin Page Module
 * Configuration and history management
 */

class AdminPage {
    render() {
        return `
            <div class="container">
                <h2>דף מנהל</h2>
                
                <div style="margin-bottom: 15px;">
                    <label>שם ההערכה</label>
                    <input type="text" id="assessmentName" value="${window.escapeHtml(window.app.data.assessmentName)}">
                </div>
                
                <div class="grid-2">
                    <div>
                        <label>חניך 1</label>
                        <input type="text" id="trainee1" value="${window.escapeHtml(window.app.data.trainee1)}">
                    </div>
                    <div>
                        <label>חניך 2</label>
                        <input type="text" id="trainee2" value="${window.escapeHtml(window.app.data.trainee2)}">
                    </div>
                    <div>
                        <label>חניך 3</label>
                        <input type="text" id="trainee3" value="${window.escapeHtml(window.app.data.trainee3)}">
                    </div>
                    <div>
                        <label>חניך 4</label>
                        <input type="text" id="trainee4" value="${window.escapeHtml(window.app.data.trainee4)}">
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <label>דגשים</label>
                    <textarea id="highlights" rows="4">${window.escapeHtml(window.app.data.highlights)}</textarea>
                </div>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    ניהול היסטוריית חנויות (טיח)
                </h3>
                <div id="storeHistoryList" class="history-list"></div>
                <button class="btn-add" onclick="addStoreToAdmin()">הוסף חנות</button>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    ניהול היסטוריית מלונות (יומינט)
                </h3>
                <div id="hotelHistoryList" class="history-list"></div>
                <button class="btn-add" onclick="addHotelToAdmin()">הוסף מלון</button>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    📊 ייצוא הגדרות
                </h3>
                
                <button class="btn btn-save" onclick="exportAdminJSON()" style="background: #3b82f6; margin-bottom: 15px;">
                    📤 ייצוא הגדרות (JSON)
                </button>
                
                <div class="nav-buttons">
                    <button class="btn btn-save" onclick="saveAdminAndBack()">💾 שמור וחזור</button>
                    <button class="btn btn-save" onclick="loadAdminJSON()">📤 טען הגדרות</button>
                </div>
                <input type="file" id="jsonFileInput" accept="application/json,.json,.txt,text/plain,*/*" style="display: none;" onchange="handleJSONFile(event)">
            </div>
        `;
    }

    onEnter() {
        this.renderStoreHistory();
        this.renderHotelHistory();
        this.attachEventListeners();
    }

    renderStoreHistory() {
        const container = document.getElementById('storeHistoryList');
        if (!container) return;

        container.innerHTML = '';
        
        window.app.data.storeHistory.forEach((store, index) => {
            const div = document.createElement('div');
            div.className = 'history-edit-item';
            div.innerHTML = `
                <input type="text" value="${window.escapeHtml(store.name)}" 
                    onchange="updateStoreHistory(${index}, 'name', this.value)" 
                    placeholder="שם חנות">
                <input type="text" value="${window.escapeHtml(store.address)}" 
                    onchange="updateStoreHistory(${index}, 'address', this.value)" 
                    placeholder="כתובת">
                <input type="text" value="${window.escapeHtml(store.notes || '')}" 
                    onchange="updateStoreHistory(${index}, 'notes', this.value)" 
                    placeholder="הערות">
                <div style="font-size: 11px; color: #666; margin: 5px 0;">
                    תאריך: ${store.date}
                </div>
                <button class="btn-delete" onclick="deleteStore(${index})">מחק</button>
            `;
            container.appendChild(div);
        });
    }

    renderHotelHistory() {
        const container = document.getElementById('hotelHistoryList');
        if (!container) return;

        container.innerHTML = '';
        
        window.app.data.hotelHistory.forEach((hotel, index) => {
            const div = document.createElement('div');
            div.className = 'history-edit-item';
            div.innerHTML = `
                <input type="text" value="${window.escapeHtml(hotel.name)}" 
                    onchange="updateHotelHistory(${index}, 'name', this.value)" 
                    placeholder="שם מלון">
                <input type="text" value="${window.escapeHtml(hotel.address)}" 
                    onchange="updateHotelHistory(${index}, 'address', this.value)" 
                    placeholder="כתובת">
                <input type="text" value="${window.escapeHtml(hotel.notes || '')}" 
                    onchange="updateHotelHistory(${index}, 'notes', this.value)" 
                    placeholder="הערות">
                <div style="font-size: 11px; color: #666; margin: 5px 0;">
                    תאריך: ${hotel.date}
                </div>
                <button class="btn-delete" onclick="deleteHotel(${index})">מחק</button>
            `;
            container.appendChild(div);
        });
    }

    attachEventListeners() {
        // Make functions global for onclick handlers
        window.updateStoreHistory = (idx, field, value) => {
            window.storage.updateStore(idx, field, value);
        };

        window.deleteStore = (idx) => {
            if (confirm('האם אתה בטוח שברצונך למחוק חנות זו?')) {
                window.storage.deleteStore(idx);
                this.renderStoreHistory();
            }
        };

        window.addStoreToAdmin = () => {
            window.storage.addStore('', '', '');
            this.renderStoreHistory();
        };

        window.updateHotelHistory = (idx, field, value) => {
            window.storage.updateHotel(idx, field, value);
        };

        window.deleteHotel = (idx) => {
            if (confirm('האם אתה בטוח שברצונך למחוק מלון זה?')) {
                window.storage.deleteHotel(idx);
                this.renderHotelHistory();
            }
        };

        window.addHotelToAdmin = () => {
            window.storage.addHotel('', '', '');
            this.renderHotelHistory();
        };

        window.saveAdminAndBack = () => {
            // Save all admin fields
            const assessmentInput = document.getElementById('assessmentName');
            if (assessmentInput) {
                window.app.data.assessmentName = assessmentInput.value;
            }
            
            for (let i = 1; i <= 4; i++) {
                const traineeInput = document.getElementById(`trainee${i}`);
                if (traineeInput) {
                    window.app.data[`trainee${i}`] = traineeInput.value;
                }
            }
            
            const highlightsInput = document.getElementById('highlights');
            if (highlightsInput) {
                window.app.data.highlights = highlightsInput.value;
            }
            
            window.storage.saveData();
            goToPage('landing');
        };

        window.loadAdminJSON = async () => {
            const input = document.getElementById('jsonFileInput');
            
            // ניסיון לפתוח ישירות את תיקיית WhatsApp
            if (window.cordova && window.cordova.file) {
                try {
                    const whatsappPath = '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents/';
                    console.log('Attempting to open WhatsApp folder:', whatsappPath);
                } catch (e) {
                    console.log('Could not pre-navigate to WhatsApp folder');
                }
            }
            
            input.click();
        };

        window.handleJSONFile = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                await window.exportManager.loadFromJSON(file);
                
                // Refresh the page
                this.onEnter();
                
                // Update input fields
                document.getElementById('assessmentName').value = window.app.data.assessmentName;
                document.getElementById('trainee1').value = window.app.data.trainee1;
                document.getElementById('trainee2').value = window.app.data.trainee2;
                document.getElementById('trainee3').value = window.app.data.trainee3;
                document.getElementById('trainee4').value = window.app.data.trainee4;
                document.getElementById('highlights').value = window.app.data.highlights;
                
                alert('✅ הגדרות נטענו בהצלחה!\n\nשם ההערכה, חניכים, דגשים, חנויות ומלונות עודכנו.');
            } catch (error) {
                alert('❌ שגיאה בטעינת קובץ JSON:\n' + error.message);
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        // Test export functions for different methods
        window.testExportJSON = async (method) => {
            const exportData = {
                metadata: {
                    assessmentName: window.app.data.assessmentName,
                    evaluatorName: window.app.data.evaluatorName,
                    exportDate: new Date().toISOString(),
                    appVersion: '1.0'
                },
                trainees: [],
                highlights: window.app.data.highlights,
                storeHistory: window.app.data.storeHistory,
                hotelHistory: window.app.data.hotelHistory
            };
            
            for (let t = 0; t < 4; t++) {
                exportData.trainees.push({
                    id: t,
                    name: window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`
                });
            }
            
            const jsonStr = JSON.stringify(exportData, null, 2);
            const filename = `בדיקה-JSON-שיטה${method}_${Date.now()}.json`;
            
            try {
                await this.executeExportMethod(method, jsonStr, filename, 'application/json');
            } catch (error) {
                alert(`❌ שיטה ${method} נכשלה:\n${error.message}`);
            }
        };
        
        window.testExportCSV = async (method) => {
            let csv = '\uFEFF'; // UTF-8 BOM
            csv += 'שם ההערכה,' + window.csvEscape(window.app.data.assessmentName || 'לא מולא') + '\n';
            csv += 'מעריך,' + window.csvEscape(window.app.data.evaluatorName || 'לא מולא') + '\n';
            csv += 'תאריך,' + new Date().toLocaleDateString('he-IL') + '\n\n';
            csv += 'חניכים,';
            for (let i = 1; i <= 4; i++) {
                csv += window.csvEscape(window.app.data[`trainee${i}`] || 'לא מולא');
                if (i < 4) csv += ',';
            }
            csv += '\n';
            csv += 'דגשים,' + window.csvEscape(window.app.data.highlights || 'לא מולא') + '\n';
            
            const filename = `בדיקה-CSV-שיטה${method}_${Date.now()}.csv`;
            
            try {
                await this.executeExportMethod(method, csv, filename, 'text/csv;charset=utf-8;');
            } catch (error) {
                alert(`❌ שיטה ${method} נכשלה:\n${error.message}`);
            }
        };
    }
    
    async executeExportMethod(method, content, filename, mimeType) {
        switch(method) {
            case 1: // File System API
                if (!('showSaveFilePicker' in window)) {
                    alert('❌ File System API לא נתמך במכשיר זה');
                    return;
                }
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: filename.endsWith('.json') ? 'JSON Files' : 'CSV Files',
                        accept: {[mimeType]: [filename.endsWith('.json') ? '.json' : '.csv']}
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                alert(`✅ שיטה ${method} הצליחה!\nהקובץ נשמר במיקום שבחרת.`);
                break;
                
            case 3: // Blob Download
                const blob3 = new Blob([content], {type: mimeType});
                const url3 = URL.createObjectURL(blob3);
                const a3 = document.createElement('a');
                a3.href = url3;
                a3.download = filename;
                a3.click();
                URL.revokeObjectURL(url3);
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד לתיקיית ההורדות.`);
                break;
                
            case 4: // Data URI
                const dataUrl = `data:${mimeType},${encodeURIComponent(content)}`;
                const a4 = document.createElement('a');
                a4.href = dataUrl;
                a4.download = filename;
                a4.click();
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד.`);
                break;
                
            case 5: // Window.open
                const blob5 = new Blob([content], {type: mimeType});
                const url5 = URL.createObjectURL(blob5);
                const newWindow = window.open(url5, '_blank');
                setTimeout(() => URL.revokeObjectURL(url5), 1000);
                if (newWindow) {
                    alert(`✅ שיטה ${method} הצליחה!\nהקובץ נפתח בחלון חדש.`);
                } else {
                    alert(`⚠️ שיטה ${method}: חלון נחסם.\nאפשר חלונות קופצים ונסה שוב.`);
                }
                break;
                
            case 6: // Force Download (octet-stream)
                const blob6 = new Blob([content], {type: 'application/octet-stream'});
                const url6 = URL.createObjectURL(blob6);
                const a6 = document.createElement('a');
                a6.href = url6;
                a6.download = filename;
                a6.click();
                URL.revokeObjectURL(url6);
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד.`);
                break;
                
            case 7: // iframe
                const dataUrl7 = `data:${mimeType},${encodeURIComponent(content)}`;
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = dataUrl7;
                document.body.appendChild(iframe);
                setTimeout(() => {
                    try {
                        document.body.removeChild(iframe);
                    } catch(e) {}
                }, 2000);
                alert(`✅ שיטה ${method} הופעלה!\nאם הקובץ הורד - השיטה עובדת!`);
                break;
                
            case 8: // Temporary Link
                const blob8 = new Blob([content], {type: mimeType});
                const url8 = URL.createObjectURL(blob8);
                const a8 = document.createElement('a');
                a8.style.display = 'none';
                a8.href = url8;
                a8.download = filename;
                document.body.appendChild(a8);
                a8.click();
                setTimeout(() => {
                    document.body.removeChild(a8);
                    URL.revokeObjectURL(url8);
                }, 100);
                alert(`✅ שיטה ${method} הופעלה!\nבדוק אם הקובץ הורד.`);
                break;
                
            case 10: // Smart Cascade
                let success = false;
                let usedMethod = '';
                
                // Try File System API
                if ('showSaveFilePicker' in window) {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: filename,
                            types: [{
                                description: filename.endsWith('.json') ? 'JSON' : 'CSV',
                                accept: {[mimeType]: [filename.endsWith('.json') ? '.json' : '.csv']}
                            }]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(content);
                        await writable.close();
                        usedMethod = 'File System API';
                        success = true;
                    } catch(e) {
                        if (e.name !== 'AbortError') console.log('FS failed:', e);
                    }
                }
                
                // Fallback to Blob
                if (!success) {
                    const blob = new Blob([content], {type: mimeType});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);
                    usedMethod = 'Blob Download';
                    success = true;
                }
                
                alert(`✅ מפל חכם הצליח!\nשיטה שעבדה: ${usedMethod}`);
                break;
                
            default:
                alert(`❌ שיטה ${method} לא נתמכת`);
        }
    }

    onLeave() {
        // Save all admin fields before leaving
        const assessmentInput = document.getElementById('assessmentName');
        if (assessmentInput) {
            window.app.data.assessmentName = assessmentInput.value;
        }
        
        for (let i = 1; i <= 4; i++) {
            const traineeInput = document.getElementById(`trainee${i}`);
            if (traineeInput) {
                window.app.data[`trainee${i}`] = traineeInput.value;
            }
        }
        
        const highlightsInput = document.getElementById('highlights');
        if (highlightsInput) {
            window.app.data.highlights = highlightsInput.value;
        }
        
        window.storage.saveData();
    }
}


// ===== js/pages/evaluator.js =====
/**
 * Evaluator Page Module
 * Evaluator name and primary trainee selection
 */

class EvaluatorPage {
    render() {
        return `
            <div class="container">
                <h2>דף מעריך</h2>
                
                <div class="import-box">
                    <label style="margin-bottom: 8px;">ייבוא הגדרות מנהל (קובץ JSON)</label>
                    <input type="file" id="jsonFileInput" accept=".json" style="display: none;" data-folder="whatsapp"">
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-add" onclick="triggerJSONImport()" style="flex: 1;">📥 טען קובץ הגדרות</button>
                        <button class="btn-delete" onclick="resetExerciseData()" style="flex: 1;">🔄 איפוס נתונים</button>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label id="evaluatorLabel" style="cursor:default;user-select:none;-webkit-user-select:none;">שם המעריך</label>
                    <input type="text" id="evaluatorName" value="${window.escapeHtml(window.app.data.evaluatorName)}">
                </div>
                
                <div>
                    <label>בחירת חניכים ראשיים (בחר 2)</label>
                    <div class="primary-selection" id="primaryBtns"></div>
                </div>
                
                <div id="highlightsDisplay" class="highlights-box" style="display: none;">
                    <h3 style="font-size: 16px; margin-bottom: 8px;">דגשים כלליים:</h3>
                    <p id="highlightsText" style="white-space: pre-wrap;"></p>
                </div>
                
                <div class="nav-buttons">
                    <button class="btn btn-back" onclick="goToPage('landing')">⬅ אחורה</button>
                    <button class="btn btn-forward" onclick="goToPage('assessment')">קדימה ➡</button>
                </div>
            </div>
            
            <!-- Easter Egg -->
            <div id="easterEgg" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 99999; justify-content: center; align-items: center;">
                <img src="easter-egg.png" style="max-width: 80%; max-height: 80%; border-radius: 20px; box-shadow: 0 0 50px rgba(255,255,255,0.3);">
            </div>
            <audio id="easterEggAudio" src="easter-egg.mp3" loop></audio>
        `;
    }

    onEnter() {
        this.renderPrimaryButtons();
        this.updateHighlights();
        this.attachEventListeners();
        this.initEasterEgg();
    }

    renderPrimaryButtons() {
        const container = document.getElementById('primaryBtns');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const btn = document.createElement('button');
            const isPrimary = window.app.primaryTrainees.indexOf(i) >= 0;
            btn.className = isPrimary ? 'primary-btn selected' : 'primary-btn';
            
            if (isPrimary) {
                btn.innerHTML = '⭐ ' + window.getTraineeName(i) + ' ⭐';
            } else {
                btn.textContent = window.getTraineeName(i);
            }
            
            btn.onclick = () => this.togglePrimary(i);
            container.appendChild(btn);
        }
    }

    togglePrimary(index) {
        const idx = window.app.primaryTrainees.indexOf(index);
        
        if (idx >= 0) {
            // Remove from primary
            window.app.primaryTrainees.splice(idx, 1);
        } else {
            // Add to primary (max 2)
            if (window.app.primaryTrainees.length < 2) {
                window.app.primaryTrainees.push(index);
            } else {
                alert('ניתן לבחור עד 2 חניכים ראשיים בלבד');
                return;
            }
        }
        
        this.renderPrimaryButtons();
        window.storage.saveData();
    }

    updateHighlights() {
        const highlightsDisplay = document.getElementById('highlightsDisplay');
        const highlightsText = document.getElementById('highlightsText');
        
        if (window.app.data.highlights) {
            highlightsDisplay.style.display = 'block';
            highlightsText.textContent = window.app.data.highlights;
        } else {
            highlightsDisplay.style.display = 'none';
        }
    }

    attachEventListeners() {
        window.triggerJSONImport = async () => {
            const input = document.getElementById('jsonFileInput');
            
            // ניסיון לפתוח ישירות את תיקיית WhatsApp (עובד רק ב-Chrome מודרני)
            if (window.cordova && window.cordova.file) {
                try {
                    // נסה לגשת לתיקיית WhatsApp
                    const whatsappPath = '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents/';
                    console.log('Attempting to open WhatsApp folder:', whatsappPath);
                } catch (e) {
                    console.log('Could not pre-navigate to WhatsApp folder');
                }
            }
            
            input.click();
        };
        
        // פונקציה לאיפוס נתונים
        window.resetExerciseData = () => {
            if (confirm('⚠️ האם אתה בטוח שברצונך למחוק את כל נתוני התרגילים, הסיכום והמסמכים הסרוקים?\n\nפעולה זו תמחק:\n✓ כל התשובות בתרגילים\n✓ כל הציונים והערות בסיכום ההערכה\n✓ כל המסמכים הסרוקים\n\nהנתונים האחרים (שמות חניכים, דגשים, חנויות ומלונות) לא יושפעו.')) {
                // מחיקת נתוני תרגילים
                window.app.data.exerciseData = {};
                // מחיקת נתוני סיכום
                window.app.data.summaryData = {};
                // מחיקת מסמכים סרוקים מהזיכרון
                window.app.data.scannedDocs = {};
                
                // ניקוי קבצים זמניים מהcache (לא מ-Downloads)
                if (window.cordova && window.cordova.file) {
                    try {
                        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(cacheDir) {
                            var reader = cacheDir.createReader();
                            reader.readEntries(function(entries) {
                                entries.forEach(function(entry) {
                                    if (entry.isDirectory && (entry.name.includes('_docs_') || entry.name.includes('מסמכים'))) {
                                        entry.removeRecursively(function() { console.log('🗑️ Cache dir removed:', entry.name); }, function() {});
                                    } else if (entry.isFile && entry.name.endsWith('.pdf')) {
                                        entry.remove(function() { console.log('🗑️ Cache file removed:', entry.name); }, function() {});
                                    }
                                });
                            }, function() {});
                        }, function() {});
                    } catch(e) { console.warn('Cache cleanup error:', e); }
                }
                
                window.storage.saveData(true);
                alert('✅ נתוני התרגילים, הסיכום והמסמכים הסרוקים נמחקו בהצלחה!');
            }
        };

        const fileInput = document.getElementById('jsonFileInput');
        if (fileInput) {
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    // שאלה אם למחוק נתונים לפני ייבוא
                    const shouldReset = confirm('❓ האם ברצונך למחוק את נתוני התרגילים והסיכום לפני הייבוא?\n\n✓ כן - מחק נתונים קיימים ואז טען את ההגדרות\n✗ לא - רק טען הגדרות (שמות, דגשים, היסטוריה)');
                    
                    if (shouldReset) {
                        window.app.data.exerciseData = {};
                        window.app.data.summaryData = {};
                    }
                    
                    await window.exportManager.loadFromJSON(file);
                    this.renderPrimaryButtons();
                    this.updateHighlights();
                    alert('✅ הגדרות נטענו בהצלחה!\n\nשם ההערכה, חניכים, דגשים, חנויות ומלונות עודכנו.');
                } catch (error) {
                    alert('❌ שגיאה בקריאת קובץ JSON:\n' + error.message);
                    console.error(error);
                }
                
                // Reset file input
                e.target.value = '';
            };
        }
    }

    initEasterEgg() {
        let clickCount = 0;
        let clickTimer = null;
        
        const evaluatorLabel = document.getElementById('evaluatorLabel');
        const easterEgg = document.getElementById('easterEgg');
        const audio = document.getElementById('easterEggAudio');
        
        if (!evaluatorLabel || !easterEgg || !audio) return;
        
        evaluatorLabel.addEventListener('click', (e) => {
            e.preventDefault();
            clickCount++;
            
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 3000);
            
            if (clickCount >= 10) {
                clickCount = 0;
                easterEgg.style.display = 'flex';
                audio.play().catch(err => console.log('Audio play failed:', err));
            }
        });
        
        easterEgg.addEventListener('click', (e) => {
            if (e.target === easterEgg) {
                easterEgg.style.display = 'none';
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    onLeave() {
        // Save evaluator name
        const evaluatorInput = document.getElementById('evaluatorName');
        if (evaluatorInput) {
            window.app.data.evaluatorName = evaluatorInput.value;
        }
        window.storage.saveData();
    }
}


// ===== js/pages/assessment.js =====
/**
 * Assessment Page Module v5.7
 * Primary trainee priority, quick-switch bar, modern design
 */


class AssessmentPage {
    constructor() {
        this.exercises = [
            new BalloonExercise(),
            new TiachExercise(),
            new DoliraExercise(),
            new DavidExercise(),
            new LailaExercise(),
            new MichtavExercise(),
            new YominetExercise()
        ];
    }

    getOrderedTrainees() {
        const primary = window.app.primaryTrainees || [];
        const all = [0, 1, 2, 3];
        const ordered = [];
        primary.forEach(p => { if (all.includes(p)) ordered.push(p); });
        all.forEach(i => { if (!ordered.includes(i)) ordered.push(i); });
        return ordered;
    }

    isPrimary(index) {
        return (window.app.primaryTrainees || []).includes(index);
    }

    render() {
        return `
            <div class="quick-switch-bar" id="quickSwitchBar"></div>
            <div class="container" id="assessmentContainer" style="padding-bottom: 65px; padding-top: 50px;">
                <div class="assessment-header">
                    <h3 id="assessmentTitle">${window.app.data.assessmentName || 'הערכה'}</h3>
                    <p id="evaluatorDisplay">מעריך: ${window.app.data.evaluatorName || ''}</p>
                </div>
                
                <div class="trainee-tabs" id="traineeTabs"></div>
                <div class="exercise-tabs" id="exerciseTabs"></div>
                <div class="exercise-content" id="exerciseContent"></div>
            </div>
            <div class="sticky-bottom-nav" id="assessmentNav">
                <button class="nav-btn nav-btn-back" onclick="goToPage('evaluator')">⬅ אחורה</button>
                <button class="nav-btn-save" onclick="window.storage.saveData(); alert('נשמר ✅')" title="שמירה">💾</button>
                <button class="nav-btn nav-btn-forward" onclick="goToPage('summary')">קדימה ➡</button>
                <button class="scroll-top-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="למעלה">⬆</button>
            </div>
        `;
    }

    onEnter() {
        this.renderQuickSwitch();
        this.renderTraineeTabs();
        this.renderExerciseTabs();
        this.selectTrainee(window.app.currentTrainee || this.getOrderedTrainees()[0]);
        this.selectExercise(window.app.currentExercise || 0);
    }

    renderQuickSwitch() {
        const bar = document.getElementById('quickSwitchBar');
        if (!bar) return;
        bar.innerHTML = '';
        const ordered = this.getOrderedTrainees();
        ordered.forEach(i => {
            const btn = document.createElement('button');
            btn.className = 'quick-switch-btn';
            btn.id = `qs${i}`;
            btn.textContent = window.getTraineeName(i);
            if (this.isPrimary(i)) btn.classList.add('primary-badge');
            btn.onclick = () => this.selectTrainee(i);
            bar.appendChild(btn);
        });
    }

    renderTraineeTabs() {
        const container = document.getElementById('traineeTabs');
        if (!container) return;
        container.innerHTML = '';
        const ordered = this.getOrderedTrainees();
        ordered.forEach(i => {
            const div = document.createElement('div');
            div.className = 'trainee-tab';
            div.id = `traineeTab${i}`;
            div.textContent = window.getTraineeName(i);
            if (this.isPrimary(i)) div.classList.add('primary-trainee');
            div.onclick = () => this.selectTrainee(i);
            container.appendChild(div);
        });
    }

    renderExerciseTabs() {
        const container = document.getElementById('exerciseTabs');
        if (!container) return;
        container.innerHTML = '';
        window.app.exercises.forEach((name, i) => {
            const btn = document.createElement('button');
            btn.className = 'exercise-tab';
            btn.id = `exerciseTab${i}`;
            btn.textContent = name;
            btn.onclick = () => this.selectExercise(i);
            container.appendChild(btn);
        });
    }

    selectTrainee(index) {
        window.app.currentTrainee = index;
        for (let i = 0; i < 4; i++) {
            const tab = document.getElementById(`traineeTab${i}`);
            const qs = document.getElementById(`qs${i}`);
            const color = window.app.traineeColors[i];
            [tab, qs].forEach(el => {
                if (!el) return;
                if (i === index) {
                    el.classList.add('active');
                    el.style.backgroundColor = color;
                    el.style.borderColor = color;
                    el.style.color = 'white';
                } else {
                    el.classList.remove('active');
                    el.style.backgroundColor = '';
                    el.style.borderColor = '';
                    el.style.color = '';
                }
            });
        }
        const container = document.getElementById('assessmentContainer');
        if (container) {
            container.style.backgroundColor = window.app.traineeColors[index] + '08';
            container.style.transition = 'background-color 0.3s';
        }
        this.renderCurrentExercise();
    }

    selectExercise(index) {
        window.app.currentExercise = index;
        window.app.exercises.forEach((_, i) => {
            const tab = document.getElementById(`exerciseTab${i}`);
            if (tab) tab.classList.toggle('active', i === index);
        });
        this.renderCurrentExercise();
    }

    renderCurrentExercise() {
        const content = document.getElementById('exerciseContent');
        if (!content) return;
        const exercise = this.exercises[window.app.currentExercise];
        if (exercise) {
            const scanBtnTop = `<button class="btn-scan scan-btn-top" onclick="window.startDocScan()">📷 סרוק מסמך</button>`;
            const scanBtnBottom = `<button class="btn-scan scan-btn-bottom" onclick="window.startDocScan()">📷 סרוק מסמך</button>`;
            content.innerHTML = scanBtnTop + exercise.render(window.app.currentTrainee, window.app.currentExercise) + scanBtnBottom;
            if (exercise.onRender) setTimeout(() => exercise.onRender(window.app.currentTrainee, window.app.currentExercise), 0);
            else if (exercise.onEnter) setTimeout(() => exercise.onEnter(), 0);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onLeave() {
        window.storage.saveData();
        const bar = document.getElementById('quickSwitchBar');
        if (bar) bar.innerHTML = '';
    }
}


// ===== js/pages/summary.js =====
/**
 * Summary Page Module v5.7
 * Primary trainee priority, PDF summary report
 */


class SummaryPage {
    constructor() {
        this.exportManager = new ExportManager();
    }

    getOrderedTrainees() {
        const primary = window.app.primaryTrainees || [];
        const all = [0, 1, 2, 3];
        const ordered = [];
        primary.forEach(p => { if (all.includes(p)) ordered.push(p); });
        all.forEach(i => { if (!ordered.includes(i)) ordered.push(i); });
        return ordered;
    }

    isPrimary(index) {
        return (window.app.primaryTrainees || []).includes(index);
    }

    render() {
        return `
            <div class="container" id="summaryContainer" style="padding-bottom: 65px;">
                <h2 style="text-align: center;">סיכום הערכה</h2>
                
                <div class="trainee-tabs" id="summaryTabs"></div>
                
                <button class="btn-scan scan-btn-summary" onclick="window.startDocScanSummary()">📷 סרוק מסמך</button>
                
                <div class="criteria-list" id="criteriaList"></div>
                
                <div class="export-buttons">
                    <button class="btn btn-excel" onclick="testSocialSharing()">📊 ייצוא Excel</button>
                    <button class="btn btn-print" onclick="openExcelPreview()">👁️ תצוגה מקדימה</button>
                </div>
                
                <button class="btn-pdf-summary" onclick="window.generatePDFSummary()">📄 סיכום PDF לחניך</button>
                
                <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 8px; border: 2px dashed #2196f3;">
                    <p style="font-size: 12px; color: #1565c0; margin-bottom: 8px; font-weight: bold;">💾 שמירת גיבוי מקומי:</p>
                    <button class="btn" onclick="testFilePlugin()" style="width: 100%; background: #2196f3; color: white;">
                        שמירת גיבוי מקומי
                    </button>
                </div>
                
                <div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 8px; border: 2px dashed #f59e0b;">
                    <p style="font-size: 12px; color: #92400e; margin-bottom: 8px; font-weight: bold;">📄 מסמכים סרוקים:</p>
                    <div class="doc-export-buttons">
                        <button class="btn btn-doc-export" onclick="exportDocsZip()">📤 שתף מסמכים</button>
                        <button class="btn btn-doc-export" onclick="exportDocsLocal()" style="background:#059669;">💾 שמור לתיקייה</button>
                        <button class="btn btn-doc-export" onclick="showDocsList()" style="background:#6366f1;">👁️ צפייה</button>
                    </div>
                </div>
            </div>
            <div class="sticky-bottom-nav" id="summaryNav">
                <button class="nav-btn nav-btn-back" onclick="goToPage('assessment')">⬅ חזור להערכה</button>
                <button class="nav-btn-save" onclick="window.storage.saveData(); alert('נשמר ✅')" title="שמירה">💾</button>
                <button class="scroll-top-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="למעלה">⬆</button>
            </div>
        `;
    }

    onEnter() {
        this.renderSummaryTabs();
        this.selectSummaryTrainee(window.app.currentSummaryTrainee || this.getOrderedTrainees()[0]);
        this.attachEventListeners();
    }

    renderSummaryTabs() {
        const container = document.getElementById('summaryTabs');
        if (!container) return;
        container.innerHTML = '';
        const ordered = this.getOrderedTrainees();
        ordered.forEach(i => {
            const div = document.createElement('div');
            div.className = 'trainee-tab';
            div.id = `summaryTab${i}`;
            div.textContent = window.getTraineeName(i);
            if (this.isPrimary(i)) div.classList.add('primary-trainee');
            div.onclick = () => this.selectSummaryTrainee(i);
            container.appendChild(div);
        });
    }

    selectSummaryTrainee(index) {
        window.app.currentSummaryTrainee = index;
        for (let i = 0; i < 4; i++) {
            const tab = document.getElementById(`summaryTab${i}`);
            if (!tab) continue;
            if (i === index) {
                tab.classList.add('active');
                tab.style.backgroundColor = window.app.traineeColors[i];
                tab.style.borderColor = window.app.traineeColors[i];
                tab.style.color = 'white';
            } else {
                tab.classList.remove('active');
                tab.style.backgroundColor = '';
                tab.style.borderColor = '';
                tab.style.color = '';
            }
        }
        const container = document.getElementById('summaryContainer');
        if (container) {
            container.style.backgroundColor = window.app.traineeColors[index] + '08';
            container.style.transition = 'background-color 0.3s';
        }
        this.renderCriteria();
    }

    renderCriteria() {
        const list = document.getElementById('criteriaList');
        if (!list) return;
        list.innerHTML = '';
        window.app.criteria.forEach(criterion => {
            const key = `${window.app.currentSummaryTrainee}-${criterion}`;
            const div = document.createElement('div');
            div.className = 'criterion-item';
            div.innerHTML = `
                <h4>${criterion}</h4>
                <div>
                    <label>ציון (1-7)</label>
                    <select onchange="updateSummaryScore('${key}', this.value)" style="width:100%;padding:8px;font-size:16px;border-radius:8px;border:1px solid #ddd;">
                        <option value="">בחר ציון...</option>
                        ${[1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7].map(v => 
                            `<option value="${v}" ${window.storage.getSummaryData(key, 'score') == v ? 'selected' : ''}>${v}</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label>הערות</label>
                    <textarea onchange="updateSummaryText('${key}', this.value)">${window.escapeHtml(window.storage.getSummaryData(key, 'text'))}</textarea>
                </div>
                <div>
                    <label>דוגמאות</label>
                    <textarea onchange="updateSummaryExamples('${key}', this.value)">${window.escapeHtml(window.storage.getSummaryData(key, 'examples'))}</textarea>
                </div>
            `;
            list.appendChild(div);
        });
    }

    attachEventListeners() {
        window.updateSummaryScore = (key, value) => {
            window.storage.setSummaryData(key, 'score', value);
        };
        window.updateSummaryText = (key, value) => {
            window.storage.setSummaryData(key, 'text', value);
        };
        window.updateSummaryExamples = (key, value) => {
            window.storage.setSummaryData(key, 'examples', value);
        };
    }

    onLeave() {
        window.storage.saveData();
    }
}


// ===== js/pages/preview.js =====
/**
 * Preview Page Module
 * Excel preview before export
 */

class PreviewPage {
    render() {
        return `
            <div class="container">
                <h2>👁️ תצוגה מקדימה - Excel</h2>
                
                <div id="preview-content" style="overflow-x: auto; margin: 20px 0; background: white; padding: 15px; border-radius: 10px;">
                    <p>טוען נתונים...</p>
                </div>
                
                <div class="nav-buttons">
                    <button class="btn btn-back" onclick="goToPage('summary')">⬅ חזור</button>
                </div>
            </div>
        `;
    }

    onEnter() {
        this.loadPreview();
    }

    loadPreview() {
        const previewDiv = document.getElementById('preview-content');
        
        try {
            const data = window.app.data;
            
            if (typeof window.generateTabularExcel === 'function' && typeof XLSX !== 'undefined') {
                const excelBuffer = window.generateTabularExcel(data);
                
                if (excelBuffer) {
                    // המר ל-workbook
                    const wb = XLSX.read(excelBuffer, {type: 'array'});
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    
                    // המר ל-HTML
                    const html = XLSX.utils.sheet_to_html(ws);
                    previewDiv.innerHTML = html;
                } else {
                    previewDiv.innerHTML = '<p style="color:red;">❌ שגיאה ביצירת Excel</p>';
                }
            } else {
                previewDiv.innerHTML = '<p style="color:red;">❌ SheetJS לא נטען</p>';
            }
        } catch (error) {
            console.error('Preview error:', error);
            previewDiv.innerHTML = '<p style="color:red;">❌ שגיאה: ' + error.message + '</p>';
        }
    }
}


// ===== js/app.js =====
/**
 * Main Application Entry Point
 * Handles routing, initialization, and page management
 */


// Global app state
window.app = {
    currentPage: 'landing',
    currentTrainee: 0,
    currentExercise: 0,
    currentSummaryTrainee: 0,
    primaryTrainees: [],
    data: {
        assessmentName: '',
        trainee1: '',
        trainee2: '',
        trainee3: '',
        trainee4: '',
        highlights: '',
        evaluatorName: '',
        primaryTrainees: [],
        exerciseData: {},
        summaryData: {},
        storeHistory: [],
        hotelHistory: [],
        scannedDocs: {}
    },
    traineeColors: ['#e63946', '#2a9d8f', '#457b9d', '#e9c46a'],
    exercises: ['בלון', 'טיח', 'דולירה', 'דויד', 'לילה', 'מכתב', 'יומינט'],
    criteria: [
        'כישורי חשיבה - יכולת למידה',
        'כישורי חשיבה - גמישות מחשבתית',
        'כישורי חשיבה - תכנון',
        'טקטי - גמישות ביצועית',
        'טקטי - בטחון מול יעילות',
        'טקטי - מיומנויות',
        'טקטי - יכולות דיווח',
        'טקטי - שטח/בינאישי',
        'אישיות - חוסן, עמימות ולחץ',
        'אישיות - גמישות מחשבתית',
        'אישיות - עבודה בצוות',
        'סיכום כללי'
    ]
};

// Initialize storage
window.storage = new Storage();

// Initialize export manager
window.exportManager = new ExportManager();

// Initialize document scanner
window.docScanner = new DocScanner();

// Initialize router
window.router = new Router();

// Register pages
window.router.register('landing', new LandingPage());
window.router.register('admin', new AdminPage());
window.router.register('evaluator', new EvaluatorPage());
window.router.register('assessment', new AssessmentPage());
window.router.register('summary', new SummaryPage());
window.router.register('preview', new PreviewPage());

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App initializing...');
    
    // Load saved data
    window.storage.loadData();
    
    // Navigate to landing page
    window.router.navigate('landing');
    
    // Setup auto-save every 30 seconds
    setInterval(() => {
        if (window.app.currentPage !== 'landing' && !window._clearingData) {
            window.storage.saveData();
            console.log('💾 Auto-saved');
        }
    }, 30000);
    
    // Keep screen awake while app is open (prevent screen lock during work)
    initWakeLock();
    
    console.log('✅ App initialized');
});

/**
 * Screen Wake Lock - prevents Android screen from turning off
 * Uses Web Wake Lock API (Android WebView Chrome 84+)
 * Falls back to hidden video trick for older devices
 */
function initWakeLock() {
    let wakeLock = null;
    
    async function requestWakeLock() {
        // Method 1: Web Wake Lock API (preferred, modern Android)
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('🔆 Screen wake lock active (Wake Lock API)');
                wakeLock.addEventListener('release', () => {
                    console.log('🔆 Wake lock released');
                });
                return true;
            } catch (err) {
                console.warn('Wake Lock API failed:', err.message);
            }
        }
        
        // Method 2: Hidden video trick (fallback for older WebViews)
        try {
            if (!document.getElementById('wakeLockVideo')) {
                const video = document.createElement('video');
                video.id = 'wakeLockVideo';
                video.setAttribute('playsinline', '');
                video.setAttribute('muted', '');
                video.muted = true;
                video.loop = true;
                video.style.cssText = 'position:fixed;top:-1px;left:-1px;width:1px;height:1px;opacity:0.01;pointer-events:none;';
                // Minimal silent MP4 (base64)
                video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAChtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAACAAIASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAADFhdmNDAWQAFf/hABhnZAAVrNlBsJaEAAADAAQAAAMACDxYtlgBAAZo6+PLIsAAAAAbU1QAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAB8HN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU3LjgzLjEwMA==';
                document.body.appendChild(video);
                video.play().then(() => {
                    console.log('🔆 Screen wake lock active (video fallback)');
                }).catch(() => {
                    console.warn('Video wake lock failed');
                });
            }
            return true;
        } catch(e) {
            console.warn('Video fallback failed:', e);
        }
        return false;
    }
    
    // Request wake lock now
    requestWakeLock();
    
    // Re-acquire wake lock when user returns to app (visibility change)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        }
    });
    
    // Re-acquire on Cordova resume event
    document.addEventListener('resume', () => {
        requestWakeLock();
    }, false);
}

// Global helper functions
window.getTraineeName = function(index) {
    const names = [
        window.app.data.trainee1,
        window.app.data.trainee2,
        window.app.data.trainee3,
        window.app.data.trainee4
    ];
    return names[index] || 'חניך ' + (index + 1);
};

window.escapeHtml = function(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
};

window.csvEscape = function(text) {
    if (!text) return '';
    text = String(text);
    if (text.indexOf(',') !== -1 || text.indexOf('"') !== -1 || text.indexOf('\n') !== -1) {
        return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
};

// Make global navigation function
window.goToPage = function(pageId) {
    window.storage.saveData();
    window.router.navigate(pageId);
};

// Make global export functions
window.exportToExcel = async function() {
    console.log('📊 Exporting to Excel...');
    try {
        await window.exportManager.exportToExcel();
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ שגיאה בייצוא Excel:\n' + error.message);
    }
};

window.shareToWhatsApp = function() {
    console.log('📱 Sharing to WhatsApp...');
    try {
        window.exportManager.shareToWhatsApp();
    } catch (error) {
        console.error('Share error:', error);
        alert('❌ שגיאה בשיתוף:\n' + error.message);
    }
};

console.log('📦 App module loaded');

// Document Scanner - global functions for exercise pages
window.startDocScan = function() {
    const traineeIndex = window.app.currentTrainee;
    const exerciseIndex = window.app.currentExercise;
    window.docScanner.startScan(traineeIndex, exerciseIndex);
};

// Document Scanner - global function for summary page
window.startDocScanSummary = function() {
    const traineeIndex = window.app.currentSummaryTrainee;
    window.docScanner.startScan(traineeIndex, 'summary');
};

// Document Scanner - export functions (with trainee picker)
window.exportDocsZip = function() {
    window.docScanner.exportDocsZipWithPicker();
};

window.exportDocsLocal = function() {
    window.docScanner.exportDocsLocalWithPicker();
};

window.showDocsList = function() {
    window.docScanner.showDocsListWithPicker();
};

// Print Excel function - opens export popup
window.printExcel = function() {
    console.log('🖨️ Opening export popup...');
    
    // שמור נתונים ל-localStorage כדי שה-popup יוכל לגשת
    try {
        localStorage.setItem('feedbackAppData', JSON.stringify(window.app.data));
        
        // פתח popup
        window.open('export-popup.html', '_blank', 'width=500,height=600');
    } catch (error) {
        console.error('Export popup error:', error);
        alert('❌ שגיאה בפתיחת חלון ייצוא:\n' + error.message);
    }
};

// Open preview with Android share
window.openExcelPreview = function() {
    console.log('👁️ Opening preview...');
    window.goToPage('preview');
};

// Test Social Sharing Plugin with organized CSV by trainee
// Test Social Sharing Plugin with XLSX tabular format - WRITE FILE FIRST
window.testSocialSharing = function() {
    console.log('🧪 Testing Social Sharing Plugin...');
    
    if (!window.plugins || !window.plugins.socialsharing) {
        alert('❌ Social Sharing Plugin לא זמין!');
        return;
    }
    
    if (!window.cordova || !window.cordova.file) {
        alert('❌ File Plugin לא זמין!');
        return;
    }
    
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.xlsx`;
        
        // יצירת Excel
        const excelBuffer = window.generateTabularExcel(data);
        if (!excelBuffer) {
            alert('❌ שגיאה ביצירת Excel');
            return;
        }
        
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // כתיבה ל-cache
        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
            dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        // שתף את הקובץ
                        window.plugins.socialsharing.shareWithOptions({
                            message: 'משוב סדנת אימפרוביזציה',
                            files: [fileEntry.nativeURL],
                            chooserTitle: 'שתף Excel'
                        }, function() {
                            console.log('✅ Share success');
                        }, function(error) {
                            console.error('❌ Share failed:', error);
                            alert('❌ שיתוף נכשל');
                        });
                    };
                    
                    fileWriter.onerror = function(e) {
                        alert('❌ כתיבה נכשלה');
                    };
                    
                    fileWriter.write(blob);
                });
            });
        }, function(error) {
            alert('❌ גישה למערכת קבצים נכשלה');
        });
        
    } catch (error) {
        alert('❌ שגיאה: ' + error.message);
    }
};

// Test File Plugin - Save XLSX to Downloads
window.testFilePlugin = function() {
    console.log('🧪 Testing File Plugin...');
    
    if (!window.cordova || !window.cordova.file) {
        alert('❌ File Plugin לא זמין!');
        return;
    }
    
    try {
        const data = window.app.data;
        const evaluator = data.evaluatorName || 'מעריך';
        const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        const filename = `${evaluator}_${dateStr}.xlsx`;
        
        // יצירת Excel בפורמט טבלאי
        const excelBuffer = window.generateTabularExcel(data);
        
        if (!excelBuffer) {
            alert('❌ שגיאה ביצירת קובץ Excel');
            return;
        }
        
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // שמור לתיקיית Downloads
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Download/', function(dir) {
            dir.getFile(filename, { create: true }, function(file) {
                file.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        alert('✅ הקובץ נשמר ב-Downloads!\n\n' + filename);
                    };
                    fileWriter.onerror = function(e) {
                        alert('❌ שגיאת כתיבה:\n' + e.toString());
                    };
                    
                    fileWriter.write(blob);
                }, function(error) {
                    alert('❌ שגיאה ביצירת writer:\n' + error);
                });
            }, function(error) {
                alert('❌ שגיאה ביצירת קובץ:\n' + error);
            });
        }, function(error) {
            alert('❌ לא ניתן לגשת ל-Downloads:\n' + error);
        });
        
    } catch (error) {
        alert('❌ שגיאה:\n' + error.message);
    }
};

// Export admin JSON with 3 methods
window.exportAdminJSON = function() {
    console.log('📄 Exporting JSON via Social Share');
    
    // Save current admin fields first
    const assessmentInput = document.getElementById('assessmentName');
    if (assessmentInput) window.app.data.assessmentName = assessmentInput.value;
    for (let i = 1; i <= 4; i++) {
        const traineeInput = document.getElementById(`trainee${i}`);
        if (traineeInput) window.app.data[`trainee${i}`] = traineeInput.value;
    }
    const highlightsInput = document.getElementById('highlights');
    if (highlightsInput) window.app.data.highlights = highlightsInput.value;
    window.storage.saveData();
    
    // Build structured export (same format as loadFromJSON expects)
    const exportData = {
        metadata: {
            assessmentName: window.app.data.assessmentName,
            evaluatorName: window.app.data.evaluatorName,
            exportDate: new Date().toISOString(),
            appVersion: '5.4'
        },
        trainees: [],
        highlights: window.app.data.highlights,
        storeHistory: window.app.data.storeHistory,
        hotelHistory: window.app.data.hotelHistory
    };
    
    for (let t = 0; t < 4; t++) {
        exportData.trainees.push({
            id: t,
            name: window.app.data[`trainee${t + 1}`] || `חניך ${t + 1}`
        });
    }
    
    if (!window.cordova || !window.cordova.file || !window.plugins || !window.plugins.socialsharing) {
        // Fallback: download via blob
        try {
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `settings_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('✅ קובץ הגדרות יוצא!');
        } catch (e) {
            alert('❌ שגיאה: ' + e.message);
        }
        return;
    }
    
    try {
        const jsonStr = JSON.stringify(exportData, null, 2);
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `settings_${dateStr}.json`;
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        window.resolveLocalFileSystemURL(window.cordova.file.cacheDirectory, function(dirEntry) {
            dirEntry.getFile(filename, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        window.plugins.socialsharing.shareWithOptions({
                            files: [fileEntry.nativeURL],
                            chooserTitle: 'שתף קובץ הגדרות'
                        }, function() {
                            console.log('✅ Share success');
                        }, function(error) {
                            console.error('❌ Share failed:', error);
                        });
                    };
                    
                    fileWriter.onerror = function(e) {
                        console.error('❌ Write failed:', e);
                    };
                    
                    fileWriter.write(blob);
                });
            }, function(error) {
                console.error('❌ getFile failed:', error);
            });
        }, function(error) {
            console.error('❌ File system access failed:', error);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};






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
     * Save current app data to localStorage
     */
    saveData() {
        try {
            // Get all input values
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

            // Update primary trainees
            window.app.data.primaryTrainees = window.app.primaryTrainees;

            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(window.app.data));
            localStorage.setItem(this.primaryKey, JSON.stringify(window.app.primaryTrainees));

            console.log('💾 Data saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving data:', error);
            alert('שגיאה בשמירת נתונים. אנא וודא שיש מספיק שטח אחסון.');
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
     */
    clearAllData() {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו אינה ניתנת לביטול!')) {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.primaryKey);
            window.location.reload();
        }
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

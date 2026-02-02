/**
 * Summary Page Module
 * Final summary and export functionality
 */

import { ExportManager } from '../export.js';

export class SummaryPage {
    constructor() {
        this.exportManager = new ExportManager();
    }

    render() {
        return `
            <div class="container" id="summaryContainer">
                <h2 style="text-align: center;">סיכום הערכה</h2>
                
                <div class="trainee-tabs" id="summaryTabs"></div>
                <div class="criteria-list" id="criteriaList"></div>
                
                <div class="export-buttons">
                    <button class="btn btn-excel" onclick="openExportPopup('excel')">📊 ייצוא Excel</button>
                    <button class="btn btn-print" onclick="openExcelPreview()">👁️ תצוגה מקדימה + שיתוף</button>
                </div>
                
                <button class="btn btn-back" onclick="goToPage('assessment')" style="width: 100%;">
                    ⬅ חזור להערכה
                </button>
            </div>
        `;
    }

    onEnter() {
        this.renderSummaryTabs();
        this.selectSummaryTrainee(window.app.currentSummaryTrainee || 0);
        this.attachEventListeners();
    }

    renderSummaryTabs() {
        const container = document.getElementById('summaryTabs');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const div = document.createElement('div');
            div.className = 'trainee-tab';
            div.id = `summaryTab${i}`;
            div.textContent = window.getTraineeName(i);
            div.onclick = () => this.selectSummaryTrainee(i);
            container.appendChild(div);
        }
    }

    selectSummaryTrainee(index) {
        window.app.currentSummaryTrainee = index;
        
        // Update tab styles
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
        
        // Update container background
        const container = document.getElementById('summaryContainer');
        if (container) {
            container.style.backgroundColor = window.app.traineeColors[index];
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
                <div class="grid-2">
                    <div>
                        <label>ציון (1-7)</label>
                        <input type="number" min="1" max="7" step="0.5" 
                            value="${window.storage.getSummaryData(key, 'score')}" 
                            onchange="updateSummaryScore('${key}', this.value)">
                    </div>
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

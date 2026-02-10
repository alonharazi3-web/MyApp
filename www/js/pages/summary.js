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
            <div class="container" id="summaryContainer" style="padding-bottom: 65px;">
                <h2 style="text-align: center;">סיכום הערכה</h2>
                
                <div class="trainee-tabs" id="summaryTabs"></div>
                
                <button class="btn-scan scan-btn-summary" onclick="window.startDocScanSummary()">📷 סרוק מסמך</button>
                
                <div class="criteria-list" id="criteriaList"></div>
                
                <div class="export-buttons">
                    <button class="btn btn-excel" onclick="testSocialSharing()">📊 ייצוא Excel</button>
                    <button class="btn btn-print" onclick="openExcelPreview()">👁️ תצוגה מקדימה</button>
                </div>
                
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

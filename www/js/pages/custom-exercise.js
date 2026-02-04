/**
 * Custom Exercise Page Module
 * Dynamic exercise rendering based on type
 */

export class CustomExercisePage {
    constructor(exerciseData) {
        this.exercise = exerciseData;
    }

    render() {
        const traineeIndex = window.app.currentTrainee;
        const traineeName = window.app.data[`trainee${traineeIndex + 1}`] || `חניך ${traineeIndex + 1}`;
        const traineeColor = window.app.traineeColors[traineeIndex];

        return `
            <div class="container">
                <div style="background: ${traineeColor}; color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: white;">${window.escapeHtml(this.exercise.name)}</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">${window.escapeHtml(traineeName)}</p>
                </div>

                ${this.renderExerciseContent()}

                <div class="nav-buttons">
                    <button class="btn btn-back" onclick="goToPage('assessment')">⬅ חזור</button>
                    <button class="btn btn-forward" onclick="saveCustomExerciseAndNext()">קדימה ➡</button>
                </div>
            </div>
        `;
    }

    renderExerciseContent() {
        const traineeIndex = window.app.currentTrainee;
        const exerciseKey = `custom_${this.exercise.id}_${traineeIndex}`;
        const savedData = window.app.data.exerciseData[exerciseKey] || {};

        switch (this.exercise.type) {
            case 'story':
                return `
                    <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="color: #667eea; margin-top: 0;">📖 סיפור מעשה</h3>
                        <p style="white-space: pre-wrap; line-height: 1.6;">${window.escapeHtml(this.exercise.story || '')}</p>
                    </div>
                    <p style="color: #666; text-align: center;">לחץ "קדימה" כאשר החניך סיים לקרוא</p>
                `;

            case 'instructions':
                return `
                    <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #ffc107;">
                        <h3 style="color: #856404; margin-top: 0;">📋 הנחיות למעריך</h3>
                        <p style="white-space: pre-wrap; line-height: 1.6; color: #856404;">${window.escapeHtml(this.exercise.instructions || '')}</p>
                    </div>
                `;

            case 'yesno':
                return `
                    <div style="margin-bottom: 20px;">
                        <label style="font-size: 18px; font-weight: bold; display: block; margin-bottom: 15px;">
                            ${window.escapeHtml(this.exercise.question || '')}
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button 
                                class="option-btn ${savedData.answer === 'yes' ? 'selected' : ''}" 
                                onclick="selectYesNo('${exerciseKey}', 'yes')"
                                id="btn-yes">
                                ✓ כן
                            </button>
                            <button 
                                class="option-btn ${savedData.answer === 'no' ? 'selected' : ''}" 
                                onclick="selectYesNo('${exerciseKey}', 'no')"
                                id="btn-no">
                                ✗ לא
                            </button>
                        </div>
                    </div>
                `;

            case 'yesno-text':
                return `
                    <div style="margin-bottom: 20px;">
                        <label style="font-size: 18px; font-weight: bold; display: block; margin-bottom: 15px;">
                            ${window.escapeHtml(this.exercise.question || '')}
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <button 
                                class="option-btn ${savedData.answer === 'yes' ? 'selected' : ''}" 
                                onclick="selectYesNo('${exerciseKey}', 'yes')"
                                id="btn-yes">
                                ✓ כן
                            </button>
                            <button 
                                class="option-btn ${savedData.answer === 'no' ? 'selected' : ''}" 
                                onclick="selectYesNo('${exerciseKey}', 'no')"
                                id="btn-no">
                                ✗ לא
                            </button>
                        </div>
                        <label>הערות נוספות:</label>
                        <textarea id="custom-text" rows="4">${window.escapeHtml(savedData.text || '')}</textarea>
                    </div>
                `;

            case 'text':
                return `
                    <div style="margin-bottom: 20px;">
                        <label style="font-size: 18px; font-weight: bold; display: block; margin-bottom: 15px;">
                            ${window.escapeHtml(this.exercise.question || '')}
                        </label>
                        <textarea id="custom-text" rows="6" placeholder="הכנס תשובה...">${window.escapeHtml(savedData.text || '')}</textarea>
                    </div>
                `;

            case 'scale':
                return `
                    <div style="margin-bottom: 20px;">
                        <label style="font-size: 18px; font-weight: bold; display: block; margin-bottom: 15px;">
                            ${window.escapeHtml(this.exercise.question || '')}
                        </label>
                        <div style="display: flex; gap: 8px; justify-content: center; margin: 20px 0;">
                            ${[1, 2, 3, 4, 5, 6, 7].map(num => `
                                <button 
                                    class="scale-btn ${savedData.scale === num ? 'selected' : ''}" 
                                    onclick="selectScale('${exerciseKey}', ${num})"
                                    id="scale-${num}">
                                    ${num}
                                </button>
                            `).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; color: #666; font-size: 13px;">
                            <span>חלש</span>
                            <span>חזק</span>
                        </div>
                    </div>
                `;

            default:
                return '<p>סוג תרגיל לא ידוע</p>';
        }
    }

    onEnter() {
        // Add event listeners for dynamic interactions
        const traineeIndex = window.app.currentTrainee;
        const exerciseKey = `custom_${this.exercise.id}_${traineeIndex}`;

        window.selectYesNo = (key, value) => {
            if (!window.app.data.exerciseData[key]) {
                window.app.data.exerciseData[key] = {};
            }
            window.app.data.exerciseData[key].answer = value;
            
            // Update UI
            document.getElementById('btn-yes')?.classList.toggle('selected', value === 'yes');
            document.getElementById('btn-no')?.classList.toggle('selected', value === 'no');
            
            window.storage.saveData();
        };

        window.selectScale = (key, value) => {
            if (!window.app.data.exerciseData[key]) {
                window.app.data.exerciseData[key] = {};
            }
            window.app.data.exerciseData[key].scale = value;
            
            // Update UI
            for (let i = 1; i <= 7; i++) {
                document.getElementById(`scale-${i}`)?.classList.toggle('selected', i === value);
            }
            
            window.storage.saveData();
        };

        window.saveCustomExerciseAndNext = () => {
            // Save text if exists
            const textArea = document.getElementById('custom-text');
            if (textArea) {
                if (!window.app.data.exerciseData[exerciseKey]) {
                    window.app.data.exerciseData[exerciseKey] = {};
                }
                window.app.data.exerciseData[exerciseKey].text = textArea.value;
            }
            
            window.storage.saveData();
            window.goToPage('assessment');
        };
    }
}

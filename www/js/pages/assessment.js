/**
 * Assessment Page Module v5.4
 * Main assessment interface with trainee and exercise tabs
 * Now includes camera scan buttons at top and bottom of each exercise
 */

import { BalloonExercise } from '../exercises/balloon.js';
import { TiachExercise } from '../exercises/tiach.js';
import { DoliraExercise } from '../exercises/dolira.js';
import { DavidExercise } from '../exercises/david.js';
import { LailaExercise } from '../exercises/laila.js';
import { MichtavExercise } from '../exercises/michtav.js';
import { YominetExercise } from '../exercises/yominet.js';

export class AssessmentPage {
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

    render() {
        return `
            <div class="container" id="assessmentContainer">
                <div class="assessment-header">
                    <h3 id="assessmentTitle">${window.app.data.assessmentName || 'הערכה'}</h3>
                    <p id="evaluatorDisplay">מעריך: ${window.app.data.evaluatorName || ''}</p>
                </div>
                
                <div class="trainee-tabs" id="traineeTabs"></div>
                <div class="exercise-tabs" id="exerciseTabs"></div>
                <div class="exercise-content" id="exerciseContent"></div>
                
                <div class="nav-buttons">
                    <button class="btn btn-back" onclick="goToPage('evaluator')">⬅ אחורה</button>
                    <button class="btn btn-forward" onclick="goToPage('summary')">קדימה ➡</button>
                </div>
            </div>
        `;
    }

    onEnter() {
        this.renderTraineeTabs();
        this.renderExerciseTabs();
        this.selectTrainee(window.app.currentTrainee || 0);
        this.selectExercise(window.app.currentExercise || 0);
    }

    renderTraineeTabs() {
        const container = document.getElementById('traineeTabs');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const div = document.createElement('div');
            div.className = 'trainee-tab';
            div.id = `traineeTab${i}`;
            div.textContent = window.getTraineeName(i);
            div.onclick = () => this.selectTrainee(i);
            container.appendChild(div);
        }
    }

    renderExerciseTabs() {
        const container = document.getElementById('exerciseTabs');
        if (!container) return;
        container.innerHTML = '';
        const exerciseNames = window.app.exercises;
        exerciseNames.forEach((exerciseName, i) => {
            const btn = document.createElement('button');
            btn.className = 'exercise-tab';
            btn.id = `exerciseTab${i}`;
            btn.textContent = exerciseName;
            btn.onclick = () => this.selectExercise(i);
            container.appendChild(btn);
        });
    }

    selectTrainee(index) {
        window.app.currentTrainee = index;
        for (let i = 0; i < 4; i++) {
            const tab = document.getElementById(`traineeTab${i}`);
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
        const container = document.getElementById('assessmentContainer');
        if (container) {
            container.style.backgroundColor = window.app.traineeColors[index];
            container.style.transition = 'background-color 0.3s';
        }
        this.renderCurrentExercise();
    }

    selectExercise(index) {
        window.app.currentExercise = index;
        const exerciseNames = window.app.exercises;
        exerciseNames.forEach((_, i) => {
            const tab = document.getElementById(`exerciseTab${i}`);
            if (!tab) return;
            if (i === index) { tab.classList.add('active'); }
            else { tab.classList.remove('active'); }
        });
        this.renderCurrentExercise();
    }

    renderCurrentExercise() {
        const content = document.getElementById('exerciseContent');
        if (!content) return;

        const traineeId = window.app.currentTrainee;
        const exerciseId = window.app.currentExercise;
        const exercise = this.exercises[exerciseId];
        
        if (exercise) {
            // Build content with camera buttons at top and bottom
            const scanBtnTop = window.documentScanner.renderCameraButton(exerciseId);
            const exerciseHtml = exercise.render(traineeId, exerciseId);
            
            const scanCount = window.documentScanner.getScanCount(traineeId);
            const scanBtnBottom = `
                <div class="scan-bottom-row">
                    <button class="scan-camera-btn" onclick="window.documentScanner.openScanDialog(${exerciseId})" 
                            style="width: auto; border-radius: 25px; padding: 8px 20px; font-size: 15px;">
                        📷 סרוק מסמך${scanCount > 0 ? ' (' + scanCount + ')' : ''}
                    </button>
                </div>
            `;
            
            content.innerHTML = `
                <div class="scan-top-row">${scanBtnTop}</div>
                ${exerciseHtml}
                ${scanBtnBottom}
            `;
            
            if (exercise.onRender) {
                setTimeout(() => exercise.onRender(traineeId, exerciseId), 0);
            } else if (exercise.onEnter) {
                setTimeout(() => exercise.onEnter(), 0);
            }
        } else {
            content.innerHTML = '<p>תרגיל לא נמצא</p>';
        }
    }

    onLeave() {
        window.storage.saveData();
    }
}

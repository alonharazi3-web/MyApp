/**
 * Assessment Page Module v5.7
 * Primary trainee priority, quick-switch bar, modern design
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

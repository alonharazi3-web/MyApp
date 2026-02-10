/**
 * Balloon Exercise Module - תרגיל בלון
 */

export class BalloonExercise {
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

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
            html += `
                <div class="question-block">
                    <div class="question-title">${score}</div>
                    <input type="number" min="1" max="7" step="0.5" 
                        value="${window.escapeHtml(this.getData(key, `score_${i}`))}" 
                        onchange="setExerciseData('${key}', 'score_${i}', this.value)">
                </div>
            `;
        });
        
        return html;
    }

    getData(key, field) {
        return window.storage.getExerciseData(key.split('-')[0], key.split('-')[1], field);
    }

    onRender(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        // Make setExerciseData global for this exercise
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}

/**
 * David Exercise Module - תרגיל דויד
 */

export class DavidExercise {
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
        return `
            <div class="question-block">
                <div class="question-title">${title}</div>
                <input type="number" min="1" max="7" step="0.5" value="${value}" 
                    onchange="setExerciseData('${key}', '${field}', this.value)">
            </div>
        `;
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

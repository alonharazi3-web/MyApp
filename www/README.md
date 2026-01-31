# מערכת משוב סדנה - PWA מודולרי

## 📋 תוכן עניינים
- [מבנה הפרויקט](#מבנה-הפרויקט)
- [התקנה ושימוש](#התקנה-ושימוש)
- [איך לערוך תרגיל](#איך-לערוך-תרגיל)
- [איך להוסיף תרגיל חדש](#איך-להוסיף-תרגיל-חדש)
- [איך לשנות עיצוב](#איך-לשנות-עיצוב)
- [טיפים לפיתוח](#טיפים-לפיתוח)

---

## 🗂️ מבנה הפרויקט

```
feedback-app/
├── index.html              # דף הבית
├── manifest.json           # הגדרות PWA
├── service-worker.js       # עבודה אופליין
├── css/
│   └── styles.css         # כל העיצוב
├── js/
│   ├── app.js             # נקודת כניסה ראשית
│   ├── storage.js         # ניהול נתונים
│   ├── export.js          # ייצוא Excel/WhatsApp
│   ├── router.js          # ניווט בין עמודים
│   ├── pages/             # עמודי האפליקציה
│   │   ├── landing.js     # דף הבחירה (מעריך/מנהל)
│   │   ├── admin.js       # דף מנהל
│   │   ├── evaluator.js   # דף מעריך
│   │   ├── assessment.js  # דף הערכה
│   │   └── summary.js     # דף סיכום
│   └── exercises/         # מודולי תרגילים
│       ├── balloon.js     # תרגיל בלון
│       ├── tiach.js       # תרגיל טיח
│       ├── dolira.js      # תרגיל דולירה
│       ├── david.js       # תרגיל דויד
│       ├── laila.js       # תרגיל לילה
│       ├── michtav.js     # תרגיל מכתב
│       └── yominet.js     # תרגיל יומינט
└── README.md              # מדריך זה
```

---

## 🚀 התקנה ושימוש

### דרישות מקדימות
- שרת אינטרנט (כמו Apache, Nginx, או Python SimpleHTTPServer)
- דפדפן מודרני (Chrome, Firefox, Edge)

### התקנה מקומית

**1. הורדת הקבצים**
```bash
# העתק את כל התיקייה feedback-app למחשב שלך
```

**2. הפעלת שרת מקומי**

**אפשרות א': Python (מומלץ)**
```bash
cd feedback-app
python -m http.server 8000
```

**אפשרות ב': Node.js**
```bash
npm install -g http-server
cd feedback-app
http-server -p 8000
```

**אפשרות ג': PHP**
```bash
cd feedback-app
php -S localhost:8000
```

**3. פתיחה בדפדפן**
```
http://localhost:8000
```

---

## ✏️ איך לערוך תרגיל קיים

### דוגמה: עריכת תרגיל "בלון"

**1. פתח את הקובץ:**
```
js/exercises/balloon.js
```

**2. מצא את המקום שרוצה לערוך:**

```javascript
export class BalloonExercise {
    constructor() {
        this.name = 'בלון';  // שינוי השם
        this.scores = [       // שינוי רשימת הציונים
            'גמישות מחשבתית',
            'יכולת תכנון',
            // הוסף או הסר פריטים כאן
        ];
    }

    render(traineeId, exerciseId) {
        // כאן נמצא ה-HTML של התרגיל
        let html = `<h4>${this.name}</h4>`;
        
        // הוספת שדה חדש:
        html += `
            <div class="question-block">
                <div class="question-title">שאלה חדשה</div>
                <textarea onchange="setExerciseData('${key}', 'newField', this.value)">
                    ${this.getData(key, 'newField')}
                </textarea>
            </div>
        `;
        
        return html;
    }
}
```

**3. שמור את הקובץ ורענן את הדפדפן**

---

## ➕ איך להוסיף תרגיל חדש

### שלב 1: יצירת קובץ התרגיל

**צור קובץ חדש:**
```
js/exercises/new-exercise.js
```

**תבנית בסיסית:**
```javascript
/**
 * New Exercise Module - תרגיל חדש
 */

export class NewExercise {
    constructor() {
        this.name = 'שם התרגיל';
    }

    render(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        let html = `<h4>${this.name}</h4>`;
        
        // מטרות התרגיל
        html += `
            <div class="exercise-goals">
                <h4>🎯 מטרות:</h4>
                כאן תכתוב את מטרות התרגיל
            </div>
        `;
        
        // שאלה פשוטה
        html += `
            <div class="question-block">
                <div class="question-title">שאלה ראשונה</div>
                <textarea onchange="setExerciseData('${key}', 'question1', this.value)">
                    ${this.getData(key, 'question1')}
                </textarea>
            </div>
        `;
        
        // בחירה מרובה (רדיו)
        html += `
            <div class="question-block">
                <div class="question-title">בחר אפשרות</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="${key}_choice" value="אופציה 1"
                            ${this.getData(key, 'choice') === 'אופציה 1' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'choice', this.value)">
                        אופציה 1
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${key}_choice" value="אופציה 2"
                            ${this.getData(key, 'choice') === 'אופציה 2' ? 'checked' : ''}
                            onchange="setExerciseData('${key}', 'choice', this.value)">
                        אופציה 2
                    </label>
                </div>
            </div>
        `;
        
        // ציון מספרי
        html += `
            <div class="question-block">
                <div class="question-title">ציון (1-7)</div>
                <input type="number" min="1" max="7" step="0.5"
                    value="${this.getData(key, 'score')}"
                    onchange="setExerciseData('${key}', 'score', this.value)">
            </div>
        `;
        
        return html;
    }

    getData(key, field) {
        const [tId, eId] = key.split('-');
        return window.storage.getExerciseData(tId, eId, field);
    }

    onRender(traineeId, exerciseId) {
        const key = `${traineeId}-${exerciseId}`;
        
        window.setExerciseData = (k, field, value) => {
            const [tId, eId] = k.split('-');
            window.storage.setExerciseData(parseInt(tId), parseInt(eId), field, value);
        };
    }
}
```

### שלב 2: רישום התרגיל באפליקציה

**פתח את הקובץ:**
```
js/pages/assessment.js
```

**הוסף את הייבוא:**
```javascript
import { NewExercise } from '../exercises/new-exercise.js';
```

**הוסף לרשימת התרגילים:**
```javascript
constructor() {
    this.exercises = [
        new BalloonExercise(),
        new TiachExercise(),
        // ... תרגילים אחרים
        new NewExercise()  // ← הוסף כאן
    ];
}
```

### שלב 3: עדכון רשימת שמות התרגילים

**פתח את הקובץ:**
```
js/app.js
```

**עדכן את המערך:**
```javascript
exercises: ['בלון', 'טיח', 'דולירה', 'דויד', 'לילה', 'מכתב', 'יומינט', 'שם התרגיל החדש']
```

### שלב 4: בדיקה
1. שמור את כל הקבצים
2. רענן את הדפדפן (Ctrl+F5)
3. היכנס לדף הערכה
4. בדוק שהתרגיל החדש מופיע בטאבים

---

## 🎨 איך לשנות עיצוב

כל העיצוב נמצא בקובץ אחד: `css/styles.css`

### דוגמאות לשינויים נפוצים:

**שינוי צבעים:**
```css
/* מצא את: */
.btn-evaluator {
    background: #667eea;  /* ← שנה צבע כאן */
}

/* או שנה את צבעי החניכים ב-js/app.js: */
traineeColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
```

**שינוי גודל טקסט:**
```css
h1 {
    font-size: 28px;  /* ← שנה גודל */
}

.question-title {
    font-size: 13px;  /* ← גודל כותרות שאלות */
}
```

**שינוי רווחים:**
```css
.container {
    padding: 20px;  /* ← רווח פנימי */
}

.question-block {
    margin-bottom: 12px;  /* ← רווח בין שאלות */
}
```

---

## 💡 טיפים לפיתוח

### 1. השתמש ב-Console לדיבאג
```javascript
// הוסף לכל פונקציה שרוצה לבדוק:
console.log('הערך:', value);
console.log('המפתח:', key);
console.log('הנתונים:', window.app.data);
```

### 2. בדיקת נתונים שמורים
```javascript
// פתח Console בדפדפן (F12) והקלד:
localStorage.getItem('feedbackAppData')
```

### 3. איפוס נתונים
```javascript
// ב-Console:
localStorage.clear()
location.reload()
```

### 4. בדיקת שגיאות
- פתח Console (F12)
- חפש שורות באדום 🔴
- השגיאה תכלול:
  - שם הקובץ
  - מספר שורה
  - תיאור הבעיה

### 5. מבנה מפתח (Key) לנתונים
```
חניך-תרגיל-שדה

דוגמאות:
0-0-impression  → חניך 1, תרגיל בלון, התרשמות
2-3-q1_0        → חניך 3, תרגיל דויד, שאלה 1
```

### 6. פונקציות עזר שימושיות
```javascript
// קבלת שם חניך
window.getTraineeName(0)  // → "שם חניך 1"

// Escape HTML
window.escapeHtml("<script>")  // → "&lt;script&gt;"

// CSV Escape
window.csvEscape("text, with comma")  // → '"text, with comma"'

// שמירת נתונים
window.storage.saveData()

// טעינת נתונים
window.storage.loadData()
```

---

## 🔧 פתרון בעיות נפוצות

### הכפתורים לא עובדים
```bash
# בדוק ב-Console שגיאות JavaScript
# וודא ששמות הפונקציות תואמים
```

### הנתונים לא נשמרים
```javascript
// בדוק שיש שמירה אוטומטית:
setInterval(() => {
    window.storage.saveData();
}, 30000);  // כל 30 שניות
```

### התרגיל לא מופיע
```bash
# וודא שהוספת:
# 1. import בקובץ assessment.js
# 2. new Exercise() ברשימת exercises
# 3. שם התרגיל במערך exercises ב-app.js
```

### שגיאת "module not found"
```bash
# וודא שהשרת רץ ושהנתיב נכון:
# /js/exercises/exercise-name.js
```

---

## 📱 פרסום כ-PWA

### התקנה במכשיר אנדרואיד:

1. פתח את האפליקציה בדפדפן Chrome
2. לחץ על תפריט (⋮)
3. בחר "הוסף למסך הבית"
4. האפליקציה תיפתח כאפליקציה רגילה!

### עבודה אופליין:

האפליקציה עובדת אוטומטית בלי אינטרנט אחרי הכניסה הראשונה!

---

## 📞 תמיכה

אם יש בעיות או שאלות:
1. בדוק את Console לשגיאות
2. קרא את המדריך לעיל
3. בדוק את הקבצים דומים לדוגמה

---

## 🎯 סיכום מהיר

| מה רוצה לעשות? | איפה לערוך? |
|----------------|--------------|
| שינוי תרגיל | `js/exercises/exercise-name.js` |
| הוספת תרגיל | צור קובץ חדש + עדכן `assessment.js` |
| שינוי עיצוב | `css/styles.css` |
| שינוי לוגיקה | `js/storage.js`, `js/export.js` |
| שינוי עמוד | `js/pages/page-name.js` |

---

**בהצלחה! 🚀**

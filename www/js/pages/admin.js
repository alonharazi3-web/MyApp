/**
 * Admin Page Module
 * Configuration and history management
 */

export class AdminPage {
    render() {
        return `
            <div class="container">
                <h2>דף מנהל</h2>
                
                <div style="margin-bottom: 15px;">
                    <label>שם ההערכה</label>
                    <input type="text" id="assessmentName" value="${window.escapeHtml(window.app.data.assessmentName)}">
                </div>
                
                <div class="grid-2">
                    <div>
                        <label>חניך 1</label>
                        <input type="text" id="trainee1" value="${window.escapeHtml(window.app.data.trainee1)}">
                    </div>
                    <div>
                        <label>חניך 2</label>
                        <input type="text" id="trainee2" value="${window.escapeHtml(window.app.data.trainee2)}">
                    </div>
                    <div>
                        <label>חניך 3</label>
                        <input type="text" id="trainee3" value="${window.escapeHtml(window.app.data.trainee3)}">
                    </div>
                    <div>
                        <label>חניך 4</label>
                        <input type="text" id="trainee4" value="${window.escapeHtml(window.app.data.trainee4)}">
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <label>דגשים</label>
                    <textarea id="highlights" rows="4">${window.escapeHtml(window.app.data.highlights)}</textarea>
                </div>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    ניהול היסטוריית חנויות (טיח)
                </h3>
                <div id="storeHistoryList" class="history-list"></div>
                <button class="btn-add" onclick="addStoreToAdmin()">הוסף חנות</button>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">
                    ניהול היסטוריית מלונות (יומינט)
                </h3>
                <div id="hotelHistoryList" class="history-list"></div>
                <button class="btn-add" onclick="addHotelToAdmin()">הוסף מלון</button>
                
                <h3 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #eee;">

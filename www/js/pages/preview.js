/**
 * Preview Page Module
 * Excel preview before export
 */

export class PreviewPage {
    render() {
        return `
            <div class="container">
                <h2>👁️ תצוגה מקדימה - Excel</h2>
                
                <div id="preview-content" style="overflow-x: auto; margin: 20px 0; background: white; padding: 15px; border-radius: 10px;">
                    <p>טוען נתונים...</p>
                </div>
                
                <div class="nav-buttons">
                    <button class="btn btn-back" onclick="goToPage('summary')">⬅ חזור</button>
                </div>
            </div>
        `;
    }

    onEnter() {
        this.loadPreview();
    }

    loadPreview() {
        const previewDiv = document.getElementById('preview-content');
        
        try {
            const data = window.app.data;
            
            if (typeof window.generateTabularExcel === 'function' && typeof XLSX !== 'undefined') {
                const excelBuffer = window.generateTabularExcel(data);
                
                if (excelBuffer) {
                    // המר ל-workbook
                    const wb = XLSX.read(excelBuffer, {type: 'array'});
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    
                    // המר ל-HTML
                    const html = XLSX.utils.sheet_to_html(ws);
                    previewDiv.innerHTML = html;
                } else {
                    previewDiv.innerHTML = '<p style="color:red;">❌ שגיאה ביצירת Excel</p>';
                }
            } else {
                previewDiv.innerHTML = '<p style="color:red;">❌ SheetJS לא נטען</p>';
            }
        } catch (error) {
            console.error('Preview error:', error);
            previewDiv.innerHTML = '<p style="color:red;">❌ שגיאה: ' + error.message + '</p>';
        }
    }
}

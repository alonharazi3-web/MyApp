/**
 * Landing Page Module
 * Initial page with evaluator/admin selection
 */

export class LandingPage {
    render() {
        return `
            <div class="container">
                <div style="text-align: center; margin: 30px 0;">
                    <img src="logo.png" alt="סדנת אימפרוב" style="max-width: 90%; height: auto; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                </div>
                <div class="landing-buttons">
                    <button class="btn-large btn-evaluator" onclick="goToPage('evaluator')">
                        מעריך
                    </button>
                    <button class="btn-large btn-admin" onclick="goToPage('admin')">
                        מנהל
                    </button>
                </div>
            </div>
        `;
    }

    onEnter() {
        console.log('📱 Landing page loaded');
    }
}

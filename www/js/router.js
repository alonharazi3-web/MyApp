/**
 * Router Module
 * Handles page navigation and rendering
 */

export class Router {
    constructor() {
        this.pages = {};
        this.currentPage = null;
    }

    /**
     * Register a page with the router
     */
    register(name, page) {
        this.pages[name] = page;
        console.log(`📄 Page registered: ${name}`);
    }

    /**
     * Navigate to a specific page
     */
    navigate(pageName) {
        if (!this.pages[pageName]) {
            console.error(`❌ Page not found: ${pageName}`);
            return;
        }

        // Save data before navigation
        if (this.currentPage && this.pages[this.currentPage].onLeave) {
            this.pages[this.currentPage].onLeave();
        }

        // Update current page
        window.app.currentPage = pageName;
        this.currentPage = pageName;

        // Render new page
        const appContainer = document.getElementById('app');
        const html = this.pages[pageName].render();
        appContainer.innerHTML = html;

        // Call onEnter hook if exists
        if (this.pages[pageName].onEnter) {
            setTimeout(() => {
                this.pages[pageName].onEnter();
            }, 0);
        }

        console.log(`🔀 Navigated to: ${pageName}`);
    }

    /**
     * Get current page name
     */
    getCurrentPage() {
        return this.currentPage;
    }
}

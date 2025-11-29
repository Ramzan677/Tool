// Enhanced Authentication System
const CORRECT_PASSWORD = 'SUFYANXRAMZAN';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class AuthenticationSystem {
    constructor() {
        this.initializeEventListeners();
        this.checkExistingSession();
    }

    initializeEventListeners() {
        const passwordInput = document.getElementById('password-input');
        const loginBtn = document.getElementById('login-btn');
        
        // Enter key support
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.attemptLogin();
            }
        });
        
        // Login button click
        loginBtn.addEventListener('click', () => {
            this.attemptLogin();
        });
        
        // Prevent right-click and inspect element
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent F12, Ctrl+Shift+I, etc.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                return false;
            }
        });
    }

    attemptLogin() {
        const passwordInput = document.getElementById('password-input');
        const errorMessage = document.getElementById('error-message');
        const enteredPassword = passwordInput.value.trim();
        
        // Clear previous errors
        errorMessage.textContent = '';
        passwordInput.classList.remove('error');
        
        if (!enteredPassword) {
            this.showError('Please enter the access password');
            return;
        }
        
        // Simple obfuscation check
        if (this.verifyPassword(enteredPassword)) {
            this.startSession();
            this.showMainContent();
        } else {
            this.showError('Invalid password. Access denied.');
            // Clear input after failed attempt
            passwordInput.value = '';
            this.shakeAuthForm();
        }
    }

    verifyPassword(input) {
        // Basic obfuscation - not secure but adds a layer
        const normalizedInput = input.toUpperCase().replace(/\s/g, '');
        return normalizedInput === CORRECT_PASSWORD;
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        const passwordInput = document.getElementById('password-input');
        
        errorMessage.textContent = message;
        passwordInput.classList.add('error');
    }

    shakeAuthForm() {
        const authContainer = document.querySelector('.auth-container');
        authContainer.classList.add('shake');
        setTimeout(() => {
            authContainer.classList.remove('shake');
        }, 500);
    }

    startSession() {
        const sessionData = {
            authenticated: true,
            timestamp: Date.now()
        };
        
        // Store session in localStorage with obfuscation
        const obfuscatedData = btoa(JSON.stringify(sessionData));
        localStorage.setItem('bp_session', obfuscatedData);
        
        // Set timeout for automatic logout
        this.sessionTimer = setTimeout(() => {
            this.logout();
        }, SESSION_TIMEOUT);
    }

    checkExistingSession() {
        try {
            const sessionData = localStorage.getItem('bp_session');
            if (sessionData) {
                const decodedData = JSON.parse(atob(sessionData));
                const timeDiff = Date.now() - decodedData.timestamp;
                
                if (decodedData.authenticated && timeDiff < SESSION_TIMEOUT) {
                    this.showMainContent();
                    // Reset timer
                    this.startSession();
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            this.clearSession();
        }
    }

    showMainContent() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        
        // Load tools after authentication
        this.loadTools();
        this.initializeSearch();
    }

    loadTools() {
        const toolsContainer = document.getElementById('tools-container');
        
        // Group tools by category
        const categories = {};
        ENCRYPTED_TOOLS_DATA.forEach(tool => {
            if (!categories[tool.category]) {
                categories[tool.category] = [];
            }
            categories[tool.category].push(tool);
        });
        
        // Generate HTML for each category
        let toolsHTML = '';
        for (const [categoryName, tools] of Object.entries(categories)) {
            toolsHTML += this.generateCategoryHTML(categoryName, tools);
        }
        
        toolsContainer.innerHTML = toolsHTML;
    }

    generateCategoryHTML(categoryName, tools) {
        return `
            <h2 class="category-title">${categoryName}</h2>
            <div class="tools-grid">
                ${tools.map(tool => this.generateToolCardHTML(tool)).join('')}
            </div>
        `;
    }

    generateToolCardHTML(tool) {
        const isExternal = tool.external || false;
        const onClick = isExternal ? 
            `window.open('${tool.link}', '_blank')` : 
            `downloadTool('${tool.name}', '${tool.link}')`;
        
        return `
            <div class="tool-card" onclick="${onClick}">
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-name">${tool.name}</div>
                <div class="tool-description">${tool.description}</div>
                <div class="tool-status">${tool.status}</div>
            </div>
        `;
    }

    initializeSearch() {
        const searchBox = document.querySelector('.search-box');
        
        searchBox.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const toolCards = document.querySelectorAll('.tool-card');
            
            toolCards.forEach(card => {
                const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
                const toolDesc = card.querySelector('.tool-description').textContent.toLowerCase();
                
                if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    logout() {
        this.clearSession();
        document.getElementById('main-content').classList.add('hidden');
        document.getElementById('auth-screen').classList.remove('hidden');
        
        // Clear password field
        document.getElementById('password-input').value = '';
    }

    clearSession() {
        localStorage.removeItem('bp_session');
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
    }
}

// Global functions
function logout() {
    authSystem.logout();
}

function downloadTool(name, url) {
    // Enhanced download function with security checks
    if (!url || !url.startsWith('http')) {
        console.error('Invalid URL');
        return;
    }
    
    // Open in new tab for external resources
    window.open(url, '_blank');
}

// Initialize authentication system when DOM is loaded
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthenticationSystem();
});

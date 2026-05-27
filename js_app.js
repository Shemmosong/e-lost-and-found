import { getCurrentUser, logout, showToast, getRecords, DB, formatLocation, formatDate, deleteRecord } from './js_utils.js';

/* Homepage & General App Functions */

document.addEventListener('DOMContentLoaded', () => {
    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you for your message! We will respond soon.');
            contactForm.reset();
        });
    }
    
    // Update navigation based on login status
    updateNavigationLinks();
});

function updateNavigationLinks() {
    const user = getCurrentUser();
    const navMenu = document.getElementById('navMenu');
    
    if (!navMenu) return;
    
    const loginBtn = navMenu.querySelector('.btn-login');
    const registerBtn = navMenu.querySelector('.btn-register');
    
    if (user) {
        // User is logged in
        if (loginBtn) {
            loginBtn.textContent = `${user.fullName}`;
            loginBtn.href = 'pages_profile.html';
        }
        if (registerBtn) {
            registerBtn.textContent = 'Logout';
            registerBtn.href = '#';
            registerBtn.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        }
    } else {
        // User is not logged in
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.href = 'auth_login.html';
        }
        if (registerBtn) {
            registerBtn.textContent = 'Register';
            registerBtn.href = 'auth_register.html';
        }
    }
}

/**
 * Fetch and update dashboard metrics
 * Fetches total counts from Firestore collections and updates the UI
 */
async function refreshDashboardMetrics() {
    try {
        // Fetch all item records from Firestore
        const lostItems = (await getRecords(DB.lostItems)).filter(i => i.status !== 'recovered');
        const foundItems = (await getRecords(DB.foundItems)).filter(i => i.status !== 'claimed');
        const claims = (await getRecords(DB.claims)).filter(c => c.status === 'completed');
        
        // Update dashboard metric elements if they exist
        const lostCountEl = document.getElementById('lostCount');
        const foundCountEl = document.getElementById('foundCount');
        const claimCountEl = document.getElementById('claimCount');
        
        if (lostCountEl) lostCountEl.textContent = lostItems.length;
        if (foundCountEl) foundCountEl.textContent = foundItems.length;
        if (claimCountEl) claimCountEl.textContent = claims.length;
        
        return {
            lostItems,
            foundItems,
            claims
        };
    } catch (error) {
        console.error('Error refreshing dashboard metrics:', error);
        return null;
    }
}

// Expose refreshDashboardMetrics to window for external use
if (typeof window !== 'undefined') {
    window.refreshDashboardMetrics = refreshDashboardMetrics;
}

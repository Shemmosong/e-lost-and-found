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

/**
 * Find potential matches between lost and found items
 * Compares category and extracts keywords from descriptions
 * @param {Array} lostItems - Array of lost item objects
 * @param {Array} foundItems - Array of found item objects
 * @returns {Object} Map of item IDs to their matching items
 */
function findMatches(lostItems, foundItems) {
    const matches = {};
    
    // Common stop words to ignore when comparing descriptions
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
        'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
        'as', 'if', 'about', 'also', 'very', 'not', 'no', 'yes', 'e.g', 'etc', 'includes', 'includes'
    ]);

    /**
     * Extract keywords from text
     * @param {string} text - Text to extract keywords from
     * @returns {Set} Set of keywords
     */
    function getKeywords(text) {
        if (!text) return new Set();
        
        return new Set(
            text
                .toLowerCase()
                .replace(/[^\w\s]/g, '') // Remove special characters
                .split(/\s+/) // Split by whitespace
                .filter(word => word.length > 2 && !stopWords.has(word)) // Filter stop words and short words
        );
    }

    // Create matches for lost items
    lostItems.forEach(lostItem => {
        const lostKeywords = getKeywords(lostItem.description);
        const lostCategory = (lostItem.category || '').toLowerCase();
        
        if (!matches[lostItem.id]) {
            matches[lostItem.id] = [];
        }

        foundItems.forEach(foundItem => {
            const foundCategory = (foundItem.category || '').toLowerCase();
            
            // Check if categories match
            if (lostCategory && foundCategory && lostCategory === foundCategory) {
                const foundKeywords = getKeywords(foundItem.description);
                
                // Check if there's at least one keyword match
                const hasMatch = Array.from(lostKeywords).some(keyword => foundKeywords.has(keyword));
                
                if (hasMatch) {
                    matches[lostItem.id].push({
                        id: foundItem.id,
                        itemName: foundItem.itemName,
                        type: 'found'
                    });
                }
            }
        });
    });

    // Create matches for found items (to identify potential lost item matches)
    foundItems.forEach(foundItem => {
        const foundKeywords = getKeywords(foundItem.description);
        const foundCategory = (foundItem.category || '').toLowerCase();
        
        if (!matches[foundItem.id]) {
            matches[foundItem.id] = [];
        }

        lostItems.forEach(lostItem => {
            const lostCategory = (lostItem.category || '').toLowerCase();
            
            // Check if categories match
            if (foundCategory && lostCategory && foundCategory === lostCategory) {
                const lostKeywords = getKeywords(lostItem.description);
                
                // Check if there's at least one keyword match
                const hasMatch = Array.from(foundKeywords).some(keyword => lostKeywords.has(keyword));
                
                if (hasMatch) {
                    matches[foundItem.id].push({
                        id: lostItem.id,
                        itemName: lostItem.itemName,
                        type: 'lost'
                    });
                }
            }
        });
    });

    return matches;
}

// Expose functions to window for external use
if (typeof window !== 'undefined') {
    window.refreshDashboardMetrics = refreshDashboardMetrics;
    window.findMatches = findMatches;
}

import { db } from "./js_firebase.js";
import { addDoc, collection, deleteDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

/* E-Lost and Found - Global Utilities */

// ==================== LOCAL STORAGE MANAGEMENT ====================
const DB = {
  users: "users",
  lostItems: "lostItems",
  foundItems: "foundItems",
  claims: "claims",
  currentUser: "currentUser",
};

// Initialize sample data
function initializeDB() {
  if (!localStorage.getItem(DB.users)) {
    localStorage.setItem(DB.users, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB.lostItems)) {
    localStorage.setItem(DB.lostItems, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB.foundItems)) {
    localStorage.setItem(DB.foundItems, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB.claims)) {
    localStorage.setItem(DB.claims, JSON.stringify([]));
  }
}

// Get all records from Firestore collection
async function getRecords(storeName) {
  try {
    const querySnapshot = await getDocs(collection(db, storeName));
    return querySnapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
  } catch (error) {
    console.error("getRecords error:", error);
    return [];
  }
}

// Add a new document to Firestore collection
async function addRecord(storeName, record) {
  try {
    const recordToSave = {
      ...record,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, storeName), recordToSave);
    return { id: docRef.id, ...recordToSave };
  } catch (error) {
    console.error("addRecord error:", error);
    return null;
  }
}

// Update a document in Firestore collection
async function updateRecord(storeName, id, updates) {
  try {
    const recordRef = doc(db, storeName, id);
    await updateDoc(recordRef, updates);
    return { id, ...updates };
  } catch (error) {
    console.error("updateRecord error:", error);
    return null;
  }
}

// Delete record from Firestore collection
async function deleteRecord(storeName, id) {
  try {
    const recordRef = doc(db, storeName, id);
    await deleteDoc(recordRef);
  } catch (error) {
    console.error("deleteRecord error:", error);
  }
}

// Find record by ID using Firestore helpers
async function findById(storeName, id) {
  const records = await getRecords(storeName);
  return records.find((record) => record.id === id) || null;
}

// ==================== AUTHENTICATION ====================
function getCurrentUser() {
  const user = localStorage.getItem(DB.currentUser);
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(DB.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(DB.currentUser);
  }
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function logout() {
  setCurrentUser(null);
  window.location.href = "../index.html";
}

// ==================== UTILITIES ====================
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Show alert
function showAlert(title, message, type = "info") {
  const alertBox = document.createElement("div");
  alertBox.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                    z-index: 2000; max-width: 400px; text-align: center;">
            <h2 style="margin-bottom: 10px; color: #1a1a1a;">${title}</h2>
            <p style="color: #666; margin-bottom: 20px;">${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
        </div>
        <div onclick="this.remove()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1999;"></div>
    `;
  document.body.appendChild(alertBox);
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Format location
function formatLocation(location) {
  return location.trim() || "Not specified";
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeDB();

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        navMenu.classList.remove("active");
      }
    });
  }

  updateNavigation();
});

function updateNavigation() {
  const navMenu = document.getElementById("navMenu");
  if (!navMenu) return;

  const user = getCurrentUser();
  const loginBtn = navMenu.querySelector(".btn-login");
  const registerBtn = navMenu.querySelector(".btn-register");

  if (user && loginBtn && registerBtn) {
    loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.fullName}`;
    loginBtn.href = "../pages/profile.html";
    registerBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
    registerBtn.href = "#";
    registerBtn.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  }
}

// ==================== DARK MODE ====================
function initializeDarkMode() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    enableDarkMode();
  }
}

function toggleDarkMode() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

function enableDarkMode() {
  document.body.classList.add("dark-mode");
  localStorage.setItem("darkMode", "true");
  updateDarkModeIcon(true);
}

function disableDarkMode() {
  document.body.classList.remove("dark-mode");
  localStorage.setItem("darkMode", "false");
  updateDarkModeIcon(false);
}

function updateDarkModeIcon(isDark) {
  const icon = document.getElementById("darkModeToggle");
  if (icon) {
    icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
  }
}

// Add CSS animation
const style = document.createElement("style");
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    #darkModeToggle {
        cursor: pointer;
        transition: color 0.3s;
        font-size: 20px;
    }
    
    #darkModeToggle:hover {
        color: var(--accent-color);
    }
`;
document.head.appendChild(style);

// Initialize dark mode on page load
initializeDarkMode();

if (typeof window !== "undefined") {
  Object.assign(window, {
    DB,
    getRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    findById,
    getCurrentUser,
    setCurrentUser,
    isLoggedIn,
    logout,
    generateId,
    formatDate,
    convertImageToBase64,
    showToast,
    showAlert,
    validateEmail,
    formatLocation,
    toggleDarkMode,
    initializeDarkMode,
    enableDarkMode,
    disableDarkMode
  });
}

export {
  DB,
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  findById,
  getCurrentUser,
  setCurrentUser,
  isLoggedIn,
  logout,
  generateId,
  formatDate,
  convertImageToBase64,
  showToast,
  showAlert,
  validateEmail,
  formatLocation,
  toggleDarkMode,
  initializeDarkMode,
  enableDarkMode,
  disableDarkMode
};

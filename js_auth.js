import { db } from "./js_firebase.js";
import { addDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { validateEmail, showAlert, setCurrentUser, showToast, getCurrentUser, isLoggedIn } from "./js_utils.js";

/* Authentication Handler */

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!validateEmail(email) || password.length < 3) {
    showAlert("Invalid Input", "Please enter valid email and password (min 3 characters)");
    return;
  }

  try {
    const loginQuery = query(
      collection(db, "users"),
      where("email", "==", email),
      where("password", "==", password)
    );
    const snapshot = await getDocs(loginQuery);

    if (snapshot.empty) {
      showAlert("Login Failed", "Invalid email or password");
      return;
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    setCurrentUser(user);
    showToast("Login successful!");
    window.location.href = "pages_dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    showAlert("Error", "An error occurred during login");
  }
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", handleRegister);
}

async function handleRegister(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!fullName || !email || !phone || !password) {
    showAlert("Validation Error", "All fields are required");
    return;
  }

  if (!validateEmail(email)) {
    showAlert("Validation Error", "Please enter a valid email address");
    return;
  }

  if (password.length < 6) {
    showAlert("Validation Error", "Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("Validation Error", "Passwords do not match");
    return;
  }

  try {
    const emailQuery = query(collection(db, "users"), where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      showAlert("Registration Failed", "This email is already registered");
      return;
    }

    const newUser = {
      fullName,
      email,
      phone,
      password, // In production, hash this!
      role: "user",
      profileImage: null,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "users"), newUser);
    const user = { id: docRef.id, ...newUser };

    setCurrentUser(user);
    showToast("Registration successful!");
    window.location.href = "pages_dashboard.html";
  } catch (error) {
    console.error("Registration error:", error);
    showAlert("Error", "An error occurred during registration");
  }
}

const togglePassword = document.getElementById("togglePassword");
if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
    togglePassword.className = input.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
  });
}

const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", handleForgotPassword);
}

async function handleForgotPassword(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  if (!validateEmail(email)) {
    showAlert("Error", "Please enter a valid email address");
    return;
  }

  try {
    const forgotQuery = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(forgotQuery);

    if (snapshot.empty) {
      showAlert("Not Found", "No account found with this email address");
      return;
    }

    showAlert("Success", "A password reset link has been sent to " + email);
    setTimeout(() => {
      window.location.href = "auth_login.html";
    }, 2000);
  } catch (error) {
    console.error("Forgot password error:", error);
    showAlert("Error", "An error occurred while trying to reset password");
  }
}

function checkAuth() {
  if (!isLoggedIn() && !window.location.pathname.includes("auth") && !window.location.pathname.includes("index")) {
    window.location.href = "auth_login.html";
  }
}

if (typeof window !== "undefined") {
  window.checkAuth = checkAuth;
}

export { checkAuth };


document.addEventListener("DOMContentLoaded", checkAuth);

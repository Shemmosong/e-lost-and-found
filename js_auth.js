import { db } from "./js_firebase.js";
import { collection, getDocs, query, where, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
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
  const termsCheckbox = document.getElementById("terms").checked;

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

  if (!termsCheckbox) {
    showAlert("Validation Error", "You must agree to the Terms and Conditions");
    return;
  }

  try {
    // Initialize Auth
    const auth = getAuth();

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Prepare profile payload without password
    const profile = {
      fullName,
      email,
      phone,
      role: "user",
      profileImage: null,
      createdAt: new Date().toISOString(),
    };

    // Save profile in Firestore using the Auth UID as the document ID
    await setDoc(doc(db, "users", uid), profile);

    const user = { id: uid, ...profile };
    setCurrentUser(user);
    showToast("Registration successful!");
    window.location.href = "pages_dashboard.html";
  } catch (error) {
    console.error("Registration error:", error);
    // Provide clearer error messages from Firebase when available
    const message = error && error.message ? error.message : 'An error occurred during registration';
    showAlert("Registration Failed", message);
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

  const email = (document.getElementById("email") || { value: '' }).value.trim();

  if (!email) {
    showAlert("Error", "Please enter your email address");
    return;
  }

  try {
    const auth = getAuth();
    // Wait for Firebase to send the password reset email
    await sendPasswordResetEmail(auth, email);

    alert("Success! A password reset link has been sent to your email. Please check your inbox and your spam folder.");
    setTimeout(() => {
      window.location.href = "auth_login.html";
    }, 2000);
  } catch (error) {
    console.error(error);
    alert("Error: " + (error && error.message ? error.message : String(error)));
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

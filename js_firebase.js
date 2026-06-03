  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDTrRVndMD7GBamuOf-sEGk9O2VXN41xK4",
    authDomain: "e-lost-and-found-d7d2b.firebaseapp.com",
    projectId: "e-lost-and-found-d7d2b",
    storageBucket: "e-lost-and-found-d7d2b.firebasestorage.app",
    messagingSenderId: "285405475724",
    appId: "1:285405475724:web:82707326f367d6e81c5ca9"
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  export { app, db };

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyArb86FC6-vIX9OQ7ir1adDEmtc27Ksq4k",
  authDomain: "dynamic-portfolio-builde-11c0f.firebaseapp.com",
  projectId: "dynamic-portfolio-builde-11c0f",
  storageBucket: "dynamic-portfolio-builde-11c0f.firebasestorage.app",
  messagingSenderId: "634500340453",
  appId: "1:634500340453:web:75641ec2eb46c5003fd20c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    // FIXED: GitHub Pages path redirection fixed
    if (user) { window.location.href = "./dashboard.html"; }
});

// DOM ELEMENTS FOR CARDS
const signInCard = document.getElementById('signInCard');
const signUpCard = document.getElementById('signUpCard');
const resetCard = document.getElementById('resetCard');

// TOGGLE LOGIC
document.getElementById('toSignUp').addEventListener('click', () => { 
    signInCard.classList.add('hidden'); resetCard.classList.add('hidden'); signUpCard.classList.remove('hidden'); 
});
document.getElementById('toSignIn').addEventListener('click', () => { 
    signUpCard.classList.add('hidden'); resetCard.classList.add('hidden'); signInCard.classList.remove('hidden'); 
});
document.getElementById('toResetPassword').addEventListener('click', () => { 
    signInCard.classList.add('hidden'); signUpCard.classList.add('hidden'); resetCard.classList.remove('hidden'); 
});
document.getElementById('backToSignIn').addEventListener('click', () => { 
    resetCard.classList.add('hidden'); signUpCard.classList.add('hidden'); signInCard.classList.remove('hidden'); 
});

// --- SIGN IN PROCESS ---
const loginForm = document.getElementById('loginForm');
const errorDisplay = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    errorDisplay.innerText = "";
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // FIXED: GitHub Pages path redirection fixed
        window.location.href = "./dashboard.html";
    } catch (error) {
        errorDisplay.innerText = error.code === 'auth/invalid-credential' ? "Incorrect email or password. Please verify your credentials." : "Access denied. Verification failed.";
    }
});

// --- SIGN UP PROCESS ---
const signUpForm = document.getElementById('signUpForm');
const signUpError = document.getElementById('signUpError');
const signUpSuccess = document.getElementById('signUpSuccess');

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const regEmail = document.getElementById('regEmail').value.trim();
    const regPassword = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    signUpError.innerText = ""; signUpSuccess.innerText = "";

    if (regPassword !== confirmPassword) { signUpError.innerText = "Passwords do not match."; return; }
    if (regPassword.length < 6) { signUpError.innerText = "Password must be at least 6 characters long."; return; }

    try {
        await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        signUpSuccess.innerText = "Account successfully created! Redirecting...";
        // FIXED: GitHub Pages path redirection fixed
        setTimeout(() => { window.location.href = "./dashboard.html"; }, 1500);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') signUpError.innerText = "This email is already registered. Please Sign In.";
        else if (error.code === 'auth/invalid-email') signUpError.innerText = "The email format is invalid.";
        else signUpError.innerText = "Registration failed. Please try again.";
    }
});

// --- PASSWORD RESET PROCESS ---
const resetForm = document.getElementById('resetForm');
const resetMessage = document.getElementById('resetMessage');

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resetEmail = document.getElementById('resetEmail').value.trim();
    resetMessage.innerText = "Sending request...";
    resetMessage.style.color = "#2563eb";

    try {
        await sendPasswordResetEmail(auth, resetEmail);
        resetMessage.innerText = "Password reset link sent! Check your email inbox.";
        resetMessage.style.color = "#10b981";
        document.getElementById('resetEmail').value = ""; // Clear the input
    } catch (error) {
        console.error("Reset Error:", error.code);
        resetMessage.style.color = "#dc2626";
        if (error.code === 'auth/invalid-email') {
            resetMessage.innerText = "The email format is invalid.";
        } else if (error.code === 'auth/user-not-found') {
            resetMessage.innerText = "No account found with this email.";
        } else {
            resetMessage.innerText = "Failed to send reset link. Please try again.";
        }
    }
});
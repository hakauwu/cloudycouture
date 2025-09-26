import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { showNotification } from "./notification.js";


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return console.error("Can not find form #login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showNotification("Please enter both email and password.", "warning");
      return;
    }

    try {
      if (window.showLoader) window.showLoader();

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      if (!user.emailVerified) {
        showNotification("Your email is not verified. Please check your inbox.", "info");
        await sendEmailVerification(user);
        await signOut(auth);
        if (window.hideLoader) window.hideLoader();
        return;
      }

      showNotification("Login successful!", "success");

      setTimeout(() => {
        if (window.hideLoader) window.hideLoader();
        window.location.href = "./index.html";
      }, 1000);
    } catch (err) {
      console.error(err.code, err.message);

      if (window.hideLoader) window.hideLoader();

      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          showNotification("Incorrect email or password.", "error");
          break;
        case "auth/invalid-email":
          showNotification("Invalid email format.", "error");
          break;
        default:
          showNotification("Login error: " + err.message, "error");
      }
    }
  });
});

// Google Sign-In
const googleButton = document.querySelector(".google-login-button");
googleButton.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    showNotification("Login successful!", "success");
    setTimeout(() => {
      if (window.hideLoader) window.hideLoader();
      window.location.href = "./index.html";
    }, 1000);
  } catch (error) {
    const errorMessage = error.message;
    showNotification("Login failed: " + errorMessage, "error");
  }
});

import {auth, db} from "./firebase.js";
import {sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const requestButton = document.querySelector(".form-btn");

requestButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const email = emailInput.value.trim();
    if (!email) {
        showNotification("Please enter your email address.", "warning");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        showNotification("Password reset email sent. Please check your inbox.", "success");
        emailInput.value = "";
    } catch (error) {
        console.error("Error sending password reset email:", error);
        showNotification("Failed to send password reset email. Please try again.", "error");
    }
});
import { showNotification } from "./notification.js";
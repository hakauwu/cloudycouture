import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth, db } from "./firebase.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { showNotification } from "./notification.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    if (!form) return console.error("Can not find form #register-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = form.username.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        if (password !== confirmPassword) {
            showNotification("warning", "The confirmation password does not match!");
            return;
        }

        const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            showNotification("info", "Username must be 3–20 characters, only letters, numbers, or underscore.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            showNotification("info", "Password must include uppercase, lowercase, and a number.");
            return;
        }

        try {
            const usernameRef = doc(db, "usernames", username.toLowerCase());
            const usernameSnap = await getDoc(usernameRef);
            if (usernameSnap.exists()) {
                showNotification("error", "Username is already taken!");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { user } = userCredential;

             await setDoc(usernameRef, { uid: user.uid, email, createdAt: new window.Date() });

            // await setDoc(doc(db, "usernames", username.toLowerCase()), {
            //     // username: username.toLowerCase(),
            //     email,
            //     createdAt: serverTimestamp(),
            // });

            try {
                await sendEmailVerification(user);
                showNotification("success", "Registration successful. Check your email to verify your account!");

                await signOut(auth);
                form.reset();
                window.location.href = "./login.html";
            } catch (err) {
                showNotification("error", "Failed to send verification email. Please try again.");
            }

            window.location.href = "./login.html";

        } catch (err) {
            console.error(err.code, err.message);
            switch (err.code) {
                case "auth/email-already-in-use":
                    showNotification("error", "Email is already in use.");
                    break;
                case "auth/invalid-email":
                    showNotification("error", "Invalid email format.");
                    break;
                case "auth/weak-password":
                    showNotification("warning", "Your password is too weak.");
                    break;
                default:
                    showNotification("error", "Registration error: " + err.message);
            }
        }
    });
});

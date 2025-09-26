import {
    onAuthStateChanged,
    updateEmail,
    updatePassword,
    signOut,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendEmailVerification,
    verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth, db } from "./firebase.js";
import { 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

function getIconPath(type) {
    switch (type) {
        case "success":
            return "M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
        case "info":
            return "M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
        case "warning":
            return "M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
        case "error":
        default:
            return "m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
    }
}

function showNotification(message, type = 'success') {
    const container = document.querySelector(".notification-container");
    if (!container) return;

    const li = document.createElement("li");
    li.classList.add("notification-item", type);

    li.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="${getIconPath(type)}" />
                </svg>
            </div>
            <div class="notification-text">${message}</div>
        </div>
        <div class="notification-icon notification-close">
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18 17.94 6M18 18 6.06 6" />
            </svg>
        </div>
        <div class="notification-progress-bar"></div>
    `;

    container.appendChild(li);

    setTimeout(() => {
        li.remove();
    }, 5000);

    li.querySelector(".notification-close")?.addEventListener("click", () => {
        li.remove();
    });
}

const overlay = document.getElementById('manage-overlay');
const closeBtn = document.getElementById('closeBtn');
const popupTitle = document.getElementById('popup-title');

const usernameForm = document.getElementById('username-form');
const emailVerifyForm = document.getElementById('email-verify-form');
const emailChangeForm = document.getElementById('email-change-form');
const passwordForm = document.getElementById('password-form');

let currentUser = null;

function showPopup(formId, title) {
    [usernameForm, emailVerifyForm, emailChangeForm, passwordForm].forEach(form => {
        if (form) form.style.display = 'none';
    });

    const targetForm = document.getElementById(formId);
    if (targetForm) {
        targetForm.style.display = 'block';
        popupTitle.textContent = title;
        overlay.style.display = 'flex';
    }
}

function hidePopup() {
    overlay.style.display = 'none';
    [usernameForm, emailVerifyForm, emailChangeForm, passwordForm].forEach(form => {
        if (form) {
            form.reset();
            form.style.display = 'none';
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const currentUsername = document.getElementById("currentUsername");
    const currentEmail = document.getElementById("currentEmail");
    const usernameLoader = document.getElementById("usernameLoader");
    const emailLoader = document.getElementById("emailLoader");


    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            
            currentEmail.textContent = user.email;
            currentEmail.classList.remove("d-none");
            emailLoader.classList.add("d-none");

            try {
                const q = query(collection(db, "usernames"), where("uid", "==", user.uid));
                const querySnap = await getDocs(q);

                if (!querySnap.empty) {
                    const usernameDoc = querySnap.docs[0];
                    currentUsername.textContent = usernameDoc.id;
                } else {
                    currentUsername.textContent = "No username set";
                }
                
                currentUsername.classList.remove("d-none");
                usernameLoader.classList.add("d-none");
            } catch (error) {
                console.error("Error fetching username:", error);
                currentUsername.textContent = "Error loading username";
                currentUsername.classList.remove("d-none");
                usernameLoader.classList.add("d-none");
            }
        } else {
            window.location.href = "./login.html";
        }
    });

    setupPopupEvents();
    setupFormEvents();
});

function setupPopupEvents() {
    document.getElementById('changeUsernameBtn')?.addEventListener('click', () => {
        showPopup('username-form', 'Change Username');
    });

    document.getElementById('changeEmailBtn')?.addEventListener('click', () => {
        showPopup('email-verify-form', 'Change Email');
    });

    document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
        showPopup('password-form', 'Change Password');
    });

    closeBtn?.addEventListener('click', hidePopup);

    document.querySelectorAll('.form-cancel-btn').forEach(btn => {
        btn.addEventListener('click', hidePopup);
    });

    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hidePopup();
        }
    });
}

function setupFormEvents() {
    usernameForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleUsernameChange();
    });

    emailVerifyForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleEmailVerification();
    });

    emailChangeForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleEmailChange();
    });

    passwordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handlePasswordChange();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to log out?')) {
            try {
                await signOut(auth);
                showNotification('Logged out successfully', 'info');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                showNotification('Error logging out', 'error');
            }
        }
    });
}

async function handleUsernameChange() {
    const newUsername = document.getElementById('new-username').value.trim();
    
    if (!newUsername) {
        showNotification('Please enter a username', 'error');
        return;
    }

    const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
        showNotification('Username must be 3–20 characters, only letters, numbers, or underscore.', 'warning');
        return;
    }

    if (!currentUser) {
        showNotification('No authenticated user found.', 'error');
        return;
    }

    try {
        const usernameRef = doc(db, "usernames", newUsername.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);
        
        if (usernameSnap.exists()) {
            showNotification('This username is already taken!', 'error');
            return;
        }

        const q = query(collection(db, "usernames"), where("uid", "==", currentUser.uid));
        const querySnap = await getDocs(q);
        let oldUsername = null;
        
        if (!querySnap.empty) {
            oldUsername = querySnap.docs[0].id;
        }

        if (oldUsername) {
            await deleteDoc(doc(db, "usernames", oldUsername.toLowerCase()));
        }

        await setDoc(usernameRef, { 
            uid: currentUser.uid, 
            email: currentUser.email 
        });

        document.getElementById("currentUsername").textContent = newUsername;
        
        showNotification('Username updated successfully!', 'success');
        hidePopup();
        
    } catch (error) {
        console.error("Error updating username:", error);
        showNotification('Failed to update username: ' + error.message, 'error');
    }
}

async function handleEmailVerification() {
    const password = document.getElementById('verify-password').value;
    
    if (!password) {
        showNotification('Please enter your password', 'error');
        return;
    }

    if (!currentUser) {
        showNotification('No authenticated user found.', 'error');
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        
        showPopup('email-change-form', 'Enter New Email');
        
    } catch (error) {
        console.error("Email verification error:", error);
        if (error.code === "auth/wrong-password") {
            showNotification('Incorrect password. Please try again.', 'error');
        } else {
            showNotification('Password verification failed', 'error');
        }
    }
}

async function handleEmailChange() {
    const newEmail = document.getElementById('new-email').value.trim();
    
    if (!newEmail) {
        showNotification('Please enter an email address', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }

    if (!currentUser) {
        showNotification('No authenticated user found.', 'error');
        return;
    }

    try {
        await verifyBeforeUpdateEmail(currentUser, newEmail);
        
        await sendEmailVerification(currentUser);

        const q = query(collection(db, "usernames"), where("uid", "==", currentUser.uid));
        const querySnap = await getDocs(q);
        
        if (!querySnap.empty) {
            const username = querySnap.docs[0].id;
            const usernameRef = doc(db, "usernames", username.toLowerCase());
            await updateDoc(usernameRef, { email: newEmail });
        }

        document.getElementById("currentEmail").textContent = newEmail;
        
        showNotification('Email updated! Please verify your new email via the link sent.', 'success');
        hidePopup();
        
    } catch (error) {
        console.error("Email update error:", error);
        showNotification('Failed to update email: ' + error.message, 'error');
    }
}

async function handlePasswordChange() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'warning');
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        showNotification('Password must be at least 8 characters, include uppercase, lowercase, and a number.', 'warning');
        return;
    }

    if (!currentUser) {
        showNotification('No authenticated user found.', 'error');
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        await updatePassword(currentUser, newPassword);
        
        showNotification('Password updated successfully!', 'success');
        hidePopup();
        
    } catch (error) {
        console.error("Password update error:", error);
        
        if (error.code === "auth/wrong-password") {
            showNotification('Current password is incorrect', 'error');
        } else if (error.code === "auth/requires-recent-login") {
            showNotification('Please log in again before changing your password', 'warning');
        } else {
            showNotification('Failed to update password: ' + error.message, 'error');
        }
    }
}

export { 
    showNotification, 
    showPopup, 
    hidePopup,
    handleUsernameChange,
    handleEmailChange,
    handlePasswordChange
};
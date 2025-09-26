import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth, db } from "./firebase.js";
import { collection, query, where, doc, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { showNotification } from "./notification.js";


const toggleInput = document.querySelector('.toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    toggleInput.checked = true;
}

toggleInput.addEventListener('change', function () {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


// document.addEventListener("DOMContentLoaded", () => {
//     const loginBtn = document.querySelector("#bot");
//     const logoutBtn = document.querySelector("#logoutBtn");

//     onAuthStateChanged(auth, async (user) => {
//         if (user) {
//             try {
//                 const userRef = doc(db, "users", user.uid);
//                 const userSnap = await getDoc(userRef);

//                 if (userSnap.exists()) {
//                     const data = userSnap.data();
//                     loginBtn.textContent = data.username || user.email;
//                 } else {
//                     loginBtn.textContent = user.email;
//                 }

//                 loginBtn.href = "../pages/manage.html";
//                 if (logoutBtn) logoutBtn.style.display = "inline-block";

//             } catch (err) {
//                 console.error("Error fetching user data:", err);
//                 loginBtn.textContent = user.email;
//             }

//         } else {
//             loginBtn.textContent = "Login";
//             loginBtn.href = "./login.html";
//             if (logoutBtn) logoutBtn.style.display = "none";
//         }
//     });

//     if (logoutBtn) {
//         logoutBtn.addEventListener("click", async () => {
//             try {
//                 await signOut(auth);

//                 loginBtn.textContent = "Login";
//                 loginBtn.href = "./login.html";
//                 window.location.href = "../pages/index.html";
//             } catch (err) {
//                 console.error("Error logging out:", err);
//                 showNotification("An error occurred while logging out. Please try again.", "error");
//             }
//         });
//     }
// });



document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector("#bot");
    const logoutBtn = document.querySelector("#logoutBtn");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const q = query(collection(db, "usernames"), where("uid", "==", user.uid));
                const querySnap = await getDocs(q);

                if (!querySnap.empty) {
                    const usernameDoc = querySnap.docs[0];
                    const username = usernameDoc.id;
                    loginBtn.textContent = username;
                } else {
                    loginBtn.textContent = user.email;
                }

                loginBtn.href = "../pages/manage.html";
                if (logoutBtn) logoutBtn.style.display = "inline-block";

            } catch (err) {
                console.error("Error fetching username:", err);
                loginBtn.textContent = user.email;
            }

        } else {
            loginBtn.textContent = "Login";
            loginBtn.href = "./login.html";
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);

                loginBtn.textContent = "Login";
                loginBtn.href = "./login.html";
                window.location.href = "../pages/index.html";
            } catch (err) {
                console.error("Error logging out:", err);
                showNotification("An error occurred while logging out. Please try again.", "error");
            }
        });
    }
});


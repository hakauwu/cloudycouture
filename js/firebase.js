
// Import the functions you need from the SDKs you need
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAH1kMfryjlool10TpqNkUbkTKdF2ThRRM",
  authDomain: "cloudy-couture.firebaseapp.com",
  projectId: "cloudy-couture",
  storageBucket: "cloudy-couture.firebasestorage.app",
  messagingSenderId: "655909238522",
  appId: "1:655909238522:web:25605dbdc45e79c13fbb43",
  measurementId: "G-9PK401F3BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const FirebaseUtils = {
  auth,
  db,
  storage
};
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5zP_npQzmcClR-A4GS7JBPrD3q9wA3F8",
  authDomain: "erp-sys-50291.firebaseapp.com",
  projectId: "erp-sys-50291",
  storageBucket: "erp-sys-50291.firebasestorage.app",
  messagingSenderId: "434179052777",
  appId: "1:434179052777:web:9d9d80e63ff28de7e50c78",
  measurementId: "G-DHQ79BQEYW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

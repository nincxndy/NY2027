import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2XppnhpwrtmBfcrz6uKtET1WsPi-F-XA",
  authDomain: "text-img-43f01.firebaseapp.com",
  projectId: "text-img-43f01",
  storageBucket: "text-img-43f01.firebasestorage.app",
  messagingSenderId: "926891045186",
  appId: "1:926891045186:web:3b1417e88a9c26180cd8db",
  measurementId: "G-6YBJQB4BEL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc, getDocs, onSnapshot, ref, uploadBytes, getDownloadURL };
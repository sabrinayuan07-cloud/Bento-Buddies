// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkgMT54VN_AI0k3zFq4ycycipXU-aBJaI",
  authDomain: "bento-buddies.firebaseapp.com",
  projectId: "bento-buddies",
  storageBucket: "bento-buddies.firebasestorage.app",
  messagingSenderId: "361952378066",
  appId: "1:361952378066:web:69efb0a0e4ea54ef31010b",
  measurementId: "G-WFML4QHNC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Export for use in other files
export { auth, db, storage, googleProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, signOut, doc, setDoc, getDoc, updateDoc, ref, uploadBytes, getDownloadURL };

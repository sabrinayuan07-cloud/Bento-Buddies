// Firebase Configuration
// NOTE: Import Firebase from CDN (defined in HTML)
// Firebase is loaded globally via script tags

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0",
    authDomain: "bentobuddies-1e6cf.firebaseapp.com",
    projectId: "bentobuddies-1e6cf",
    storageBucket: "bentobuddies-1e6cf.firebasestorage.app",
    messagingSenderId: "729393063738",
    appId: "1:729393063738:web:c3bd3a39c8bdb1f1cb1ca8",
    measurementId: "G-4PDWSG9ZZJ"
};

// Wait for Firebase to load from CDN
const app = firebase.initializeApp(firebaseConfig);

// Initialize services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export default app;

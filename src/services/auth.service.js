// Authentication Service
import { auth, db, storage, googleProvider, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, doc, setDoc, getDoc, ref, uploadBytes, getDownloadURL } from '../../firebase-config.js';
import { handleError } from '../utils/error-handler.js';

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password, profileData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Upload profile picture if provided
        let profilePictureUrl = '';
        if (profileData.profilePicture) {
            profilePictureUrl = await uploadProfilePicture(user.uid, profileData.profilePicture);
        }

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            name: `${profileData.firstName} ${profileData.lastName}`,
            username: profileData.username || email.split('@')[0],
            year: parseInt(profileData.year),
            major: profileData.major,
            bio: profileData.bio || '',
            personality: profileData.personality || [],
            funFact: profileData.funFact || '',
            lastMeal: profileData.lastMeal || '',
            favoriteFoods: profileData.favoriteFoods || [],
            profilePicture: profilePictureUrl,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { success: true, user };
    } catch (error) {
        return handleError(error, 'Failed to sign up');
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return handleError(error, 'Failed to sign in');
    }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists, if not create one
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: user.displayName,
                username: user.email.split('@')[0],
                profilePicture: user.photoURL || '',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return { success: true, user };
    } catch (error) {
        return handleError(error, 'Failed to sign in with Google');
    }
}

/**
 * Sign out current user
 */
export async function logOut() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return handleError(error, 'Failed to sign out');
    }
}

/**
 * Upload profile picture to Firebase Storage
 */
export async function uploadProfilePicture(userId, file) {
    try {
        // If it's a data URL (from file reader)
        if (typeof file === 'string' && file.startsWith('data:')) {
            const blob = await fetch(file).then(r => r.blob());
            const storageRef = ref(storage, `profilePictures/${userId}/${Date.now()}.jpg`);
            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        }

        // If it's a File object
        if (file instanceof File) {
            const storageRef = ref(storage, `profilePictures/${userId}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        }

        return '';
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return '';
    }
}

/**
 * Check if user is authenticated
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth(redirectUrl = '../index/index.html') {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                window.location.href = redirectUrl;
                reject(new Error('Not authenticated'));
            }
        });
    });
}

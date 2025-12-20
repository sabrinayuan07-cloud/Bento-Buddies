// Error Handler Utility

/**
 * Handle Firebase errors and return user-friendly messages
 */
export function handleError(error, defaultMessage = 'An error occurred') {
    console.error('Error:', error);

    let userMessage = defaultMessage;

    // Firebase Auth errors
    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                userMessage = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                userMessage = 'Invalid email address';
                break;
            case 'auth/operation-not-allowed':
                userMessage = 'Operation not allowed';
                break;
            case 'auth/weak-password':
                userMessage = 'Password should be at least 6 characters';
                break;
            case 'auth/user-disabled':
                userMessage = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                userMessage = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                userMessage = 'Incorrect password';
                break;
            case 'auth/invalid-credential':
                userMessage = 'Invalid login credentials';
                break;
            case 'auth/popup-closed-by-user':
                userMessage = 'Sign-in popup was closed';
                break;
            case 'permission-denied':
                userMessage = 'You do not have permission to perform this action';
                break;
            case 'not-found':
                userMessage = 'Requested resource not found';
                break;
            case 'already-exists':
                userMessage = 'Resource already exists';
                break;
            case 'resource-exhausted':
                userMessage = 'Too many requests. Please try again later';
                break;
            case 'unavailable':
                userMessage = 'Service temporarily unavailable';
                break;
            default:
                userMessage = error.message || defaultMessage;
        }
    } else {
        userMessage = error.message || defaultMessage;
    }

    return {
        success: false,
        error: userMessage,
        code: error.code || 'unknown'
    };
}

/**
 * Show error message to user
 */
export function showError(message, duration = 3000) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        font-size: 14px;
    `;

    document.body.appendChild(toast);

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show success message to user
 */
export function showSuccess(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        font-size: 14px;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show loading spinner
 */
export function showLoading(message = 'Loading...') {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            flex-direction: column;
            gap: 15px;
        ">
            <div style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #FF93A9;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <p style="color: white; font-size: 16px;">${message}</p>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(loader);
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
    }
}

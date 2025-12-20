// Validation Utility

/**
 * Validate email format
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate UBC email
 */
export function validateUBCEmail(email) {
    return email.toLowerCase().endsWith('@ubc.ca') || email.toLowerCase().endsWith('@student.ubc.ca');
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    if (password.length > 128) {
        return { valid: false, message: 'Password is too long' };
    }
    return { valid: true, message: '' };
}

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = 'This field') {
    if (!value || value.trim() === '') {
        return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true, message: '' };
}

/**
 * Validate number range
 */
export function validateNumberRange(value, min, max, fieldName = 'Value') {
    const num = parseInt(value);
    if (isNaN(num)) {
        return { valid: false, message: `${fieldName} must be a number` };
    }
    if (num < min) {
        return { valid: false, message: `${fieldName} must be at least ${min}` };
    }
    if (num > max) {
        return { valid: false, message: `${fieldName} must be at most ${max}` };
    }
    return { valid: true, message: '' };
}

/**
 * Validate date (not in the past)
 */
export function validateFutureDate(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
        return { valid: false, message: 'Date cannot be in the past' };
    }
    return { valid: true, message: '' };
}

/**
 * Validate time format (HH:MM)
 */
export function validateTime(timeString) {
    const re = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!re.test(timeString)) {
        return { valid: false, message: 'Invalid time format' };
    }
    return { valid: true, message: '' };
}

/**
 * Validate form with multiple fields
 */
export function validateForm(fields) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, validations] of Object.entries(fields)) {
        for (const validation of validations) {
            const result = validation();
            if (!result.valid) {
                errors[fieldName] = result.message;
                isValid = false;
                break;
            }
        }
    }

    return { valid: isValid, errors };
}

/**
 * Show validation error on input field
 */
export function showFieldError(inputElement, message) {
    // Find or create error element
    let errorElement = inputElement.parentElement.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #ff4444;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        `;
        inputElement.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;
    inputElement.classList.add('error');

    // Add error styling if not present
    if (!inputElement.style.borderColor) {
        inputElement.style.borderColor = '#ff4444';
    }
}

/**
 * Clear validation error from input field
 */
export function clearFieldError(inputElement) {
    const errorElement = inputElement.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    inputElement.classList.remove('error');
    inputElement.style.borderColor = '';
}

/**
 * Clear all validation errors in a form
 */
export function clearFormErrors(formElement) {
    const inputs = formElement.querySelectorAll('input, textarea, select');
    inputs.forEach(input => clearFieldError(input));
}

/**
 * Validate and show errors for all fields
 */
export function validateAndShowErrors(validations) {
    let isValid = true;

    for (const [inputElement, validators] of validations) {
        clearFieldError(inputElement);

        for (const validator of validators) {
            const result = validator();
            if (!result.valid) {
                showFieldError(inputElement, result.message);
                isValid = false;
                break;
            }
        }
    }

    return isValid;
}

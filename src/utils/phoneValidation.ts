/**
 * Morocco phone number validation utilities for Admin Dashboard
 * Accepts mobile numbers starting with 06 or 07
 * Domestic format: 0[67]XXXXXXXX (10 digits)
 * International format: +212[67]XXXXXXXX (13 characters)
 */

export type ValidationErrorType =
    | 'empty'
    | 'invalid_length'
    | 'invalid_prefix'
    | 'invalid_format';

export interface ValidationError {
    type: ValidationErrorType;
    message: string;
    details?: string;
}

export interface PhoneValidationResult {
    isValid: boolean;
    normalized: string;
    error: ValidationError | null;
}

// Pre-compiled regex patterns for better performance
const CLEAN_REGEX = /[\s\-().]/g;
const DOMESTIC_REGEX = /^0[67][0-9]{8}$/;
const SHORT_FORMAT_REGEX = /^[67][0-9]{8}$/;
const DIGITS_ONLY_REGEX = /^[0-9]+$/;

/**
 * Validates and normalizes a Moroccan phone number to international format (+212XXXXXXXXX)
 * @param input - Raw phone number input from user
 * @returns Validation result with normalized phone number
 */
export function validateMoroccanPhone(input: string): PhoneValidationResult {
    if (!input || input.length === 0) {
        return {
            isValid: false,
            normalized: '',
            error: {
                type: 'empty',
                message: 'Phone number is required',
            },
        };
    }

    // Remove spaces, hyphens, parentheses, dots
    const cleaned = input.replace(CLEAN_REGEX, '');

    let normalized = '';
    let error: ValidationError | null = null;

    // Check if starts with 0 (domestic format with leading zero)
    if (cleaned.startsWith('0')) {
        if (cleaned.length !== 10) {
            error = {
                type: 'invalid_length',
                message: 'Invalid phone number length',
                details: 'Morocco phone numbers should be 10 digits (e.g., 0612345678)',
            };
        } else if (!DOMESTIC_REGEX.test(cleaned)) {
            error = {
                type: 'invalid_prefix',
                message: 'Invalid phone number prefix',
                details: 'Morocco mobile numbers must start with 06 or 07',
            };
        } else {
            // Convert to international format: +212 + digits without leading 0
            normalized = `+212${cleaned.substring(1)}`;
        }
    }
    // Check if user entered without leading 0 (9 digits starting with 6 or 7)
    else if (SHORT_FORMAT_REGEX.test(cleaned)) {
        // Convert to international format
        normalized = `+212${cleaned}`;
    } else if (DIGITS_ONLY_REGEX.test(cleaned)) {
        // It's all digits but wrong length/prefix
        if (cleaned.length < 9) {
            error = {
                type: 'invalid_length',
                message: 'Phone number too short',
                details: 'Please enter at least 9 digits',
            };
        } else if (cleaned.length > 10) {
            error = {
                type: 'invalid_length',
                message: 'Phone number too long',
                details: 'Morocco phone numbers have maximum 10 digits',
            };
        } else {
            error = {
                type: 'invalid_prefix',
                message: 'Invalid phone number prefix',
                details: 'Morocco mobile numbers must start with 06 or 07',
            };
        }
    } else {
        error = {
            type: 'invalid_format',
            message: 'Invalid phone number format',
            details: 'Phone number should contain only digits, with optional +212 prefix',
        };
    }

    return {
        isValid: normalized !== '' && error === null,
        normalized,
        error,
    };
}

/**
 * Formats a phone number for display (+212XXXXXXXXX -> 0X XX XX XX XX)
 * @param phoneNumber - International format phone number
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
    if (!phoneNumber) return '';

    // Remove +212 prefix and add 0
    const cleaned = phoneNumber.replace('+212', '0');

    // Format as: 0X XX XX XX XX
    if (cleaned.length === 10) {
        return cleaned.replace(
            /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
            '$1 $2 $3 $4 $5'
        );
    }

    return cleaned;
}

/**
 * Custom form validator for Ant Design forms
 * Returns a Promise that resolves or rejects based on validation
 */
export function createPhoneValidator() {
    return (_: unknown, value: string) => {
        if (!value) {
            return Promise.reject(new Error('Phone number is required'));
        }

        const result = validateMoroccanPhone(value);
        if (!result.isValid && result.error) {
            return Promise.reject(new Error(result.error.details || result.error.message));
        }

        return Promise.resolve();
    };
}

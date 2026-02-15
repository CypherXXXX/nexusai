/**
 * Validates an email address.
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates a URL (simple check).
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url.startsWith("http") ? url : `https://${url}`);
        return true;
    } catch {
        return false;
    }
}

/**
 * Formats a currency value.
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

export function validateLeadForm(data: any): ValidationResult {
    const errors: Record<string, string> = {};
    if (!data.company_name) errors.company_name = "Company name is required";
    if (data.company_website && !isValidUrl(data.company_website)) errors.company_website = "Invalid URL";

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

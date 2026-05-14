import countriesData from './country.json';

export interface Country {
  name: string;
  code: string;
  emoji: string;
  unicode: string;
  dial_code?: string;
  image: string;
}

export const countries = countriesData as Country[];

// Flat list of all possible clean dial codes (e.g. "+1", "+1809")
export const validDialCodes = new Set<string>();

countries.forEach((country) => {
  if (country.dial_code) {
    // split by comma, strip spaces
    const codes = country.dial_code.split(',').map((c: string) => c.replace(/\s+/g, ''));
    codes.forEach((c: string) => validDialCodes.add(c));
  }
});

// Sorted by length descending, so we match longest dial code first (e.g. +1809 before +1)
export const sortedDialCodes = Array.from(validDialCodes).sort((a, b) => b.length - a.length);

/**
 * Validates if a phone number string has a valid format and country code.
 * Example: +8801712345678 -> true
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all spaces and dashes for checking
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Must start with + and contain only digits afterwards (total length between 7 and 15)
  if (!/^\+\d{7,15}$/.test(cleanPhone)) return false;

  // Check if it starts with a known dial code
  for (const dialCode of sortedDialCodes) {
    if (cleanPhone.startsWith(dialCode)) {
      // Ensure the local part has at least some digits (e.g., 4 to 12 digits after dial code)
      const localPart = cleanPhone.slice(dialCode.length);
      if (localPart.length >= 4 && localPart.length <= 12) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Normalizes phone number (removes spaces, dashes, etc.)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[\s-]/g, '');
}

/**
 * Tries to extract the dial code from a full phone number string.
 * Returns the dial code and the local number part.
 */
export function parsePhone(phone: string): { dialCode: string; localNumber: string } | null {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  for (const dialCode of sortedDialCodes) {
    if (cleanPhone.startsWith(dialCode)) {
      return {
        dialCode,
        localNumber: cleanPhone.slice(dialCode.length)
      };
    }
  }
  return null;
}

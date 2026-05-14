import { isValidPhoneNumber, parsePhoneNumber, AsYouType, getCountries, getCountryCallingCode } from 'libphonenumber-js';
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

/**
 * Validates a full phone number string (e.g. "+8801712345678") using libphonenumber-js.
 * This is now authoritative — no need to maintain length tables manually.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  try {
    return isValidPhoneNumber(phone.trim());
  } catch {
    return false;
  }
}

/**
 * Returns the calling code for a given ISO 3166-1 alpha-2 country code (e.g. "BD" → "+880").
 */
export function getDialCodeForCountry(countryCode: string): string {
  try {
    return '+' + getCountryCallingCode(countryCode as any);
  } catch {
    return '';
  }
}

/**
 * Tries to parse a full phone string and return { dialCode, localNumber }.
 */
export function parsePhone(phone: string): { dialCode: string; localNumber: string; countryCode?: string } | null {
  if (!phone) return null;
  try {
    const parsed = parsePhoneNumber(phone.trim());
    if (parsed) {
      const dialCode = '+' + parsed.countryCallingCode;
      const localNumber = parsed.nationalNumber;
      return { dialCode, localNumber, countryCode: parsed.country };
    }
  } catch {}

  // Fallback: try to match our country.json dial codes
  const clean = phone.replace(/\s/g, '');
  const sorted = countries
    .filter(c => c.dial_code)
    .flatMap(c => c.dial_code!.split(',').map(d => ({ code: d.trim().replace(/\s/g, ''), c })))
    .sort((a, b) => b.code.length - a.code.length);

  for (const { code } of sorted) {
    if (clean.startsWith(code)) {
      return { dialCode: code, localNumber: clean.slice(code.length) };
    }
  }
  return null;
}

/**
 * Removes all non-digit characters (for input normalisation).
 */
export function normalizePhone(phone: string): string {
  return (phone ?? '').replace(/\D/g, '');
}

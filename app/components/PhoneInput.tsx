'use client';
import { useState, useEffect, useRef } from 'react';
import { AsYouType, getCountryCallingCode, isSupportedCountry } from 'libphonenumber-js';
import { countries, parsePhone } from '@/lib/utils/phone';

interface PhoneInputProps {
  id?: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

// Build dropdown option list from country.json (emoji + name + dial code)
// Map ISO country code → dial code via libphonenumber-js for accuracy,
// but fall back to the JSON dial_code when the ISO code isn't supported.
const allOptions = countries.flatMap(c => {
  let code = '';
  if (isSupportedCountry(c.code as any)) {
    code = '+' + getCountryCallingCode(c.code as any);
  } else if (c.dial_code) {
    code = c.dial_code.split(',')[0].replace(/\s+/g, '');
  }
  if (!code) return [];
  return [{ isoCode: c.code, code, emoji: c.emoji, name: c.name }];
});

// Get max national number length for a country
function getMaxLocalLength(isoCode: string, dialCode: string): number {
  const dialCodeDigits = dialCode.replace('+', '').length;
  const absoluteMax = 15 - dialCodeDigits;

  try {
    const formatter = new AsYouType(isoCode as any);
    // Use a more realistic sequence to trigger the metadata lookup
    // Most countries start with 1-9.
    formatter.input('9');
    formatter.input('012345678901234');
    const result = formatter.getNumber();
    
    if (result && result.nationalNumber) {
      // libphonenumber-js metadata might allow longer numbers for some countries,
      // but we still want to respect the user's 15-digit total limit.
      return Math.min(result.nationalNumber.length, absoluteMax);
    }
  } catch {}
  
  // Specific override for Bangladesh if detection fails
  if (isoCode === 'BD') return 10;
  
  return absoluteMax; 
}

export default function PhoneInput({
  id, name, defaultValue = '', required, disabled, className, onChange
}: PhoneInputProps) {
  const [selectedOption, setSelectedOption] = useState(
    () => allOptions.find(o => o.code === '+880') ?? allOptions[0]
  );
  const [localNumber, setLocalNumber] = useState('');
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef         = useRef<HTMLDivElement>(null);
  const searchRef           = useRef<HTMLInputElement>(null);

  // Parse defaultValue on mount
  useEffect(() => {
    if (!defaultValue) return;
    const parsed = parsePhone(defaultValue);
    if (parsed) {
      const match = allOptions.find(o => o.code === parsed.dialCode)
        ?? allOptions.find(o => o.isoCode === parsed.countryCode);
      if (match) setSelectedOption(match);
      setLocalNumber(parsed.localNumber);
    } else {
      setLocalNumber(defaultValue);
    }
  }, [defaultValue]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Filtered list
  const q = search.toLowerCase().trim();
  const filtered = q
    ? allOptions.filter(o => o.name.toLowerCase().includes(q) || o.code.includes(q))
    : allOptions;

  const maxLocalLength = getMaxLocalLength(selectedOption.isoCode, selectedOption.code);
  const fullPhone = localNumber ? `${selectedOption.code}${localNumber}` : '';

  useEffect(() => {
    if (onChange) onChange(fullPhone);
  }, [fullPhone, onChange]);

  return (
    <div className={className} ref={dropdownRef}
      style={{ display: 'flex', padding: 0, overflow: 'visible', alignItems: 'stretch', position: 'relative' }}>
      
      <input type="hidden" name={name} value={fullPhone} id={id} />

      {/* Trigger button */}
      <button type="button" disabled={disabled}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        style={{
          background: 'rgba(0,0,0,0.25)',
          color: 'white',
          border: 'none',
          borderRight: '1px solid var(--border-color)',
          padding: '12px 10px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minWidth: '105px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
        <span>{selectedOption.emoji}</span>
        <span>{selectedOption.code}</span>
        <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 9999,
          background: '#1a1a1a',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          width: '290px',
          overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
            <input ref={searchRef} type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code…"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'white',
                padding: '8px 10px',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Options list */}
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                No results
              </p>
            ) : filtered.map((opt, i) => (
              <button key={`${opt.code}-${i}`} type="button"
                onClick={() => {
                  setSelectedOption(opt);
                  // Trim local number if new country max is shorter
                  const newMax = getMaxLocalLength(opt.isoCode, opt.code);
                  if (localNumber.length > newMax) setLocalNumber(localNumber.slice(0, newMax));
                  setOpen(false); setSearch('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  background: opt.code === selectedOption.code ? 'rgba(235,183,0,0.12)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                }}
                onMouseEnter={e => { if (opt.code !== selectedOption.code) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (opt.code !== selectedOption.code) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                <span style={{ fontSize: '1.1rem' }}>{opt.emoji}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.name}</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600, flexShrink: 0 }}>{opt.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Local number input */}
      <input type="tel" value={localNumber}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, '');
          if (digits.length <= maxLocalLength) setLocalNumber(digits);
        }}
        maxLength={maxLocalLength}
        placeholder="1712345678"
        required={required}
        disabled={disabled}
        inputMode="numeric"
        pattern="[0-9]*"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'white',
          padding: '12px 16px',
          outline: 'none',
          fontSize: 'inherit',
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

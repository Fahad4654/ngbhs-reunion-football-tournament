'use client';
import { useState, useEffect } from 'react';
import { countries, parsePhone, normalizePhone } from '@/lib/utils/phone';

interface PhoneInputProps {
  id?: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInput({
  id,
  name,
  defaultValue = '',
  required,
  disabled,
  className
}: PhoneInputProps) {
  const [dialCode, setDialCode] = useState('+880'); // Default to Bangladesh
  const [localNumber, setLocalNumber] = useState('');

  // On mount, parse the default value if it exists
  useEffect(() => {
    if (defaultValue) {
      const parsed = parsePhone(defaultValue);
      if (parsed) {
        setDialCode(parsed.dialCode);
        setLocalNumber(parsed.localNumber);
      } else {
        // If it can't be parsed, just dump it all in localNumber to let user edit it
        setLocalNumber(defaultValue);
      }
    }
  }, [defaultValue]);

  // The actual value submitted by the form
  const fullPhone = localNumber ? `${dialCode}${localNumber}` : '';

  return (
    <div 
      className={className} 
      style={{ 
        display: 'flex', 
        padding: 0, 
        overflow: 'hidden',
        alignItems: 'stretch'
      }}
    >
      <input type="hidden" name={name} value={fullPhone} id={id} />
      
      <select 
        value={dialCode}
        onChange={(e) => setDialCode(e.target.value)}
        disabled={disabled}
        style={{
          background: 'rgba(0,0,0,0.2)',
          color: 'white',
          border: 'none',
          borderRight: '1px solid var(--border-color)',
          padding: '12px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          maxWidth: '120px',
          fontFamily: 'inherit',
          fontSize: 'inherit'
        }}
      >
        {countries.map(country => {
          if (!country.dial_code) return null;
          const codes = country.dial_code.split(',').map(c => c.replace(/\s+/g, ''));
          return codes.map(code => (
            <option key={`${country.code}-${code}`} value={code}>
              {country.emoji} {code}
            </option>
          ));
        })}
      </select>
      
      <input 
        type="tel"
        value={localNumber}
        onChange={(e) => setLocalNumber(normalizePhone(e.target.value))}
        placeholder="1712345678"
        required={required}
        disabled={disabled}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'white',
          padding: '12px 16px',
          outline: 'none',
          fontSize: 'inherit',
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />
    </div>
  );
}

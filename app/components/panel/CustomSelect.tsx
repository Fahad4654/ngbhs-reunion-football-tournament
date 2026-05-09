'use client';

import React from 'react';

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  containerStyle?: React.CSSProperties;
}

export default function CustomSelect({ label, containerStyle, style, children, ...props }: CustomSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', ...containerStyle }}>
      {label && (
        <label style={{ 
          fontSize: '0.72rem', 
          fontWeight: 800, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em' 
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <select
          {...props}
          style={{
            width: '100%',
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            background: 'rgba(20, 22, 26, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.9rem',
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            transition: 'all 0.2s ease',
            ...style
          }}
          className="custom-select-element"
        >
          {children}
        </select>
        <div style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.8rem'
        }}>
          ▼
        </div>
      </div>
      <style jsx>{`
        .custom-select-element:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(235, 183, 0, 0.15);
          background: rgba(20, 22, 26, 0.95);
        }
        .custom-select-element:hover:not(:disabled) {
          border-color: rgba(235, 183, 0, 0.4);
          background: rgba(25, 27, 32, 0.9);
        }
        .custom-select-element option {
          background: #14161a;
          color: white;
          padding: 10px;
        }
        .custom-select-element:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

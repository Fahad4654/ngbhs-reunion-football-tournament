'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';

interface ConfirmModalProps {
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  message,
  subMessage,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '440px',
          padding: '2rem',
          margin: '0 1rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(235,183,0,0.12)',
          border: '1px solid rgba(235,183,0,0.3)',
          animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '2.5rem', lineHeight: 1, display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            {danger ? (
              <WarningAmberIcon sx={{ fontSize: '3rem', color: '#ef4444' }} />
            ) : (
              <InfoIcon sx={{ fontSize: '3rem', color: 'var(--accent-primary)' }} />
            )}
          </div>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
            {message}
          </p>
          {subMessage && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {subMessage}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="btn glass"
            style={{ flex: 1, padding: '0.75rem' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="btn"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: danger ? '#ef4444' : 'var(--accent-primary)',
              color: danger ? 'white' : 'black',
              border: 'none',
              fontWeight: '700',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface ConfirmState {
  open: boolean;
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
}

/** Hook to manage a confirm modal — use `ask()` to trigger, render `modal` in JSX */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, message: '' });

  const ask = (
    message: string,
    onConfirm: () => void,
    opts?: { subMessage?: string; confirmLabel?: string; danger?: boolean }
  ) => {
    setState({ open: true, message, onConfirm, ...opts });
  };

  const close = () => setState((s) => ({ ...s, open: false }));

  const modal = state.open ? (
    <ConfirmModal
      message={state.message}
      subMessage={state.subMessage}
      confirmLabel={state.confirmLabel}
      danger={state.danger ?? true}
      onConfirm={() => { state.onConfirm?.(); close(); }}
      onCancel={close}
    />
  ) : null;

  return { ask, modal };
}

export default ConfirmModal;

'use client';

import { useActionState, useState } from 'react';
import { updateProfile } from '@/lib/actions';
import styles from '../login/login.module.css';

interface ProfileFormProps {
  user: any;
  batches: any[];
}

export default function ProfileForm({ user, batches }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [previewImage, setPreviewImage] = useState(user.image || '');

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Avatar Section */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          background: previewImage ? 'transparent' : 'var(--accent-primary)',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          color: '#000',
          fontWeight: '800',
          overflow: 'hidden',
          border: '4px solid var(--border-color)',
          boxShadow: '0 0 20px rgba(235, 183, 0, 0.2)'
        }}>
          {previewImage
            ? <img src={previewImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user.name?.charAt(0)
          }
        </div>
        <div className={styles.inputGroup} style={{ maxWidth: '300px', margin: '0 auto' }}>
          <input 
            type="text" 
            name="image" 
            placeholder="Profile Image URL" 
            className={styles.input}
            defaultValue={user.image || ''}
            onChange={(e) => setPreviewImage(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Full Name</label>
        <input name="name" type="text" defaultValue={user.name || ''} className={styles.input} required />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Email Address (Read-only)</label>
        <input type="email" value={user.email || ''} className={styles.input} disabled style={{ opacity: 0.6 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Batch</label>
          <select name="batchId" defaultValue={user.batchId || ''} className={styles.input} style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.05)' }}>
            <option value="" style={{ background: 'var(--bg-secondary)' }}>Select Batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id} style={{ background: 'var(--bg-secondary)' }}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Contact Number</label>
          <input name="phone" type="tel" defaultValue={user.phone || ''} placeholder="+880..." className={styles.input} />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Current Position / Job</label>
        <input name="occupation" type="text" defaultValue={user.occupation || ''} placeholder="e.g. Software Engineer at Google" className={styles.input} />
      </div>

      {state?.error && (
        <p style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', textAlign: 'center' }}>{state.error}</p>
      )}
      
      {state?.success && (
        <p style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center' }}>{state.message}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isPending} style={{ marginTop: '1rem' }}>
        {isPending ? 'Saving Changes...' : 'Save Profile Details'}
      </button>
    </form>
  );
}

'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { updateProfile } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import styles from '../login/login.module.css';

interface ProfileFormProps {
  user: any;
  batches: any[];
}

export default function ProfileForm({ user, batches }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [previewImage, setPreviewImage] = useState(user.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || 'Profile updated successfully!');
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Avatar Section */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <input 
          type="file" 
          name="profilePicture" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageChange}
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
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
            boxShadow: '0 0 20px rgba(235, 183, 0, 0.2)',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Click to change profile picture"
        >
          {previewImage
            ? <img src={previewImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user.name?.charAt(0)
          }
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
            color: 'white',
            fontSize: '1.5rem',
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
          >
            📷
          </div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Current Position / Job</label>
          <input name="occupation" type="text" defaultValue={user.occupation || ''} placeholder="e.g. Software Engineer" className={styles.input} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Organization / Workplace</label>
          <input name="workplace" type="text" defaultValue={user.workplace || ''} placeholder="e.g. Google" className={styles.input} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Current Address</label>
          <textarea name="currentAddress" defaultValue={user.currentAddress || ''} placeholder="City, Country" className={styles.input} style={{ minHeight: '80px', resize: 'vertical' }} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Permanent Address</label>
          <textarea name="permanentAddress" defaultValue={user.permanentAddress || ''} placeholder="Natore, Bangladesh" className={styles.input} style={{ minHeight: '80px', resize: 'vertical' }} />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isPending} style={{ marginTop: '1rem' }}>
        {isPending ? 'Saving Changes...' : 'Save Profile Details'}
      </button>
    </form>
  );
}

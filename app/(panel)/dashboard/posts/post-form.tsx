'use client';

import { useActionState, useState } from 'react';
import { createPost } from '@/lib/actions';
import styles from '@/app/(website)/login/login.module.css';

export default function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);
  
  if (state?.success) {
    return (
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '24px' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Success! 🎉</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{state.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn glass" 
          style={{ marginTop: '2rem' }}
        >
          Create Another Post
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="title">Post Title</label>
        <input 
          id="title" 
          name="title" 
          type="text" 
          placeholder="Give your post a title" 
          className={styles.input} 
          required 
          disabled={isPending}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="content">Content</label>
        <textarea 
          id="content" 
          name="content" 
          placeholder="What's on your mind? Share tournament updates, batch memories, or match highlights..." 
          className={styles.input} 
          style={{ minHeight: '200px', resize: 'vertical', paddingTop: '1rem' }}
          required 
          disabled={isPending}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="imageUrl">Image URL (Optional)</label>
          <input 
            id="imageUrl" 
            name="imageUrl" 
            type="url" 
            placeholder="https://example.com/image.jpg" 
            className={styles.input} 
            disabled={isPending}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="videoUrl">Video URL (Optional)</label>
          <input 
            id="videoUrl" 
            name="videoUrl" 
            type="url" 
            placeholder="https://youtube.com/..." 
            className={styles.input} 
            disabled={isPending}
          />
        </div>
      </div>

      {state?.error && (
        <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center' }}>{state.error}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isPending} style={{ marginTop: '1rem' }}>
        {isPending ? 'Submitting...' : 'Submit Post for Approval'}
      </button>
    </form>
  );
}

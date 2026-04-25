'use client';

import { useActionState, useState, useRef } from 'react';
import { createPost } from '@/lib/actions';
import type { AppUser } from '@/lib/server-auth';

interface PostFormProps {
  user: AppUser;
}

interface MediaPreview {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  file: File;
}

export default function PostForm({ user }: PostFormProps) {
  const [state, formAction, isPending] = useActionState(createPost, null);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'VIDEO') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews(prev => [...prev, {
            url: reader.result as string,
            type,
            file
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    // Append all media files to the same key names
    mediaPreviews.forEach(m => {
      if (m.type === 'IMAGE') {
        formData.append('imageFiles', m.file);
      } else {
        formData.append('videoFiles', m.file);
      }
    });
    formAction(formData);
  };

  return (
    <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
      <form action={handleSubmit}>
        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0, textTransform: 'none' }}>Create Post</h2>
        </div>

        {/* User Info */}
        <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            color: 'black'
          }}>
            {user.name?.charAt(0)}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{user.name}</div>
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '2px 8px', 
              borderRadius: '6px', 
              fontSize: '0.7rem', 
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px'
            }}>
              👥 Public
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '0 1rem' }}>
          <input 
            name="title" 
            type="text" 
            placeholder="Post Title (Optional)" 
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: '1rem', 
              padding: '0.5rem 0',
              outline: 'none',
              fontWeight: '600'
            }} 
          />
          <textarea 
            name="content" 
            placeholder={`What's on your mind, ${user.name?.split(' ')[0]}?`}
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: '1.5rem', 
              minHeight: '150px',
              padding: '0.5rem 0',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.4'
            }}
            required 
          />
        </div>

        {/* Multi-Media Previews */}
        {mediaPreviews.length > 0 && (
          <div style={{ padding: '0 1rem 1rem', display: 'grid', gridTemplateColumns: mediaPreviews.length === 1 ? '1fr' : '1fr 1fr', gap: '8px' }}>
            {mediaPreviews.map((media, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '1/1' }}>
                {media.type === 'IMAGE' ? (
                  <img 
                    src={media.url} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <video 
                    src={media.url} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                )}
                <button 
                  type="button" 
                  onClick={() => removeMedia(index)}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Attachments Section */}
        <div style={{ padding: '0.5rem 1rem' }}>
          <div style={{ 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>Add to your post</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="file" 
                name="imageFiles" 
                accept="image/*" 
                multiple
                ref={fileInputRef} 
                onChange={(e) => handleMediaChange(e, 'IMAGE')}
                style={{ display: 'none' }} 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                title="Photo"
              >
                🖼️
              </button>
              <input 
                type="file" 
                name="videoFiles" 
                accept="video/*" 
                multiple
                ref={videoInputRef}
                onChange={(e) => handleMediaChange(e, 'VIDEO')}
                style={{ display: 'none' }} 
              />
              <button 
                type="button" 
                onClick={() => videoInputRef.current?.click()}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                title="Video"
              >
                📹
              </button>
              <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                😊
              </button>
              <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                📍
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {state?.error && (
          <div style={{ margin: '0.5rem 1rem', color: 'var(--accent-danger)', fontSize: '0.8rem', fontWeight: '600' }}>
            ⚠️ {state.error}
          </div>
        )}

        {state?.success && (
          <div style={{ margin: '0.5rem 1rem', color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
            🎉 Post submitted! Visible after approval.
          </div>
        )}

        {/* Footer / Submit */}
        <div style={{ padding: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isPending}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          >
            {isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

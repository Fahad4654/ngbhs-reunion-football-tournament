'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
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

import { toast } from 'react-hot-toast';
import MediaRenderer from '@/app/components/MediaRenderer';

export default function PostForm({ user }: PostFormProps) {
  const [state, formAction, isPending] = useActionState(createPost, null);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs when component unmounts to prevent memory leaks
  const previewsRef = useRef<MediaPreview[]>(mediaPreviews);
  previewsRef.current = mediaPreviews;
  useEffect(() => {
    return () => {
      previewsRef.current.forEach(m => URL.revokeObjectURL(m.url));
    };
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'VIDEO') => {
    const files = Array.from(e.target.files || []);
    
    if (mediaPreviews.length + files.length > 50) {
      toast.error("Maximum 50 items allowed.");
      return;
    }

    if (files.length > 0) {
      const newPreviews: MediaPreview[] = files.map(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();

        // Format validation
        if (type === 'VIDEO' && ['avi', 'mkv', 'flv', 'wmv'].includes(extension || '')) {
          toast.error(`Format .${extension} is not supported. Please use MP4 or WebM.`);
          return null;
        }
        if (type === 'IMAGE' && ['tif', 'tiff', 'bmp'].includes(extension || '')) {
          toast.error(`Format .${extension} is not supported. Please use JPEG, PNG, or WebP.`);
          return null;
        }

        // Size validation
        if (type === 'IMAGE' && file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large (Max 10MB)`);
          return null;
        }
        if (type === 'VIDEO' && file.size > 1024 * 1024 * 1024) {
          toast.error(`Video ${file.name} is too large (Max 1GB)`);
          return null;
        }

        // Use URL.createObjectURL instead of FileReader for better performance with large files
        return {
          url: URL.createObjectURL(file),
          type,
          file
        };
      }).filter((p): p is MediaPreview => p !== null);

      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    const mediaToRemove = mediaPreviews[index];
    if (mediaToRemove) {
      URL.revokeObjectURL(mediaToRemove.url);
    }
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    toast.success("Media removed");
  };

  const handleSubmit = (formData: FormData) => {
    if (mediaPreviews.length === 0 && !formData.get('content')) {
      toast.error("Please add some content or media.");
      return;
    }

    // Append all media files to the same key names
    mediaPreviews.forEach(m => {
      if (m.type === 'IMAGE') {
        formData.append('imageFiles', m.file);
      } else {
        formData.append('videoFiles', m.file);
      }
    });

    const promise = new Promise(async (resolve, reject) => {
      try {
        await formAction(formData);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Uploading your story...',
      success: 'Post submitted! Waiting for approval.',
      error: 'Failed to submit post.',
    });
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
            <div style={{ marginTop: '4px' }}>
              <select 
                name="scope"
                defaultValue="GLOBAL"
                className="glass"
                style={{ 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <option value="GLOBAL" style={{ color: 'black' }}>🌍 Global Community</option>
                {user.batchId && <option value="BATCH" style={{ color: 'black' }}>🎓 My Batch Only</option>}
              </select>
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
                <MediaRenderer 
                  url={media.url} 
                  type={media.type} 
                  fileName={media.file.name}
                  style={{ borderRadius: '8px' }}
                />
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
            alignItems: 'center',
            position: 'relative'
          }}>
            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>Add to your post</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept="image/*, .jpg, .jpeg, .png, .gif, .webp, .avif, .heic, .heif" 
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
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', position: 'absolute', top: '-15px', right: '110px' }}>All Formats</div>

              <input 
                type="file" 
                accept="video/*, .mp4, .mov, .webm" 
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
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', position: 'absolute', top: '-15px', right: '65px' }}>All Formats</div>
              <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                😊
              </button>
              <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                📍
              </button>
            </div>
          </div>
        </div>

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

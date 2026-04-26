'use client';

import { useState, useRef, useEffect } from 'react';
import { deletePostAction, editPostAction } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import MediaRenderer from '@/app/components/MediaRenderer';

export interface PostMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
}

interface MediaPreview {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  file: File;
}

interface PostOptionsProps {
  postId: string;
  title: string | null;
  content: string;
  isAuthorized: boolean;
  media?: PostMedia[];
}

export default function PostOptions({ postId, title, content, isAuthorized, media = [] }: PostOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, message: '', onConfirm: null });

  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const previewsRef = useRef<MediaPreview[]>(newMediaPreviews);
  previewsRef.current = newMediaPreviews;
  useEffect(() => {
    return () => {
      previewsRef.current.forEach(m => URL.revokeObjectURL(m.url));
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, message: '', onConfirm: null });
  };

  if (!isAuthorized) return null;

  const handleDelete = () => {
    setIsOpen(false);
    confirmAction('Are you sure you want to delete this post?', async () => {
      const promise = deletePostAction(postId).then(res => {
        if (res.error) throw new Error(res.error);
        return res;
      });

      toast.promise(promise, {
        loading: 'Deleting post...',
        success: 'Post deleted successfully.',
        error: (err) => err.message || 'Failed to delete post.',
      });
    });
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'VIDEO') => {
    const files = Array.from(e.target.files || []);
    
    const existingMediaCount = media.length - removedMediaIds.length;
    if (existingMediaCount + newMediaPreviews.length + files.length > 50) {
      toast.error("Maximum 50 items allowed.");
      return;
    }

    if (files.length > 0) {
      const newPreviews: MediaPreview[] = files.map(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (type === 'VIDEO' && ['avi', 'mkv', 'flv', 'wmv'].includes(extension || '')) {
          toast.error(`Format .${extension} is not supported. Please use MP4 or WebM.`);
          return null;
        }
        if (type === 'IMAGE' && ['tif', 'tiff', 'bmp'].includes(extension || '')) {
          toast.error(`Format .${extension} is not supported. Please use JPEG, PNG, or WebP.`);
          return null;
        }
        if (type === 'IMAGE' && file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large (Max 10MB)`);
          return null;
        }
        if (type === 'VIDEO' && file.size > 1024 * 1024 * 1024) {
          toast.error(`Video ${file.name} is too large (Max 1GB)`);
          return null;
        }
        return {
          url: URL.createObjectURL(file),
          type,
          file
        };
      }).filter((p): p is MediaPreview => p !== null);

      setNewMediaPreviews(prev => [...prev, ...newPreviews]);
    }
    e.target.value = '';
  };

  const removeExistingMedia = (id: string) => {
    setRemovedMediaIds(prev => [...prev, id]);
  };

  const removeNewMedia = (index: number) => {
    const mediaToRemove = newMediaPreviews[index];
    if (mediaToRemove) URL.revokeObjectURL(mediaToRemove.url);
    setNewMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    removedMediaIds.forEach(id => formData.append('removedMediaIds', id));
    newMediaPreviews.forEach(m => {
      if (m.type === 'IMAGE') formData.append('imageFiles', m.file);
      else formData.append('videoFiles', m.file);
    });

    const promise = editPostAction(postId, formData).then(res => {
      if (res.error) throw new Error(res.error);
      setIsEditing(false);
      setRemovedMediaIds([]);
      setNewMediaPreviews([]);
      return res;
    });

    toast.promise(promise, {
      loading: 'Updating post...',
      success: 'Post updated successfully.',
      error: (err) => err.message || 'Failed to update post.',
    });
  };

  return (
    <>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
        >
          ⋯
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minWidth: '150px',
            zIndex: 50,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <button 
              onClick={() => { setIsEditing(true); setIsOpen(false); }}
              className="btn"
              style={{ background: 'transparent', color: 'white', justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              ✏️ Edit Post
            </button>
            <button 
              onClick={handleDelete}
              className="btn"
              style={{ background: 'transparent', color: '#ef4444', justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              🗑️ Delete Post
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Edit Post</h3>
            
            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Title (Optional)</label>
                <input 
                  name="title" 
                  defaultValue={title || ''} 
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Content</label>
                <textarea 
                  name="content" 
                  defaultValue={content}
                  required
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white', resize: 'vertical' }}
                />
              </div>

              {/* Media Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                {media.filter(m => !removedMediaIds.includes(m.id)).map(m => (
                  <div key={m.id} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <MediaRenderer url={m.url} type={m.type} style={{ borderRadius: '8px' }} />
                    <button type="button" onClick={() => removeExistingMedia(m.id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
                  </div>
                ))}
                {newMediaPreviews.map((m, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', opacity: 0.8 }}>
                    <MediaRenderer url={m.url} type={m.type} style={{ borderRadius: '8px' }} />
                    <button type="button" onClick={() => removeNewMedia(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Attachments Section */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '0.875rem' }}>Add to your post</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="file" accept="image/*, .jpg, .jpeg, .png, .webp" multiple ref={fileInputRef} onChange={(e) => handleMediaChange(e, 'IMAGE')} style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '4px' }} title="Add Photo">🖼️</button>
                  
                  <input type="file" accept="video/*, .mp4, .webm" multiple ref={videoInputRef} onChange={(e) => handleMediaChange(e, 'VIDEO')} style={{ display: 'none' }} />
                  <button type="button" onClick={() => videoInputRef.current?.click()} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '4px' }} title="Add Video">📹</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn glass" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmState.isOpen && typeof window !== 'undefined' && require('react-dom').createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
          onClick={closeConfirm}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem', 
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(235, 183, 0, 0.1)',
              border: '1px solid rgba(235, 183, 0, 0.3)',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              margin: '0 1rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                margin: 0, 
                fontWeight: '600', 
                fontSize: '1.25rem', 
                color: 'var(--text-primary)',
                fontFamily: 'Outfit, sans-serif'
              }}>
                {confirmState.message}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={closeConfirm}
                className="btn glass"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmState.onConfirm) confirmState.onConfirm();
                  closeConfirm();
                }}
                className="btn"
                style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.9) translateY(10px); }
              to { transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}

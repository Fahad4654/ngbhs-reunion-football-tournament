'use client';

import { useState, useRef, useEffect } from 'react';
import { deletePostAction, editPostAction } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface PostOptionsProps {
  postId: string;
  title: string | null;
  content: string;
  isAuthorized: boolean;
}

export default function PostOptions({ postId, title, content, isAuthorized }: PostOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, message: '', onConfirm: null });

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

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTitle = formData.get('title') as string;
    const newContent = formData.get('content') as string;

    const promise = editPostAction(postId, newTitle, newContent).then(res => {
      if (res.error) throw new Error(res.error);
      setIsEditing(false);
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
                  rows={6}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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

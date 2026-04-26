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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthorized) return null;

  const handleDelete = () => {
    setIsOpen(false);
    toast((t) => (
      <div style={{
        background: 'var(--bg-secondary)',
        color: 'white',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ fontWeight: '600' }}>Are you sure you want to delete this post?</div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            className="btn glass" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button 
            className="btn" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#ef4444', color: 'white', border: 'none' }}
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const executeDelete = async () => {
    const promise = deletePostAction(postId).then(res => {
      if (res.error) throw new Error(res.error);
      return res;
    });

    toast.promise(promise, {
      loading: 'Deleting post...',
      success: 'Post deleted successfully.',
      error: (err) => err.message || 'Failed to delete post.',
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
    </>
  );
}

'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { createPost } from '@/lib/actions';
import type { AppUser } from '@/lib/server-auth';
import { toast } from 'react-hot-toast';
import MediaRenderer from '@/app/components/MediaRenderer';

import EditIcon from '@mui/icons-material/Edit';
import PublicIcon from '@mui/icons-material/Public';
import SchoolIcon from '@mui/icons-material/School';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

interface PostFormProps {
  user: AppUser;
}

interface MediaPreview {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  file: File;
}

export default function PostForm({ user }: PostFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [scope, setScope] = useState<'GLOBAL' | 'BATCH'>('GLOBAL');
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Cleanup object URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      mediaPreviews.forEach(m => URL.revokeObjectURL(m.url));
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

    // Block PENDING users from posting to batch scope
    const selectedScope = formData.get('scope') as string;
    if (selectedScope === 'BATCH' && user.status === 'PENDING') {
      toast.error('Your batch membership is still pending approval. You can only post globally for now.');
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

    const promise = (async () => {
      setIsPending(true);
      try {
        const res = await createPost(null, formData);
        if (res.error) throw new Error(res.error);
        
        // Success: Clear everything
        mediaPreviews.forEach(m => URL.revokeObjectURL(m.url));
        setMediaPreviews([]);
        formRef.current?.reset();
        
        return res;
      } finally {
        setIsPending(false);
      }
    })();

    toast.promise(promise, {
      loading: 'Uploading your story...',
      success: 'Post submitted! Waiting for approval.',
      error: (err) => err.message || 'Failed to submit post.',
    });
  };

  return (
    <div className="glass" style={{ borderRadius: 'calc(0.625vw * var(--font-scale))', overflow: 'hidden', background: 'var(--bg-secondary)', border: '0.052vw solid var(--border-color)' }}>
      <form ref={formRef} action={handleSubmit}>
        {/* Header */}
        <div style={{ 
          padding: '0.75rem', 
          background: 'linear-gradient(90deg, rgba(235, 183, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
          borderBottom: '1px solid var(--border-color)', 
          textAlign: 'center' 
        }}>
          <h2 style={{ 
            fontSize: '1rem', 
            fontWeight: '900',
            color: 'var(--accent-primary)', 
            margin: 0, 
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Create Post
          </h2>
        </div>

        {/* User Info */}
        <div style={{ padding: 'calc(1.481vh * var(--font-scale)) calc(0.833vw * var(--font-scale))', display: 'flex', alignItems: 'center', gap: 'calc(0.625vw * var(--font-scale))' }}>
          <div style={{ 
            width: 'calc(2.083vw * var(--font-scale))', 
            minWidth: 'calc(2.083vw * var(--font-scale))',
            height: 'calc(2.083vw * var(--font-scale))', 
            borderRadius: '50%', 
            background: user.image ? 'transparent' : 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            color: 'black',
            fontSize: 'calc(0.8vw * var(--font-scale))',
            overflow: 'hidden',
            border: user.image ? '0.052vw solid var(--border-color)' : 'none'
          }}>
            {user.image ? (
              <img src={user.image} alt={user.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name?.charAt(0)
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: '700', fontSize: 'calc(0.85vw * var(--font-scale))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ marginTop: '0.37vh' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select 
                  name="scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value as 'GLOBAL' | 'BATCH')}
                  className="glass"
                  style={{ 
                    padding: '0.37vh 0.417vw 0.37vh 1.5rem', 
                    borderRadius: 'calc(0.313vw * var(--font-scale))', 
                    fontSize: 'calc(0.7vw * var(--font-scale))', 
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    border: '0.052vw solid var(--border-color)',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    appearance: 'none'
                  }}
                >
                  <option value="GLOBAL" style={{ color: 'black' }}>Global</option>
                  {user.batchId && <option value="BATCH" style={{ color: 'black' }}>Batch Only</option>}
                </select>
                <div style={{ position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                  {scope === 'GLOBAL' ? <PublicIcon sx={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }} /> : <SchoolIcon sx={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '0 calc(0.833vw * var(--font-scale))' }}>
          <input 
            name="title" 
            type="text" 
            placeholder="Post Title (Optional)" 
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: 'calc(0.9vw * var(--font-scale))', 
              padding: 'calc(1vh * var(--font-scale)) 0',
              outline: 'none',
              fontWeight: '600'
            }} 
          />
          <textarea 
            name="content" 
            placeholder={`What's on your mind?`}
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: 'calc(1.1vw * var(--font-scale))', 
              minHeight: '15vh',
              padding: 'calc(1vh * var(--font-scale)) 0',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.4'
            }}
            required 
          />
        </div>

        {/* Multi-Media Previews */}
        {mediaPreviews.length > 0 && (
          <div style={{ padding: '0 calc(0.833vw * var(--font-scale)) calc(1.481vh * var(--font-scale))', display: 'grid', gridTemplateColumns: mediaPreviews.length === 1 ? '1fr' : '1fr 1fr', gap: 'calc(0.417vw * var(--font-scale))' }}>
            {mediaPreviews.map((media, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: 'calc(0.417vw * var(--font-scale))', overflow: 'hidden', border: '0.052vw solid var(--border-color)', aspectRatio: '1/1' }}>
                <MediaRenderer 
                  url={media.url} 
                  type={media.type} 
                  fileName={media.file.name}
                  style={{ borderRadius: 'calc(0.417vw * var(--font-scale))' }}
                />
                <button 
                  type="button" 
                  onClick={() => removeMedia(index)}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '2rem', height: '2rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
                >
                  <CloseIcon sx={{ fontSize: '1.2rem' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Attachments Section */}
        <div style={{ padding: '0.5rem 0.833vw' }}>
          <div style={{ 
            border: '0.052vw solid var(--border-color)', 
            borderRadius: 'calc(0.417vw * var(--font-scale))', 
            padding: 'calc(1.111vh * var(--font-scale)) calc(0.833vw * var(--font-scale))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            <span style={{ color: 'white', fontSize: 'calc(0.75vw * var(--font-scale))', fontWeight: '600' }}>Add to your post</span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Photo"
              >
                <ImageIcon sx={{ fontSize: 'calc(1.5vw * var(--font-scale))', color: '#45bd62' }} />
              </button>

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
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Video"
              >
                <VideocamIcon sx={{ fontSize: 'calc(1.5vw * var(--font-scale))', color: '#f02849' }} />
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <SentimentSatisfiedAltIcon sx={{ fontSize: 'calc(1.5vw * var(--font-scale))', color: '#f7b928' }} />
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ fontSize: 'calc(1.5vw * var(--font-scale))', color: '#f5533d' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Submit */}
        <div style={{ padding: '0.5rem 0.833vw 1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isPending}
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '800' }}
          >
            {isPending ? 'Posting...' : 'POST'}
          </button>
        </div>
      </form>
    </div>
  );
}

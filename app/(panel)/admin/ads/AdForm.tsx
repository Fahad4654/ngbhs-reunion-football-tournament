'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AdPosition, Advertisement } from '@prisma/client';
import { createAd, updateAd } from '@/lib/actions/ad.actions';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface AdFormProps {
  initialData?: Advertisement | null;
  onSuccess?: () => void;
}

export default function AdForm({ initialData, onSuccess }: AdFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || '');
  const [position, setPosition] = useState<AdPosition>(initialData?.position || 'SIDEBAR');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [closeDelay, setCloseDelay] = useState(initialData?.closeDelay ?? 5);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/ads', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      setImageUrl(data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast.error('Title and Image are required');
      return;
    }

    setIsPending(true);

    try {
      if (initialData?.id) {
        const res = await updateAd(initialData.id, {
          title,
          linkUrl,
          position,
          imageUrl,
          isActive,
          closeDelay
        });
        if (res.error) throw new Error(res.error);
        toast.success('Advertisement updated successfully');
      } else {
        const res = await createAd({
          title,
          linkUrl,
          position,
          imageUrl,
          isActive,
          closeDelay
        });
        if (res.error) throw new Error(res.error);
        toast.success('Advertisement created successfully');
        
        // Reset form if it's a new ad
        setTitle('');
        setLinkUrl('');
        setImageUrl('');
        setIsActive(true);
      }
      
      router.refresh();
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="input glass" 
          style={{ width: '100%' }} 
          placeholder="E.g., Winter Sale 50% Off" 
          required 
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Link URL (Optional)</label>
        <input 
          type="url" 
          value={linkUrl} 
          onChange={e => setLinkUrl(e.target.value)} 
          className="input glass" 
          style={{ width: '100%' }} 
          placeholder="https://example.com/sale" 
        />
      </div>

      <div style={{ width: '100%' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Position</label>
        <select 
          value={position} 
          onChange={e => setPosition(e.target.value as AdPosition)} 
          className="input glass" 
          style={{ width: '100%' }}
        >
          <option value="SIDEBAR">Sidebar (Admin & Feed)</option>
          <option value="STANDINGS">Standings Page</option>
          <option value="FEED_TOP">Feed Page - Top</option>
          <option value="MATCHES">Matches Page - Top</option>
          <option value="NEWS">News Page - Top</option>
          <option value="ORGANIZATION">Organization Page - Top</option>
          <option value="FLOATING">Floating Ad (Mobile Only)</option>
        </select>

      </div>
...
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mobile Close Delay (Seconds)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input 
            type="number" 
            value={closeDelay} 
            onChange={e => setCloseDelay(parseInt(e.target.value) || 0)} 
            className="input glass" 
            style={{ width: '100px' }}
            min="0"
            max="60"
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Number of seconds before the "Close" button appears on mobile floating ads.
          </span>
        </div>
      </div>


      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Advertisement Media</label>
        {imageUrl ? (
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
            {imageUrl.match(/\.(mp4|webm|ogg)$/) ? (
              <video src={imageUrl} style={{ width: '100%', display: 'block' }} autoPlay muted loop playsInline />
            ) : (
              <img src={imageUrl} alt="Ad Preview" style={{ width: '100%', display: 'block' }} />
            )}
            <button 
              type="button" 
              onClick={() => setImageUrl('')} 
              className="btn btn-primary" 
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ border: '2px dashed var(--border-color)', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
            <input 
              type="file" 
              id="ad-image-upload" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              disabled={uploading}
            />
            <label htmlFor="ad-image-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <AddPhotoAlternateIcon sx={{ fontSize: '3rem' }} />
              {uploading ? 'Uploading...' : 'Click to upload image'}
            </label>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          id="is-active" 
          checked={isActive} 
          onChange={e => setIsActive(e.target.checked)} 
          style={{ width: '20px', height: '20px' }}
        />
        <label htmlFor="is-active" style={{ fontWeight: 'bold' }}>Active (Display on site)</label>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isPending || uploading || !title || !imageUrl}
        style={{ marginTop: '1rem' }}
      >
        {isPending ? 'Saving...' : initialData ? 'Update Advertisement' : 'Create Advertisement'}
      </button>
    </form>
  );
}

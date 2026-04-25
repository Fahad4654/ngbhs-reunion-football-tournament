'use client';

import React from 'react';

interface MediaRendererProps {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  fileName?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov']; // .mov is widely supported enough on mobile/safari
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'];

export default function MediaRenderer({ url, type, fileName, className, style }: MediaRendererProps) {
  // Extract file name from URL if not provided (handling both Object URLs and standard paths)
  let extractedName = fileName || 'Attached File';
  let extension = '';

  if (!fileName && url && !url.startsWith('blob:')) {
    const parts = url.split('/');
    extractedName = parts[parts.length - 1];
  } else if (!fileName && url.startsWith('blob:')) {
    extractedName = type === 'VIDEO' ? 'Video File' : 'Image File';
  }

  if (extractedName) {
    const nameParts = extractedName.split('.');
    if (nameParts.length > 1) {
      extension = `.${nameParts[nameParts.length - 1].toLowerCase()}`;
    }
  }

  // Determine if supported
  let isSupported = true;
  if (extension) {
    if (type === 'VIDEO') {
      isSupported = SUPPORTED_VIDEO_EXTENSIONS.includes(extension);
    } else {
      isSupported = SUPPORTED_IMAGE_EXTENSIONS.includes(extension);
    }
  } else {
    // If we can't determine extension (e.g. from blob URL where original file wasn't passed), assume supported and let browser try
    // Wait, in post-form we have the File object. We should pass the fileName.
  }

  if (isSupported) {
    if (type === 'IMAGE') {
      return <img src={url} alt={extractedName} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }} />;
    } else {
      return (
        <video 
          src={url} 
          controls 
          className={className}
          style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }} 
        />
      );
    }
  }

  // Unsupported Format - Render Sleek Attachment Card
  return (
    <div className={`glass ${className || ''}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      width: '100%',
      height: '100%',
      minHeight: '200px',
      gap: '1rem',
      backgroundColor: 'rgba(255,255,255,0.02)',
      ...style
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'rgba(235, 183, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        color: 'var(--accent-primary)'
      }}>
        {type === 'VIDEO' ? '🎬' : '🖼️'}
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontWeight: '600', color: 'white', wordBreak: 'break-all' }}>{extractedName}</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Format not supported for web playback
        </p>
      </div>

      <a 
        href={url} 
        download={extractedName}
        target="_blank"
        rel="noopener noreferrer"
        className="btn glass"
        style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        onClick={(e) => e.stopPropagation()} // Prevent triggering parent clicks if any
      >
        ⬇️ Download File
      </a>
    </div>
  );
}

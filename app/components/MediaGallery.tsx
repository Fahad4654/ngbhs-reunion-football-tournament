'use client';

import { useState, useEffect, useCallback } from 'react';
import MediaRenderer from './MediaRenderer';

export interface MediaItem {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface MediaGalleryProps {
  media: MediaItem[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null && media.length > 1) {
      setSelectedIndex((selectedIndex - 1 + media.length) % media.length);
    }
  }, [selectedIndex, media.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null && media.length > 1) {
      setSelectedIndex((selectedIndex + 1) % media.length);
    }
  }, [selectedIndex, media.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  if (!media || media.length === 0) return null;

  return (
    <>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: media.length === 1 ? '1fr' : '1fr 1fr',
        gap: '0.417vw',
        padding: '1.481vh 1.25vw',
      }}>
        {media.map((item, idx) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedIndex(idx)}
            style={{ 
              position: 'relative', 
              aspectRatio: media.length === 1 ? '16/9' : (media.length === 3 && idx === 0) ? '16/9' : '1/1',
              gridColumn: (media.length === 3 && idx === 0) ? 'span 2' : 'span 1',
              borderRadius: '0.625vw',
              overflow: 'hidden',
              border: '0.052vw solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            <MediaRenderer 
              url={item.url} 
              type={item.type} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
            />
          </div>
        ))}
      </div>

      {selectedIndex !== null && typeof window !== 'undefined' && require('react-dom').createPortal(
        <div 
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(0.521vw)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '1.25vw',
              right: '1.25vw',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              width: '2.292vw',
              height: '2.292vw',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25vw',
              zIndex: 10,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ✕
          </button>

          {/* Navigation Controls */}
          {media.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                style={{
                  position: 'absolute',
                  left: '1.25vw',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '2.917vw',
                  height: '2.917vw',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.667vw',
                  zIndex: 10,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ‹
              </button>
              <button 
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  right: '1.25vw',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '2.917vw',
                  height: '2.917vw',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.667vw',
                  zIndex: 10,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ›
              </button>
              
              {/* Media Counter */}
              <div style={{
                position: 'absolute',
                bottom: '1.667vw',
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '0.741vh 0.833vw',
                borderRadius: '1.042vw',
                fontSize: '0.729vw',
                letterSpacing: '0.104vw',
              }}>
                {selectedIndex + 1} / {media.length}
              </div>
            </>
          )}

          {/* Media Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MediaRenderer 
              url={media[selectedIndex].url} 
              type={media[selectedIndex].type} 
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '0.417vw',
                boxShadow: '0 1.302vw 2.604vw -0.625vw rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}

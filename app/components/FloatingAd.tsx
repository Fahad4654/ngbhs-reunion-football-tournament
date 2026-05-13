'use client';

import { useState, useEffect } from 'react';
import { getActiveAdsByPosition } from '@/lib/actions/ad.actions';
import { AdPosition, Advertisement } from '@prisma/client';
import CloseIcon from '@mui/icons-material/Close';

interface FloatingAdProps {
  position: AdPosition;
}

export default function FloatingAd({ position }: FloatingAdProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetchAds() {
      const fetchedAds = await getActiveAdsByPosition(position);
      if (fetchedAds && fetchedAds.length > 0) {
        setAds(fetchedAds as Advertisement[]);
        setIsVisible(true);
        const delay = (fetchedAds[0] as any).closeDelay || 5;
        setTimeLeft(delay);
      }
    }
    
    // Only run on mobile
    if (window.innerWidth <= 768) {
      fetchAds();
    }
  }, [position]);

  useEffect(() => {
    if (!isVisible || ads.length === 0) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [timeLeft, isVisible, ads]);

  const handleClose = () => {
    if (canClose) {
      setIsVisible(false);
    }
  };

  if (!isVisible || ads.length === 0) return null;

  const ad = ads[0]; // Show only one for now to avoid clutter
  const isVideo = ad.imageUrl.match(/\.(mp4|webm|mov)$/i);

  return (
    <div 
      className="mobile-only" 
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '20px', 
        right: '20px', 
        zIndex: 10000,
        animation: 'slideUp 0.5s ease-out'
      }}
    >
      <div className="glass" style={{ 
        position: 'relative', 
        padding: '10px', 
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        border: '1px solid var(--accent-primary)',
        overflow: 'hidden'
      }}>
        {/* Close Button / Countdown */}
        <div style={{ 
          position: 'absolute', 
          top: '5px', 
          right: '5px', 
          zIndex: 10
        }}>
          {canClose ? (
            <button 
              onClick={handleClose}
              style={{ 
                background: 'rgba(0,0,0,0.7)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              <CloseIcon sx={{ fontSize: '1.2rem' }} />
            </button>
          ) : (
            <div style={{ 
              background: 'rgba(0,0,0,0.7)', 
              color: 'white', 
              borderRadius: '20px', 
              padding: '4px 10px', 
              fontSize: '0.75rem',
              fontWeight: 'bold',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              Wait {timeLeft}s
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
          Sponsored Content
        </div>

        {ad.linkUrl ? (
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
            {isVideo ? (
              <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '40vh', objectFit: 'contain' }} />
            ) : (
              <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '40vh', objectFit: 'contain' }} />
            )}
          </a>
        ) : (
          <div>
            {isVideo ? (
              <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '40vh', objectFit: 'contain' }} />
            ) : (
              <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '40vh', objectFit: 'contain' }} />
            )}
          </div>
        )}

        <div style={{ marginTop: '10px', fontWeight: '800', fontSize: '0.95rem', color: 'white', letterSpacing: '-0.02em' }}>
          {ad.title}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

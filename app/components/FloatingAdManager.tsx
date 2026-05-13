'use client';

import { useState, useEffect } from 'react';
import { getActiveAdsByPosition } from '@/lib/actions/ad.actions';
import { Advertisement } from '@prisma/client';
import CloseIcon from '@mui/icons-material/Close';

export default function FloatingAdManager() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetchFloatingAds() {
      const fetchedAds = await getActiveAdsByPosition('FLOATING');
      if (fetchedAds && fetchedAds.length > 0) {
        setAds(fetchedAds as Advertisement[]);
        setIsVisible(true);
        const delay = (fetchedAds[0] as any).closeDelay || 5;
        setTimeLeft(delay);
      }
    }
    
    // Only run on mobile
    if (window.innerWidth <= 768) {
      fetchFloatingAds();
    }
  }, []);

  useEffect(() => {
    if (!isVisible || ads.length === 0) return;

    const currentAd = ads[currentAdIndex] as any;
    const delay = currentAd.closeDelay || 5;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [timeLeft, isVisible, ads, currentAdIndex]);

  const handleClose = () => {
    if (canClose) {
      setIsVisible(false);
    }
  };

  if (!isVisible || ads.length === 0) return null;

  const ad = ads[currentAdIndex];
  const isVideo = ad.imageUrl.match(/\.(mp4|webm|mov)$/i);

  return (
    <div 
      className="mobile-only" 
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '20px', 
        right: '20px', 
        zIndex: 9999,
        animation: 'slideUp 0.5s ease-out'
      }}
    >
      <div className="glass" style={{ 
        position: 'relative', 
        padding: '10px', 
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
                background: 'rgba(0,0,0,0.6)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <CloseIcon sx={{ fontSize: '1.2rem' }} />
            </button>
          ) : (
            <div style={{ 
              background: 'rgba(0,0,0,0.6)', 
              color: 'white', 
              borderRadius: '15px', 
              padding: '2px 8px', 
              fontSize: '0.7rem',
              fontWeight: 'bold',
              backdropFilter: 'blur(4px)'
            }}>
              Wait {timeLeft}s
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 'bold' }}>
          Sponsored
        </div>

        {ad.linkUrl ? (
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
            {isVideo ? (
              <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
            ) : (
              <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
            )}
          </a>
        ) : (
          <div>
            {isVideo ? (
              <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
            ) : (
              <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
            )}
          </div>
        )}

        <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: 'white' }}>
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

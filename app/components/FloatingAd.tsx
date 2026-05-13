'use client';

import { useState, useEffect } from 'react';
import { getActiveAdsByPosition } from '@/lib/actions/ad.actions';
import { AdPosition, Advertisement } from '@prisma/client';
import CloseIcon from '@mui/icons-material/Close';

interface FloatingAdProps {
  positions: AdPosition[];
}

export default function FloatingAd({ positions }: FloatingAdProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetchAds() {
      try {
        const adsPromises = positions.map(pos => getActiveAdsByPosition(pos));
        const adsResults = await Promise.all(adsPromises);
        const allAds = adsResults.flat() as Advertisement[];
        
        if (allAds.length > 0) {
          setAds(allAds);
          setIsVisible(true);
          const maxDelay = Math.max(...allAds.map(ad => (ad as any).closeDelay || 5));
          setTimeLeft(maxDelay);
        }
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    }
    
    // Only run on mobile
    if (window.innerWidth <= 768) {
      fetchAds();
    }
  }, [positions.join(',')]);


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

  return (
    <div 
      className="mobile-only" 
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '20px', 
        right: '20px', 
        zIndex: 10000,
        maxWidth: '400px',
        margin: '0 auto',
        animation: 'slideUp 0.5s ease-out'
      }}
    >
      <div className="glass" style={{ 
        position: 'relative', 
        padding: '12px', 
        borderRadius: '16px',
        boxShadow: '0 15px 50px rgba(0,0,0,0.7)',
        border: '1.5px solid var(--accent-primary)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Close Button / Countdown */}
        <div style={{ 
          position: 'absolute', 
          top: '8px', 
          right: '8px', 
          zIndex: 10
        }}>
          {canClose ? (
            <button 
              onClick={handleClose}
              style={{ 
                background: 'rgba(0,0,0,0.8)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              <CloseIcon sx={{ fontSize: '1.2rem' }} />
            </button>
          ) : (
            <div style={{ 
              background: 'rgba(235, 183, 0, 0.9)', 
              color: 'black', 
              borderRadius: '20px', 
              padding: '4px 12px', 
              fontSize: '0.75rem',
              fontWeight: '900',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {timeLeft}s
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.15em' }}>
          Sponsored
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '40vh', overflowY: 'auto', paddingRight: '4px' }} className="no-scrollbar">
          {ads.map((ad) => {
            const isVideo = ad.imageUrl.match(/\.(mp4|webm|mov)$/i);
            return (
              <div key={ad.id} style={{ borderBottom: ads.length > 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: ads.length > 1 ? '0.75rem' : '0' }}>
                {ad.linkUrl ? (
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                    {isVideo ? (
                      <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '120px', objectFit: 'contain' }} />
                    ) : (
                      <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '120px', objectFit: 'contain' }} />
                    )}
                  </a>
                ) : (
                  <div>
                    {isVideo ? (
                      <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '120px', objectFit: 'contain' }} />
                    ) : (
                      <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '120px', objectFit: 'contain' }} />
                    )}
                  </div>
                )}
                <div style={{ marginTop: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'white' }}>
                  {ad.title}
                </div>
              </div>
            );
          })}
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

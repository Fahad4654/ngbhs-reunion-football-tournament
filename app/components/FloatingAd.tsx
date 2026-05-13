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

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (!isVisible || ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // Cycle every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible, ads.length]);

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
        flexDirection: 'column'
      }}>
        {/* Non-closable indicator */}
        <div style={{ 
          position: 'absolute', 
          top: '8px', 
          right: '8px', 
          zIndex: 10
        }}>
          <div style={{ 
            background: 'rgba(235, 183, 0, 0.2)', 
            color: 'var(--accent-primary)', 
            borderRadius: '20px', 
            padding: '2px 10px', 
            fontSize: '0.6rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: '1px solid rgba(235, 183, 0, 0.3)'
          }}>
            Ad
          </div>
        </div>


        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.15em', marginBottom: '8px' }}>
          Sponsored {ads.length > 1 && `(${currentAdIndex + 1}/${ads.length})`}
        </div>

        <div style={{ position: 'relative', minHeight: '100px' }}>
          {ads.map((ad, index) => {
            const isVideo = ad.imageUrl.match(/\.(mp4|webm|mov)$/i);
            const isActive = index === currentAdIndex;
            
            return (
              <div 
                key={ad.id} 
                style={{ 
                  display: isActive ? 'block' : 'none',
                  animation: isActive ? 'fadeIn 0.3s ease-in' : 'none'
                }}
              >
                {ad.linkUrl ? (
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                    {isVideo ? (
                      <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '150px', objectFit: 'contain' }} />
                    ) : (
                      <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '150px', objectFit: 'contain' }} />
                    )}
                  </a>
                ) : (
                  <div>
                    {isVideo ? (
                      <video src={ad.imageUrl} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '150px', objectFit: 'contain' }} />
                    ) : (
                      <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '8px', display: 'block', maxHeight: '150px', objectFit: 'contain' }} />
                    )}
                  </div>
                )}
                <div style={{ marginTop: '10px', fontWeight: '700', fontSize: '0.9rem', color: 'white', lineHeight: '1.2' }}>
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

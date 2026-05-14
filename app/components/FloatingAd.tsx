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
          // Calculate total time as the sum of all ads' delays
          const totalDelay = allAds.reduce((sum, ad) => sum + ((ad as any).closeDelay || 5), 0);
          setTimeLeft(totalDelay);
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


  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Unified timer and carousel effect
  useEffect(() => {
    if (!isVisible || ads.length === 0) return;

    let currentAdTimeRemaining = (ads[currentAdIndex] as any).closeDelay || 5;

    const interval = setInterval(() => {
      // 1. Update Global Timer
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });

      // 2. Update Carousel Logic
      currentAdTimeRemaining -= 1;
      if (currentAdTimeRemaining <= 0) {
        setCurrentAdIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < ads.length) {
            currentAdTimeRemaining = (ads[nextIndex] as any).closeDelay || 5;
            return nextIndex;
          }
          return prevIndex;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, ads]); // Only re-run if ads load or visibility toggles



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
        {/* Close Button / Countdown */}
        <div style={{ 
          position: 'absolute', 
          top: '8px', 
          right: '8px', 
          zIndex: 10
        }}>
          {timeLeft <= 0 ? (
            <button 
              onClick={() => setIsVisible(false)}
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {timeLeft}s
            </div>
          )}
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

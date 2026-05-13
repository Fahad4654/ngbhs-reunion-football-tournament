'use client';

import { getActiveAdsByPosition } from '@/lib/actions/ad.actions';
import { AdPosition, Advertisement } from '@prisma/client';
import { useState, useEffect } from 'react';

interface AdBannerProps {
  position: AdPosition;
  className?: string;
}

export default function AdBanner({ position, className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAds() {
      try {
        const fetchedAds = await getActiveAdsByPosition(position);
        setAds(fetchedAds as Advertisement[]);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, [position]);

  if (loading || !ads || ads.length === 0) {
    return null;
  }

  return (
    <div className={`ad-banner-container ${className}`} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0', alignItems: 'center' }}>
      {ads.map((ad) => {
        const isVideo = ad.imageUrl.match(/\.(mp4|webm|mov)$/i);
        
        const mediaStyle: React.CSSProperties = { 
          width: 'auto', 
          maxWidth: '100%', 
          maxHeight: '350px', 
          borderRadius: '8px', 
          display: 'block',
          objectFit: 'contain',
          margin: '0 auto'
        };

        const mediaContent = isVideo ? (
          <video 
            src={ad.imageUrl} 
            style={mediaStyle} 
            autoPlay 
            muted 
            loop 
            playsInline
          />
        ) : (
          <img 
            src={ad.imageUrl} 
            alt={ad.title} 
            style={mediaStyle} 
            loading="lazy"
          />
        );

        return (
          <div key={ad.id} className="ad-banner glass" style={{ padding: '0.5rem', borderRadius: '12px', width: 'fit-content', maxWidth: '100%' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', textAlign: 'right' }}>
              Advertisement
            </div>
            {ad.linkUrl ? (
              <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                {mediaContent}
              </a>
            ) : (
              mediaContent
            )}
          </div>
        );
      })}
    </div>
  );
}




'use client';

import { getActiveAdsByPosition } from '@/lib/actions/ad.actions';
import { AdPosition, Advertisement } from '@prisma/client';
import { useState, useEffect } from 'react';

interface AdBannerProps {
  position: AdPosition;
  className?: string;
  showTitle?: boolean;
  style?: React.CSSProperties;
}

export default function AdBanner({ position, className = '', showTitle = false, style = {} }: AdBannerProps) {


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
    <div className={className} style={style}>

      {showTitle && ads.length > 0 && (
        <h3 style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Sponsorship
        </h3>
      )}
      <div 
        className="ad-banner-grid" 
        style={{ 
          width: '100%', 
          display: 'grid', 
          gridTemplateColumns: ads.length > 1 && !position.includes('SIDEBAR') ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
          gap: '0.75rem', 
          margin: '0.5rem 0', 
          alignItems: 'start',
          justifyContent: 'center'
        }}
      >

      {ads.map((ad) => {
        const isVideo = ad.imageUrl.match(/\.(mp4|webm|mov)$/i);
        
        const mediaStyle: React.CSSProperties = { 
          width: 'auto', 
          maxWidth: '100%', 
          height: 'auto', 
          borderRadius: '4px', 
          display: 'block',
          objectFit: 'contain',
          maxHeight: '120px',
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
          <div key={ad.id} className="ad-banner glass" style={{ padding: '0.2rem', borderRadius: '6px', width: '100%', maxWidth: '100%', margin: '0 auto' }}>
            <div style={{ fontSize: '0.45rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem', textAlign: 'right', fontWeight: '700', letterSpacing: '0.05em', opacity: 0.6 }}>
              Sponsored
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
    </div>
  );
}






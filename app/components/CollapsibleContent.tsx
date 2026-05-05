'use client';

import { useState, useRef, useEffect } from 'react';

interface CollapsibleContentProps {
  htmlContent: string;
  maxHeight?: number;
}

export default function CollapsibleContent({ htmlContent, maxHeight = 300 }: CollapsibleContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTooLong, setIsTooLong] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Check if content height exceeds max height
      if (contentRef.current.scrollHeight > maxHeight) {
        setIsTooLong(true);
      }
    }
  }, [htmlContent, maxHeight]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={contentRef}
        className="rich-text-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'clamp(0.95rem, 1.2vw, 1.35rem)', 
          overflowWrap: 'break-word', 
          wordBreak: 'break-word',
          maxHeight: isExpanded ? 'none' : `${maxHeight}px`,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out',
          position: 'relative'
        }}
      />
      
      {isTooLong && !isExpanded && (
        <>
          {/* Fade effect */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(to bottom, transparent, rgba(15, 17, 20, 0.9))',
            pointerEvents: 'none'
          }} />
          
          {/* See More Button */}
          <button 
            onClick={toggleExpand}
            style={{
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(235, 183, 0, 0.15)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '20px',
              padding: '4px 16px',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: '800',
              cursor: 'pointer',
              zIndex: 2,
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.color = 'black';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(235, 183, 0, 0.15)';
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
          >
            See More
          </button>
        </>
      )}

      {isExpanded && (
        <button 
          onClick={toggleExpand}
          style={{
            marginTop: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-primary)',
            fontSize: '0.85rem',
            fontWeight: '800',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline'
          }}
        >
          Show Less
        </button>
      )}
    </div>
  );
}

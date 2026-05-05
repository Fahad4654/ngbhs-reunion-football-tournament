'use client';

interface ClickablePostProps {
  postId: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function ClickablePost({ postId, children, style }: ClickablePostProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger if not clicking a link or button inside
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' || 
      target.tagName === 'A' || 
      target.closest('button') || 
      target.closest('a')
    ) {
      return;
    }
    window.location.hash = `post-${postId}`;
  };

  return (
    <div 
      className="clickable-post" 
      onClick={handleClick} 
      style={{ cursor: 'pointer', ...style }}
    >
      {children}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import PostViewer from './PostViewer';
import { usePathname } from 'next/navigation';

interface PostViewerProviderProps {
  currentUserId?: string;
  currentUserBatchId?: string;
  currentUserRole?: string;
}

export default function PostViewerProvider({ currentUserId, currentUserBatchId, currentUserRole }: PostViewerProviderProps) {
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#post-')) {
        const postId = hash.replace('#post-', '');
        setActivePostId(postId);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      } else {
        setActivePostId(null);
        document.body.style.overflow = '';
      }
    };

    // Check initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.body.style.overflow = '';
    };
  }, [pathname]); // Re-run on path changes to check for hashes on new pages

  const handleClose = () => {
    // Clear hash without reload
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    setActivePostId(null);
    document.body.style.overflow = '';
  };

  if (!activePostId) return null;

  return (
    <PostViewer 
      postId={activePostId} 
      onClose={handleClose}
      currentUserId={currentUserId}
      currentUserBatchId={currentUserBatchId}
      currentUserRole={currentUserRole}
    />
  );
}

'use client';

import { useTransition } from 'react';
import { deleteNews } from '@/lib/actions/news.actions';
import { toast } from 'react-hot-toast';

export default function DeleteNewsAction({ newsId }: { newsId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this news article? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await deleteNews(newsId);
        if (result.success) {
          toast.success('News article deleted successfully');
        } else {
          toast.error(result.error || 'Failed to delete news article');
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="btn glass" 
      style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--accent-danger)' }}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

'use client';

import { useTransition } from 'react';
import { deleteNews } from '@/lib/actions/news.actions';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/app/components/ConfirmModal';

export default function DeleteNewsAction({ newsId }: { newsId: string }) {
  const [isPending, startTransition] = useTransition();
  const { ask: askConfirm, modal: confirmModal } = useConfirm();

  const handleDelete = () => {
    askConfirm(
      'Delete this news article?',
      () => {
        startTransition(async () => {
          const result = await deleteNews(newsId);
          if (result.success) {
            toast.success('News article deleted successfully');
          } else {
            toast.error(result.error || 'Failed to delete news article');
          }
        });
      },
      { subMessage: 'This action cannot be undone.', confirmLabel: 'Delete Article' }
    );
  };

  return (
    <>
      {confirmModal}
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="btn glass" 
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--accent-danger)' }}
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
    </>
  );
}

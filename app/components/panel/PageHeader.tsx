import { ReactNode } from 'react';

interface PageHeaderProps {
  badge: string;
  title: string;
  /** Optional right-side action element (e.g. a button or link) */
  action?: ReactNode;
}

export default function PageHeader({ badge, title, action }: PageHeaderProps) {
  return (
    <header
      style={{
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          className="badge"
          style={{ marginBottom: '0.5rem', fontSize: '0.7rem', letterSpacing: '0.1em' }}
        >
          {badge}
        </div>
        <h1 className="text-gradient" style={{ fontSize: '2.25rem', margin: 0 }}>
          {title}
        </h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}

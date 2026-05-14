'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CustomSelect from '@/app/components/panel/CustomSelect';

export default function UsersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set('q', q);
      else params.delete('q');
      
      if (sort && sort !== 'newest') params.set('sort', sort);
      else params.delete('sort');
      
      router.push(`?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [q, sort, router, searchParams]);

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
        <SearchIcon style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder="Search by name or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input glass"
          style={{ width: '100%', paddingLeft: '3rem', height: '42px' }}
        />
      </div>
      <div style={{ minWidth: '180px' }}>
        <CustomSelect 
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ height: '42px', padding: '0 2.5rem 0 1rem' }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="role">Role</option>
        </CustomSelect>
      </div>
    </div>
  );
}

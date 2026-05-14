'use client';

import { useState, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface MemberFilterProps {
  members: any[];
  children: (filteredMembers: any[]) => React.ReactNode;
  placeholder?: string;
}

export default function MemberFilter({ members, children, placeholder = "Search members..." }: MemberFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'occupation' | 'role'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredMembers = useMemo(() => {
    return [...members]
      .filter(member => 
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.batch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = (a.name || '').localeCompare(b.name || '');
        } else if (sortBy === 'occupation') {
          comparison = (a.occupation || '').localeCompare(b.occupation || '');
        } else if (sortBy === 'role') {
          const roleScore = (u: any) => u.role === 'BATCH_MANAGER' ? 3 : (u.isPlayer ? 2 : 1);
          comparison = roleScore(a) - roleScore(b);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [members, searchTerm, sortBy, sortOrder]);

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="glass" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '0.5rem 1.25rem', 
          borderRadius: '100px',
          maxWidth: '500px',
          flex: 1,
          border: '1px solid var(--border-color)',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <SearchIcon sx={{ color: 'var(--text-muted)', fontSize: '1.2rem' }} />
          <input 
            type="text" 
            placeholder={placeholder} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              fontSize: '0.9rem', 
              width: '100%',
              outline: 'none',
              padding: '0.5rem 0'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="glass"
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              color: 'white', 
              border: '1px solid var(--border-color)', 
              borderRadius: '100px', 
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="name" style={{ background: '#111' }}>Sort by Name</option>
            <option value="role" style={{ background: '#111' }}>Sort by Role</option>
            <option value="occupation" style={{ background: '#111' }}>Sort by Occupation</option>
          </select>

          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="glass"
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              color: 'white', 
              border: '1px solid var(--border-color)', 
              borderRadius: '100px', 
              padding: '0.6rem 1rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {children(filteredMembers)}
    </>
  );
}

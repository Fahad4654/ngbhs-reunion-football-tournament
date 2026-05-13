'use client';

import { useState } from 'react';
import { Advertisement } from '@prisma/client';
import AdForm from './AdForm';
import AdActions from './AdActions';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

interface ManageAdsClientProps {
  initialAds: Advertisement[];
}

export default function ManageAdsClient({ initialAds }: ManageAdsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const filteredAds = initialAds.filter(ad => 
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAd(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Form Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
          </h2>
          {editingAd && (
            <button 
              onClick={handleCancelEdit}
              className="btn glass"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              Cancel Edit
            </button>
          )}
        </div>
        <AdForm 
          key={editingAd ? `edit-${editingAd.id}` : 'create'} 
          initialData={editingAd} 
          onSuccess={() => setEditingAd(null)}
        />
      </div>

      {/* List Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Existing Advertisements</h2>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <SearchIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input glass"
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div className="responsive-table-container glass" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem' }}>Image</th>
                <th style={{ padding: '1.25rem' }}>Details</th>
                <th style={{ padding: '1.25rem' }}>Position</th>
                <th style={{ padding: '1.25rem' }}>Status</th>
                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.length > 0 ? filteredAds.map((ad) => (
                <tr key={ad.id} style={{ borderBottom: '1px solid var(--border-color)', background: editingAd?.id === ad.id ? 'rgba(235, 183, 0, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ width: '120px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                      <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{ad.title}</div>
                    {ad.linkUrl && (
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline' }}>
                        {ad.linkUrl}
                      </a>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      border: '1px solid var(--border-color)' 
                    }}>
                      {ad.position}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: ad.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                      color: ad.isActive ? '#22c55e' : '#ef4444', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      border: `1px solid ${ad.isActive ? '#22c55e' : '#ef4444'}`
                    }}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleEdit(ad)}
                        className="btn glass"
                        style={{ padding: '0.5rem', minWidth: 'auto' }}
                        title="Edit"
                      >
                        <EditIcon sx={{ fontSize: '1.2rem' }} />
                      </button>
                      <AdActions id={ad.id} isActive={ad.isActive} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {searchQuery ? `No ads matching "${searchQuery}"` : 'No advertisements found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

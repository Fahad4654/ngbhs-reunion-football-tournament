'use client';

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LanguageIcon from '@mui/icons-material/Language';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SchoolIcon from '@mui/icons-material/School';

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
  isAdmin?: boolean;
  isSameBatch?: boolean;
}

export default function UserDetailModal({ user, onClose, isAdmin, isSameBatch }: UserDetailModalProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  if (!user) return null;

  const canSeeAll = isAdmin || isSameBatch;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'rgba(15, 17, 20, 0.98)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        {/* Header/Cover */}
        <div style={{ 
          height: '100px', 
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          opacity: 0.2,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }} />

        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            zIndex: 10
          }}
        >
          <CloseIcon sx={{ fontSize: '1.2rem' }} />
        </button>

        <div style={{ 
          padding: 'clamp(1.5rem, 5vw, 2.5rem)', 
          position: 'relative',
          overflowY: 'auto',
          flex: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--accent-primary) transparent'
        }}>
          {/* Avatar */}
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '4px solid #0f1114',
            background: user.image && user.privacySettings?.showImage !== false ? 'transparent' : 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: '900',
            color: 'black',
            overflow: 'hidden',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}>
            {user.image && (user.privacySettings?.showImage !== false || canSeeAll) ? (
              <img 
                src={user.image} 
                alt={user.name} 
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              user.name?.charAt(0)
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', fontWeight: '900', color: 'white', lineHeight: 1.2 }}>
              {user.privacySettings?.showFirstName !== false || user.privacySettings?.showLastName !== false || canSeeAll
                ? `${(user.privacySettings?.showFirstName !== false || canSeeAll) ? (user.firstName || '') : ''} ${(user.privacySettings?.showLastName !== false || canSeeAll) ? (user.lastName || '') : ''}`.trim() || user.name
                : (user.privacySettings?.showUsername !== false || canSeeAll ? `@${user.username}` : 'Private Member')
              }
            </h2>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem', 
              padding: '0.25rem 0.85rem', 
              borderRadius: '100px', 
              background: 'rgba(235, 183, 0, 0.12)', 
              color: 'var(--accent-primary)',
              fontSize: '0.7rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid rgba(235, 183, 0, 0.25)'
            }}>
              {user.teamRole || (user.isPlayer ? 'Player' : 'Member')} <span style={{ opacity: 0.5 }}>•</span> {user.batch?.name || 'No Batch'}
            </div>
            {(user.privacySettings?.showUsername !== false || canSeeAll) && (user.privacySettings?.showFirstName !== false || user.privacySettings?.showLastName !== false || canSeeAll) && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                @{user.username}
              </div>
            )}
          </div>

          {/* Social Icons */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginBottom: '1.5rem' 
          }}>
            {user.websiteUrl && (user.privacySettings?.showWebsite !== false || canSeeAll) && (
              <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" 
                style={{ color: 'var(--accent-primary)', position: 'relative' }} 
                onMouseEnter={() => setHoveredLink(user.websiteUrl)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <LanguageIcon />
              </a>
            )}
            {user.youtubeUrl && (user.privacySettings?.showYoutube !== false || canSeeAll) && (
              <a href={user.youtubeUrl} target="_blank" rel="noopener noreferrer" 
                style={{ color: '#FF0000', position: 'relative' }}
                onMouseEnter={() => setHoveredLink(user.youtubeUrl)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <YouTubeIcon />
              </a>
            )}
          </div>

          {/* Bio */}
          {user.bio && (user.privacySettings?.showBio !== false || canSeeAll) && (
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '1.25rem', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.7',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              "{user.bio}"
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Nicknames */}
            {user.nicknames?.length > 0 && (user.privacySettings?.showNicknames !== false || canSeeAll) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {user.nicknames.filter((n: string) => !!n).map((n: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(235, 183, 0, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(235, 183, 0, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    "{n}"
                  </span>
                ))}
              </div>
            )}

            {/* Personal Details Row */}
            {(user.birthday || user.gender || user.maritalStatus) && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                padding: '1.25rem', 
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                {user.birthday && (user.privacySettings?.showBirthday !== false || canSeeAll) && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Birthday</div>
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>{new Date(user.birthday).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</div>
                  </div>
                )}
                {user.gender && (user.privacySettings?.showGender !== false || canSeeAll) && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Gender</div>
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>{user.gender}</div>
                  </div>
                )}
                {user.maritalStatus && (user.privacySettings?.showMaritalStatus !== false || canSeeAll) && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Status</div>
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem' }}>{user.maritalStatus}</div>
                  </div>
                )}
              </div>
            )}

            {user.email && (user.privacySettings?.showEmail !== false || canSeeAll) && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <EmailIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Email Address</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user.email}</div>
                </div>
              </div>
            )}

            {user.phone && (user.privacySettings?.showPhone !== false || canSeeAll) && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <PhoneIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Contact Number</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user.phone}</div>
                </div>
              </div>
            )}

            {(user.occupation || user.workplace) && (user.privacySettings?.showOccupation !== false || user.privacySettings?.showWorkplace !== false || canSeeAll) && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <WorkIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Professional Details</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>
                    {(user.privacySettings?.showOccupation !== false || canSeeAll) && user.occupation}
                    {(user.privacySettings?.showWorkplace !== false || canSeeAll) && user.workplace && ` at ${user.workplace}`}
                  </div>
                </div>
              </div>
            )}

            {user.currentAddress && (user.privacySettings?.showCurrentAddress !== false || canSeeAll) && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <LocationOnIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Current Address</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user.currentAddress}</div>
                </div>
              </div>
            )}

            {user.permanentAddress && (user.privacySettings?.showPermanentAddress !== false || canSeeAll) && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <HomeIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Permanent Address</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user.permanentAddress}</div>
                </div>
              </div>
            )}            {/* Education Section */}
            {user.education?.length > 0 && (user.privacySettings?.showEducation !== false || canSeeAll) && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SchoolIcon sx={{ fontSize: '1rem', color: 'var(--accent-primary)' }} /> Education
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {user.education.map((edu: any, i: number) => (
                    <div key={i} style={{ paddingLeft: '1.5rem', position: 'relative', borderLeft: '2px solid rgba(235, 183, 0, 0.2)' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                      <div style={{ color: 'white', fontWeight: '700', fontSize: '0.85rem' }}>{edu.institute}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{edu.degree} • {edu.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social & Other Contact */}
            {(
              (user.secondaryEmail && (user.privacySettings?.showSecondaryEmail !== false || canSeeAll)) || 
              (user.whatsappNo && (user.privacySettings?.showWhatsapp !== false || canSeeAll)) || 
              (user.facebookUrl && (user.privacySettings?.showFacebook !== false || canSeeAll)) || 
              (user.instagramUrl && (user.privacySettings?.showInstagram !== false || canSeeAll)) || 
              (user.linkedinUrl && (user.privacySettings?.showLinkedin !== false || canSeeAll)) || 
              (user.githubUrl && (user.privacySettings?.showGithub !== false || canSeeAll)) || 
              (user.websiteUrl && (user.privacySettings?.showWebsite !== false || canSeeAll)) ||
              (user.youtubeUrl && (user.privacySettings?.showYoutube !== false || canSeeAll))
            ) && (
              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1.5rem', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                {user.secondaryEmail && (user.privacySettings?.showSecondaryEmail !== false || canSeeAll) && (
                  <a href={`mailto:${user.secondaryEmail}`} 
                    style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.secondaryEmail)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} 
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <EmailIcon />
                  </a>
                )}
                {user.whatsappNo && (user.privacySettings?.showWhatsapp !== false || canSeeAll) && (
                  <a href={`https://wa.me/${user.whatsappNo.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#25D366', opacity: 0.8, transition: 'opacity 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.whatsappNo)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                    onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <WhatsAppIcon />
                  </a>
                )}
                {user.facebookUrl && (user.privacySettings?.showFacebook !== false || canSeeAll) && (
                  <a href={user.facebookUrl} target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#1877F2', opacity: 0.8, transition: 'opacity 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.facebookUrl)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                    onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <FacebookIcon />
                  </a>
                )}
                {user.instagramUrl && (user.privacySettings?.showInstagram !== false || canSeeAll) && (
                  <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#E4405F', opacity: 0.8, transition: 'opacity 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.instagramUrl)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                    onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <InstagramIcon />
                  </a>
                )}
                {user.linkedinUrl && (user.privacySettings?.showLinkedin !== false || canSeeAll) && (
                  <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#0A66C2', opacity: 0.8, transition: 'opacity 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.linkedinUrl)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                    onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {user.githubUrl && (user.privacySettings?.showGithub !== false || canSeeAll) && (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#ffffff', opacity: 0.7, transition: 'opacity 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.githubUrl)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                    onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
                  >
                    <GitHubIcon />
                  </a>
                )}
                {user.youtubeUrl && (user.privacySettings?.showYoutube !== false || canSeeAll) && (
                  <a href={user.youtubeUrl} target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#FF0000', opacity: 0.8, transition: 'opacity 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.youtubeUrl)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                    onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <YouTubeIcon />
                  </a>
                )}
                {user.websiteUrl && (user.privacySettings?.showWebsite !== false || canSeeAll) && (
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" 
                    style={{ color: 'var(--accent-primary)', opacity: 0.8, transition: 'opacity 0.2s' }} 
                    onMouseEnter={() => setHoveredLink(user.websiteUrl)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                    onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <LanguageIcon />
                  </a>
                )}
              </div>
            )}

            {/* Link Preview Tooltip */}
            {hoveredLink && (
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.9)',
                color: 'var(--accent-primary)',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                border: '1px solid var(--accent-primary)',
                whiteSpace: 'nowrap',
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                animation: 'fadeInCentered 0.2s ease'
              }}>
                {hoveredLink}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
  );
}

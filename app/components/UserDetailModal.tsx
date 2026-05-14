'use client';

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

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
}

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  if (!user) return null;

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
        maxWidth: '500px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        background: 'rgba(15, 17, 20, 0.95)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
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

        <div style={{ padding: '2rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '4px solid #0f1114',
            background: user.image ? 'transparent' : 'var(--accent-primary)',
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
            {user.image ? (
              <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name?.charAt(0)
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>
              {user.privacySettings?.showFirstName !== false || user.privacySettings?.showLastName !== false
                ? `${user.privacySettings?.showFirstName !== false ? (user.firstName || '') : ''} ${user.privacySettings?.showLastName !== false ? (user.lastName || '') : ''}`.trim() || user.name
                : (user.privacySettings?.showUsername !== false ? `@${user.username}` : 'Private Member')
              }
            </h2>
            <div style={{ 
              display: 'inline-block', 
              marginTop: '0.5rem', 
              padding: '0.2rem 0.75rem', 
              borderRadius: '100px', 
              background: 'rgba(235, 183, 0, 0.1)', 
              color: 'var(--accent-primary)',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid rgba(235, 183, 0, 0.2)'
            }}>
              {user.teamRole || (user.isPlayer ? 'Player' : 'Member')} • {user.batch?.name || 'No Batch'}
            </div>
            {user.privacySettings?.showUsername !== false && (user.privacySettings?.showFirstName !== false || user.privacySettings?.showLastName !== false) && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                @{user.username}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {user.privacySettings?.showEmail !== false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <EmailIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Email Address</div>
                  <div style={{ color: 'white', fontWeight: '600' }}>{user.email}</div>
                </div>
              </div>
            )}

            {user.phone && user.privacySettings?.showPhone !== false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <PhoneIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Phone Number</div>
                  <div style={{ color: 'white', fontWeight: '600' }}>{user.phone}</div>
                </div>
              </div>
            )}

            {(user.occupation && user.privacySettings?.showOccupation !== false || user.workplace && user.privacySettings?.showWorkplace !== false) && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <WorkIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Professional</div>
                  <div style={{ color: 'white', fontWeight: '600' }}>
                    {user.privacySettings?.showOccupation !== false && user.occupation}
                    {user.privacySettings?.showWorkplace !== false && user.workplace && `${user.privacySettings?.showOccupation !== false ? ' at ' : ''}${user.workplace}`}
                  </div>
                </div>
              </div>
            )}

            {user.currentAddress && user.privacySettings?.showCurrentAddress !== false && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <LocationOnIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Current Address</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user.currentAddress}</div>
                </div>
              </div>
            )}

            {user.permanentAddress && user.privacySettings?.showPermanentAddress !== false && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <HomeIcon sx={{ color: 'var(--accent-primary)', opacity: 0.7, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Permanent Address</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user.permanentAddress}</div>
                </div>
              </div>
            )}

            {/* Social & Other Contact */}
            {(
              (user.secondaryEmail && user.privacySettings?.showSecondaryEmail !== false) || 
              (user.whatsappNo && user.privacySettings?.showWhatsapp !== false) || 
              (user.facebookUrl && user.privacySettings?.showFacebook !== false) || 
              (user.instagramUrl && user.privacySettings?.showInstagram !== false) || 
              (user.linkedinUrl && user.privacySettings?.showLinkedin !== false) || 
              (user.githubUrl && user.privacySettings?.showGithub !== false) || 
              (user.websiteUrl && user.privacySettings?.showWebsite !== false)
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
                {user.secondaryEmail && user.privacySettings?.showSecondaryEmail !== false && (
                  <a href={`mailto:${user.secondaryEmail}`} title={`Secondary Email: ${user.secondaryEmail}`} style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <EmailIcon />
                  </a>
                )}
                {user.whatsappNo && user.privacySettings?.showWhatsapp !== false && (
                  <a href={`https://wa.me/${user.whatsappNo.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ color: '#25D366', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.8'}>
                    <WhatsAppIcon />
                  </a>
                )}
                {user.facebookUrl && user.privacySettings?.showFacebook !== false && (
                  <a href={user.facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: '#1877F2', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.8'}>
                    <FacebookIcon />
                  </a>
                )}
                {user.instagramUrl && user.privacySettings?.showInstagram !== false && (
                  <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: '#E4405F', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.8'}>
                    <InstagramIcon />
                  </a>
                )}
                {user.linkedinUrl && user.privacySettings?.showLinkedin !== false && (
                  <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: '#0A66C2', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.8'}>
                    <LinkedInIcon />
                  </a>
                )}
                {user.githubUrl && user.privacySettings?.showGithub !== false && (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub" style={{ color: '#ffffff', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.7'}>
                    <GitHubIcon />
                  </a>
                )}
                {user.websiteUrl && user.privacySettings?.showWebsite !== false && (
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" title="Website" style={{ color: 'var(--accent-primary)', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.8'}>
                    <LanguageIcon />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

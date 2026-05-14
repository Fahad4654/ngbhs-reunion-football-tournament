'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { updateProfile, updatePrivacyAction } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import styles from '@/app/(website)/login/login.module.css';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';

interface ProfileFormProps {
  user: any;
  batches: any[];
}

export default function ProfileForm({ user, batches }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [previewImage, setPreviewImage] = useState(user.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PrivacyToggle = ({ name, defaultChecked }: { name: string, defaultChecked: boolean }) => {
    const [isPublic, setIsPublic] = useState(defaultChecked);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
      setIsPublic(defaultChecked);
    }, [defaultChecked]);

    const handleToggle = async (checked: boolean) => {
      setIsPublic(checked);
      setIsUpdating(true);
      try {
        const result = await updatePrivacyAction(name, checked);
        if (result?.error) {
          toast.error(result.error);
          setIsPublic(!checked); // Rollback
        } else {
          toast.success(`${name.replace('show', '')} is now ${checked ? 'Public' : 'Private'}`);
        }
      } catch (err) {
        toast.error('Connection failed.');
        setIsPublic(!checked);
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div style={{ 
        position: 'absolute', 
        top: '-10px', 
        right: '0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.4rem', 
        background: 'var(--bg-secondary)', 
        padding: '2px 8px', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)', 
        zIndex: 5, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        opacity: isUpdating ? 0.6 : 1,
        pointerEvents: isUpdating ? 'none' : 'auto',
        transition: 'opacity 0.2s'
      }}>
        <span style={{ fontSize: '0.6rem', color: isPublic ? 'var(--accent-primary)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.05em' }}>
          {isPublic ? 'Public' : 'Private'}
        </span>
        <label style={{ position: 'relative', display: 'inline-block', width: '24px', height: '14px', cursor: 'pointer' }}>
          <input type="hidden" name={`privacy_${name}`} value={isPublic ? 'on' : 'off'} />
          <input 
            type="checkbox" 
            checked={isPublic}
            onChange={(e) => handleToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isPublic ? 'var(--accent-primary)' : '#444', transition: '.2s', borderRadius: '14px' }}>
            <span style={{ position: 'absolute', content: '""', height: '10px', width: '10px', left: isPublic ? '12px' : '2px', bottom: '2px', backgroundColor: 'white', transition: '.2s', borderRadius: '50%' }}></span>
          </span>
        </label>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || 'Profile updated successfully!');
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Avatar Section */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', width: 'fit-content', margin: '0 auto' }}>
        <PrivacyToggle name="showImage" defaultChecked={user.privacySettings?.showImage ?? true} />
        <input 
          type="file" 
          name="profilePicture" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageChange}
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            width: 'clamp(120px, 20vw, 160px)', 
            height: 'clamp(120px, 20vw, 160px)', 
            borderRadius: '50%', 
            background: previewImage ? 'transparent' : 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            color: '#000',
            fontWeight: '800',
            overflow: 'hidden',
            border: '4px solid var(--border-color)',
            boxShadow: '0 0 20px rgba(235, 183, 0, 0.2)',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Click to change profile picture"
        >
          {previewImage
            ? <img src={previewImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user.name?.charAt(0)
          }
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
            color: 'white',
            fontSize: '1.5rem',
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
          >
            📷
          </div>
        </div>
      </div>

      <div className="responsive-grid">
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showFirstName" defaultChecked={user.privacySettings?.showFirstName ?? true} />
          <label className={styles.label}>First Name</label>
          <input name="firstName" type="text" defaultValue={user.firstName || ''} className={styles.input} required />
        </div>
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showLastName" defaultChecked={user.privacySettings?.showLastName ?? true} />
          <label className={styles.label}>Last Name</label>
          <input name="lastName" type="text" defaultValue={user.lastName || ''} className={styles.input} required />
        </div>
      </div>

      <div className={styles.inputGroup} style={{ position: 'relative' }}>
        <PrivacyToggle name="showUsername" defaultChecked={user.privacySettings?.showUsername ?? true} />
        <label className={styles.label}>Unique Username</label>
        <input 
          name="username" 
          type="text" 
          defaultValue={user.username || ''} 
          placeholder="e.g. john_doe123" 
          className={styles.input} 
          pattern="^[a-zA-Z0-9_]{3,20}$"
          title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores."
          disabled={!!user.username}
          style={!!user.username ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
        />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {!!user.username 
            ? "Your username is permanent and cannot be changed." 
            : "Choose a unique username. Once set, it cannot be changed."}
        </p>
      </div>

      <div className={styles.inputGroup} style={{ position: 'relative' }}>
        <PrivacyToggle name="showEmail" defaultChecked={user.privacySettings?.showEmail ?? false} />
        <label className={styles.label}>Email Address (Read-only)</label>
        <input type="email" value={user.email || ''} className={styles.input} disabled style={{ opacity: 0.6 }} />
      </div>

      <div className="responsive-grid">
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <label className={styles.label}>Batch</label>
          <select name="batchId" defaultValue={user.batchId || ''} className={styles.input}>
            <option value="" style={{ background: 'var(--bg-secondary)' }}>Select Batch</option>
            {batches.map((batch: any) => (
              <option key={batch.id} value={batch.id} style={{ background: 'var(--bg-secondary)' }}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showPhone" defaultChecked={user.privacySettings?.showPhone ?? false} />
          <label className={styles.label}>Contact Number</label>
          <input 
            name="phone" 
            type="tel" 
            defaultValue={user.phone || ''} 
            placeholder="+880..." 
            className={styles.input} 
            disabled={!!user.phone}
            style={!!user.phone ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          />
          {!!user.phone && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Phone number cannot be changed once verified.
            </p>
          )}
        </div>
      </div>

      <div className="responsive-grid">
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showOccupation" defaultChecked={user.privacySettings?.showOccupation ?? true} />
          <label className={styles.label}>Current Position / Job</label>
          <input name="occupation" type="text" defaultValue={user.occupation || ''} placeholder="e.g. Engineer" className={styles.input} />
        </div>
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showWorkplace" defaultChecked={user.privacySettings?.showWorkplace ?? true} />
          <label className={styles.label}>Organization / Workplace</label>
          <input name="workplace" type="text" defaultValue={user.workplace || ''} placeholder="e.g. Google" className={styles.input} />
        </div>
      </div>

      <div className="responsive-grid">
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showCurrentAddress" defaultChecked={user.privacySettings?.showCurrentAddress ?? false} />
          <label className={styles.label}>Current Address</label>
          <textarea name="currentAddress" defaultValue={user.currentAddress || ''} placeholder="Natore, Bangladesh" className={styles.input} style={{ minHeight: '80px', resize: 'vertical' }} />
        </div>
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showPermanentAddress" defaultChecked={user.privacySettings?.showPermanentAddress ?? false} />
          <label className={styles.label}>Permanent Address</label>
          <textarea name="permanentAddress" defaultValue={user.permanentAddress || ''} placeholder="Natore, Bangladesh" className={styles.input} style={{ minHeight: '80px', resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Contact & Social Presence
        </h3>
        
        <div className="responsive-grid">
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <PrivacyToggle name="showSecondaryEmail" defaultChecked={user.privacySettings?.showSecondaryEmail ?? false} />
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <EmailIcon sx={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} /> 
              <span>Secondary Email</span>
            </label>
            <input name="secondaryEmail" type="email" defaultValue={user.secondaryEmail || ''} placeholder="alternative@example.com" className={styles.input} />
          </div>
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <PrivacyToggle name="showWhatsapp" defaultChecked={user.privacySettings?.showWhatsapp ?? false} />
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <WhatsAppIcon sx={{ fontSize: '1.2rem', color: '#25D366' }} /> 
              <span>WhatsApp Number</span>
            </label>
            <input name="whatsappNo" type="text" defaultValue={user.whatsappNo || ''} placeholder="e.g. +88017..." className={styles.input} />
          </div>
        </div>

        <div className="responsive-grid" style={{ marginTop: '1.25rem' }}>
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <PrivacyToggle name="showFacebook" defaultChecked={user.privacySettings?.showFacebook ?? true} />
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <FacebookIcon sx={{ fontSize: '1.2rem', color: '#1877F2' }} /> 
              <span>Facebook Profile</span>
            </label>
            <input name="facebookUrl" type="url" defaultValue={user.facebookUrl || ''} placeholder="https://facebook.com/username" className={styles.input} />
          </div>
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <PrivacyToggle name="showInstagram" defaultChecked={user.privacySettings?.showInstagram ?? true} />
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <InstagramIcon sx={{ fontSize: '1.2rem', color: '#E4405F' }} /> 
              <span>Instagram Profile</span>
            </label>
            <input name="instagramUrl" type="url" defaultValue={user.instagramUrl || ''} placeholder="https://instagram.com/username" className={styles.input} />
          </div>
        </div>

        <div className="responsive-grid" style={{ marginTop: '1.25rem' }}>
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <PrivacyToggle name="showLinkedin" defaultChecked={user.privacySettings?.showLinkedin ?? true} />
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <LinkedInIcon sx={{ fontSize: '1.2rem', color: '#0A66C2' }} /> 
              <span>LinkedIn Profile</span>
            </label>
            <input name="linkedinUrl" type="url" defaultValue={user.linkedinUrl || ''} placeholder="https://linkedin.com/in/username" className={styles.input} />
          </div>
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <PrivacyToggle name="showGithub" defaultChecked={user.privacySettings?.showGithub ?? true} />
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <GitHubIcon sx={{ fontSize: '1.2rem', color: '#fff' }} /> 
              <span>GitHub Profile</span>
            </label>
            <input name="githubUrl" type="url" defaultValue={user.githubUrl || ''} placeholder="https://github.com/username" className={styles.input} />
          </div>
        </div>

        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showWebsite" defaultChecked={user.privacySettings?.showWebsite ?? true} />
          <label className={styles.label}>Website / Portfolio URL</label>
          <div style={{ position: 'relative' }}>
            <LanguageIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', opacity: 0.7 }} />
            <input name="websiteUrl" type="url" defaultValue={user.websiteUrl || ''} placeholder="https://yourwebsite.com" className={styles.input} style={{ paddingLeft: '40px' }} />
          </div>
        </div>
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showYoutube" defaultChecked={user.privacySettings?.showYoutube ?? true} />
          <label className={styles.label}>YouTube Channel</label>
          <div style={{ position: 'relative' }}>
            <LanguageIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#FF0000', opacity: 0.7 }} />
            <input name="youtubeUrl" type="url" defaultValue={user.youtubeUrl || ''} placeholder="https://youtube.com/@channel" className={styles.input} style={{ paddingLeft: '40px' }} />
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0', opacity: 0.5 }}></div>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
        About & Bio
      </h3>

      <div className={styles.inputGroup} style={{ position: 'relative' }}>
        <PrivacyToggle name="showBio" defaultChecked={user.privacySettings?.showBio ?? true} />
        <label className={styles.label}>Short Bio</label>
        <textarea name="bio" defaultValue={user.bio || ''} placeholder="Tell us something about yourself..." className={styles.input} style={{ minHeight: '100px', resize: 'vertical' }} />
      </div>

      <div className="responsive-grid">
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showBirthday" defaultChecked={user.privacySettings?.showBirthday ?? false} />
          <label className={styles.label}>Birthday</label>
          <input name="birthday" type="date" defaultValue={user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ''} className={styles.input} />
        </div>
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showGender" defaultChecked={user.privacySettings?.showGender ?? true} />
          <label className={styles.label}>Gender</label>
          <select name="gender" defaultValue={user.gender || ''} className={styles.input}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className={styles.inputGroup} style={{ position: 'relative' }}>
          <PrivacyToggle name="showMaritalStatus" defaultChecked={user.privacySettings?.showMaritalStatus ?? false} />
          <label className={styles.label}>Marital Status</label>
          <select name="maritalStatus" defaultValue={user.maritalStatus || ''} className={styles.input}>
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Separated">Separated</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
      </div>

      <div className={styles.inputGroup} style={{ position: 'relative' }}>
        <PrivacyToggle name="showNicknames" defaultChecked={user.privacySettings?.showNicknames ?? true} />
        <label className={styles.label}>Nicknames (Max 3)</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[0, 1, 2].map(i => (
            <input 
              key={i}
              name="nicknames" 
              type="text" 
              defaultValue={user.nicknames?.[i] || ''} 
              placeholder={`Nickname ${i+1}`} 
              className={styles.input} 
              style={{ flex: 1, minWidth: '120px' }} 
            />
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0', opacity: 0.5 }}></div>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
        Education (Max 5)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        <PrivacyToggle name="showEducation" defaultChecked={user.privacySettings?.showEducation ?? true} />
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="responsive-grid" style={{ gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Institute</label>
              <input name="edu_institute" type="text" defaultValue={user.education?.[i]?.institute || ''} placeholder="University/College Name" className={styles.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Degree</label>
              <input name="edu_degree" type="text" defaultValue={user.education?.[i]?.degree || ''} placeholder="BSc/MSc..." className={styles.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Passing Year</label>
              <input name="edu_year" type="text" defaultValue={user.education?.[i]?.year || ''} placeholder="2020" className={styles.input} />
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="btn btn-primary" disabled={isPending} style={{ marginTop: '1rem', padding: '1.5vh 2vw', fontSize: 'clamp(1rem, 1.2vw, 1.2rem)' }}>
        {isPending ? 'Saving Changes...' : 'Save Profile Details'}
      </button>
    </form>
  );
}

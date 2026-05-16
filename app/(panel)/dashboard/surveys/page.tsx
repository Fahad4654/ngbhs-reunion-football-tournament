import { getServerUser } from '@/lib/server-auth';
import { getOpenSurveysForMember } from '@/lib/actions/survey.actions';
import { redirect } from 'next/navigation';
import SurveyCard from './SurveyCard';
import Link from 'next/link';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';

export const metadata = {
  title: 'Surveys - Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function SurveysPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  if (!user.batchId) {
    return (
      <div style={{ maxWidth: 'min(100%, 500px)', margin: '5vh auto', padding: '0 1rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px' }}>
          <SchoolIcon sx={{ fontSize: '3rem', color: 'var(--accent-primary)', display: 'block', margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>No Batch Selected</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Join a batch to see surveys from your Batch Manager.</p>
          <Link href="/profile" className="btn btn-primary">Update Profile</Link>
        </div>
      </div>
    );
  }

  if (user.status === 'PENDING') {
    return (
      <div style={{ maxWidth: 'min(100%, 500px)', margin: '5vh auto', padding: '0 1rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px', borderColor: 'rgba(245,158,11,0.3)' }}>
          <LockIcon sx={{ fontSize: '3rem', color: '#f59e0b', display: 'block', margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#f59e0b', marginBottom: '0.75rem' }}>Approval Pending</h2>
          <p style={{ color: 'var(--text-muted)' }}>Surveys are available once your Batch Manager approves your membership.</p>
        </div>
      </div>
    );
  }

  if (user.status === 'REJECTED') {
    return (
      <div style={{ maxWidth: 'min(100%, 500px)', margin: '5vh auto', padding: '0 1rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px', borderColor: 'rgba(239,68,68,0.3)' }}>
          <LockIcon sx={{ fontSize: '3rem', color: 'var(--accent-danger)', display: 'block', margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--accent-danger)', marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your batch membership request was not approved.</p>
        </div>
      </div>
    );
  }

  // ── Batch Manager: show the management UI inline ──
  if (user.role === 'BATCH_MANAGER') {
    const { getSurveysForManager } = await import('@/lib/actions/survey.actions');
    const SurveyManagerTab = (await import('@/app/(panel)/dashboard/manage-batch/SurveyManagerTab')).default;
    const surveys = await getSurveysForManager();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(235,183,0,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent-primary)' }}>
            <AssignmentIcon />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Manage Surveys
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Create and manage surveys for your batch members
            </p>
          </div>
        </div>
        <SurveyManagerTab surveys={surveys as any} />
      </div>
    );
  }

  // ── Regular member: fill-out view ──
  const { open, submitted } = await getOpenSurveysForMember();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(235,183,0,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent-primary)' }}>
          <AssignmentIcon />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Batch Surveys
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Forms &amp; polls from your Batch Manager
          </p>
        </div>
      </div>

      {open.length > 0 && (
        <section>
          <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
            Open — {open.length} pending
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {open.map((s: any) => (
              <SurveyCard key={s.id} survey={s} />
            ))}
          </div>
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
            Already Submitted
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {submitted.map((s: any) => (
              <div key={s.id} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircleIcon sx={{ fontSize: '1.25rem', color: '#10b981', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s._count.responses} total response{s._count.responses !== 1 ? 's' : ''}</div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '100px', border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
                  Submitted ✓
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {open.length === 0 && submitted.length === 0 && (
        <div className="glass" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '16px' }}>
          <AssignmentIcon sx={{ fontSize: '3.5rem', color: 'var(--text-muted)', display: 'block', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '1rem' }}>No surveys yet.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Your Batch Manager hasn&apos;t created any surveys. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}

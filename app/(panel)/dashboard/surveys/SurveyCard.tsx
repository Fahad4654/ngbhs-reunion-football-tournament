'use client';

import { useState, useTransition } from 'react';
import { submitSurveyResponse } from '@/lib/actions/survey.actions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

type Question = {
  id: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
  order: number;
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  closesAt: Date | null;
  questions: Question[];
  _count: { responses: number };
};

export default function SurveyCard({ survey }: { survey: Survey }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function setAnswer(qId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  function toggleCheckbox(qId: string, option: string) {
    const current = answers[qId] ? answers[qId].split(',').filter(Boolean) : [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswer(qId, updated.join(','));
  }

  async function handleSubmit() {
    // Validate required
    for (const q of survey.questions) {
      if (q.required && !answers[q.id]?.trim()) {
        return setError(`Please answer: "${q.label}"`);
      }
    }
    setError('');
    const payload = survey.questions.map((q) => ({ questionId: q.id, value: answers[q.id] || '' }));
    startTransition(async () => {
      const res = await submitSurveyResponse(survey.id, payload);
      if (res.success) setSubmitted(true);
      else setError(res.error || 'Submission failed');
    });
  }

  if (submitted) {
    return (
      <div className="glass" style={{ borderRadius: '16px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
        <AssignmentTurnedInIcon sx={{ fontSize: '3rem', color: '#10b981', marginBottom: '0.75rem' }} />
        <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Response Submitted!</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{survey.title}</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
  };

  return (
    <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      {/* Card Header */}
      <div style={{ padding: '1.25rem', borderBottom: open ? '1px solid var(--border-color)' : 'none', background: 'linear-gradient(90deg, rgba(235,183,0,0.07) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ color: 'white', fontWeight: '800', fontSize: '1rem', marginBottom: '0.35rem' }}>{survey.title}</h3>
            {survey.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{survey.description}</p>}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{survey._count.responses} response{survey._count.responses !== 1 ? 's' : ''}</span>
              {survey.closesAt && (
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                  Closes: {new Date(survey.closesAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', flexShrink: 0, whiteSpace: 'nowrap' }}
            onClick={() => setOpen(!open)}
          >
            {open ? 'Hide' : 'Fill Out'}
          </button>
        </div>
      </div>

      {/* Form */}
      {open && (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {survey.questions.map((q, i) => (
            <div key={q.id}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', color: 'white', marginBottom: '0.5rem' }}>
                {i + 1}. {q.label}
                {q.required && <span style={{ color: 'var(--accent-danger)', marginLeft: '0.25rem' }}>*</span>}
              </label>

              {q.type === 'TEXT' && (
                <textarea
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Your answer..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}

              {q.type === 'CHOICE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {q.options.map((opt) => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: answers[q.id] === opt ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswer(q.id, opt)}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'CHECKBOX' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {q.options.map((opt) => {
                    const checked = (answers[q.id] || '').split(',').includes(opt);
                    return (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: checked ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheckbox(q.id, opt)}
                          style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === 'RATING' && (
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = Number(answers[q.id] || 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAnswer(q.id, String(star))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', color: filled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)' }}
                      >
                        {filled ? <StarIcon sx={{ fontSize: '2rem' }} /> : <StarBorderIcon sx={{ fontSize: '2rem' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {error && <p style={{ color: 'var(--accent-danger)', fontSize: '0.85rem' }}>{error}</p>}

          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', padding: '0.65rem 1.5rem' }}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Submitting…' : 'Submit Response'}
          </button>
        </div>
      )}
    </div>
  );
}

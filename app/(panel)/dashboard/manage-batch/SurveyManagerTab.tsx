'use client';

import { useState, useTransition } from 'react';
import { createSurvey, toggleSurveyOpen, deleteSurvey } from '@/lib/actions/survey.actions';
import type { QuestionInput } from '@/lib/actions/survey.actions';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

type Survey = {
  id: string;
  title: string;
  description: string | null;
  isOpen: boolean;
  requireUserDetails: boolean;
  closesAt: Date | null;
  createdAt: Date;
  questions: { id: string; label: string; type: string; options: string[]; order: number }[];
  responses: {
    id: string;
    submittedAt: Date;
    responder: { id: string; name: string | null; image: string | null; email: string | null; phone: string | null };
    answers: { questionId: string; value: string }[];
  }[];
  _count: { responses: number };
};

export default function SurveyManagerTab({ surveys: initial }: { surveys: Survey[] }) {
  const [surveys, setSurveys] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [requireUserDetails, setRequireUserDetails] = useState(false);
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { label: '', type: 'TEXT', options: [], required: true, order: 0 },
  ]);
  const [error, setError] = useState('');

  function addQuestion() {
    setQuestions((q) => [...q, { label: '', type: 'TEXT', options: [], required: true, order: q.length }]);
  }

  function removeQuestion(i: number) {
    setQuestions((q) => q.filter((_, idx) => idx !== i).map((q, idx) => ({ ...q, order: idx })));
  }

  function updateQuestion(i: number, field: string, value: any) {
    setQuestions((q) => q.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  function addOption(qi: number) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi ? { ...q, options: [...(q.options ?? []), ''] } : q
      )
    );
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi ? { ...q, options: (q.options ?? []).filter((_, i) => i !== oi) } : q
      )
    );
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? { ...q, options: (q.options ?? []).map((o, i) => (i === oi ? value : o)) }
          : q
      )
    );
  }

  async function handleCreate() {
    if (!title.trim()) return setError('Title is required');
    if (questions.some((q) => !q.label.trim())) return setError('All questions need a label');
    setError('');
    startTransition(async () => {
      const res = await createSurvey({
        title,
        description,
        closesAt: closesAt || null,
        requireUserDetails,
        questions: questions.map((q) => ({
          ...q,
          // filter blank lines only at submit time
          options: (q.options ?? []).map((o) => o.trim()).filter(Boolean),
        })),
      });
      if (res.success) {
        setShowCreate(false);
        setTitle(''); setDescription(''); setClosesAt(''); setRequireUserDetails(false);
        setQuestions([{ label: '', type: 'TEXT', options: [], required: true, order: 0 }]);
        window.location.reload();
      } else {
        setError(res.error || 'Failed');
      }
    });
  }

  async function handleToggle(id: string) {
    startTransition(async () => {
      await toggleSurveyOpen(id);
      window.location.reload();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this survey and all responses?')) return;
    startTransition(async () => {
      await deleteSurvey(id);
      window.location.reload();
    });
  }

  function downloadCSV(survey: Survey) {
    const headers = survey.requireUserDetails 
      ? ['Responder Name', 'Email', 'Phone', 'Submitted At', ...survey.questions.map(q => q.label)]
      : ['Responder', 'Submitted At', ...survey.questions.map(q => q.label)];
    
    const rows = survey.responses.map((resp, idx) => {
      const row = survey.requireUserDetails 
        ? [
            resp.responder.name || 'Unknown',
            resp.responder.email || '',
            resp.responder.phone || '',
            new Date(resp.submittedAt).toLocaleString(),
          ]
        : [
            `Anonymous #${idx + 1}`,
            new Date(resp.submittedAt).toLocaleString(),
          ];
      survey.questions.forEach(q => {
        const ans = resp.answers.find(a => a.questionId === q.id);
        row.push(ans ? ans.value : '');
      });
      return row;
    });

    const csvContent = [
      headers.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Survey_Results_${survey.title.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadPDF(survey: Survey) {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.text(`Survey Results: ${survey.title}`, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleString()} | ${survey.responses.length} total responses`, 14, 22);

    const headers = survey.requireUserDetails 
      ? ['Responder Name', 'Email', 'Phone', 'Submitted At', ...survey.questions.map(q => q.label)]
      : ['Responder', 'Submitted At', ...survey.questions.map(q => q.label)];
    
    const rows = survey.responses.map((resp, idx) => {
      const row = survey.requireUserDetails 
        ? [
            resp.responder.name || 'Unknown',
            resp.responder.email || '',
            resp.responder.phone || '',
            new Date(resp.submittedAt).toLocaleDateString(),
          ]
        : [
            `Anonymous #${idx + 1}`,
            new Date(resp.submittedAt).toLocaleDateString(),
          ];
      survey.questions.forEach(q => {
        const ans = resp.answers.find(a => a.questionId === q.id);
        row.push(ans ? ans.value : '');
      });
      return row;
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [235, 183, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`Survey_Results_${survey.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    overflow: 'hidden',
  };

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

  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: '800',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '0.3rem',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {surveys.length} survey{surveys.length !== 1 ? 's' : ''} created
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          onClick={() => setShowCreate(!showCreate)}
        >
          <AddIcon sx={{ fontSize: '1rem' }} />
          Create Survey
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass" style={{ ...cardStyle, border: '1px solid rgba(235,183,0,0.3)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1.25rem', fontSize: '1rem', textTransform: 'uppercase' }}>
            New Survey
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Jersey Size Poll" />
            </div>
            <div>
              <label style={labelStyle}>Description (optional)</label>
              <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this survey about?" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Close Date (optional)</label>
                <input type="datetime-local" style={inputStyle} value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'white', cursor: 'pointer' }}>
                  <input type="checkbox" checked={requireUserDetails} onChange={(e) => setRequireUserDetails(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }} />
                  Require User Details (Name, Email, Phone)
                </label>
              </div>
            </div>

            {/* Questions */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, margin: 0 }}>Questions</label>
                <button className="btn glass" style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={addQuestion}>
                  <AddIcon sx={{ fontSize: '0.9rem' }} /> Add Question
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {questions.map((q, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '800' }}>Q{i + 1}</span>
                      {questions.length > 1 && (
                        <button onClick={() => removeQuestion(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: 0 }}>
                          <DeleteIcon sx={{ fontSize: '1rem' }} />
                        </button>
                      )}
                    </div>
                    <input style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Question label" value={q.label} onChange={(e) => updateQuestion(i, 'label', e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <select
                        style={{ ...inputStyle, flex: 1, minWidth: '130px' }}
                        value={q.type}
                        onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                      >
                        <option value="TEXT">Short Text</option>
                        <option value="CHOICE">Single Choice (pick one)</option>
                        <option value="CHECKBOX">Multiple Choice (pick many)</option>
                        <option value="RATING">Rating (1–5)</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(i, 'required', e.target.checked)} />
                        Required
                      </label>
                    </div>
                    {(q.type === 'CHOICE' || q.type === 'CHECKBOX') && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <label style={labelStyle}>Options</label>
                          <button
                            type="button"
                            className="btn glass"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => addOption(i)}
                          >
                            <AddIcon sx={{ fontSize: '0.85rem' }} /> Add Option
                          </button>
                        </div>
                        {(q.options ?? []).length === 0 && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No options yet. Click "Add Option".</p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {(q.options ?? []).map((opt, oi) => (
                            <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', minWidth: '20px' }}>{oi + 1}.</span>
                              <input
                                style={{ ...inputStyle, flex: 1 }}
                                placeholder={`Option ${oi + 1}`}
                                value={opt}
                                onChange={(e) => updateOption(i, oi, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(i, oi)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: '0.2rem', flexShrink: 0 }}
                              >
                                <DeleteIcon sx={{ fontSize: '1rem' }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p style={{ color: 'var(--accent-danger)', fontSize: '0.85rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn glass" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={isPending}>
                {isPending ? 'Creating…' : 'Create Survey'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey List */}
      {surveys.length === 0 && !showCreate && (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 1rem', borderRadius: '14px', color: 'var(--text-muted)' }}>
          <AssignmentIcon sx={{ fontSize: '3rem', marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
          No surveys yet. Create one to get started!
        </div>
      )}

      {surveys.map((survey) => {
        const isExpanded = expandedId === survey.id;
        const isExpired = survey.closesAt && new Date() > new Date(survey.closesAt);

        return (
          <div key={survey.id} className="glass" style={cardStyle}>
            {/* Survey Header */}
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '800', color: 'white', fontSize: '0.95rem' }}>{survey.title}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '100px',
                    background: survey.isOpen && !isExpired ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: survey.isOpen && !isExpired ? '#10b981' : 'var(--accent-danger)',
                    border: `1px solid ${survey.isOpen && !isExpired ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    textTransform: 'uppercase',
                  }}>
                    {isExpired ? 'Expired' : survey.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div style={{ marginTop: '0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>{survey._count.responses} response{survey._count.responses !== 1 ? 's' : ''}</span>
                  <span>{survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}</span>
                  {survey.closesAt && <span>Closes: {new Date(survey.closesAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  className="btn glass"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem', color: survey.isOpen ? '#f59e0b' : '#10b981' }}
                  onClick={() => handleToggle(survey.id)}
                  disabled={isPending}
                >
                  {survey.isOpen ? 'Close' : 'Reopen'}
                </button>
                <button
                  className="btn glass"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  onClick={() => downloadCSV(survey)}
                >
                  <DownloadIcon sx={{ fontSize: '1rem' }} />
                  CSV
                </button>
                <button
                  className="btn glass"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  onClick={() => downloadPDF(survey)}
                >
                  <PictureAsPdfIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />
                  PDF
                </button>
                <button
                  className="btn glass"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  onClick={() => setExpandedId(isExpanded ? null : survey.id)}
                >
                  {isExpanded ? <ExpandLessIcon sx={{ fontSize: '1rem' }} /> : <ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
                  Results
                </button>
                <button
                  className="btn glass"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', color: 'var(--accent-danger)' }}
                  onClick={() => handleDelete(survey.id)}
                  disabled={isPending}
                >
                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                </button>
              </div>
            </div>

            {/* Responses Panel */}
            {isExpanded && (
              <div style={{ padding: '1.25rem' }}>
                {survey.responses.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                    No responses yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {survey.responses.map((resp, idx) => (
                      <div key={resp.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '800', fontSize: '0.75rem', overflow: 'hidden', flexShrink: 0 }}>
                            {survey.requireUserDetails ? (
                              resp.responder.image ? <img src={resp.responder.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : resp.responder.name?.charAt(0) || '?'
                            ) : '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'white' }}>
                              {survey.requireUserDetails ? (resp.responder.name || 'Unknown') : `Anonymous #${idx + 1}`}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(resp.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {survey.questions.map((q) => {
                            const ans = resp.answers.find((a) => a.questionId === q.id);
                            return (
                              <div key={q.id} style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>{q.label}: </span>
                                <span style={{ color: 'white' }}>{ans?.value || '—'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

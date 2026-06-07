'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Loader2, Users, BookOpen, UserPlus, UserMinus, ClipboardCheck, Clock, Zap, UserCog, LineChart, X } from 'lucide-react';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { useAuth } from '@/lib/auth/context';
import { userService, onboardingService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, OnboardingEvaluation } from '@/types';
import { toast } from 'sonner';
import { StudentSearchDialog } from '@/components/coach/student-search-dialog';

const BLUE = '#37b5ff';

type WorkflowFilter = 'all' | 'custom' | 'automated';

interface StudentWithCurriculum {
  student: User;
  hasCurriculum: boolean;
  curriculumProgress?: { totalItems: number; completedItems: number; progressPercentage: number };
  evaluation?: OnboardingEvaluation | null;
}

export default function CoachStudentsPage() {
  const { user } = useAuth();
  const [allStudents, setAllStudents] = useState<StudentWithCurriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<User | null>(null);
  const [removing, setRemoving] = useState(false);
  const [workflowFilter, setWorkflowFilter] = useState<WorkflowFilter>('all');

  useEffect(() => { if (user?.id) loadStudents(); }, [user?.id]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsResult = await userService.getAllUsers({ role: 'student' });
      if (!studentsResult.success || !studentsResult.data) { toast.error('Failed to load students'); return; }

      if (user?.role === 'coach') {
        studentsResult.data.items = studentsResult.data.items.filter(s => s.assignedCoachId === user.id);
      }

      const studentsWithData: StudentWithCurriculum[] = await Promise.all(
        studentsResult.data.items.map(async student => {
          const [curriculumResult, evaluationResult] = await Promise.all([
            customCurriculumService.getStudentCurriculum(student.id),
            onboardingService.getEvaluation(student.id),
          ]);
          const result: StudentWithCurriculum = { student, hasCurriculum: false, evaluation: evaluationResult.success ? evaluationResult.data : null };
          if (curriculumResult.success && curriculumResult.data) {
            const curriculum = curriculumResult.data;
            const totalItems = curriculum.items.length;
            const completedItems = curriculum.items.filter(i => i.status === 'completed').length;
            result.hasCurriculum = true;
            result.curriculumProgress = { totalItems, completedItems, progressPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0 };
          }
          return result;
        })
      );
      setAllStudents(studentsWithData);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const filteredStudents = useMemo(() => {
    if (workflowFilter === 'all') return allStudents;
    return allStudents.filter(({ student }) => student.workflowType === workflowFilter);
  }, [allStudents, workflowFilter]);

  const counts = useMemo(() => ({
    all: allStudents.length,
    custom: allStudents.filter(({ student }) => student.workflowType === 'custom').length,
    automated: allStudents.filter(({ student }) => student.workflowType === 'automated' || !student.workflowType).length,
  }), [allStudents]);

  const handleRemoveStudent = async () => {
    if (!studentToRemove || !user?.id) return;
    try {
      setRemoving(true);
      const result = await userService.removeStudentFromCoach(studentToRemove.id, user.id);
      if (result.success) { toast.success(`${studentToRemove.displayName} removed from your roster`); loadStudents(); }
      else toast.error(result.error?.message || 'Failed to remove student');
    } catch { toast.error('Failed to remove student from roster'); }
    finally { setRemoving(false); setRemoveDialogOpen(false); setStudentToRemove(null); }
  };

  const openRemoveDialog = (student: User) => { setStudentToRemove(student); setRemoveDialogOpen(true); };

  if (loading) return <SkeletonDarkPage />;

  const WORKFLOW_TABS = [
    { key: 'all' as WorkflowFilter, label: `All (${counts.all})`, icon: <Users size={14} /> },
    { key: 'custom' as WorkflowFilter, label: `Custom (${counts.custom})`, icon: <UserCog size={14} /> },
    { key: 'automated' as WorkflowFilter, label: `Automated (${counts.automated})`, icon: <Zap size={14} /> },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .students-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .students-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .students-grid { grid-template-columns: 1fr 1fr 1fr; } }
      `}</style>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div style={{ position: 'relative', borderRadius: '20px', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 50%, #0d1f40 100%)', border: '1px solid rgba(55,181,255,0.22)', boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(55,181,255,0.12)', padding: '28px 32px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(55,181,255,0.1)', filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(167,139,250,0.07)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: BLUE, marginBottom: '6px' }}>My Students</p>
              <h1 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>Students</h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>View evaluations and manage curriculum for your students</p>
            </div>
            {user?.role === 'coach' && workflowFilter === 'custom' && (
              <button
                onClick={() => setSearchDialogOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', borderRadius: '12px', color: '#000f28', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 16px rgba(55,181,255,0.35)` }}
              >
                <UserPlus size={14} /> Add Student
              </button>
            )}
          </div>
        </div>

        {/* Workflow Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(2,18,44,0.8)', border: '1px solid rgba(55,181,255,0.15)', borderRadius: '12px', padding: '5px', width: 'fit-content', flexWrap: 'wrap' }}>
          {WORKFLOW_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setWorkflowFilter(t.key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                background: workflowFilter === t.key ? BLUE : 'transparent',
                color: workflowFilter === t.key ? '#000f28' : 'rgba(255,255,255,0.5)',
              }}
            >{t.icon}{t.label}</button>
          ))}
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div style={{ background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '16px', padding: '64px 24px', textAlign: 'center' }}>
            <Users size={56} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {workflowFilter === 'all' ? 'No Students Found' : workflowFilter === 'custom' ? 'No Custom Workflow Students' : 'No Automated Workflow Students'}
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '360px', margin: '0 auto' }}>
              {workflowFilter === 'custom' ? 'Students with custom workflow type will appear here when assigned.' : workflowFilter === 'automated' ? 'Students with automated (self-paced) workflow will appear here.' : 'No students have registered yet.'}
            </p>
          </div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map(({ student, hasCurriculum, curriculumProgress, evaluation }) => {
              const isCustomWorkflow = student.workflowType === 'custom';
              const evalStatus = evaluation?.status;
              const evalCoachReview = evaluation?.coachReview;
              const hasCompletedEvaluation = evalStatus === 'completed' || evalStatus === 'reviewed';
              const workflowColor = isCustomWorkflow ? '#f87171' : BLUE;

              return (
                <div key={student.id} style={{ background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(55,181,255,0.4)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(55,181,255,0.18)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                  {/* Top gradient bar */}
                  <div style={{ height: '3px', background: `linear-gradient(90deg, ${BLUE}, #0ea5e9)` }} />

                  <div style={{ padding: '18px 20px' }}>
                    {/* Student header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>{student.displayName}</h3>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{student.email}</p>
                        {student.studentNumber && (
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>ID: {student.studentNumber}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: workflowColor, background: `${workflowColor}18`, border: `1px solid ${workflowColor}30`, borderRadius: '20px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {isCustomWorkflow ? <><UserCog size={10} /> Custom</> : <><Zap size={10} /> Automated</>}
                        </span>
                        {user?.role === 'coach' && isCustomWorkflow && (
                          <button
                            onClick={() => openRemoveDialog(student)}
                            title="Remove from roster"
                            style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <UserMinus size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Evaluation status */}
                    {hasCompletedEvaluation && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: evalCoachReview ? '#4ade80' : '#fbbf24', background: evalCoachReview ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${evalCoachReview ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: '20px', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ClipboardCheck size={10} />{evalCoachReview ? 'Evaluation Reviewed' : 'Evaluation Pending Review'}
                        </span>
                      </div>
                    )}
                    {!hasCompletedEvaluation && !student.onboardingCompleted && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />Awaiting Onboarding
                        </span>
                      </div>
                    )}

                    {/* Curriculum Progress */}
                    {isCustomWorkflow && (
                      hasCurriculum && curriculumProgress ? (
                        <div style={{ background: 'rgba(55,181,255,0.06)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Curriculum Progress</span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{curriculumProgress.progressPercentage}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px' }}>
                            <div style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${BLUE}, #0ea5e9)`, width: `${curriculumProgress.progressPercentage}%`, transition: 'width 0.7s' }} />
                          </div>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{curriculumProgress.completedItems} of {curriculumProgress.totalItems} items completed</p>
                        </div>
                      ) : (
                        <div style={{ borderRadius: '10px', border: '1px dashed rgba(55,181,255,0.2)', padding: '10px 14px', marginBottom: '12px' }}>
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>No curriculum created yet</p>
                        </div>
                      )
                    )}

                    {/* Pacing Level */}
                    {evaluation?.intelligenceProfile?.pacingLevel && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Pacing Level</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: BLUE, background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', borderRadius: '20px', padding: '2px 8px', textTransform: 'capitalize' }}>
                          {evaluation.intelligenceProfile.pacingLevel}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {hasCompletedEvaluation && (
                        <Link href={`/coach/students/${student.id}/evaluation`} style={{ textDecoration: 'none' }}>
                          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', borderRadius: '8px', color: BLUE, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                            <ClipboardCheck size={12} />View Evaluation
                          </button>
                        </Link>
                      )}
                      <Link href={`/coach/students/${student.id}/charting`} style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                          <LineChart size={12} />View Charts
                        </button>
                      </Link>
                      {isCustomWorkflow && (
                        <Link href={`/coach/students/${student.id}/curriculum`} style={{ textDecoration: 'none', flex: 1 }}>
                          <button style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 12px', background: hasCurriculum ? `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)` : 'rgba(55,181,255,0.08)', border: hasCurriculum ? 'none' : '1px solid rgba(55,181,255,0.25)', borderRadius: '8px', color: hasCurriculum ? '#000f28' : BLUE, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                            <BookOpen size={12} />{hasCurriculum ? 'Manage Curriculum' : 'Create Curriculum'}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Student Dialog */}
      {user?.id && (
        <StudentSearchDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen} coachId={user.id} onStudentAdded={loadStudents} />
      )}

      {/* Remove Student Confirm Modal */}
      {removeDialogOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ background: 'rgba(2,18,44,0.98)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '20px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: BLUE }}>Roster</p>
                <button onClick={() => setRemoveDialogOpen(false)} disabled={removing} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>Remove Student from Roster</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Are you sure you want to remove <span style={{ fontWeight: 700, color: '#fff' }}>{studentToRemove?.displayName}</span> from your roster?
                They will no longer appear in your student list, but their curriculum progress will be preserved.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '16px 28px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRemoveDialogOpen(false)} disabled={removing} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRemoveStudent} disabled={removing} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#dc2626', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: removing ? 'not-allowed' : 'pointer', opacity: removing ? 0.7 : 1 }}>
                {removing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Removing...</> : 'Remove Student'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

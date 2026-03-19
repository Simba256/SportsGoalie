'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Users, ClipboardCheck, ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { parentLinkService } from '@/lib/database';
import { LinkedChildSummary } from '@/types';

export default function ParentPerceptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
    if (!authLoading && user && user.role !== 'parent') router.push('/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;

    const load = async () => {
      try {
        const result = await parentLinkService.getLinkedChildren(user.id);
        if (result.success && result.data) setChildren(result.data);
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user || user.role !== 'parent') return null;

  const hasAssessment = user.parentOnboardingComplete;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perception Comparison</h1>
        <p className="text-sm text-gray-500 mt-1">
          See how your perceptions align with your goalie&apos;s self-assessment
        </p>
      </div>

      {/* No Assessment State */}
      {!hasAssessment && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-red-900/5 overflow-hidden">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-red-500/5" />
            <div className="relative">
              <div className="mx-auto w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4">
                <ClipboardCheck className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Assessment Required</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Complete your parent assessment first to unlock perception comparisons with your goalie.
              </p>
            </div>
          </div>
          <div className="px-8 py-6 text-center">
            <Link href="/parent/onboarding">
              <Button className="bg-red-600 hover:bg-red-700">
                Start Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* No Children State */}
      {hasAssessment && children.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xl shadow-red-900/5">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Goalies Linked</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Link a goalie to your account to see how your perceptions compare with their self-assessment.
          </p>
          <Link href="/parent/link-child">
            <Button className="bg-red-600 hover:bg-red-700">
              Link a Goalie
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {/* Children List */}
      {hasAssessment && children.length > 0 && (
        <div className="space-y-3">
          {children.map((child) => (
            <Link
              key={child.childId}
              href={`/parent/child/${child.childId}`}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 hover:border-red-200 hover:shadow-lg hover:shadow-red-900/5 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  {child.displayName}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {child.hasCompletedAssessment ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                      Both assessments complete — view comparison
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                      Goalie assessment pending
                    </span>
                  )}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

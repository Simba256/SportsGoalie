'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Users, ClipboardCheck, ArrowRight } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!user || user.role !== 'parent') return null;

  const hasAssessment = user.parentOnboardingComplete;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perception Comparison</h1>
        <p className="text-sm text-gray-500 mt-1">
          See how your perceptions align with your goalie's self-assessment
        </p>
      </div>

      {!hasAssessment && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <ClipboardCheck className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-amber-900 mb-1">Assessment Required</h3>
          <p className="text-sm text-amber-700 max-w-md mx-auto mb-4">
            Complete your parent assessment first to unlock perception comparisons.
          </p>
          <Link href="/parent/onboarding">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              Start Assessment
            </Button>
          </Link>
        </div>
      )}

      {hasAssessment && children.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No goalies linked</h3>
          <p className="text-xs text-gray-400 mb-4">Link a goalie to see perception comparisons.</p>
          <Link href="/parent/link-child">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
              Link a Goalie
            </Button>
          </Link>
        </div>
      )}

      {hasAssessment && children.length > 0 && (
        <div className="space-y-3">
          {children.map((child) => (
            <Link
              key={child.childId}
              href={`/parent/child/${child.childId}`}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  {child.displayName}
                </h4>
                <p className="text-xs text-gray-400">
                  {child.hasCompletedAssessment
                    ? 'Both assessments complete — view comparison'
                    : 'Goalie assessment pending'}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

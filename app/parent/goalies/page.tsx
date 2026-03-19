'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ChevronRight,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';
import { parentLinkService } from '@/lib/database';
import { LinkedChildSummary } from '@/types';

export default function ParentGoaliesPage() {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Goalies</h1>
          <p className="text-sm text-gray-500 mt-1">
            {children.length} goalie{children.length !== 1 ? 's' : ''} linked to your account
          </p>
        </div>
        <Link href="/parent/link-child">
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
            <UserPlus className="h-4 w-4 mr-1" />
            Link Goalie
          </Button>
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="h-7 w-7 text-gray-300" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No linked goalies yet</h3>
          <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
            Ask your goalie for their link code from their profile settings.
          </p>
          <Link href="/parent/link-child">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
              Link Your Goalie
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child) => {
            const pct = Math.round(child.progressPercentage || 0);
            return (
              <Link
                key={child.childId}
                href={`/parent/child/${child.childId}`}
                className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">
                    {child.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                      {child.displayName}
                    </h4>
                    {child.pacingLevel && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-[18px] bg-blue-50 text-blue-600 border-blue-200">
                        {child.pacingLevel}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-[18px] capitalize">
                      {child.relationship}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-xs text-gray-400">{pct}% progress</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> {child.quizzesCompleted || 0} quizzes
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Flame className="h-3 w-3" /> {child.currentStreak || 0} streak
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      {child.hasCompletedAssessment
                        ? <><CheckCircle2 className="h-3 w-3 text-green-500" /> Assessed</>
                        : <><Clock className="h-3 w-3 text-amber-500" /> Pending</>
                      }
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

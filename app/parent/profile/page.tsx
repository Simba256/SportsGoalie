'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar } from 'lucide-react';

import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';

export default function ParentProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && user.role !== 'parent') router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return <SkeletonContentPage />;
  }

  if (!user || user.role !== 'parent') return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account information</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {user.displayName || 'Parent'}
            </h2>
            <p className="text-sm text-gray-400">Parent Account</p>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Linked Goalies</p>
              <p className="text-sm font-medium text-gray-900">
                {user.linkedChildIds?.length || 0} goalie{(user.linkedChildIds?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { auth } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export function TokenDiagnostic() {
  const { user } = useAuth();
  const [tokenClaims, setTokenClaims] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTokenClaims = async (forceRefresh = false) => {
    if (!auth.currentUser) {
      setTokenClaims({ error: 'No authenticated user' });
      return;
    }

    setLoading(true);
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult(forceRefresh);
      setTokenClaims({
        claims: tokenResult.claims,
        issuedAt: new Date(tokenResult.issuedAtTime).toLocaleString(),
        expiration: new Date(tokenResult.expirationTime).toLocaleString(),
        authTime: new Date(tokenResult.authTime).toLocaleString(),
      });
    } catch (error) {
      setTokenClaims({ error: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchTokenClaims();
    }
  }, [user]);

  const handleForceRefresh = async () => {
    setRefreshing(true);
    await fetchTokenClaims(true);
    setRefreshing(false);
  };

  if (!user) return null;

  const hasAdminClaim = tokenClaims?.claims?.role === 'admin' || tokenClaims?.claims?.admin === true;
  const firestoreRole = user.role;
  const roleMatch = hasAdminClaim && firestoreRole === 'admin';

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Token Diagnostic
          {roleMatch ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </CardTitle>
        <CardDescription>
          Firebase Auth token status and custom claims
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">Firestore User Data</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firestore Role:</span>
                <span className={`font-mono ${firestoreRole === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                  {firestoreRole}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Firebase Auth Token</h3>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading token...</div>
            ) : tokenClaims?.error ? (
              <div className="text-sm text-red-600">Error: {tokenClaims.error}</div>
            ) : tokenClaims ? (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Role:</span>
                  <span className={`font-mono ${tokenClaims.claims?.role === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                    {tokenClaims.claims?.role || 'not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin Claim:</span>
                  <span className={`font-mono ${tokenClaims.claims?.admin ? 'text-green-600' : 'text-red-600'}`}>
                    {tokenClaims.claims?.admin ? 'true' : 'false'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued:</span>
                  <span className="font-mono text-xs">{tokenClaims.issuedAt}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {!roleMatch && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-900">Token/Database Mismatch Detected</p>
                <p className="text-yellow-800 mt-1">
                  {!hasAdminClaim && firestoreRole === 'admin' &&
                    "Your Firestore document has admin role, but your authentication token doesn't have admin claims. Click 'Force Token Refresh' to sync."}
                  {hasAdminClaim && firestoreRole !== 'admin' &&
                    "Your token has admin claims, but your Firestore role is not set to admin."}
                  {!hasAdminClaim && firestoreRole !== 'admin' &&
                    "You don't have admin access. Both token claims and Firestore role are not set to admin."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleForceRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Force Token Refresh'}
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Reload Page
          </Button>
        </div>

        {tokenClaims?.claims && (
          <details className="cursor-pointer">
            <summary className="text-sm font-semibold text-muted-foreground">
              View Full Token Claims
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto">
              {JSON.stringify(tokenClaims.claims, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
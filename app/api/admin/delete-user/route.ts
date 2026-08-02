import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * DELETE /api/admin/delete-user
 *
 * Permanently deletes a Firebase Auth record so the email can be re-used.
 * Must be called after the Firestore user document has already been removed.
 * Requires a valid admin ID token in the Authorization header.
 *
 * Body: { uid: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const claims = decodedToken as { role?: string; admin?: boolean };
    if (claims.role !== 'admin' && !claims.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uid } = await request.json();
    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    if (uid === decodedToken.uid) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 });
    }

    try {
      await adminAuth.deleteUser(uid);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      // If the Auth record was already gone, treat it as success
      if (code === 'auth/user-not-found') {
        return NextResponse.json({ success: true });
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Firebase Auth user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

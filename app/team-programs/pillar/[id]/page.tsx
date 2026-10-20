'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/** Legacy nested route — redirects to the shared public pillar pages. */
export default function TeamProgramsPillarRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/pillar/${id}?from=team-programs`);
    } else {
      router.replace('/team-programs');
    }
  }, [id, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050912',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px',
        letterSpacing: '2px',
        fontWeight: 700,
      }}
    >
      LOADING PILLAR…
    </div>
  );
}

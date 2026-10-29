import { GoalieAreaRoute } from '@/components/auth/goalie-area-route';

// The goalie portal's pillar pages. The public marketing pages live under
// /pillar/[id] (singular) and are deliberately not behind this door.
export default function PillarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoalieAreaRoute>{children}</GoalieAreaRoute>;
}

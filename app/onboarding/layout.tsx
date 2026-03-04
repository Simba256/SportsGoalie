import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goalie Evaluation | SportsCoach',
  description: 'Complete your initial evaluation across the 6 Ice Hockey Goalie Pillars',
};

/**
 * Layout for the onboarding flow.
 * Minimal layout with no header/navigation for immersive experience.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

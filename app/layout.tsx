import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { AuthProvider } from '@/lib/auth/context';
import { Toaster } from '@/components/ui/sonner';
import { Chatbot } from '@/components/ui/chatbot';
import { LayoutShell } from '@/components/LayoutShell';

import './globals.css';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'SmarterGoalie - Digital Learning Platform',
  description:
    'Learn sports skills, track your progress, and assess your knowledge through interactive quizzes.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/icon-192.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Suspense fallback={null}>
            <LayoutShell>{children}</LayoutShell>
          </Suspense>
          <Toaster />
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}

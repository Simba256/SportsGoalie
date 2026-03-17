import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Footer7 } from '@/components/footer-7';
import { Header7 } from '@/components/header-7';
import { AuthProvider } from '@/lib/auth/context';
import { Toaster } from '@/components/ui/sonner';
import { Chatbot } from '@/components/ui/chatbot';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
          <div className="min-h-screen flex flex-col">
            <Header7 />
            <main className="flex-1">{children}</main>
            <Footer7 />
          </div>
          <Toaster />
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}

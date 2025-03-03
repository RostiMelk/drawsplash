import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/context/QueryProvider';
import { FiltersProvider } from '@/context/FiltersProvider';
import { Analytics } from '@vercel/analytics/react';

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
  title: 'Drawsplash',
  description: 'Draw 2 search unsplash',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <FiltersProvider>{children}</FiltersProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}

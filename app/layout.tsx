import React from 'react';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';
import { uiConfig } from '@/config/ui';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansTamil = Noto_Sans_Tamil({ subsets: ['tamil'], weight: ['400', '500', '600', '700'], variable: '--font-noto-tamil' });

export const metadata: Metadata = {
  title: uiConfig.theme.logoText,
  description: 'Civic Issue Tracking and Analytics Platform for Tamil Nadu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoSansTamil.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
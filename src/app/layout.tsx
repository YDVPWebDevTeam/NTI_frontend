import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { AppProviders } from 'components/providers';
import { activateDefaultLocale } from 'lib/i18n/runtime';
import { getRequestLocale } from 'lib/i18n/server-locale';

import './styles/global.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

activateDefaultLocale();

export const metadata: Metadata = {
  applicationName: 'NTI - innovation hub',
  title: 'NTI - innovation hub',
  description:
    'Nitriansky technologický inkubátor (NTI) is a platform connecting students, startups, mentors, and companies through innovation programs, collaboration, and technology-driven projects.',
  manifest: '/favicon/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'NTI',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      {
        url: '/favicon/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#061F3D',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}

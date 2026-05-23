import type { Metadata, Viewport } from 'next';

import { AppProviders } from 'components/providers';
import { activateDefaultLocale } from 'lib/i18n/runtime';
import { getRequestLocale } from 'lib/i18n/server-locale';

import { SpeedInsights } from '@vercel/speed-insights/next';

import './styles/global.css';

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
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>

        <SpeedInsights />
      </body>
    </html>
  );
}

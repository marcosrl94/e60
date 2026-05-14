import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'E6.0 — ESG platform · Nfq Advisory',
  description:
    'ESG reporting and risk platform for European banks. Built by Nfq Advisory.',
};

/**
 * Viewport meta. Without this, mobile browsers render the page at
 * desktop width (~980px) and then scale down — the whole UI looks
 * tiny. Auth screens are responsive; the shell shows a desktop-only
 * gate at <lg.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        {/* 7.13 · Web Vitals + page-view analytics. Both are zero-config when
            deployed on Vercel and no-ops elsewhere, so dev / CI stay quiet. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed, Roboto_Mono } from 'next/font/google';
import './globals.css';

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
});

const mono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  applicationName: 'Team USA Archetype Lab',
  title: 'Team USA Archetype Lab',
  description: 'Find Olympic and Paralympic sport archetypes with Team USA historical athlete data and Gemini analysis.',
  keywords: ['Team USA', 'Gemini', 'Google Cloud', 'Cloud Run', 'Olympic data', 'Paralympic archetypes'],
  creator: 'Team USA Archetype Lab',
  openGraph: {
    title: 'Team USA Archetype Lab',
    description: 'A Gemini-powered fan profile engine for Team USA Olympic and Paralympic sport archetypes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Team USA Archetype Lab',
    description: 'Find Olympic and Paralympic sport archetypes with aggregate Team USA history and Gemini analysis.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

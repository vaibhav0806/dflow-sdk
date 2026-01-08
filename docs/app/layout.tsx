import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dflow-sdk.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | DFlow SDK',
    default: 'DFlow SDK - TypeScript SDK for Solana Prediction Markets & Trading',
  },
  description:
    'Official DFlow SDK documentation. Build prediction markets, swap tokens, and trade on Solana with the unified TypeScript SDK. Real-time WebSocket, order management, and more.',
  keywords: [
    'DFlow',
    'DFlow SDK',
    'DFlow API',
    'Solana SDK',
    'Solana trading',
    'prediction markets',
    'crypto trading',
    'Solana prediction markets',
    'TypeScript SDK',
    'swap API',
    'orderbook API',
    'Solana WebSocket',
    'DFlow documentation',
    'Solana DeFi',
    'crypto SDK',
  ],
  authors: [{ name: 'DFlow Protocol' }],
  creator: 'DFlow Protocol',
  publisher: 'DFlow Protocol',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'DFlow SDK',
    title: 'DFlow SDK - TypeScript SDK for Solana Prediction Markets & Trading',
    description:
      'Official DFlow SDK documentation. Build prediction markets, swap tokens, and trade on Solana with the unified TypeScript SDK.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DFlow SDK Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DFlow SDK - TypeScript SDK for Solana',
    description:
      'Build prediction markets and trade on Solana with the official DFlow TypeScript SDK.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#10b981" />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TechArticle',
              headline: 'DFlow SDK Documentation',
              description:
                'Official documentation for the DFlow TypeScript SDK. Build prediction markets, swap tokens, and trade on Solana.',
              author: {
                '@type': 'Organization',
                name: 'DFlow Protocol',
                url: 'https://pond.dflow.net',
              },
              publisher: {
                '@type': 'Organization',
                name: 'DFlow Protocol',
                url: 'https://pond.dflow.net',
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': siteUrl,
              },
            }),
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            options: {
              api: '/api/search',
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}

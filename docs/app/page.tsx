'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Animated typing effect component
function TypeWriter({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(currentWord.slice(0, text.length + 1));
          if (text === currentWord) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setText(currentWord.slice(0, text.length - 1));
          if (text === '') {
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, words]);

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse text-[hsl(174,100%,50%)]">|</span>
    </span>
  );
}

// Responsive price ticker component
function PriceTicker() {
  const [prices, setPrices] = useState([
    { ticker: 'BTC > $100K', price: 0.72, change: +0.03 },
    { ticker: 'ETH > $4K', price: 0.45, change: -0.02 },
    { ticker: 'SOL > $200', price: 0.61, change: +0.05 },
    { ticker: 'FED RATE CUT', price: 0.83, change: +0.01 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((p) => ({
          ...p,
          price: Math.max(0.01, Math.min(0.99, p.price + (Math.random() - 0.5) * 0.02)),
          change: (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-full overflow-x-auto scrollbar-hide sm:flex sm:justify-center">
      <div className="inline-flex min-w-max items-center gap-2 rounded-xl border border-[hsl(218,35%,15%)] bg-[hsl(222,47%,7%)] p-1.5">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 rounded-lg bg-[hsl(222,47%,10%)] px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-[hsl(215,15%,50%)]">Markets</span>
        </div>

        {/* Price items */}
        {prices.map((p, i) => (
          <div
            key={i}
            className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[hsl(222,47%,10%)] sm:gap-3 sm:px-4"
          >
            <span className="whitespace-nowrap font-mono text-[12px] text-[hsl(215,20%,55%)] transition-colors group-hover:text-white sm:text-[13px]">{p.ticker}</span>
            <div className="h-4 w-px bg-[hsl(218,35%,18%)]" />
            <span className="font-mono text-[12px] font-semibold tabular-nums text-white sm:text-[13px]">${p.price.toFixed(2)}</span>
            <span className={`font-mono text-[11px] font-medium tabular-nums sm:text-[12px] ${p.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {p.change >= 0 ? '↑' : '↓'} {Math.abs(p.change * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile menu component
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[hsl(222,47%,6%,0.95)] backdrop-blur-sm" onClick={onClose} />

      {/* Menu content */}
      <div className="absolute right-0 top-0 h-full w-64 border-l border-[hsl(218,35%,15%)] bg-[hsl(222,47%,7%)] p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[hsl(215,20%,65%)] transition-colors hover:bg-[hsl(218,35%,12%)] hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mt-12 flex flex-col gap-2">
          <Link
            href="/docs/typescript"
            onClick={onClose}
            className="rounded-lg px-4 py-3 text-[15px] font-medium text-[hsl(215,20%,65%)] transition-all hover:bg-[hsl(218,35%,12%)] hover:text-white"
          >
            TypeScript SDK
          </Link>
          <Link
            href="/docs/python"
            onClick={onClose}
            className="rounded-lg px-4 py-3 text-[15px] font-medium text-[hsl(215,20%,65%)] transition-all hover:bg-[hsl(218,35%,12%)] hover:text-white"
          >
            Python SDK
          </Link>
          <Link
            href="https://github.com/vaibhav0806/dflow-sdk"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-[hsl(215,20%,65%)] transition-all hover:bg-[hsl(218,35%,12%)] hover:text-white"
            target="_blank"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </Link>
          <div className="my-2 h-px bg-[hsl(218,35%,15%)]" />
          <Link
            href="https://pond.dflow.net"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg bg-[hsl(218,35%,12%)] px-4 py-3 text-[15px] font-medium text-white transition-all hover:bg-[hsl(218,35%,15%)]"
            target="_blank"
          >
            <span className="h-2 w-2 rounded-full bg-[hsl(174,100%,50%)] shadow-[0_0_4px_hsl(174,100%,50%)]" />
            DFlow
          </Link>
        </div>
      </div>
    </div>
  );
}

// Package manager install component with tabs
function InstallCommand({ language = 'typescript' }: { language?: 'typescript' | 'python' }) {
  const [activeTab, setActiveTab] = useState<string>(language === 'typescript' ? 'pnpm' : 'pip');
  const [copied, setCopied] = useState(false);

  const tsCommands = {
    pnpm: 'pnpm add dflow-sdk',
    npm: 'npm install dflow-sdk',
    bun: 'bun add dflow-sdk',
  };

  const pyCommands = {
    pip: 'pip install dflow-sdk',
    uv: 'uv add dflow-sdk',
    poetry: 'poetry add dflow-sdk',
  };

  const commands = language === 'typescript' ? tsCommands : pyCommands;
  const tabs = language === 'typescript' ? ['pnpm', 'npm', 'bun'] : ['pip', 'uv', 'poetry'];

  const handleCopy = () => {
    navigator.clipboard.writeText(commands[activeTab as keyof typeof commands]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex flex-col items-center">
      {/* Tabs */}
      <div className="mb-3 flex gap-1 rounded-lg border border-[hsl(218,35%,15%)] bg-[hsl(220,40%,7%)] p-1">
        {tabs.map((pm) => (
          <button
            key={pm}
            onClick={() => setActiveTab(pm)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-all ${
              activeTab === pm
                ? 'bg-[hsl(174,100%,42%,0.15)] text-[hsl(174,100%,50%)] ring-1 ring-inset ring-[hsl(174,100%,42%,0.3)]'
                : 'text-[hsl(215,20%,55%)] hover:text-white'
            }`}
          >
            {pm}
          </button>
        ))}
      </div>

      {/* Command */}
      <div className="flex items-center gap-3 rounded-lg border border-[hsl(218,35%,15%)] bg-[hsl(220,40%,9%)] px-6 py-3 font-mono text-sm">
        <span className="text-[hsl(215,15%,45%)]">$</span>
        <span className="text-white">{commands[activeTab as keyof typeof commands]}</span>
        <button
          onClick={handleCopy}
          className="ml-4 text-[hsl(215,20%,65%)] transition-colors hover:text-[hsl(174,100%,50%)]"
        >
          {copied ? (
            <svg className="h-4 w-4 text-[hsl(174,100%,50%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Feature card component with HUD aesthetic
function FeatureCard({
  icon,
  title,
  description,
  accentColor,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  index: number;
}) {
  return (
    <div
      className="feature-card group relative"
      style={{
        animationDelay: `${index * 100}ms`,
        ['--accent' as string]: accentColor,
      }}
    >
      {/* Animated border gradient */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
          backgroundSize: '200% 100%',
        }}
      />

      {/* Card content */}
      <div className="relative overflow-hidden rounded-xl border border-[hsl(218,35%,18%)] bg-[hsl(222,47%,8%)] p-6 transition-all duration-300 group-hover:bg-[hsl(222,47%,9%)]">
        {/* Corner accents */}
        <div
          className="absolute left-0 top-0 h-8 w-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }}
        />
        <div
          className="absolute left-0 top-0 h-[1px] w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }}
        />
        <div
          className="absolute bottom-0 right-0 h-8 w-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(to top, ${accentColor}, transparent)` }}
        />
        <div
          className="absolute bottom-0 right-0 h-[1px] w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(to left, ${accentColor}, transparent)` }}
        />

        {/* Icon container with glow */}
        <div className="relative mb-5 inline-flex">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300"
            style={{
              border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
              background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
              color: accentColor,
            }}
          >
            {icon}
          </div>
        </div>

        {/* Title with accent line */}
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-[17px] font-semibold tracking-tight text-white">{title}</h3>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[hsl(218,35%,20%)] to-transparent" />
        </div>

        {/* Description */}
        <p className="text-[13px] leading-relaxed text-[hsl(215,20%,60%)]">{description}</p>

        {/* Status indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[hsl(215,15%,40%)]">Available</span>
        </div>

        {/* Background glow */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-[0.15]"
          style={{ background: accentColor }}
        />
      </div>
    </div>
  );
}

// Custom SVG icons for features
const FeatureIcons = {
  markets: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  routing: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  websocket: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  ),
  solana: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  positions: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  developer: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[hsl(222,47%,6%)]">
      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Enhanced animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Radial gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(174,100%,42%,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsla(220,100%,50%,0.06)_0%,transparent_50%)]" />

        {/* Grid pattern with fade */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(hsla(215, 20%, 30%, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, hsla(215, 20%, 30%, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          }}
        />

        {/* Animated gradient beams */}
        <div className="hero-beam absolute left-1/4 top-0 h-[500px] w-[1px] bg-gradient-to-b from-[hsl(174,100%,42%,0.5)] via-[hsl(174,100%,42%,0.1)] to-transparent" />
        <div className="hero-beam absolute right-1/3 top-0 h-[400px] w-[1px] bg-gradient-to-b from-[hsl(220,100%,60%,0.3)] via-[hsl(220,100%,60%,0.1)] to-transparent" style={{ animationDelay: '-2s' }} />
        <div className="hero-beam absolute right-1/4 top-0 h-[350px] w-[1px] bg-gradient-to-b from-[hsl(45,93%,58%,0.3)] via-[hsl(45,93%,58%,0.05)] to-transparent" style={{ animationDelay: '-4s' }} />

        {/* Floating orbs */}
        <div className="floating-orb absolute -left-32 top-1/4 h-64 w-64 bg-[hsl(174,100%,42%,0.12)]" />
        <div
          className="floating-orb absolute -right-32 top-1/2 h-96 w-96 bg-[hsl(220,100%,50%,0.08)]"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="floating-orb absolute bottom-1/4 left-1/3 h-48 w-48 bg-[hsl(45,93%,58%,0.06)]"
          style={{ animationDelay: '-10s' }}
        />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(222,47%,6%)]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between border-b border-[hsl(218,35%,12%)] bg-[hsl(222,47%,6%,0.8)] px-4 py-4 backdrop-blur-xl sm:px-6">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-[17px] font-semibold tracking-tight text-white transition-colors group-hover:text-[hsl(174,100%,55%)]">
              DFlow
            </span>
            <span className="rounded-md bg-[hsla(174,100%,42%,0.12)] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[hsl(174,100%,55%)] ring-1 ring-inset ring-[hsla(174,100%,42%,0.25)] transition-all group-hover:bg-[hsla(174,100%,42%,0.2)] group-hover:ring-[hsla(174,100%,42%,0.4)]">
              SDK
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="desktop-nav-links items-center gap-6">
            <Link
              href="/docs/typescript"
              className="text-sm font-medium text-[hsl(215,20%,65%)] transition-colors hover:text-white"
            >
              TypeScript
            </Link>
            <Link
              href="/docs/python"
              className="text-sm font-medium text-[hsl(215,20%,65%)] transition-colors hover:text-white"
            >
              Python
            </Link>
            <Link
              href="https://github.com/vaibhav0806/dflow-sdk"
              className="text-sm font-medium text-[hsl(215,20%,65%)] transition-colors hover:text-white"
              target="_blank"
            >
              GitHub
            </Link>
            <Link
              href="https://pond.dflow.net"
              className="flex items-center gap-2 text-sm font-medium text-[hsl(215,20%,65%)] transition-colors hover:text-white"
              target="_blank"
            >
              <span className="h-2 w-2 rounded-full bg-[hsl(174,100%,50%)] shadow-[0_0_4px_hsl(174,100%,50%)]" />
              DFlow
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-btn rounded-lg p-2 text-[hsl(215,20%,65%)] transition-colors hover:bg-[hsl(218,35%,12%)] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>

        {/* Hero Section */}
        <section className="relative px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
          <div className="mx-auto max-w-6xl">
            {/* Badge with entrance animation */}
            <div className="hero-fade-in mb-8 flex justify-center sm:mb-10" style={{ animationDelay: '0ms' }}>
              <div className="group relative inline-flex items-center gap-2 rounded-full border border-[hsl(174,100%,42%,0.25)] bg-[hsl(222,47%,8%)] px-4 py-2 transition-all hover:border-[hsl(174,100%,42%,0.4)] hover:bg-[hsl(222,47%,10%)] sm:gap-2.5 sm:px-5">
                {/* Animated ring */}
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(174,100%,50%)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(174,100%,50%)]" />
                </span>
                <span className="font-mono text-[11px] font-medium tracking-wide text-[hsl(174,100%,55%)] sm:text-[13px]">
                  TypeScript & Python SDKs for Solana
                </span>
                <svg className="hidden h-3.5 w-3.5 text-[hsl(215,20%,50%)] transition-colors group-hover:text-[hsl(174,100%,50%)] sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Main headline with staggered animation */}
            <div className="hero-fade-in mb-4 sm:mb-6" style={{ animationDelay: '100ms' }}>
              <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-white">Build </span>
                <span className="hero-gradient-text">
                  <TypeWriter
                    words={['Prediction Markets', 'Trading Bots', 'DeFi Apps', 'Market Makers']}
                    className="text-[0.9em] sm:text-[1em]"
                  />
                </span>
              </h1>
            </div>

            <div className="hero-fade-in mb-6 sm:mb-8" style={{ animationDelay: '200ms' }}>
              <h1 className="text-center text-4xl font-bold tracking-tight text-[hsl(215,20%,55%)] sm:text-5xl md:text-6xl lg:text-7xl">
                on Solana
              </h1>
            </div>

            {/* Subtitle */}
            <p className="hero-fade-in mx-auto mb-8 max-w-2xl px-2 text-center text-[15px] leading-relaxed text-[hsl(215,20%,60%)] sm:mb-12 sm:px-0 sm:text-[17px]" style={{ animationDelay: '300ms' }}>
              Institution-grade trading infrastructure. Real-time market data. Smart order routing.
              All in one unified TypeScript SDK.
            </p>

            {/* CTA Buttons */}
            <div className="hero-fade-in mb-10 flex flex-col items-stretch gap-3 px-4 sm:mb-14 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-0" style={{ animationDelay: '400ms' }}>
              <Link
                href="/docs"
                className="cta-btn group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[hsl(174,100%,42%)] to-[hsl(168,84%,40%)] px-8 font-semibold text-[hsl(222,47%,6%)] shadow-[0_0_30px_hsla(174,100%,42%,0.3)] transition-all hover:shadow-[0_0_50px_hsla(174,100%,42%,0.5)]"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Get Started</span>
                <svg
                  className="relative h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/docs/typescript/api-reference/client"
                className="cta-btn group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[hsl(218,35%,20%)] bg-[hsl(220,40%,9%)] px-8 font-semibold text-white transition-all hover:border-[hsl(174,100%,42%,0.5)] hover:bg-[hsl(216,30%,12%)]"
              >
                <svg className="h-4 w-4 text-[hsl(215,20%,60%)] transition-colors group-hover:text-[hsl(174,100%,50%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                API Reference
              </Link>
            </div>

            {/* Live price ticker */}
            <div className="hero-fade-in mb-10 px-2 sm:mb-14 sm:px-0" style={{ animationDelay: '500ms' }}>
              <PriceTicker />
            </div>

            {/* Enhanced Code preview */}
            <div className="hero-fade-in mx-auto max-w-3xl px-2 sm:px-0" style={{ animationDelay: '600ms' }}>
              <div className="code-window homepage-code-block group relative">
                {/* Glow effect behind */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[hsl(174,100%,42%,0.2)] via-[hsl(220,100%,60%,0.1)] to-[hsl(280,100%,60%,0.15)] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                {/* Window frame */}
                <div className="relative overflow-hidden rounded-xl border border-[hsl(218,35%,18%)] bg-[hsl(222,47%,7%)] shadow-2xl">
                  {/* Title bar */}
                  <div className="flex items-center justify-between border-b border-[hsl(218,35%,15%)] bg-[hsl(222,47%,9%)] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-[0_0_6px_#ff5f56]" />
                      <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_#ffbd2e]" />
                      <div className="h-3 w-3 rounded-full bg-[#27ca40] shadow-[0_0_6px_#27ca40]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-[hsl(174,100%,50%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-mono text-xs text-[hsl(215,20%,55%)]">quickstart.ts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(174,100%,50%)] shadow-[0_0_4px_hsl(174,100%,50%)]" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[hsl(215,15%,40%)]">Live</span>
                    </div>
                  </div>

                  {/* Code content */}
                  <pre className="overflow-x-auto p-4 text-sm leading-relaxed sm:p-6">
                    <code>
                      <span className="text-[hsl(215,15%,45%)]">{'// Initialize and start trading'}</span>
                      {'\n'}
                      <span className="text-[hsl(280,100%,70%)]">import</span>
                      <span className="text-white">{' { '}</span>
                      <span className="text-[hsl(174,100%,50%)]">DFlowClient</span>
                      <span className="text-white">{' } '}</span>
                      <span className="text-[hsl(280,100%,70%)]">from</span>
                      <span className="text-[hsl(45,93%,58%)]">{" 'dflow-sdk'"}</span>
                      {'\n\n'}
                      <span className="text-[hsl(280,100%,70%)]">const</span>
                      <span className="text-white"> dflow = </span>
                      <span className="text-[hsl(280,100%,70%)]">new</span>
                      <span className="text-[hsl(190,100%,60%)]"> DFlowClient</span>
                      <span className="text-white">()</span>
                      {'\n\n'}
                      <span className="text-[hsl(215,15%,45%)]">{'// Get active prediction markets'}</span>
                      {'\n'}
                      <span className="text-[hsl(280,100%,70%)]">const</span>
                      <span className="text-white"> markets = </span>
                      <span className="text-[hsl(280,100%,70%)]">await</span>
                      <span className="text-white"> dflow.</span>
                      <span className="text-[hsl(174,100%,50%)]">markets</span>
                      <span className="text-white">.</span>
                      <span className="text-[hsl(45,93%,70%)]">getMarkets</span>
                      <span className="text-white">({'{ '}status: </span>
                      <span className="text-[hsl(45,93%,58%)]">&quot;active&quot;</span>
                      <span className="text-white">{' }'})</span>
                      {'\n\n'}
                      <span className="text-[hsl(215,15%,45%)]">{'// Subscribe to real-time prices'}</span>
                      {'\n'}
                      <span className="text-[hsl(280,100%,70%)]">await</span>
                      <span className="text-white"> dflow.</span>
                      <span className="text-[hsl(174,100%,50%)]">ws</span>
                      <span className="text-white">.</span>
                      <span className="text-[hsl(45,93%,70%)]">connect</span>
                      <span className="text-white">()</span>
                      {'\n'}
                      <span className="text-white">dflow.</span>
                      <span className="text-[hsl(174,100%,50%)]">ws</span>
                      <span className="text-white">.</span>
                      <span className="text-[hsl(45,93%,70%)]">onPrice</span>
                      <span className="text-white">{'((p) => console.log(p))'}</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative border-t border-[hsl(218,35%,12%)] bg-[hsl(222,47%,7%)] px-6 py-24">
          {/* Section background effects */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-[1px] w-32 bg-gradient-to-r from-transparent via-[hsl(174,100%,42%,0.3)] to-transparent" />
            <div className="absolute right-1/4 top-0 h-[1px] w-32 bg-gradient-to-r from-transparent via-[hsl(174,100%,42%,0.3)] to-transparent" />
          </div>

          <div className="mx-auto max-w-6xl">
            {/* Section header */}
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-3">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[hsl(174,100%,42%)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[hsl(174,100%,50%)]">
                  Core Features
                </span>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[hsl(174,100%,42%)]" />
              </div>
              <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">
                Everything You Need
              </h2>
              <p className="mx-auto max-w-xl text-[15px] text-[hsl(215,20%,60%)]">
                A complete toolkit for building prediction markets and trading applications on Solana
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={FeatureIcons.markets}
                title="Market Discovery"
                description="Browse events, markets, series, and categories. Full access to orderbooks, trades, and live data feeds."
                accentColor="hsl(174,100%,42%)"
                index={0}
              />
              <FeatureCard
                icon={FeatureIcons.routing}
                title="Smart Order Routing"
                description="Imperative swaps with route preview or declarative intents with JIT optimization and MEV protection."
                accentColor="hsl(45,93%,58%)"
                index={1}
              />
              <FeatureCard
                icon={FeatureIcons.websocket}
                title="Real-time WebSocket"
                description="Subscribe to price updates, trades, and orderbook changes with automatic reconnection handling."
                accentColor="hsl(220,100%,65%)"
                index={2}
              />
              <FeatureCard
                icon={FeatureIcons.solana}
                title="Solana Native"
                description="Built for Solana with transaction signing helpers, position tracking, and TOKEN_2022 support."
                accentColor="hsl(280,100%,70%)"
                index={3}
              />
              <FeatureCard
                icon={FeatureIcons.positions}
                title="Position Management"
                description="Track user positions, check redemption eligibility, and calculate scalar market payouts."
                accentColor="hsl(340,100%,65%)"
                index={4}
              />
              <FeatureCard
                icon={FeatureIcons.developer}
                title="Developer First"
                description="Full TypeScript support, comprehensive JSDoc, and utilities for retry, pagination, and error handling."
                accentColor="hsl(150,100%,45%)"
                index={5}
              />
            </div>
          </div>
        </section>

        {/* SDK Selection Section */}
        <section className="border-t border-[hsl(218,35%,12%)] px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">Choose Your SDK</h2>
              <p className="text-[hsl(215,20%,65%)]">Available for both TypeScript and Python developers</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* TypeScript Card */}
              <Link
                href="/docs/typescript"
                className="group relative overflow-hidden rounded-2xl border border-[hsl(218,35%,18%)] bg-[hsl(222,47%,8%)] p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-[hsl(222,47%,9%)]"
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500 opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-20" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">TypeScript SDK</h3>
                <p className="mb-4 text-sm text-[hsl(215,20%,60%)]">
                  Full-featured SDK for Node.js and browsers with complete type safety.
                </p>
                <div className="mb-4 rounded-lg border border-[hsl(218,35%,15%)] bg-[hsl(220,40%,7%)] px-4 py-2.5 font-mono text-sm">
                  <span className="text-[hsl(215,15%,45%)]">$ </span>
                  <span className="text-white">pnpm add dflow-sdk</span>
                </div>
                <div className="flex items-center text-sm font-medium text-blue-400">
                  Get Started
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Python Card */}
              <Link
                href="/docs/python"
                className="group relative overflow-hidden rounded-2xl border border-[hsl(218,35%,18%)] bg-[hsl(222,47%,8%)] p-6 transition-all duration-300 hover:border-yellow-500/50 hover:bg-[hsl(222,47%,9%)]"
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-yellow-500 opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-20" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Python SDK</h3>
                <p className="mb-4 text-sm text-[hsl(215,20%,60%)]">
                  Pythonic SDK with async support, Pydantic models, and type hints.
                </p>
                <div className="mb-4 rounded-lg border border-[hsl(218,35%,15%)] bg-[hsl(220,40%,7%)] px-4 py-2.5 font-mono text-sm">
                  <span className="text-[hsl(215,15%,45%)]">$ </span>
                  <span className="text-white">pip install dflow-sdk</span>
                </div>
                <div className="flex items-center text-sm font-medium text-yellow-400">
                  Get Started
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[hsl(218,35%,12%)] px-6 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[hsl(215,15%,45%)]">
              <span>Powered by</span>
              <Link
                href="https://pond.dflow.net"
                className="font-medium text-white transition-colors hover:text-[hsl(174,100%,50%)]"
              >
                DFlow
              </Link>
              <span>&</span>
              <Link
                href="https://kalshi.com"
                className="font-medium text-white transition-colors hover:text-[hsl(174,100%,50%)]"
              >
                Kalshi
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/vaibhav0806/dflow-sdk"
                className="text-[hsl(215,15%,45%)] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </Link>
              <Link
                href="https://twitter.com/daborainc"
                className="text-[hsl(215,15%,45%)] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

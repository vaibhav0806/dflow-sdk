'use client';

import Link from 'next/link';

export default function DocsPage() {
  return (
    <main className="relative min-h-screen bg-[hsl(222,47%,6%)]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(174,100%,42%,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsla(220,100%,50%,0.06)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[hsl(174,100%,42%)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[hsl(174,100%,50%)]">
              Documentation
            </span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[hsl(174,100%,42%)]" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose Your SDK
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[hsl(215,20%,60%)]">
            DFlow provides SDKs for both TypeScript and Python. Select your preferred language to get started.
          </p>
        </div>

        {/* SDK Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* TypeScript Card */}
          <Link
            href="/docs/typescript"
            className="group relative overflow-hidden rounded-2xl border border-[hsl(218,35%,18%)] bg-[hsl(222,47%,8%)] p-8 transition-all duration-300 hover:border-blue-500/50 hover:bg-[hsl(222,47%,9%)]"
          >
            {/* Glow effect */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500 opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-20" />
            
            {/* Corner accents */}
            <div className="absolute left-0 top-0 h-12 w-[1px] bg-gradient-to-b from-blue-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute left-0 top-0 h-[1px] w-12 bg-gradient-to-r from-blue-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Icon */}
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
              </svg>
            </div>
            
            {/* Content */}
            <h2 className="mb-2 text-2xl font-bold text-white">TypeScript SDK</h2>
            <p className="mb-6 text-[hsl(215,20%,60%)]">
              Full-featured SDK for Node.js and browser environments with complete TypeScript support.
            </p>
            
            {/* Install command */}
            <div className="mb-6 rounded-lg border border-[hsl(218,35%,15%)] bg-[hsl(220,40%,7%)] px-4 py-3 font-mono text-sm">
              <span className="text-[hsl(215,15%,45%)]">$ </span>
              <span className="text-white">pnpm add dflow-sdk</span>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {['Type-safe', 'Tree-shakeable', 'ESM & CJS', 'Zero deps*'].map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400"
                >
                  {feature}
                </span>
              ))}
            </div>
            
            {/* Arrow */}
            <div className="absolute bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(218,35%,20%)] bg-[hsl(220,40%,9%)] text-[hsl(215,20%,55%)] transition-all group-hover:border-blue-500/50 group-hover:text-blue-400">
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Python Card */}
          <Link
            href="/docs/python"
            className="group relative overflow-hidden rounded-2xl border border-[hsl(218,35%,18%)] bg-[hsl(222,47%,8%)] p-8 transition-all duration-300 hover:border-yellow-500/50 hover:bg-[hsl(222,47%,9%)]"
          >
            {/* Glow effect */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-yellow-500 opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-20" />
            
            {/* Corner accents */}
            <div className="absolute left-0 top-0 h-12 w-[1px] bg-gradient-to-b from-yellow-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute left-0 top-0 h-[1px] w-12 bg-gradient-to-r from-yellow-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Icon */}
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
              </svg>
            </div>
            
            {/* Content */}
            <h2 className="mb-2 text-2xl font-bold text-white">Python SDK</h2>
            <p className="mb-6 text-[hsl(215,20%,60%)]">
              Pythonic SDK with async support, Pydantic models, and full type hints for data science and trading bots.
            </p>
            
            {/* Install command */}
            <div className="mb-6 rounded-lg border border-[hsl(218,35%,15%)] bg-[hsl(220,40%,7%)] px-4 py-3 font-mono text-sm">
              <span className="text-[hsl(215,15%,45%)]">$ </span>
              <span className="text-white">pip install dflow-sdk</span>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {['Type hints', 'Async/await', 'Pydantic', 'Python 3.10+'].map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400"
                >
                  {feature}
                </span>
              ))}
            </div>
            
            {/* Arrow */}
            <div className="absolute bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(218,35%,20%)] bg-[hsl(220,40%,9%)] text-[hsl(215,20%,55%)] transition-all group-hover:border-yellow-500/50 group-hover:text-yellow-400">
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-sm text-[hsl(215,20%,50%)]">Quick Links</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/docs/typescript/getting-started/quickstart"
              className="text-sm font-medium text-[hsl(174,100%,50%)] transition-colors hover:text-[hsl(174,100%,60%)]"
            >
              TypeScript Quickstart →
            </Link>
            <Link
              href="/docs/python/getting-started/quickstart"
              className="text-sm font-medium text-[hsl(174,100%,50%)] transition-colors hover:text-[hsl(174,100%,60%)]"
            >
              Python Quickstart →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

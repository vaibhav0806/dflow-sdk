import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container max-w-4xl px-4 py-16 text-center">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 ring-1 ring-emerald-500/20">
            TypeScript SDK for Solana
          </span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            DFlow SDK
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Build institution-grade trading experiences across spot and prediction
          markets natively on Solana with a unified TypeScript SDK.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-500 px-8 text-base font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            Get Started
          </Link>
          <Link
            href="/docs/api-reference/client"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-8 text-base font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            API Reference
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left">
            <div className="mb-3 text-2xl">📈</div>
            <h3 className="mb-2 font-semibold text-slate-200">
              Prediction Markets
            </h3>
            <p className="text-sm text-slate-400">
              Events, Markets, Orderbook, Trades, and Live Data APIs for
              on-chain prediction markets.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left">
            <div className="mb-3 text-2xl">⚡</div>
            <h3 className="mb-2 font-semibold text-slate-200">Trade API</h3>
            <p className="text-sm text-slate-400">
              Imperative and declarative swaps, orders, intents, and smart order
              routing.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left">
            <div className="mb-3 text-2xl">🔌</div>
            <h3 className="mb-2 font-semibold text-slate-200">
              Real-time WebSocket
            </h3>
            <p className="text-sm text-slate-400">
              Subscribe to price updates, trades, and orderbook changes in
              real-time.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-xl border border-slate-800 bg-slate-900/30 p-6">
          <pre className="overflow-x-auto text-left text-sm">
            <code className="text-slate-300">
              <span className="text-slate-500">{'// Quick Start'}</span>
              {'\n'}
              <span className="text-purple-400">import</span>
              <span className="text-slate-300">{' { '}</span>
              <span className="text-emerald-400">DFlowClient</span>
              <span className="text-slate-300">{' } '}</span>
              <span className="text-purple-400">from</span>
              <span className="text-amber-300">{" 'dflow-sdk'"}</span>
              <span className="text-slate-300">;</span>
              {'\n\n'}
              <span className="text-purple-400">const</span>
              <span className="text-slate-300"> dflow = </span>
              <span className="text-purple-400">new</span>
              <span className="text-cyan-400"> DFlowClient</span>
              <span className="text-slate-300">();</span>
              {'\n'}
              <span className="text-purple-400">const</span>
              <span className="text-slate-300"> events = </span>
              <span className="text-purple-400">await</span>
              <span className="text-slate-300"> dflow.</span>
              <span className="text-cyan-400">events</span>
              <span className="text-slate-300">.</span>
              <span className="text-yellow-400">getEvents</span>
              <span className="text-slate-300">{'({ '}</span>
              <span className="text-slate-300">status: </span>
              <span className="text-amber-300">{"'active'"}</span>
              <span className="text-slate-300">{' });'}</span>
            </code>
          </pre>
        </div>
      </div>
    </main>
  );
}

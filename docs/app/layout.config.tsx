import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="nav-logo group flex items-center gap-2.5">
        {/* DFlow text with gradient hover */}
        <span className="text-[18px] font-semibold tracking-tight text-white transition-colors group-hover:text-[hsl(174,100%,55%)]">
          DFlow
        </span>
        {/* SDK badge */}
        <span className="rounded-md bg-[hsla(174,100%,42%,0.12)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[hsl(174,100%,55%)] ring-1 ring-inset ring-[hsla(174,100%,42%,0.25)] transition-all group-hover:bg-[hsla(174,100%,42%,0.2)] group-hover:ring-[hsla(174,100%,42%,0.4)]">
          SDK
        </span>
      </div>
    ),
    transparentMode: 'top',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'DFlow',
      url: 'https://pond.dflow.net',
      external: true,
    },
  ],
  githubUrl: 'https://github.com/vaibhav0806/dflow-sdk',
};

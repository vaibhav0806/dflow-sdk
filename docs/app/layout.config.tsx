import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        DFlow SDK
      </span>
    ),
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
  githubUrl: 'https://github.com/dflow-protocol/dflow-sdk',
};

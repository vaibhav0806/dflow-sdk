import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const typescriptDocs = defineDocs({
  dir: 'content/docs/typescript',
});

export const pythonDocs = defineDocs({
  dir: 'content/docs/python',
});

export default defineConfig({
  mdxOptions: {
    // Add any MDX options here
  },
});

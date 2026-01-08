import defaultMdxComponents from 'fumadocs-ui/mdx';

type MDXComponents = Record<string, React.ComponentType<unknown>>;

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
  } as MDXComponents;
}

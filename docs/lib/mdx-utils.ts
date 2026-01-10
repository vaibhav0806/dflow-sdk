/**
 * Cleans MDX/Markdown content for LLM consumption
 */
export function cleanMdxContent(content: string): string {
  let cleaned = content;

  // Remove front matter (---...---)
  cleaned = cleaned.replace(/^---[\s\S]*?---\n*/m, '');

  // Remove import statements
  cleaned = cleaned.replace(/^import\s+.*?;?\s*$/gm, '');

  // Remove JSX components (opening and closing tags)
  cleaned = cleaned.replace(/<[A-Z][a-zA-Z]*[^>]*>/g, '');
  cleaned = cleaned.replace(/<\/[A-Z][a-zA-Z]*>/g, '');
  
  // Remove self-closing JSX components
  cleaned = cleaned.replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '');

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Convert code blocks FIRST (before other processing)
  cleaned = cleaned.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = (lang || 'code').toUpperCase();
    return `\n[${language}]\n${code.trim()}\n[END ${language}]\n`;
  });

  // Convert markdown links [text](url) to just text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Convert markdown images ![alt](url) to just description
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '(Image: $1)');

  // Convert headers to plain text with clear separation
  cleaned = cleaned.replace(/^######\s+(.+)$/gm, '\n--- $1 ---');
  cleaned = cleaned.replace(/^#####\s+(.+)$/gm, '\n--- $1 ---');
  cleaned = cleaned.replace(/^####\s+(.+)$/gm, '\n--- $1 ---');
  cleaned = cleaned.replace(/^###\s+(.+)$/gm, '\n== $1 ==');
  cleaned = cleaned.replace(/^##\s+(.+)$/gm, '\n=== $1 ===');
  cleaned = cleaned.replace(/^#\s+(.+)$/gm, '\n$1\n');

  // Convert bold **text** or __text__ to text
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

  // Convert italic *text* or _text_ to text (careful not to match underscores in code)
  cleaned = cleaned.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '$1');

  // Convert inline code `code` to just the code
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Process tables - convert to readable format
  cleaned = cleaned.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    // Skip separator rows
    if (cells.every(c => /^[\s\-:]+$/.test(c))) {
      return '';
    }
    return cells.map(c => c.trim()).join(' | ');
  });

  // Remove horizontal rules
  cleaned = cleaned.replace(/^[\-*_]{3,}\s*$/gm, '');

  // Convert blockquotes
  cleaned = cleaned.replace(/^>\s+(.+)$/gm, 'Note: $1');

  // Convert unordered lists - preserve structure
  cleaned = cleaned.replace(/^(\s*)[-*+]\s+(.+)$/gm, '$1• $2');

  // Convert ordered lists - preserve structure  
  cleaned = cleaned.replace(/^(\s*)\d+\.\s+(.+)$/gm, '$1• $2');

  // Clean up excess whitespace but preserve paragraph breaks
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  cleaned = cleaned.replace(/[ \t]+$/gm, '');
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Extracts text content from structured data (TOC)
 */
export function extractTextFromStructuredData(data: unknown): string {
  if (!data) return '';
  
  const sections: string[] = [];
  
  function processNode(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    
    const obj = node as Record<string, unknown>;
    
    if (obj.title && typeof obj.title === 'string') {
      sections.push(obj.title);
    }
    
    if (obj.content && typeof obj.content === 'string') {
      sections.push(obj.content);
    }
    
    if (Array.isArray(obj.children)) {
      obj.children.forEach(processNode);
    }
    
    if (Array.isArray(obj)) {
      obj.forEach(processNode);
    }
  }
  
  processNode(data);
  return sections.join('\n');
}

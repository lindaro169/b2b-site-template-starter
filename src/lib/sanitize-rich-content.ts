import { marked } from 'marked';
import sanitizeHtmlLibrary from 'sanitize-html';

export const EMPTY_RICH_CONTENT_PREVIEW_HTML =
  '<p style="color: #999; font-style: italic;">无预览内容</p>';

const RICH_CONTENT_SANITIZE_OPTIONS = {
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
    'code',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strike',
    'strong',
    'sub',
    'sup',
    'u',
    'ul',
  ],
  allowedAttributes: {
    '*': ['align'],
    a: ['href', 'rel', 'target', 'title'],
    img: ['alt', 'height', 'src', 'title', 'width'],
  },
  allowedSchemes: ['data', 'http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['data', 'http', 'https'],
  },
  allowProtocolRelative: false,
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownToHtml(content: string): string {
  try {
    const rendered = marked.parse(content);
    return typeof rendered === 'string'
      ? rendered
      : EMPTY_RICH_CONTENT_PREVIEW_HTML;
  } catch (error) {
    console.error('Failed to parse markdown:', error);
    return `<p>${escapeHtml(content).replace(/\n/g, '<br/>')}</p>`;
  }
}

export function looksLikeHtml(content: string): boolean {
  return /<[^>]+>/g.test(content);
}

function looksLikeMarkdown(content: string): boolean {
  return /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>|\|)|\*\*|__|`{1,3}|\[[^\]]+\]\([^)]+\)/m.test(
    content
  );
}

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLibrary(html, RICH_CONTENT_SANITIZE_OPTIONS);
}

export function renderRichContentToHtml(content?: string): string {
  if (!content || content.trim().length === 0) {
    return EMPTY_RICH_CONTENT_PREVIEW_HTML;
  }

  const rawHtml =
    looksLikeHtml(content) && !looksLikeMarkdown(content)
      ? content
      : markdownToHtml(content);
  const sanitized = sanitizeHtml(rawHtml).trim();

  return sanitized.length > 0 ? sanitized : EMPTY_RICH_CONTENT_PREVIEW_HTML;
}

export function sanitizeStoredRichContent(content?: string): string | undefined {
  if (content === undefined) {
    return undefined;
  }

  return renderRichContentToHtml(content);
}

export function extractPlainTextFromRichContent(content?: string): string {
  if (!content || content.trim().length === 0) {
    return '';
  }

  return renderRichContentToHtml(content)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/\s+/g, ' ')
    .trim();
}

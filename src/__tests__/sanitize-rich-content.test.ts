import { describe, expect, it } from 'vitest';
import {
  extractPlainTextFromRichContent,
  renderRichContentToHtml,
  sanitizeStoredRichContent,
} from '@/lib/sanitize-rich-content';

describe('sanitize rich content', () => {
  it('removes executable html from stored content', () => {
    const sanitized = sanitizeStoredRichContent(
      '<p>Hello</p><img src="x" onerror="alert(1)"><script>alert(1)</script>'
    );

    expect(sanitized).toContain('<p>Hello</p>');
    expect(sanitized).toContain('<img');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('<script');
  });

  it('renders markdown through sanitized html', () => {
    const rendered = renderRichContentToHtml('# 标题\n\n<script>alert(1)</script>\n\n**内容**');

    expect(rendered).toContain('<h1>标题</h1>');
    expect(rendered).toContain('<strong>内容</strong>');
    expect(rendered).not.toContain('<script');
  });

  it('extracts plain text from rich content', () => {
    expect(extractPlainTextFromRichContent('<p>Hello <strong>world</strong></p>')).toBe(
      'Hello world'
    );
  });
});

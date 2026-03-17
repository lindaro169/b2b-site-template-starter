'use client';

import { useState, useRef, useMemo } from 'react';
import { marked } from 'marked';
import styles from './rich-editor.module.css';

export interface RichEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageInsert?: (url: string) => void;
}

export function RichEditor({
  value,
  onChange,
  placeholder = '开始写文章...',
  onImageInsert,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertImage = (url: string) => {
    execCommand('insertImage', url);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo, we'll use a data URL. In production, upload to R2
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      insertImage(url);
      onImageInsert?.(url);
    };
    reader.readAsDataURL(file);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value;
    if (format) {
      execCommand('formatBlock', `<${format}>`);
      setSelectedFormat(format);
    }
  };

  const toggleHtmlMode = () => {
    if (editorRef.current) {
      if (isHtmlMode) {
        editorRef.current.innerHTML = value;
        editorRef.current.contentEditable = 'true';
      } else {
        editorRef.current.textContent = value;
        editorRef.current.contentEditable = 'false';
      }
      setIsHtmlMode(!isHtmlMode);
    }
  };

  return (
    <div className={styles.editor}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <select
            value={selectedFormat}
            onChange={handleFormatChange}
            className={styles.formatSelect}
            title="段落格式"
          >
            <option value="">段落格式</option>
            <option value="h1">标题 1</option>
            <option value="h2">标题 2</option>
            <option value="h3">标题 3</option>
            <option value="h4">标题 4</option>
            <option value="p">正文</option>
          </select>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={() => execCommand('bold')}
            className={styles.toolBtn}
            title="加粗 (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => execCommand('italic')}
            className={styles.toolBtn}
            title="斜体 (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => execCommand('underline')}
            className={styles.toolBtn}
            title="下划线 (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => execCommand('strikethrough')}
            className={styles.toolBtn}
            title="删除线"
          >
            <s>S</s>
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className={styles.toolBtn}
            title="无序列表"
          >
            ≡
          </button>
          <button
            onClick={() => execCommand('insertOrderedList')}
            className={styles.toolBtn}
            title="有序列表"
          >
            123
          </button>
          <button
            onClick={() => execCommand('indent')}
            className={styles.toolBtn}
            title="增加缩进"
          >
            →
          </button>
          <button
            onClick={() => execCommand('outdent')}
            className={styles.toolBtn}
            title="减少缩进"
          >
            ←
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={() => execCommand('createLink', prompt('输入 URL:') || '')}
            className={styles.toolBtn}
            title="添加链接"
          >
            🔗
          </button>
          <label className={styles.toolBtn} title="插入图片">
            🖼️
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={() => execCommand('justifyLeft')}
            className={styles.toolBtn}
            title="左对齐"
          >
            ⬅
          </button>
          <button
            onClick={() => execCommand('justifyCenter')}
            className={styles.toolBtn}
            title="居中"
          >
            ⬆
          </button>
          <button
            onClick={() => execCommand('justifyRight')}
            className={styles.toolBtn}
            title="右对齐"
          >
            ➡
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={() => execCommand('undo')}
            className={styles.toolBtn}
            title="撤销 (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={() => execCommand('redo')}
            className={styles.toolBtn}
            title="重做 (Ctrl+Y)"
          >
            ↷
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={toggleHtmlMode}
            className={`${styles.toolBtn} ${isHtmlMode ? styles.active : ''}`}
            title="HTML 编辑"
          >
            &lt;/&gt;
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        className={styles.editorContent}
        contentEditable={!isHtmlMode}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      >
        {value}
      </div>

      {/* Word Count */}
      <div className={styles.footer}>
        <span className={styles.wordCount}>
          字数: {value.replace(/<[^>]*>/g, '').length}
        </span>
      </div>
    </div>
  );
}

// 预览组件
export function EditorPreview({ content }: { content: string }) {
  // 使用 useMemo 缓存转换后的 HTML，避免每次渲染都重新转换
  const htmlContent = useMemo(() => {
    if (!content || content.trim().length === 0) {
      return '<p style="color: #999; font-style: italic;">无预览内容</p>';
    }

    // 检查内容是否为 HTML（包含 HTML 标签）或 markdown（包含 markdown 语法）
    const isHtml = /<[^>]+>/g.test(content);

    if (isHtml) {
      // 已经是 HTML，直接返回
      return content;
    }

    // 如果是 markdown，将其转换为 HTML
    try {
      const converted = marked(content) as string;
      return converted || '<p style="color: #999; font-style: italic;">无预览内容</p>';
    } catch (error) {
      // 如果转换失败，简单处理换行
      console.error('Failed to parse markdown:', error);
      return `<p>${content.replace(/\n/g, '<br/>')}</p>`;
    }
  }, [content]);

  return (
    <div
      className={styles.preview}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

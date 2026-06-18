import React, { useState } from 'react';
import styles from './CodeViewer.module.css';

interface CodeViewerProps {
  code: string;
  formTitle: string;
}

function toPascalCase(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9\s-_]/g, '');
  const words = clean.split(/[\s-_]+/);
  const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  let result = capitalized.join('');
  if (/^[0-9]/.test(result)) {
    result = 'Form' + result;
  }
  return result || 'GeneratedForm';
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, formTitle }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
    const pascalName = toPascalCase(formTitle || 'GeneratedForm');
    const filename = `${pascalName}.tsx`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting using placeholders for strings/comments to avoid nested replacements
  const getHighlightedCode = (rawCode: string) => {
    // 1. Escape HTML
    let html = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const placeholders: string[] = [];

    // String placeholder replacement
    html = html.replace(/("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)/g, (match) => {
      const idx = placeholders.length;
      placeholders.push(`<span class="${styles.codeString}">${match}</span>`);
      return `___PLACEHOLDER_${idx}___`;
    });

    // Comment placeholder replacement
    html = html.replace(/(\/\/.*)/g, (match) => {
      const idx = placeholders.length;
      placeholders.push(`<span class="${styles.codeComment}">${match}</span>`);
      return `___PLACEHOLDER_${idx}___`;
    });

    // Tag replacement
    html = html.replace(/(&lt;\/?[a-zA-Z0-9]+)/g, `<span class="${styles.codeTag}">$1</span>`);
    html = html.replace(/(&gt;)/g, `<span class="${styles.codeTag}">$1</span>`);

    // Keywords replacement
    const keywords = [
      'export', 'default', 'function', 'const', 'return', 'import', 'from',
      'let', 'interface', 'as', 'any', 'void', 'string', 'number', 'boolean',
      'null', 'undefined', 'true', 'false'
    ];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      html = html.replace(regex, `<span class="${styles.codeKeyword}">$1</span>`);
    });

    // Common React/RHF hooks and handlers
    const hooks = ['useForm', 'useState', 'useEffect', 'handleSubmit', 'register', 'reset', 'validate'];
    hooks.forEach(hook => {
      const regex = new RegExp(`\\b(${hook})\\b`, 'g');
      html = html.replace(regex, `<span class="${styles.codeHook}">$1</span>`);
    });

    // Restore placeholders
    placeholders.forEach((val, idx) => {
      html = html.replace(`___PLACEHOLDER_${idx}___`, val);
    });

    return html;
  };

  return (
    <div className={styles.container}>
      <div className={styles.actionBar}>
        <span className={styles.filename}>{toPascalCase(formTitle || 'GeneratedForm')}.tsx</span>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <span className={styles.icon}>✓</span>
                Copied!
              </>
            ) : (
              <>
                <span className={styles.icon}>📋</span>
                Copy Code
              </>
            )}
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.downloadBtn}`}
            onClick={handleDownload}
            title="Download TSX Component"
          >
            <span className={styles.icon}>⬇</span>
            Download Component
          </button>
        </div>
      </div>
      <div className={styles.codeWrapper}>
        <pre className={styles.pre}>
          <code
            className={styles.code}
            dangerouslySetInnerHTML={{ __html: getHighlightedCode(code) }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;

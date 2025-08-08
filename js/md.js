
// Minimal Markdown renderer: supports headings, bold/italic, code, lists, links
export function renderMarkdown(md) {
  if (!md) return '';
  // Basic escape
  md = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Code blocks ```
  md = md.replace(/```([\s\S]*?)```/g, (m, p1) => `<pre><code>${p1}</code></pre>`);
  // Inline code
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Headings
  md = md.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  md = md.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  md = md.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // Bold / Italic
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links [text](url)
  md = md.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Lists
  // Ordered
  md = md.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
  md = md.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)+/g, (m) => `<ol>${m}</ol>`);
  // Unordered
  md = md.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  md = md.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)+/g, (m) => {
    if (!m.includes('<ol>')) return `<ul>${m}</ul>`; return m;
  });
  // Paragraphs
  md = md.replace(/^(?!<h\d|<ul>|<ol>|<pre>|<li>|<\/li>|<\/ul>|<\/ol>|<p>|<\/p>)(.+)$/gm, '<p>$1</p>');
  // Sanitize extra tags
  return md;
}

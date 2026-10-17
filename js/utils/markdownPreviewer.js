/**
 * ToolLab.org - Markdown Parser & HTML Generator (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\markdownPreviewer.js
 */
const MarkdownPreviewer = {
  // 1. Core Markdown to HTML Parser
  parse(markdownText) {
    if (!markdownText || typeof markdownText !== "string") {
      return "";
    }

    let html = markdownText;

    // Normalize carriage returns
    html = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Fenced Code Blocks (```lang ... ```)
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escapedCode = this.escapeHtml(code.trim());
      const langClass = lang ? ` class="language-${lang}"` : "";
      return `<pre class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto my-4 font-mono text-xs"><code${langClass}>${escapedCode}</code></pre>`;
    });

    // Inline Code (`code`)
    html = html.replace(/`([^`]+)`/g, (_, code) => {
      return `<code class="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">${this.escapeHtml(code)}</code>`;
    });

    // Headers (H1 - H6)
    html = html.replace(/^###### (.*$)/gim, '<h6 class="text-sm font-bold text-slate-200 mt-4 mb-2">$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5 class="text-base font-bold text-slate-200 mt-4 mb-2">$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold text-slate-200 mt-5 mb-2">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-100 mt-5 mb-2.5">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-extrabold text-slate-100 mt-6 mb-3 pb-1 border-b border-slate-800">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-slate-100 mt-6 mb-4 pb-2 border-b border-slate-800">$1</h1>');

    // Blockquotes (> Quote)
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-1.5 my-3 text-slate-400 italic bg-slate-900/40 rounded-r">$1</blockquote>');

    // Horizontal Rules
    html = html.replace(/^(?:---|\*\*\*|___)\s*$/gim, '<hr class="border-t border-slate-800 my-6" />');

    // Bold & Italic formatting
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-slate-100"><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-100">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic text-slate-300">$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-slate-500">$1</del>');

    // Images (![alt](url))
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl border border-slate-800 max-w-full my-3" />');

    // Links ([text](url))
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">$1</a>');

    // Unordered Lists
    html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');

    // Ordered Lists
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-300">$1</li>');

    // Wrap adjacent <li> tags
    html = html.replace(/(<li class="ml-4 list-disc[^>]*>[\s\S]*?<\/li>)/g, '<ul class="my-3 space-y-1">$1</ul>');
    html = html.replace(/(<li class="ml-4 list-decimal[^>]*>[\s\S]*?<\/li>)/g, '<ol class="my-3 space-y-1">$1</ol>');
    html = html.replace(/<\/ul>\s*<ul class="my-3 space-y-1">/g, "");
    html = html.replace(/<\/ol>\s*<ol class="my-3 space-y-1">/g, "");

    // Paragraphs (Lines separated by empty lines, avoiding block elements)
    const blocks = html.split(/\n\n+/);
    html = blocks.map((b) => {
      const trimmed = b.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|pre|blockquote|ul|ol|hr|img)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p class="my-2.5 leading-relaxed text-slate-300">${trimmed.replace(/\n/g, "<br />")}</p>`;
    }).join("\n");

    return html;
  },

  // 2. Structural Analysis
  getMetrics(rawMarkdown) {
    if (!rawMarkdown) return { chars: 0, words: 0, lines: 0, headings: 0 };
    const chars = rawMarkdown.length;
    const words = rawMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const lines = rawMarkdown.split(/\r?\n/).length;
    const headings = (rawMarkdown.match(/^#{1,6}\s+/gm) || []).length;
    return { chars, words, lines, headings };
  },

  // 3. HTML Entity Sanitizer
  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = MarkdownPreviewer;
}

if (typeof window !== "undefined") {
  window.MarkdownPreviewer = MarkdownPreviewer;
}

// Node.js CLI Validation Block
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("markdownPreviewer.js")) {
  const sample = "# Heading 1\n\nThis is **bold** text and `inline code`.\n\n```js\nconsole.log('test');\n```";
  const html = MarkdownPreviewer.parse(sample);
  console.assert(html.includes("<h1"), "H1 parsing failed");
  console.assert(html.includes("<strong"), "Bold parsing failed");
  console.assert(html.includes("<pre"), "Code block parsing failed");

  const metrics = MarkdownPreviewer.getMetrics(sample);
  console.assert(metrics.headings === 1, "Heading metrics failed");
  console.log("✔ MarkdownPreviewer pure engine passed all unit tests");
}
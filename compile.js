const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

// A unique counter for placeholders
let placeholderCounter = 0;

// Helper to slugify strings for HTML IDs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper to resolve images and copy them
function processImages(markdownContent, markdownFilePath, repoRoot, distDir) {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;
  return markdownContent.replace(imgRegex, (match, alt, imgPath, attrString) => {
    if (imgPath.trim().endsWith('.md')) {
      return match;
    }

    let cleanPath = imgPath.trim();
    const absImgPath = path.resolve(path.dirname(markdownFilePath), cleanPath);
    
    if (fs.existsSync(absImgPath)) {
      const relToRepo = path.relative(repoRoot, absImgPath);
      const destPath = path.join(distDir, relToRepo);
      
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(absImgPath, destPath);
      
      let width = '';
      let id = '';
      if (attrString) {
        const widthMatch = attrString.match(/width=["']?([^"'\s}]+)["']?/);
        if (widthMatch) width = widthMatch[1];
        const idMatch = attrString.match(/#([^\s}]+)/);
        if (idMatch) id = idMatch[1];
      }
      
      let imgTag = `<img src="../${relToRepo}" alt="${alt}"`;
      let styles = [
        'max-width: 100%',
        'height: auto',
        'display: block',
        'margin: 1.5rem auto',
        'border-radius: 8px',
        'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)'
      ];
      if (width) styles.push(`width: ${width}`);
      
      imgTag += ` style="${styles.join('; ')}"`;
      if (id) imgTag += ` id="${id}"`;
      imgTag += ` class="thesis-image">`;
      
      return imgTag;
    } else {
      console.warn(`Warning: Image not found: ${absImgPath} (referenced in ${markdownFilePath})`);
      return match;
    }
  });
}

// Core recursive file resolver
function resolveFile(filePath, titleFromInclusion, repoRoot, distDir, level = 1, tocCollector = []) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    return `<div class="error">File not found: ${filePath}</div>`;
  }
  
  let markdown = fs.readFileSync(filePath, 'utf-8');
  
  markdown = processImages(markdown, filePath, repoRoot, distDir);
  
  const inclusionRegex = /^(\s*(?:[-*+]\s+|\d+\.\s+)?)!?\[([^\]]+)\]\(([^)]+\.md)\)\s*$/gm;
  
  const placeholderMap = {};
  let processedMarkdown = markdown;
  
  processedMarkdown = processedMarkdown.replace(inclusionRegex, (lineMatch, listPrefix, chapterTitle, relativeMdPath) => {
    const targetFilePath = path.resolve(path.dirname(filePath), relativeMdPath.trim());
    const placeholderId = `INCLUSIONPLACEHOLDER${placeholderCounter++}`;
    
    const childToc = [];
    const resolvedChildHtml = resolveFile(targetFilePath, chapterTitle, repoRoot, distDir, level + 1, childToc);
    
    tocCollector.push({
      title: chapterTitle,
      id: slugify(chapterTitle),
      children: childToc,
      level: level
    });
    
    placeholderMap[placeholderId] = resolvedChildHtml;
    return `\n\n${placeholderId}\n\n`;
  });
  
  const lines = processedMarkdown.split('\n');
  let firstHeaderMatch = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('<!--')) continue;
    
    const headerMatch = line.match(/^\s*(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      firstHeaderMatch = headerMatch;
      break;
    }
    break;
  }
  
  let title = titleFromInclusion;
  let id = slugify(title);
  
  if (level === 1) {
    id += '-root';
  }
  
  if (firstHeaderMatch) {
    title = firstHeaderMatch[2].replace(/\\/g, '').trim();
    id = slugify(title);
    if (level === 1) {
      id += '-root';
    }
  } else {
    const isOnlyInclusions = processedMarkdown.replace(/INCLUSIONPLACEHOLDER\d+/g, '').trim() === '';
    if (!isOnlyInclusions) {
      processedMarkdown = `# ${title}\n\n` + processedMarkdown;
    }
  }
  
  let html = marked.parse(processedMarkdown);
  
  const sortedPlaceholders = Object.keys(placeholderMap).sort((a, b) => b.length - a.length);
  
  for (const placeholderId of sortedPlaceholders) {
    const childHtml = placeholderMap[placeholderId];
    const pRegex = new RegExp(`<p>\\s*${placeholderId}\\s*<\/p>|${placeholderId}`, 'g');
    html = html.replace(pRegex, childHtml);
  }
  
  const sectionClass = level === 1 ? 'document-root' : 'chapter';
  
  return `<section class="${sectionClass}" id="${id}">
${html}
</section>`;
}

function renderTocHtml(tocEntries) {
  if (tocEntries.length === 0) return '';
  let html = '<ul>';
  for (const entry of tocEntries) {
    html += `<li>`;
    html += `<a href="#${entry.id}" class="toc-link" data-section="${entry.id}">${entry.title}</a>`;
    if (entry.children && entry.children.length > 0) {
      html += renderTocHtml(entry.children);
    }
    html += `</li>`;
  }
  html += '</ul>';
  return html;
}

function compile() {
  const repoRoot = __dirname;
  const distDir = path.join(repoRoot, 'dist');
  
  fs.mkdirSync(distDir, { recursive: true });
  
  const inputs = [
    {
      key: 'thesis',
      title: 'Graduation Thesis',
      folder: 'coretext-md',
      path: path.join(repoRoot, 'graduation-thesis/coretext-md/main.md')
    },
    {
      key: 'guide',
      title: 'Writing Guide',
      folder: 'guide-md',
      path: path.join(repoRoot, 'graduation-thesis/guide-md/main.md')
    },
    {
      key: 'project3',
      title: 'Project 3 Report',
      folder: 'project3-md',
      path: path.join(repoRoot, 'graduation-thesis/project3-md/main.md')
    }
  ];
  
  console.log('Starting compilation...');
  
  const results = {};
  
  for (const input of inputs) {
    console.log(`Compiling ${input.title}...`);
    const toc = [];
    const html = resolveFile(input.path, input.title, repoRoot, distDir, 1, toc);
    results[input.key] = {
      html: html,
      tocHtml: renderTocHtml(toc)
    };
  }
  
  const generatePageHtml = (inputKey, docTitle, docHtml, tocHtml) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle} - Coretext Portal</title>
  <meta name="description" content="Coretext - A Memory Management System with Knowledge Graph for AI Agents in Software Development. Complete graduation thesis, writing guide, and project report.">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@100..900&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --font-serif: 'Lora', Georgia, serif;
      --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      
      /* Light Mode */
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-header: rgba(255, 255, 255, 0.85);
      --text-primary: #0f172a;
      --text-secondary: #334155;
      --text-muted: #64748b;
      --accent: #2563eb;
      --accent-light: #eff6ff;
      --border-color: #e2e8f0;
      --code-bg: #0f172a;
      --code-text: #f8fafc;
      
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
 
    html[data-theme="dark"] {
      --bg-primary: #0b0f19;
      --bg-secondary: #131c2e;
      --bg-header: rgba(11, 15, 25, 0.85);
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-muted: #64748b;
      --accent: #3b82f6;
      --accent-light: rgba(59, 130, 246, 0.1);
      --border-color: #1e293b;
      --code-bg: #050b14;
      --code-text: #f1f5f9;
      
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
    }
 
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
 
    body {
      font-family: var(--font-serif);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.75;
      font-size: 1.125rem;
      transition: var(--transition);
      overflow-x: hidden;
    }
 
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background-color: var(--bg-header);
      border-bottom: 1px solid var(--border-color);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 100;
      transition: var(--transition);
    }
 
    .header-container {
      max-width: 1400px;
      height: 100%;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
 
    .logo {
      font-family: var(--font-sans);
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.025em;
      color: var(--accent);
    }
 
    .tab-switcher {
      display: flex;
      background-color: var(--border-color);
      padding: 0.25rem;
      border-radius: 9999px;
      gap: 0.25rem;
    }
 
    .tab-btn {
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-secondary);
      background: none;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      cursor: pointer;
      text-decoration: none;
      transition: var(--transition);
    }
 
    .tab-btn:hover {
      color: var(--text-primary);
    }
 
    .tab-btn.active {
      background-color: var(--bg-secondary);
      color: var(--accent);
      box-shadow: var(--shadow-sm);
    }
 
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
 
    .theme-toggle-btn, .print-btn, .user-guide-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }
 
    .theme-toggle-btn:hover, .print-btn:hover, .user-guide-btn:hover {
      color: var(--accent);
      border-color: var(--accent);
    }
 
    .print-btn, .user-guide-btn {
      font-family: var(--font-sans);
      font-weight: 600;
      padding: 0.5rem 1rem;
      gap: 0.5rem;
      text-decoration: none;
    }
 
    .theme-toggle-btn svg {
      width: 20px;
      height: 20px;
    }
 
    html[data-theme="dark"] .sun-icon { display: block; }
    html[data-theme="dark"] .moon-icon { display: none; }
    html:not([data-theme="dark"]) .sun-icon { display: none; }
    html:not([data-theme="dark"]) .moon-icon { display: block; }
 
    .app-layout {
      display: flex;
      max-width: 1400px;
      margin: 70px auto 0 auto;
      min-height: calc(100vh - 70px);
    }
 
    .sidebar-toc {
      width: 320px;
      border-right: 1px solid var(--border-color);
      padding: 2.5rem 2rem;
      position: relative;
    }
 
    .sidebar-sticky {
      position: fixed;
      top: 110px;
      width: 280px;
      max-height: calc(100vh - 150px);
      overflow-y: auto;
      padding-right: 0.5rem;
    }
 
    .sidebar-sticky::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-sticky::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 9999px;
    }
 
    .toc-header {
      font-family: var(--font-sans);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 1rem;
      font-weight: 700;
    }
 
    .toc-container {
      display: block;
    }
 
    .toc-container ul {
      list-style: none;
      padding-left: 0;
    }
 
    .toc-container li {
      margin-bottom: 0.5rem;
    }
 
    .toc-container li ul {
      padding-left: 1rem;
      margin-top: 0.25rem;
      border-left: 1px solid var(--border-color);
    }
 
    .toc-link {
      font-family: var(--font-sans);
      font-size: 0.95rem;
      color: var(--text-secondary);
      text-decoration: none;
      display: inline-block;
      padding: 0.15rem 0;
      transition: var(--transition);
      word-break: break-word;
    }
 
    .toc-link:hover {
      color: var(--accent);
    }
 
    .toc-link.active {
      color: var(--accent);
      font-weight: 600;
    }
 
    .reader-content {
      flex: 1;
      padding: 3rem 4rem;
      max-width: 900px;
      margin: 0 auto;
    }
 
    .tab-pane {
      display: block;
      animation: fadeIn 0.4s ease-in-out;
    }
 
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
 
    .document-root, .chapter {
      margin-bottom: 4rem;
      padding-bottom: 2rem;
    }
 
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-sans);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.25;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }
 
    h1 { font-size: 2.5rem; margin-top: 0; }
    h2 { font-size: 1.85rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
    h3 { font-size: 1.4rem; }
    h4 { font-size: 1.15rem; }
 
    p {
      margin-bottom: 1.5rem;
      text-align: justify;
    }
 
    ul, ol {
      margin-bottom: 1.5rem;
      padding-left: 2rem;
    }
 
    li {
      margin-bottom: 0.5rem;
    }
 
    blockquote {
      border-left: 4px solid var(--accent);
      padding: 1rem 1.5rem;
      background-color: var(--accent-light);
      color: var(--text-secondary);
      border-radius: 0 8px 8px 0;
      margin: 1.5rem 0;
      font-style: italic;
    }
 
    code {
      font-family: 'Fira Code', 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      font-size: 0.9em;
      background-color: var(--border-color);
      color: var(--accent);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      word-break: break-all;
    }
 
    pre {
      background-color: var(--code-bg) !important;
      color: var(--code-text);
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
      border: 1px solid var(--border-color);
    }
 
    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      border-radius: 0;
      font-size: 0.9rem;
      word-break: normal;
    }
 
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      font-size: 0.95rem;
      box-shadow: var(--shadow-sm);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }
 
    th, td {
      padding: 1rem 1.25rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
 
    th {
      background-color: var(--border-color);
      font-family: var(--font-sans);
      font-weight: 700;
      color: var(--text-primary);
    }
 
    tr:last-child td {
      border-bottom: none;
    }
 
    tbody tr:nth-child(even) {
      background-color: var(--accent-light);
    }
 
    .error {
      color: #ef4444;
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
    }
 
    @media print {
      body {
        background: white !important;
        color: black !important;
        font-size: 12pt;
        line-height: 1.5;
      }
      
      .no-print {
        display: none !important;
      }
      
      .app-layout {
        margin-top: 0;
        display: block;
        min-height: auto;
      }
      
      .reader-content {
        padding: 0;
        max-width: 100%;
      }
      
      .chapter, .document-root {
        break-after: page;
        page-break-after: always;
      }
      
      @page {
        margin: 20mm 20mm 20mm 20mm;
      }
    }
 
    @media (max-width: 1024px) {
      .sidebar-toc {
        display: none;
      }
      
      .reader-content {
        padding: 2rem 1.5rem;
      }
      
      .header-container {
        padding: 0 1rem;
      }
      
      .logo {
        display: none;
      }
      
      .tab-btn {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
      }
    }
  </style>
</head>
<body>
  <header id="main-header" class="no-print">
    <div class="header-container">
      <div class="logo">
        <span class="logo-text">Coretext Portal</span>
      </div>
      <nav class="tab-switcher">
        <a href="../coretext-md/index.html" class="tab-btn ${inputKey === 'thesis' ? 'active' : ''}">Thesis</a>
        <a href="../guide-md/index.html" class="tab-btn ${inputKey === 'guide' ? 'active' : ''}">Writing Guide</a>
        <a href="../project3-md/index.html" class="tab-btn ${inputKey === 'project3' ? 'active' : ''}">Project 3</a>
      </nav>
      <div class="header-actions">
        <a href="/knowledge/?file=docs/dashboard_guide.md" class="user-guide-btn" title="User Guide">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span>User Guide</span>
        </a>
        <button id="theme-toggle" class="theme-toggle-btn" title="Toggle theme">
          <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
          <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        </button>
        <button onclick="window.print()" class="print-btn" title="Print document">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          <span>Print</span>
        </button>
      </div>
    </div>
  </header>
 
  <div class="app-layout">
    <aside id="sidebar" class="sidebar-toc no-print">
      <div class="sidebar-sticky">
        <h3 class="toc-header">Table of Contents</h3>
        <div class="toc-container">
          ${tocHtml}
        </div>
      </div>
    </aside>
 
    <main id="content-area" class="reader-content">
      <div class="tab-pane">
        ${docHtml}
      </div>
    </main>
  </div>
 
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const themeToggle = document.getElementById('theme-toggle');
      
      function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('coretext-theme', newTheme);
      }
 
      themeToggle.addEventListener('click', toggleTheme);
 
      const savedTheme = localStorage.getItem('coretext-theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
 
      const tocLinks = document.querySelectorAll('.toc-link');
      
      function updateScrollSpy() {
        const sections = document.querySelectorAll('.chapter, .document-root');
        let currentActiveSectionId = '';
        const scrollPosition = window.scrollY + 100;
 
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          if (section.offsetTop <= scrollPosition) {
            currentActiveSectionId = section.id;
          } else {
            break;
          }
        }
 
        if (!currentActiveSectionId && sections.length > 0) {
          currentActiveSectionId = sections[0].id;
        }
 
        tocLinks.forEach(link => {
          if (link.getAttribute('data-section') === currentActiveSectionId) {
            link.classList.add('active');
            const parentSticky = link.closest('.sidebar-sticky');
            if (parentSticky) {
              const linkTop = link.offsetTop;
              const stickyScrollTop = parentSticky.scrollTop;
              const stickyHeight = parentSticky.clientHeight;
              if (linkTop < stickyScrollTop || linkTop > stickyScrollTop + stickyHeight) {
                parentSticky.scrollTop = linkTop - stickyHeight / 2;
              }
            }
          } else {
            link.classList.remove('active');
          }
        });
      }
 
      window.addEventListener('scroll', updateScrollSpy);
      
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          const targetSection = document.querySelector(targetId);
          if (targetSection) {
            const headerOffset = 90;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            history.pushState(null, null, targetId);
          }
        });
      });
 
      // Handle initial hash scroll with header offset
      if (window.location.hash) {
        setTimeout(() => {
          const targetSection = document.querySelector(window.location.hash);
          if (targetSection) {
            const headerOffset = 90;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'auto'
            });
          }
        }, 150);
      }
      
      setTimeout(updateScrollSpy, 100);
    });
  </script>
</body>
</html>`;

  // Write out directories and HTML files
  for (const input of inputs) {
    const pageDir = path.join(distDir, input.folder);
    fs.mkdirSync(pageDir, { recursive: true });
    
    const pageHtml = generatePageHtml(
      input.key,
      input.title,
      results[input.key].html,
      results[input.key].tocHtml
    );
    
    fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
  }
  
  // Write root redirect file
  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=./coretext-md/index.html">
  <title>Redirecting...</title>
  <script>
    window.location.href = "./coretext-md/index.html";
  </script>
</head>
<body>
  Redirecting to <a href="./coretext-md/index.html">Thesis</a>...
</body>
</html>`;
  fs.writeFileSync(path.join(distDir, 'index.html'), redirectHtml);
  
  console.log('Compilation complete! Saved all pages to dist/');
}

compile();

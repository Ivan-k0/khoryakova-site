#!/usr/bin/env node
// Builds the whole static site (landing pages + blog) from templates/ + content/.
// One template per page type, one JSON file of translated strings per language —
// so a structural/markup change is made once and applies to uk/en/ru together.
'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const TEMPLATES = path.join(ROOT, 'templates');
const CONTENT = path.join(ROOT, 'content');
const POSTS_DIR = path.join(CONTENT, 'posts');

const LANGS = ['uk', 'en', 'ru'];
const LANG_CODE = { uk: 'UK', en: 'EN', ru: 'RU' }; // matches localStorage/lang-redirect.js codes
const LANG_DIR = { uk: '', en: 'en/', ru: 'ru/' }; // output path prefix per language

const MONTHS = {
  uk: ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'],
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December']
};

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const months = MONTHS[lang] || MONTHS.en;
  return lang === 'en'
    ? `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    : `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function writeFile(outPath, contents) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents);
  console.log('wrote', path.relative(ROOT, outPath));
}

function render(templateName, data) {
  return ejs.render(
    fs.readFileSync(path.join(TEMPLATES, templateName), 'utf8'),
    data,
    { views: [TEMPLATES], filename: path.join(TEMPLATES, templateName) }
  );
}

function langPathsFrom(root) {
  // Links between language versions, relative to the current page's own root prefix.
  return { uk: root + '', en: root + 'en/', ru: root + 'ru/' };
}

function loadSite(lang) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, `site.${lang}.json`), 'utf8'));
}

// ---------- 1. Landing pages ----------
function buildLandingPages() {
  LANGS.forEach((lang) => {
    const site = loadSite(lang);
    const root = lang === 'uk' ? '' : '../';
    const canonicalPath = LANG_DIR[lang];
    const html = render('page.ejs', {
      site,
      root,
      activeLang: LANG_CODE[lang],
      langPaths: langPathsFrom(root),
      canonicalPath,
      hreflang: { uk: LANG_DIR.uk, en: LANG_DIR.en, ru: LANG_DIR.ru }
    });
    const outPath = lang === 'uk'
      ? path.join(ROOT, 'index.html')
      : path.join(ROOT, lang, 'index.html');
    writeFile(outPath, html);
  });
}

// ---------- 2. Blog posts ----------
function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
      const { data, content } = matter(raw);
      const lang = LANGS.includes(data.lang) ? data.lang : 'uk';
      const slug = f.replace(/\.md$/, '');
      return {
        slug,
        lang,
        title: data.title || slug,
        date: data.date || null,
        cover: data.cover || null,
        excerpt: data.excerpt || '',
        related: Array.isArray(data.related) ? data.related : [],
        bodyHtml: marked.parse(content)
      };
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function cleanBlogOutput() {
  // Regenerated fresh each build, so a post removed from content/posts/
  // doesn't leave an orphaned HTML page behind (previously happened when
  // a test post's .md was deleted but its blog/<slug>.html stayed).
  LANGS.forEach((lang) => {
    const dir = lang === 'uk' ? path.join(ROOT, 'blog') : path.join(ROOT, lang, 'blog');
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir)
        .filter((f) => f.endsWith('.html'))
        .forEach((f) => fs.unlinkSync(path.join(dir, f)));
    }
  });
}

function buildBlog() {
  cleanBlogOutput();
  const allPosts = loadPosts();

  LANGS.forEach((lang) => {
    const site = loadSite(lang);
    // blog/index.html and blog/<slug>.html are siblings at the same depth
    // (one level under the language root) for every language, so they
    // share the same root prefix.
    const root = lang === 'uk' ? '../' : '../../';
    const blogLangPaths = { uk: root + 'blog/', en: root + 'en/blog/', ru: root + 'ru/blog/' };
    const postsForLang = allPosts.filter((p) => p.lang === lang);

    // --- blog index ---
    const indexHtml = render('blog-index.ejs', {
      site,
      root,
      activeLang: LANG_CODE[lang],
      langPaths: blogLangPaths,
      canonicalPath: `${LANG_DIR[lang]}blog/`,
      hreflang: {
        uk: 'blog/', en: 'en/blog/', ru: 'ru/blog/'
      },
      posts: postsForLang.map((p) => ({
        title: p.title,
        href: `${p.slug}.html`,
        cover: p.cover,
        coverSrc: p.cover ? root + p.cover.replace(/^\/+/, '') : null,
        dateLabel: formatDate(p.date, lang)
      }))
    });
    const indexOut = lang === 'uk'
      ? path.join(ROOT, 'blog', 'index.html')
      : path.join(ROOT, lang, 'blog', 'index.html');
    writeFile(indexOut, indexHtml);

    // --- individual posts ---
    postsForLang.forEach((post) => {
      const relatedPosts = post.related
        .map((relTitle) => postsForLang.find((p) => p.title === relTitle && p.slug !== post.slug))
        .filter(Boolean)
        .map((rp) => ({ title: rp.title, href: `${rp.slug}.html` }));

      const postHtml = render('post.ejs', {
        site,
        root,
        activeLang: LANG_CODE[lang],
        langPaths: blogLangPaths,
        canonicalPath: `${LANG_DIR[lang]}blog/${post.slug}.html`,
        hreflang: { uk: `blog/${post.slug}.html`, en: `en/blog/${post.slug}.html`, ru: `ru/blog/${post.slug}.html` },
        post: {
          title: post.title,
          excerpt: post.excerpt,
          dateLabel: formatDate(post.date, lang),
          cover: post.cover,
          coverSrc: post.cover ? root + post.cover.replace(/^\/+/, '') : null,
          bodyHtml: post.bodyHtml
        },
        relatedPosts
      });
      const postOut = lang === 'uk'
        ? path.join(ROOT, 'blog', `${post.slug}.html`)
        : path.join(ROOT, lang, 'blog', `${post.slug}.html`);
      writeFile(postOut, postHtml);
    });
  });
}

buildLandingPages();
buildBlog();
console.log('Build complete.');

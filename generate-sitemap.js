const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const siteUrl = new URL(process.env.SITE_URL || 'https://c-ditpiravom.in');
if (siteUrl.protocol !== 'https:') {
  throw new Error('SITE_URL must use HTTPS.');
}

const source = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);

const courses = context.window.cditData?.courses;
if (!Array.isArray(courses) || courses.some((course) => !course.slug)) {
  throw new Error('data.js must define courses with slugs before the sitemap can be generated.');
}

const staticPaths = [
  '/',
  '/courses/',
  '/courses/computer-fundamentals.html',
  '/gallery/',
  '/contact/',
  '/terms/',
  '/privacy/'
];
const urls = [
  ...staticPaths.map((pathname) => new URL(pathname, siteUrl.origin).href),
  ...courses.map((course) => {
    const courseUrl = new URL('/courses/course-detail.html', siteUrl.origin);
    courseUrl.searchParams.set('slug', course.slug);
    return courseUrl.href;
  })
];
const escapeXml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} URLs.`);

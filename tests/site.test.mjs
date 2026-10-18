import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {JSDOM} from 'jsdom';

const base = '/CSP_LearningResources/';
const root = resolve('build');
function page(path) {return new JSDOM(readFileSync(join(root, path, 'index.html'), 'utf8')).window.document;}

test('home links to all eight built unit pages under the project base URL', () => {
  const home = page('');
  for (let unit = 1; unit <= 8; unit++) {
    const href = `${base}docs/unit-${unit}/`;
    assert.ok(home.querySelector(`main a[href="${href}"]`), `Home missing unit ${unit}`);
    const doc = page(`docs/unit-${unit}`);
    assert.match(doc.querySelector('h1').textContent, new RegExp(`Unit ${unit}`));
    assert.ok(doc.querySelector('nav[aria-label="Breadcrumbs"]'));
    assert.ok(doc.querySelector('aside'));
    for (const id of ['learning-objectives', 'readings', 'external-resources', 'interactive-activities', 'assignments']) {
      assert.ok(doc.getElementById(id), `Unit ${unit} missing ${id}`);
    }
  }
});

test('lesson sequence, demonstration controls, and sidebar are present in production HTML', () => {
  const overview = page('docs/unit-1');
  assert.ok(overview.querySelector(`a.pagination-nav__link--next[href="${base}docs/unit-1/binary-explorer/"]`));
  const lesson = page('docs/unit-1/binary-explorer');
  assert.ok(lesson.querySelector(`a.pagination-nav__link--prev[href="${base}docs/unit-1/"]`));
  assert.ok(lesson.querySelector(`a.pagination-nav__link--next[href="${base}docs/unit-2/"]`));
  assert.equal(lesson.querySelectorAll('button[aria-pressed]').length, 4);
  assert.equal(lesson.querySelectorAll('input[type="radio"]').length, 3);
  for (let unit = 1; unit <= 8; unit++) {
    const link = lesson.querySelector(`aside a[href="${base}docs/unit-${unit}/"]`);
    assert.ok(link, `Sidebar missing unit ${unit}`);
    assert.match(link.textContent, new RegExp(`Unit ${unit}:`), `Sidebar needs a descriptive unit ${unit} label`);
  }
});

test('all built internal page links, assets, and anchors resolve under the base URL', () => {
  function walk(dir) {return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);}
  for (const file of walk(root).filter((file) => file.endsWith('.html'))) {
    const doc = new JSDOM(readFileSync(file, 'utf8')).window.document;
    const relative = file.slice(root.length + 1).replaceAll('\\', '/').replace(/index\.html$/, '');
    const source = `https://tgibbons-css.github.io${base}${relative}`;
    // Canonical metadata (especially Docusaurus's synthetic 404 URL) is not a navigable asset.
    for (const element of doc.querySelectorAll('a[href],script[src],link[rel="stylesheet"][href],link[rel="icon"][href],link[rel="preload"][href],img[src]')) {
      const raw = element.getAttribute('href') ?? element.getAttribute('src');
      if (!raw || /^(mailto:|tel:|data:|javascript:)/.test(raw)) continue;
      const url = new URL(raw, source);
      if (url.origin !== 'https://tgibbons-css.github.io') continue;
      assert.ok(url.pathname.startsWith(base), `${file}: link escapes project base: ${raw}`);
      const target = join(root, decodeURIComponent(url.pathname.slice(base.length)));
      const targetFile = url.pathname.endsWith('/') ? join(target, 'index.html') : target;
      assert.ok(existsSync(targetFile), `${file}: missing target ${raw}`);
      if (url.hash && targetFile.endsWith('.html')) {
        const destination = new JSDOM(readFileSync(targetFile, 'utf8')).window.document;
        assert.ok(destination.getElementById(decodeURIComponent(url.hash.slice(1))), `${file}: missing anchor ${raw}`);
      }
    }
  }
});

test('Unit 6 lessons separate activities and preserve the reading sequence', () => {
  const firstHref = `${base}docs/unit-6/why-we-need-data-centers/`;
  const caseHref = `${base}docs/unit-6/hermantown-data-center-case-study/`;
  const overview = page('docs/unit-6');
  for (const href of [firstHref, caseHref]) assert.ok(overview.querySelector(`a[href="${href}"]`));
  const first = page('docs/unit-6/why-we-need-data-centers');
  const caseStudy = page('docs/unit-6/hermantown-data-center-case-study');
  assert.equal(first.querySelector('h1').textContent, 'Why We Need Data Centers');
  assert.equal(caseStudy.querySelector('h1').textContent, 'Hermantown Data Center Case Study');
  assert.equal(first.querySelectorAll('[role="tab"]').length, 5);
  assert.equal(first.querySelector('input[type="range"]'), null);
  assert.equal(caseStudy.querySelectorAll('[role="tab"]').length, 0);
  assert.equal(caseStudy.querySelector('input[type="range"]'), null);
  assert.equal(caseStudy.getElementById('out-of-class-reflection-the-cloud-in-our-backyard'), null);
  assert.equal(first.getElementById('out-of-class-reflection-the-cloud-in-our-backyard'), null);
  for (const doc of [first, caseStudy]) {
    for (const href of [firstHref, caseHref]) assert.ok(doc.querySelector(`aside a[href="${href}"]`));
    assert.ok(doc.querySelector('nav[aria-label="Breadcrumbs"]'));
  }
  assert.ok(overview.querySelector(`a.pagination-nav__link--next[href="${firstHref}"]`));
  assert.ok(first.querySelector(`a.pagination-nav__link--prev[href="${base}docs/unit-6/"]`));
  assert.ok(first.querySelector(`a.pagination-nav__link--next[href="${caseHref}"]`));
  assert.ok(caseStudy.querySelector(`a.pagination-nav__link--prev[href="${firstHref}"]`));
  assert.ok(caseStudy.querySelector(`a.pagination-nav__link--next[href="${base}docs/unit-7/"]`));
});

test('Hermantown routes students to all ten shared Docs instead of the legacy local workspace', () => {
  const doc = page('docs/unit-6/hermantown-data-center-case-study');
  const documentIds = [
    '1lrviQHY4x-jLDPpGHWOIIkM-sxczA5Eo4qbywMj9f08',
    '1t7GECDu-IZA7YLjylOOBB_XQejoRLonvdPgW3iyaelU',
    '1Yazqd5jXh_C22tASbNvxJ5xRuSHqMda6Os6nhfLXG94',
    '1vk1cxWy3PfFaa23Lk3dmC3y1wEoHE9RXJuhDu_uH-O8',
    '1D6A_KCDOy6RJdVJroctwVb6HkQcgi6jyQbl8CILgbV0',
    '1Ihz0zZh3xR5Z6uzSFiQNV_FTdeY535ocjpbjdoywKzA',
    '1mN5FD6cXprx0YmD4tagVP08EH8yygRrxcUDdt1pfQXM',
    '1Vs5aogmbzQIZHtH9EiaZNtNz2xi8VOCSXy8s-uCv-TM',
    '1piXJCstzgO0k-6lchx9_PKoJiRx8vOIHadnUw6tmwUU',
    '1jJoYD6ZhIN-82ijr7WsgHUQiVnub93_hiD5e5_0vZRI',
  ];
  for (const id of documentIds) {
    const link = doc.querySelector(`article a[href^="https://docs.google.com/document/d/${id}/edit"]`);
    assert.ok(link, `Missing shared document ${id}`);
    assert.equal(link.target, '_blank');
    assert.ok(link.textContent.trim().length > 10);
  }
  assert.equal(doc.querySelectorAll('article a[href^="https://docs.google.com/document/d/"]').length, 10);
  assert.equal(doc.querySelectorAll('textarea, iframe').length, 0);
  assert.doesNotMatch(doc.body.textContent, /Copy Group Reflection|Loading saved notes|POD_1_DOC_LINK|YOUR_FOLDER_URL/);
  for (const id of ['phase-1-expert-pods', 'phase-2-home-teams', 'phase-3-final-class-decision']) {
    assert.ok(doc.getElementById(id), `Missing student instructions for ${id}`);
  }
  assert.equal(doc.querySelector('a[href*="1gdclunNC525hWhev2urzdnCYQTotwaCOqqSjB1kAcwU"]'), null);
  assert.deepEqual([...doc.querySelectorAll('article h2')].map((heading) => heading.textContent.replace(/\u200b/g, '').trim()),
    ['How the jigsaw works', 'Resource Library']);
  assert.equal(doc.getElementById('before-you-begin'), null);
  assert.ok(doc.getElementById('resource-library'));
});

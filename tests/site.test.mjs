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

test('Unit 6 case study is reachable and statically renders both accessible activities', () => {
  const href = `${base}docs/unit-6/data-centers-big-data/`;
  const overview = page('docs/unit-6');
  assert.ok(overview.querySelector(`a[href="${href}"]`));
  const lesson = page('docs/unit-6/data-centers-big-data');
  assert.ok(lesson.querySelector(`aside a[href="${href}"]`));
  assert.equal(lesson.querySelectorAll('[role="tab"]').length, 7);
  assert.ok(lesson.querySelector('input[type="range"][min="50"][max="700"]'));
  assert.match(lesson.body.textContent, /not a forecast for Hermantown/);
  assert.ok(lesson.querySelector(`a.pagination-nav__link--prev[href="${base}docs/unit-6/"]`));
  assert.ok(lesson.querySelector(`a.pagination-nav__link--next[href="${base}docs/unit-7/"]`));
});

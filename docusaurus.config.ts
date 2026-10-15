import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CIS 1001',
  tagline: 'Computer Science Principles · Learning Resources',
  favicon: 'img/favicon.svg',
  url: 'https://tgibbons-css.github.io',
  baseUrl: '/CSP_LearningResources/',
  organizationName: 'tgibbons-css',
  projectName: 'CSP_LearningResources',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  presets: [[
    'classic',
    {
      docs: {sidebarPath: './sidebars.ts', breadcrumbs: true},
      blog: false,
      theme: {customCss: './src/css/custom.css'},
    } satisfies Preset.Options,
  ]],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: 'CIS 1001',
      logo: {alt: '', src: 'img/favicon.svg'},
      items: [
        {to: '/', label: 'Course home', position: 'left'},
        {type: 'docSidebar', sidebarId: 'courseSidebar', label: 'Learning resources', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [{title: 'Course resources', items: [
        {label: 'Course home', to: '/'},
        {label: 'Start with Unit 1', to: '/docs/unit-1/'},
      ]}],
      copyright: 'CIS 1001 · Computer Science Principles',
    },
  } satisfies Preset.ThemeConfig,
};
export default config;

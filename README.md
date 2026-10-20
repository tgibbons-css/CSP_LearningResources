# CIS 1001 · Computer Science Principles

An extensible Docusaurus, React, TypeScript, and MDX framework for college-level introductory computing resources. Eight course units provide space for objectives, readings, external resources, interactive activities, and assignments. Unit 1 includes a binary explorer and self-check, Unit 5 a resource hub, and Unit 6 a collaborative Big Data/data-center case study. Other content is intentionally minimal.

Production URL: https://tgibbons-css.github.io/CSP_LearningResources/

## Local development

Install Node.js 24 LTS and npm (Node 22 or newer is supported), then run:

```sh
npm ci
npm start
```

Open the local address printed by Docusaurus, usually http://localhost:3000/CSP_LearningResources/. Lesson and component changes reload automatically.

## Build and test

```sh
npm run check
```

This runs strict TypeScript checks, Vitest component tests, a production build with broken-link validation, and Node tests that inspect generated pages for unit links, breadcrumbs, sidebar presence, lesson sequence, local assets, and anchors.

Individual commands:

```sh
npm run typecheck
npm test
npm run test:watch
npm run build
npm run test:site
npm run serve
```

`test:site` requires a current `build/` directory. `serve` previews production output at http://localhost:3000/CSP_LearningResources/. Verify keyboard navigation, the mobile menu, narrow layouts, and light/dark themes during UI review. Automated checks do not replace a full accessibility audit.

## Structure

```text
docs/
  unit-1/                 # MDX overview and demonstration lesson
  unit-2/ … unit-8/       # MDX overviews with five content sections
src/
  components/             # ResourceCard, LearningObjectives,
                          # InstructionalCallout, SelfCheck, BinaryExplorer
  css/custom.css          # Responsive shared styles and theme colors
  data/units.ts           # Homepage unit metadata
  pages/index.tsx         # Course homepage
tests/                    # Component behavior and built-site navigation
.github/workflows/       # Validation and GitHub Pages deployment
docusaurus.config.ts     # Site URL, base path, theme and navigation
sidebars.ts              # Generated unit/lesson sidebar
AGENTS.md                 # Authoring and coding conventions
```

## Authoring

Follow [AGENTS.md](AGENTS.md). Add MDX lessons to the appropriate unit folder with descriptive front matter and ordered `sidebar_position` values. Use relative MDX links between lessons. The generated sidebar, breadcrumbs, table of contents, and previous/next links follow these positions. Unit category links open each MDX landing page.

After hydration, the active lesson expands in the course sidebar with a collapsible **On this page** list generated from its H2/H3 headings (or its front-matter TOC level limits). Inactive lessons remain page links. Theme wrappers in `src/theme/` share the current lesson's heading metadata with the sidebar and replace the desktop right-hand TOC, giving the lesson more space. The mobile menu includes these section links; the inline mobile TOC remains available as well.

Use [the demonstration lesson](docs/unit-1/binary-explorer.mdx) as a small authoring example. Keep TypeScript behavior in `src/components`; import it into MDX. Shared activities use native accessible controls and local React state. The original practice activities reset on reload; the Unit 6 workspaces retain drafts locally as described below. This static site does not grade responses or submit assignments.

When changing unit names, update `src/data/units.ts`, the unit `_category_.json`, and the overview front matter together. The eight unit titles follow the course outline; lesson content remains under development.

## Unit 6: Big Data infrastructure and Hermantown

[Why We Need Data Centers](docs/unit-6/why-we-need-data-centers.mdx) includes five-V readings and a five-team activity in a shared Google Doc. [Hermantown Data Center Case Study](docs/unit-6/hermantown-data-center-case-study.mdx) directs students through four expert-pod Google Docs, five home-team Google Docs, and one final class decision Doc. The instructor assigns pods and teams. Shared Docs hold jigsaw responses; the former single-Doc embed and local reflection form are no longer mounted on this lesson. Confirm student Editor access before class; adding links does not grant access or change sharing permissions.

The Hermantown lesson contains the three jigsaw phases and one Resource Library. Learning objectives, the estimator, the seasonal cooling assignment, and the individual reflection have been removed from this page. The standalone `src/components/ResourceFootprintEstimator/index.tsx` calculator remains available in the codebase, with in-memory settings that reset on unmount/reload. No automatic submission or Google Docs updates are implemented.

The retained standalone synthesis builder is no longer mounted on the lesson. It stores validated drafts in `cis1001.unit6.synthesis.v2` after hydration, with clipboard and storage fallbacks. Its copy action exports only the selected V team's work. Older synthesis v1 drafts are left intact. The legacy `HermantownJigsawExplorer` component remains available with its existing validated `cis1001.unit6.jigsaw.v1` draft behavior, but the current lesson does not render it or read/delete those saved drafts. On shared devices, learners can remove old drafts through browser site-data controls.

`footprintModel.ts` defines illustrative teaching assumptions, not verified Hermantown design parameters: evaporative PUE/WUE pairs of 1.12 / 0.85 L per IT kWh and 1.15 / 1.8 L per IT kWh; a dry air/closed-loop scenario uses PUE 1.25, zero evaporative cooling WUE, and separate municipal water of 8,000 + 25 times IT MW in gallons/day. The household comparison assumes 1.2 kW continuously per home. The model assumes constant IT load, shows off-site water as a separate optional sensitivity, and does not model emissions, costs, or ecological impacts. Neither the 50–700 MW slider nor announced supply capacity establishes actual site demand.

The retained case-study sources are a March–June 2026 snapshot, previously reviewed October 14, 2026. Check the City project page for later decisions. Previously unverified supplied YouTube links remain labeled for confirmation before class.

Tests cover standalone calculator updates/reset without local-storage access, legacy draft restoration and copying, model units/bounds, and production-page links to all ten Docs. Run `npm run check` for TypeScript, component tests, production build, and navigation checks.

## Deployment after review

No push or deployment is needed to review locally. **Pushing to `main` triggers automatic deployment.** Review and approve the implementation before doing so.

After approval:

1. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.
2. Push the reviewed changes to `main`.
3. The workflow runs `npm ci` and `npm run check`, uploads `build/`, and deploys with the `github-pages` environment. GitHub's built-in token is used; no personal access token is required. If the environment requires review, approve the deployment there.
4. Confirm the published site at the production URL above, including direct lesson URLs and the mobile menu.

Pull requests to `main` run validation without deployment. Manual workflow runs deploy only when the selected ref is `main`. Configure environment protection in GitHub if every future deployment should require review.

The config uses `url: 'https://tgibbons-css.github.io'`, `baseUrl: '/CSP_LearningResources/'`, and trailing slashes for static routes. Keep these aligned with the repository name. See the [Docusaurus deployment documentation](https://docusaurus.io/docs/deployment).

## Dependency maintenance

The initial install uses Docusaurus 3.10.2 and Vitest 5.0.4 (resolved in the lockfile). An npm audit after compatible fixes still reports 45 advisories (15 moderate, 15 high, 15 critical) through Docusaurus's dependency tree, including build workers, CSS processing, serialization, and development-server packages. npm's proposed forced fix downgrades Docusaurus outside the selected range; it was not applied. Recheck `npm audit` and upstream releases before publishing. Avoid feeding untrusted build inputs to the toolchain or exposing the development server publicly.

## License

See [LICENSE](LICENSE).

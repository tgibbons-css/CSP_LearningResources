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

Use [the demonstration lesson](docs/unit-1/binary-explorer.mdx) as a small authoring example. Keep TypeScript behavior in `src/components`; import it into MDX. Shared activities use native accessible controls and local React state. The original practice activities reset on reload; the Unit 6 workspaces retain drafts locally as described below. This static site does not grade responses or submit assignments.

When changing unit names, update `src/data/units.ts`, the unit `_category_.json`, and the overview front matter together. The eight unit titles follow the course outline; lesson content remains under development.

## Unit 6: Big Data infrastructure and Hermantown

The [case-study lesson](docs/unit-6/data-centers-big-data.mdx) includes five-V readings with supporting data-format and distributed-computing context, a five-team synthesis builder, four expert pods, an electricity/water estimator, and an individual reflection. Unit 6 components and CSS modules are in `src/components/Unit6/`.

The two workspaces are an explicit exception to the original in-memory-only activities: they store validated drafts in versioned localStorage keys (`cis1001.unit6.synthesis.v2` and `cis1001.unit6.jigsaw.v1`) after hydration. Storage and clipboard failures are handled without blocking editing. The synthesis workspace provides five V tabs and copies only the selected team's definition, example, source quote/link, and discussion question for pasting into the linked shared Google Doc. It does not update the Doc automatically. Older synthesis v1 drafts are left intact and are not migrated into the new five-team structure. Data stays on the device until users copy and paste it into the class destination. On shared computers, users can remove drafts through browser site-data controls. Clipboard copying does not submit work, and Google Docs may paste Markdown as plain text.

`footprintModel.ts` defines **illustrative teaching coefficients**, not verified Hermantown design parameters: evaporative PUE 1.20 / 1.8 L per IT kWh; low-water air/closed-loop PUE 1.35 / 0.05 L per IT kWh. The model assumes constant IT load and excludes indirect water, emissions, cost, and ecological impacts. Its home comparison uses EIA's 2022 US average annual residential-customer purchases (10,791 kWh), not Minnesota peak demand. Do not relabel the 50–700 MW slider or announced wind/battery capacity as measured site demand.

Case cards are explicitly a March–June 2026 source snapshot, reviewed October 14, 2026. Check the City project page before teaching for later decisions. All supplied resource URLs are preserved. Three supplied YouTube links (two IBM Technology videos and the CNBC interview) could not be independently retrieved; confirm titles and availability before class. The City announcement initially returned an intermittent error but was corroborated by indexed content and the City's project materials.

Tests cover server rendering, draft restoration, keyboard tabs, copying and fallback, blocked storage, model units/bounds, group export, and built-site navigation. No linter is configured; `npm run check` runs the available TypeScript, behavior, build, and navigation checks.

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

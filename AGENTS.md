# Conventions for coding agents

## Purpose and scope

This is the CIS 1001: Computer Science Principles learning-resource framework. Keep course content short unless the user requests lesson development. Unit names are provisional. Do not invent due dates, grading policies, required readings, or institutional requirements.

## Architecture

- Author lessons in `docs/unit-N/*.mdx`. Do not embed substantial interaction logic in MDX.
- Put reusable, typed React components in `src/components/ComponentName/index.tsx`. Keep component state local unless persistence is explicitly requested.
- Keep unit card metadata in `src/data/units.ts`, and match titles in each unit's `_category_.json` and landing page.
- The sidebar is generated from folder category positions and lesson `sidebar_position` values. Category links point to each unit's `index.mdx` overview.
- Homepage: `src/pages/index.tsx`; shared responsive styles: `src/css/custom.css`; site settings: `docusaurus.config.ts`.
- Avoid adding dependencies when React, native HTML, or existing Docusaurus capabilities suffice.

## Adding or revising a lesson

1. Use a descriptive, lowercase, hyphenated filename in the appropriate unit folder. Include `title`, `description`, `sidebar_label`, and `sidebar_position` front matter.
2. Let Docusaurus supply the page H1 from the title; begin content sections at H2. Preserve meaningful heading order.
3. Include learning objectives, readings, external resources, interactive activities, and assignment/reflection sections as appropriate. Keep all five sections on unit landing pages.
4. Import shared components explicitly from `@site/src/components/...`. Use the existing demonstration in `docs/unit-1/binary-explorer.mdx` as a pattern.
5. Use relative `.mdx` links between lessons. In React, use `@docusaurus/Link` and unprefixed paths such as `/docs/unit-1/`; Docusaurus adds the base URL. Use `useBaseUrl` for static asset URLs in React.
6. Use descriptive external links and accurate source attribution. Do not add nonfunctional placeholder links. Do not silently make unverified sources required course material.
7. Preview the unit overview, sidebar, breadcrumbs, and previous/next navigation after changes.

## Interactive component contracts

- `ResourceCard`: `title`, `href`, optional `label`, and description as children.
- `LearningObjectives`: an array of unique plain-language `items`.
- `InstructionalCallout`: children, optional `title`, and `tone` (`note`, `tip`, `important`).
- `SelfCheck`: `question`, options with unique stable `id` and `text`, one matching `correctAnswer` ID, and an `explanation`. Use one correct answer. Feedback is formative, never a grade.
- `BinaryExplorer`: reference implementation for a small self-contained activity with instructions, keyboard controls, live output, and reset.
- Use native buttons, labeled inputs, fieldsets, and legends. Support keyboard operation, visible focus, polite announcements of changing results, adequate contrast, reduced motion, and narrow screens. Never rely on color alone.
- Avoid random IDs, browser globals during render, or other server/client inconsistencies: Docusaurus statically renders lessons. Use `useId` for instance-specific labels/groups.
- State is in-memory and resets on unmount or reload. Do not add response collection, analytics, storage, or grading without explicit user scope.

## Verification and delivery

- Run `npm run check` after implementation: TypeScript, component tests, production build, and built-site link/navigation tests. Run `npm run serve` to inspect the production site at its configured base path.
- Add meaningful behavior tests for new interactions in `tests/*.test.tsx`. The Link mock isolates component tests; production navigation is checked against real generated HTML by `tests/site.test.mjs`.
- Keep `package-lock.json` with dependency changes. Do not edit generated `.docusaurus/`, `build/`, or `node_modules/` files.
- Update README when adding tooling or changing workflows.
- Do not push, deploy, or change remote settings until the user explicitly approves. Local build and test runs are expected. Pushing to `main` triggers the configured deployment workflow.

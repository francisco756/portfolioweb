# Francisco De Santis — Portfolio

"From Buenos Aires to the world." A static TypeScript site (Vite) with a dotted 3D globe, a split-flap hero and a scroll journey through every country with clients.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + build to /dist
```

## Add or edit a project

Everything lives in [`src/data/projects.ts`](src/data/projects.ts). Add an entry to `projects` with its `stop` (`AR`, `CL`, `US`, `AE`) and it shows up as a boarding pass at that stop.

Then record its media:

```bash
npx playwright install chromium   # first time only
npm run capture -- <project-id>   # or no id to capture every project
```

That writes `desktop.webp`, `mobile.webp` and `scroll.mp4` (the hover video) to `public/media/<id>/`, plus `full.webp` (tall capture) for projects with a case study.

The route itself (which countries, in which order) is the `legs` array in the same file.

## Case studies

Content lives in [`src/data/cases.ts`](src/data/cases.ts). To add one:

1. Add an entry to `cases` and set `caseStudy: '<slug>'` on the project.
2. Copy one of the files in [`cases/`](cases) to `cases/<slug>.html` and update its title and description.
3. Add it to `input` in [`vite.config.ts`](vite.config.ts).

## Share image and domain

`public/og.jpg` is a screenshot of the hero. Absolute share URLs use `VITE_SITE_URL` from [`.env`](.env); update it when the final domain is set.

## Deploy

Push to GitHub and import the repo in Vercel. `vercel.json` already sets the build command and output folder.

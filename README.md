# YaleClubs

A website to view information on all the clubs, plus what's happening on campus

## Setup

- Create a `.env.dev` and a `.env.prod` file in the root directory based off of `.env.example`
- Make sure you have the VSCode extensions Prettier and ESLint installed
- `npm run dev` to run locally with live updates
- `npm run devprod` to run locally with the prod database, with live updates
- `npm run build` to build for prod, then `npm run start` to run locally as prod

Make sure to run `npm run build && npm run start` before submitting a pull request, as sometimes errors will only show up in prod!
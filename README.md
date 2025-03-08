# YaleClubs

A website about clubs and events at Yale.

We LOVE feedback! Please give us your thoughts [here](https://forms.gle/APtJYSsztGU8DfSf9)

## Setup

- If you don't have it already, install `nvm`
- Install the VSCode extensions Prettier and ESLint
- Create a `.env.dev` and a `.env.prod` file in the root directory based off of `.env.example`
- Run `npm install` to install dependencies

## Development

- `npm run dev` to run locally with live updates
- `npm run devprod` to run locally with the prod database, with live updates
- `npm run build` to build for prod
- `npm run start` to run a built project (after npm run build)

*Make sure to run `npm run build && npm run start` before submitting a pull request, as sometimes errors will only show up in prod!*

## Infrastructure

This project is made with NextJS, Typescript, TailwindCSS, and MongoDB

Infrastructure consists of the following three services, all within DigitalOcean (DO):

- Droplet: a DO server running nginx that serves the backend and runs the API. Uses pm2 to keep yaleclubs always running. Access with `ssh root@yaleclubs.io` and then enter the env file's `DO_BACKEND_PASSWORD`. ~$6/month
- Database Cluster: a DO database running MongoDB that stores all non-image information. ~$15/month
- Spaces: A DO Object Store that stores uploaded images. ~$5/month

Currently, all infrastructure is under the account addison.goolsbee@yale.edu because of the free $200 in student credits. Eventually it will be transfered to an account under yaleclubsycs@gmail.com

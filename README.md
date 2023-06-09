# Effio

## Goals
- Develop web application for creating, exporting and importing online tests in GIFT format
- Create community place where you can publish your own tests and browse tests of others
- Make fully scalable, typesafe and tested application


## Author
### Matěj Kotrba


## Consultants
### [Mgr. Marek Lučný](https://github.com/superucitelka), [Lukáš Sukeník](https://github.com/lukyncze)


## Techstack
#### About techstack
- This techstack is inspired by [Theo's](https://www.youtube.com/@t3dotgg) T3 stack with replacement of Next with SvelteKit, main purpose of this techstack is to create serverless web application using modern technologies with typesafety and for the most part without the need of the own server

### Used technologies:
- SvelteKit
  - Superforms
  - Svelte French Toast
- TypeScript
  - ts-reset
- Tailwind
  - Daisy UI
  - tailwind-merge
- tRPC
  - trpc-sveltekit 
- Zod
- Prisma
- Auth
  - Auth.js
- Testing
  - Vitest (Jest)
  - Cypress
- Bundler
  - Vite
- Package manager
  - pnpm
- Database
  - Planetscale (MySQL), connection via Prisma

I want to keep project as serverless (on edge) as possible, however in need of file creation, backend server will be likely needed, in that case the
FastAPI / NodeJS - Express, NestJS will be considered.


## Timeline
#### January -> April - Learning stack and testing it separatly
#### April -> May - Building frontend for Effio
#### May -> June - Building forentend, creating type definitions, routers, auth, DB and Prisma connection as well as building the test creation functionality 
#### June -> Now - Displaying tests, taking them and being able to visit previously taken one, implemented drag and drop input creation in test creator

## Sources
- Youtube
  - [Joy of Code](https://www.youtube.com/@JoyofCodeDev)
  - [Theo Browne](https://www.youtube.com/@t3dotgg)
  - [Huntabyte](https://www.youtube.com/@Huntabyte)
  - [Matt Pocock](https://www.youtube.com/@mattpocockuk)
- Docs
  - [Svelte](https://svelte.dev/)
  - [SvelteKit](https://kit.svelte.dev/)
  - [tRPC](https://trpc.io/)
  - [Prisma](https://www.prisma.io/)

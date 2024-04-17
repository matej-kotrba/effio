# Effio
![Lines of Code](https://aschey.tech/tokei/github/matej-kotrba/effio?labelColor=ffffff&color=f73c00&iconColor=ffffff&style=for-the-badge&label=Lines&logo=https://simpleicons.org/icons/svelte.svg)

> “25 000+ lines of code is a big project” - @ThePrimeagen

<a><img src="./static/imgs/effio/text.png" align="middle" width="256" ></a>
## Table of Contents

- [About](#about)
- [Features](#features)
- [Goals](#goals)
- [Consultants](#consultants)
- [Techstack](#techstack)

## About

Effio is an online tool for creating tests and quizes. Apart from only creating, Effio is designed to work as whole platform for taking tests, sharing them in groups and being able to export and import them to different formats with addition of few unique Effio question types. Whole project is being developed by Matěj Kotrba.

## Features

- [ ] Test creator
    - [x] Question Types - Pick One, True/False, Connect, Write, Fill, Geography
    - [x] Grades - custom marking
    - [x] Comments - question responses
    - [x] Import and export of GIFT format
    - [x] Programming test
    - [ ] Test templates
- [x] Test taking
    - [x] Being able to take tests and see results
    - [x] Randomly ordered answers and questions
    - [x] Question navigation, showing marks and points earned
    - [x] Test overview page
- [ ] Community place
    - [ ] Showing tests
        - [x] Infinite scrolling functionality
        - [x] Depending on release date and rating
        - [x] Showing relevant tests which were released recently
        - [ ] Showing user specific relevant tests    
- [x] Test History
- [x] Groups
    - [x] Creating of groups
    - [x] Inviting to groups
    - [x] Sharing tests in group
    - [x] Graphs of tests taken by participants of group and invidiual display of users results
    - [x] Group channel chat
    - [x] Editing, deleting groups and its channels
    - [x] Showing relevant information and overall better design
- [x] Caching and security
    - [x] Redis rate limitting
    - [x] Caching of the frequently used endpoints
- [ ] Adding AI implementation

## Goals
- [x] Develop web application for creating, exporting and importing online tests in GIFT format
- [x] Eneble users to take tests and view results
- [x] Create community place where you can publish your own tests and browse tests of others
- [x] Make fully scalable, typesafe and performant application

## Consultants
### [Mgr. Marek Lučný](https://github.com/superucitelka)


## Techstack
#### About techstack
- This techstack is inspired by [Theo's](https://www.youtube.com/@t3dotgg) T3 stack with replacement of Next with SvelteKit, main purpose of this techstack is to create typesafe serverless application using cloud based providers without need of self hosted (maintained) server

> “The name is Sveltegen” - @ThePrimeagen

### Used technologies:

<details>
<summary><strong>Frontend</strong></summary>

- Svelte
    - Svelte French Toast
    - Shadcn Svelte
- Tailwind
    - Daisy UI
    - tailwind-merge
- Chart.js
- GSAP
- Other
    - Iconify
    - Leaflet
    - monaco-editor
    - SandboxJS
    - gift-pegjs
</details>

<details>
  <summary><strong>Backend</strong></summary>
    
- SvelteKit
    - Superforms
- tRPC
    - trpc-sveltekit
- Prisma
- Auth
    - Auth.js (Oauth - Google, Github)
- NodeJS
</details>

<details>
  <summary><strong>Database and providers</strong></summary>
    
- Supabase - PostgreSQL, connected via Prisma
- Vercel - application hosting, serverless function hosting (sort of), CDN distribution,
- Cloudinary - image bucket
- Pusher - takes care of web sockets needs
- Upstash Redis - caching and rate limitting
</details>

<details>
  <summary><strong>Both</strong></summary>
    
- TypeScript
    - ts-reset
- Zod
- Bundler - Vite
- Package manager - PNPM
</details>


## Timeline
- January -> April - Learning stack and testing it separatly
- April -> May - Designing and building frontend for Effio
- May -> June - Building forentend, creating type definitions, routers, auth, DB and Prisma connection as well as building the test creation functionality 
- June -> July - Displaying tests, taking them and being able to visit previously taken ones, implemented drag and drop input creation in test creator
- August -> October - Creating more input types, darkmode, refactoring and leveling up quality of life in app
- November -> December - Programming test, many bug fixes, refactoring, comments and making quality of live features
- December -> January - bug fixes, polishing app and writing documentation
- January -> Now - better group options and implementation, optimizations, refactoring, polishing and bug fixing

## Sources
- Youtube
  - [Joy of Code](https://www.youtube.com/@JoyofCodeDev)
  - [Theo Browne](https://www.youtube.com/@t3dotgg)
  - [Huntabyte](https://www.youtube.com/@Huntabyte)
  - [Matt Pocock](https://www.youtube.com/@mattpocockuk)
  - [Josh](https://www.youtube.com/@joshtriedcoding)
- Docs
  - [Svelte](https://svelte.dev/)
  - [SvelteKit](https://kit.svelte.dev/)
  - [tRPC](https://trpc.io/)
  - [Prisma](https://www.prisma.io/)
  - [Auth.js](https://authjs.dev/)

## Try it yourself

First thing you need to get started is to clone this repo and run
```bash
pnpm i
```
then there is file called `.env-sample`, rename it to `.env` and fill all the enviromental variables with your own keys.

Also to push database schema to your own DB use `npx prisma migrate dev`

You are good to go! 🥳🥳

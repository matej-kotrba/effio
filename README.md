# Effio
![Lines of Code](https://aschey.tech/tokei/github/matej-kotrba/effio?labelColor=ffffff&color=f73c00&iconColor=ffffff&style=for-the-badge&label=Lines&logo=https://simpleicons.org/icons/svelte.svg)

> “25 000+ lines of code is a big project” - @ThePrimeagen

<a><img src="./static/imgs/effio/text.png" align="middle" width="256" ></a>
## Table of Contents

- [About](#about)
- [Features](#features)
- [Goals](#goals)
- [Author](#author)
- [Consultants](#consultants)
- [Techstack](#techstack)

## About

Effio is an online tool for creating tests and quizes. Apart from only creating, Effio is designed to work as whole platform for taking tests, sharing them in groups and being able to export and import them to different formats with addition of few unique Effio question types

## Features

- [ ] Test creator
    - [x] Question Types - Pick One, True/False, Connect, Write, Fill, Geography
    - [x] Grades - custom marking
    - [x] Comments - question responses
    - [x] Import and export of GIFT format
    - [x] Programming test
    - [ ] Test templates 
- [x] Community place
    - [x] Showing tests
        - [x] Infinite scrolling functionality
        - [x] Depending on release date and rating
        - [x] Showing relevant tests which were released recently
        - [ ] Showing user specific relevant tests    

## Goals
- Develop web application for creating, exporting and importing online tests in GIFT format
- Create community place where you can publish your own tests and browse tests of others
- Make fully scalable, typesafe and performant application


## Author
### Matěj Kotrba


## Consultants
### [Mgr. Marek Lučný](https://github.com/superucitelka), [Lukáš Sukeník](https://github.com/lukyncze)


## Techstack
#### About techstack
- This techstack is inspired by [Theo's](https://www.youtube.com/@t3dotgg) T3 stack with replacement of Next with SvelteKit, main purpose of this techstack is to create typesafe serverless application using cloud based providers without need of own server

> “The name is Sveltegen” - @ThePrimeagen

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
- Chart.js
- Prisma
- Auth
  - Auth.js (Oauth - Google, Github)
- Bundler
  - Vite
- Package manager
  - pnpm
- Database
  - Planetscale (MySQL), connection via Prisma
- Hosting
  - Vercel, AWS S3



## Timeline
- January -> April - Learning stack and testing it separatly
- April -> May - Building frontend for Effio
- May -> June - Building forentend, creating type definitions, routers, auth, DB and Prisma connection as well as building the test creation functionality 
- June -> July - Displaying tests, taking them and being able to visit previously taken ones, implemented drag and drop input creation in test creator
- August -> October - Creating more input types, darkmode, refactoring and leveling up quality of life in app
- November -> December - Programming test, many bug fixes, refactoring, comments and making useful features

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

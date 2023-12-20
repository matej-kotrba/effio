# Effio
![Lines of Code](https://aschey.tech/tokei/github/matej-kotrba/effio?labelColor=ffffff&color=f73c00&iconColor=ffffff&style=for-the-badge&label=Lines&logo=https://simpleicons.org/icons/svelte.svg)

> “25 000+ lines of code is a big project” - @ThePrimeagen

<a><img src="logo.png" align="middle" height="256" width="256" ></a>
## Table of Contents

- [About](#about)
- [Features](#features)
- [Building from source](#building-from-source)

## About

Effio is an online tool for creating tests and quizes. Apart from only creating, Effio is designed to work as whole platform for taking tests, sharing them in groups and being able to export and import them to different formats with addition of few unique Effio question types

## Features

Tabulka s tím co funguje atd.

### Hello world

```Ruda
import "#io"

fun main() {
    io.println("Hello world")
}
```

## Building from source

If you are one of those crazy people and want to modify the source code or have any other reasons to, you are more than welcome to!

First you need to have:
 1. Python - https://www.python.org/downloads/
 2. Rust - https://www.rust-lang.org/tools/install

Just clone the repository and run `py ruda_build.py`. This should create a  `build/` directory with the whole application. You can move it anywhere you want.

Add `build/bin` to your enviroment path variable and create a new variable `RUDA_PATH` with the path to `build` directory. If this is unclear, look up _How to Change the PATH Environment Variable on Windows_ (or any other platform).

Open new terminal and try `rudavm .\test.rdbin -- Hello, World!`.

## Other

To learn more about the Ruda components see their respective directories. (good luck reading compiler source code)


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
- This techstack is inspired by [Theo's](https://www.youtube.com/@t3dotgg) T3 stack with replacement of Next with SvelteKit, main purpose of this techstack is to create serverless web application using modern technologies with typesafety and for the most part without the need of own server

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
- Testing
  - Vitest (Jest)
  - Cypress
- Bundler
  - Vite
- Package manager
  - pnpm
- Database
  - Planetscale (MySQL), connection via Prisma
- Hosting
  - Vercel, AWS S3



## Timeline
#### January -> April - Learning stack and testing it separatly
#### April -> May - Building frontend for Effio
#### May -> June - Building forentend, creating type definitions, routers, auth, DB and Prisma connection as well as building the test creation functionality 
#### June -> July - Displaying tests, taking them and being able to visit previously taken ones, implemented drag and drop input creation in test creator
#### August -> Now - Creating more input types, darkmode

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

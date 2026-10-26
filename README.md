# MyTube

MyTube is a static, browser-only video library built with HTML, CSS, and vanilla JavaScript. It has no build step, backend, environment variables, or external dependencies.

## Deploy to Vercel my-tube-lime.vercel.app.

Import this project folder as the project root, or run the Vercel CLI from this folder. Use these project settings:

- **Framework preset:** Other
- **Root directory:** `.` (the project root containing `index.html`)
- **Build command:** leave blank
- **Output directory:** `.`
- **Install command:** leave blank

The root `index.html` is the canonical entry point. `vercel.json` adds security headers and cache behavior. No rewrite is needed because the app is a static page, not a path-routed SPA.

## Media size note

The included MP4 files currently total about 103.6 MB (decimal), before posters and app files. Vercel documents a 100 MB source upload limit for Hobby CLI deployments, so this full media bundle is over that limit. A Hobby deployment through the CLI may fail unless the media is reduced below the limit. Keep the original media unchanged; either use a deployment plan with enough upload capacity or prepare optimized replacement MP4s and verify their playback before deploying. Vercel's published limits can change, so check the current [Vercel limits](https://vercel.com/docs/limits) for the account and deployment method in use.

## Local preview

Serve this folder with any local static web server and open `/` or `/index.html`. Opening the HTML directly from disk is not the recommended production-like check; use a server so relative media paths behave consistently.

Favorites, watch history, playback speed, and resume positions use browser-local storage. They do not sync between browsers or devices.

# Avant UDS Library

Universal Design System Library for Rust.

## Repository Structure

```
├── ci/docs/theme/   Hugo configuration and theme setup
├── docs/            Documentation source (write here)
│   └── next/        Upcoming release docs — becomes versioned on tag push
├── src/             Rust library source (future)
└── .github/
    └── workflows/   CI/CD pipelines
```

## Writing Documentation

All documentation is written under `docs/next/` following this structure:

```
docs/next/
└── en/
    └── <section>/
        └── page.md
```

Add a new language by creating a new folder alongside `en/`.

### Shortcodes

```
{{< drawio "path/to/file.drawio" >}}   relative to current version/lang root
{{< pdf "path/to/file.pdf" >}}         relative to current version/lang root
```

## Local Development

Requires [Hugo extended](https://gohugo.io/installation/) and Go.

One-time setup:

```bash
cd ci/docs/theme
hugo mod get gitlab.com/natitec_public/bora
```

Then to run the local server:

```bash
cd ci/docs/theme
hugo server -D
```

Open `http://localhost:1313/docs/`.

The `-D` flag renders draft pages. The `next/` version is visible locally but excluded from production builds.

## Releases

Documentation is versioned by git tags. On each tag push:

1. CI renames `docs/next/` → `docs/<tag>/`
2. Hugo builds the site
3. The built version is deployed to GitHub Pages
4. `versions.json` on the `gh-pages` branch is updated with the new version

```bash
git tag v0.1.0
git push origin v0.1.0
```

The version picker on the live site updates automatically.

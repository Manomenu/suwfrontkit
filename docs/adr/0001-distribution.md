# 0001 Distribution: a public package on npmjs.com

## Context

Three apps (alfusion, suwagcms, suwageval) and the template they come from each carry their own copy of the same design
system, and the copies drift. The library must reach every app on a laptop, in CI and in a Docker build, without secrets.

## Decision

One public package, `@maniumek/suwfrontstyle` (the owner's npm user scope), on npmjs.com, built from one package at the
root of the public repository Manomenu/suwfrontstyle.

- Published only from GitHub Actions with npm trusted publishing (OIDC): no long-lived token, provenance attached.
- Versions and the CHANGELOG come from changesets; 0.x until the first app runs on it, with minor allowed to break.
- Apps pin the exact version and list the package under `minimumReleaseAgeExclude` (pnpm 11 waits a day otherwise).
- Source CSS with `@source`, not precompiled CSS: the app's Tailwind generates one stylesheet, and `cn()` merges the app's classes with the library's.

## Rejected

- GitHub Packages: installing needs a classic token even for a public package, so a secret in every Docker build.
- A git dependency: pnpm 11 refuses its build scripts until `allowBuilds` names the exact commit.
- Copying components in (shadcn registry): that is the drift this library ends.

## Cost

The first version is published by hand once, because a trusted publisher is configured on a package that exists. An app
that forgets the `theme.css` import gets unstyled components with no error, so the README gives the exact lines and the
consumer test in the gate proves they are enough.

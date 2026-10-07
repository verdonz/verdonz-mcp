# Publishing

1. On npm, create or verify the public `@verdonz/mcp` package and configure GitHub Actions trusted publishing for the `verdonz/verdonz-mcp` repository and the `publish.yml` workflow. No npm token belongs in this repository.
2. On GitHub, create a release for the version in `package.json`.
3. The release workflow runs `npm ci`, builds, and publishes with provenance.

For a local publish after authenticating to npm: `npm login`, verify `npm whoami`, run `npm publish --access public`.

# OnboardingAudit.ai — Release Checklist
1) Verify CI green (verify workflow + font guard).
2) Smoke Pages: /, /demo/, /dl/ → 200 + <!-- build: ... -->.
3) Font probes → Content-Type: font/woff2, magic 774f4632.
4) Tag: bump vX.Y.Z on default branch; push tag.
5) Extension MV3 sanity: manifest_version=3, no content_scripts array, popup renders Satoshi/Geist.
6) Lighthouse CI: run lighthouserc.json; stash artifacts in .lighthouseci/.
7) Write SANITY_REPORT.md with URLs, stamps, font magic, and tag.
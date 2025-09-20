# Onbrd.run — Pages Deploy Visibility and Brand Styling Audit

This report explains why https://virrpe.github.io/onbrd.run/ appeared unchanged, documents the minimal fixes applied to ensure deployments reflect source changes, and details a styling coherency pass aligned with brand guardrails.

## Summary
- GitHub Pages is deployed via Actions from the site/ directory using [.github/workflows/pages.yml](.github/workflows/pages.yml:1).
- The Pages workflow only runs on pushes to main; recent work was on a feature branch, so the live site didn’t rebuild.
- Static assets (CSS, fonts, icons) lacked cache-busting, so even when rebuilt, browsers/CDNs could serve stale assets.
- Implemented non-destructive, minimal fixes: build stamp + cache-busting, verified Pages workflow, brand tokens, font stacks, accessibility tweaks.

## Root Causes
1) Not deploying from the active branch:
   - Current branch: feat/brand-ui-polish-bird (local); Pages workflow triggers only on main.
   - Result: main’s last successful deploy kept serving older HTML.

2) Stale assets due to no cache-busting:
   - site/index.html previously referenced icons, CSS, and fonts without a version query param.
   - GH Pages/CDNs can cache assets aggressively; unchanged URLs yield stale UI.

3) Minor asset reference issues:
   - OG image path absolute vs. repo layout could lead to fallback/no visual change (not primary, but addressed).

## Fixes (Done)
- Deployment stamp + cache-busting:
  - Added build stamp HTML comment to [site/index.html](site/index.html:512).
  - Appended ?v=%BUILD_ID% to favicon, manifest, CSS, fonts, logos in [site/index.html](site/index.html:9), [site/styles.css](site/styles.css:1).
  - Added tokens file and wired it in the HTML head as the first stylesheet: [site/tokens.css](site/tokens.css:1), [site/index.html](site/index.html:26).

- GitHub Pages workflow hardening:
  - Injects BUILD_ID (short SHA), GIT_SHA, and ISO_TIME into HTML/CSS via sed before upload in [.github/workflows/pages.yml](.github/workflows/pages.yml:26).
  - Safe-guards sed when optional files are absent.

- Brand & styling coherency:
  - Created brand tokens (teal #0EA5A4, font stacks, motion reduction, focus-visible): [site/tokens.css](site/tokens.css:1).
  - Updated font stacks in [site/styles.css](site/styles.css:12) ensuring headings=“Satoshi”, body=“Geist” with robust fallbacks.
  - Replaced blue hover glow with subtle brand teal shadow in [site/index.html](site/index.html:48) to match premium, calm tone.
  - Respected prefers-reduced-motion (animations/transitions disabled): [site/index.html](site/index.html:58).
  - Ensured focus-visible uses brand token: [site/index.html](site/index.html:32).

- Asset correctness:
  - Preloads for variable WOFF2, query-busted: [site/index.html](site/index.html:20).
  - Fixed OG image path to a present asset and cache-busted: [site/index.html](site/index.html:16).

## Fixes (Pending)
- Merge to main and push:
  - The Pages workflow triggers on main only; merge the updated site/ and workflow changes to main to deploy.
- Optional: Add .nojekyll if you introduce underscored folders (not needed today).

## Styling Coherency Changes (Guardrails)
- Primary brand color: #0EA5A4 (teal) codified in [site/tokens.css](site/tokens.css:1) and used via CSS variables.
- Typography: headings “Satoshi”, body “Geist”, with fallbacks included in [site/tokens.css](site/tokens.css:11) and [site/styles.css](site/styles.css:18).
- Tone: premium, calm, modern:
  - Eliminated heavy glow hover; used subtle teal shadows and smoother transitions.
- Accessibility:
  - WCAG AA-friendly focus states via tokens; visible :focus-visible outlines (brand teal).
  - Added prefers-reduced-motion guards to disable motion-heavy effects.

## Verification Steps

Local (no cache):
1) Serve locally without cache:
   - python3 -m http.server 5173 --directory site
2) Visit http://localhost:5173 and then View Source:
   - Find comment near the end: <!-- build: <FULL_SHA> @ <ISO_TIME> -->
3) Verify assets include ?v=<shortsha>:
   - stylesheets, fonts, icons, and logos end with ?v=<shortsha>.
4) Fonts:
   - Confirm headings render with Satoshi and body with Geist.

CI/CD (GitHub Actions):
1) Merge PR into main.
2) Confirm Pages workflow “Pages” completes successfully.
3) Check “Deploy to GitHub Pages” outputs a page_url.

Live:
1) Hard refresh (Shift+Reload).
2) View Source on https://virrpe.github.io/onbrd.run/:
   - Look for: <!-- build: <main HEAD SHA> @ <UTC ISO> -->
   - Ensure asset URLs include ?v=<shortsha>.

## Notes
- No bundlers introduced. Static references only.
- No large file deletions. Non-destructive, additive approach.
- If future features require more aggressive cache control, consider adding hashed filenames via a minimal build step—but not needed for current static site.

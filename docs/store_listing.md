# Onbrd – Chrome Web Store Listing (Draft)

## Short description (≤132 chars)
1-click onboarding audit: score, benchmarks, and prioritized fixes. Client-side, no login.

## Full description
- 1-click audit of the current page
- Score (0–100) + prioritized fixes (CTA above fold, social proof, signup friction, accessibility, performance)
- Export single-file HTML report (shareable, offline)
- Optional anonymous benchmarks (opt-in)
- Privacy-first: runs client-side; minimal permissions

## Why it's safe
- No login; runs on your machine
- Permissions: 
  - `activeTab` – analyze the current tab on demand
  - `scripting` – programmatic injection for analysis
  - `storage` – remember settings & cache rules
- Telemetry opt-in only. If enabled, we send anonymized audit stats to compute benchmarks. You can disable any time.

## Privacy Policy (summary)
Onbrd runs locally in your browser. No personal data is collected. If you opt in, anonymized metrics (hashed URL scope + score) are sent to compute benchmarks. No PII or content data is stored.

## Screenshot guidance (attach in CWS)
1. Popup showing score + "Fix these to improve"
2. Exported HTML report open in browser (benchmark line if available)
3. Optional telemetry toggle in popup (showing opt-in)
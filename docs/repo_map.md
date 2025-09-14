# Repository Map & Update Rules

## Directory Structure
```
/home/swirky/DevHub/repos/OnboardingAudit.ai/
├── .eslintrc.cjs                 # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── package.json                  # Root package.json with workspaces
├── pnpm-workspace.yaml           # PNPM workspace configuration
├── tsconfig.json                 # TypeScript configuration (strict: true)
├── vite.config.ts                # Root Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── vitest.config.ts              # Vitest test configuration
├── playwright.config.ts          # Playwright E2E test configuration
│
├── docs/                         # Truth files only - no implementation details
│   ├── mvp.md                    # MVP scope and constraints
│   ├── acceptance.md             # Acceptance criteria
│   ├── heuristics.md             # Heuristic definitions (5 max)
│   ├── repo_map.md               # This file - repository structure
│   └── retro.md                  # Retrospective notes
│
├── packages/                     # Shared packages
│   ├── core/                     # Core audit logic and schemas
│   │   ├── package.json          # Package configuration
│   │   ├── schemas/
│   │   │   └── audit_v1.json     # Audit schema definition
│   │   └── src/
│   │       ├── index.ts          # Main exports
│   │       ├── types.ts          # TypeScript type definitions
│   │       ├── probes.ts         # Heuristic detection logic
│   │       └── scoring.ts        # Scoring algorithms
│   │
│   └── report/                   # Report generation
│       ├── package.json          # Package configuration
│       └── src/
│           └── index.ts          # HTML/JSON/Markdown generators
│
├── extension/                    # Chrome MV3 extension
│   ├── package.json              # Extension package configuration
│   ├── vite.config.ts            # Extension-specific Vite config
│   ├── manifest.json             # Extension manifest (points to built files)
│   └── src/
│       ├── background/
│       │   └── index.ts          # Service worker
│       ├── content/
│       │   └── index.ts          # Content script
│       └── popup/
│           ├── App.svelte        # Svelte popup component
│           ├── main.ts           # Popup entry point
│           └── styles.css        # Tailwind CSS imports
│
├── backend/                      # Serverless functions
│   ├── package.json              # Backend package configuration
│   ├── api/
│   │   ├── proxy/
│   │   │   └── fetch.ts          # Cross-domain fetch proxy
│   │   └── audits/
│   │       ├── save.ts           # Save audit endpoint
│   │       └── list.ts           # List audits endpoint
│   └── lib/
│       └── storage.ts            # Turso/SQLite storage client
│
├── scripts/                      # Build and utility scripts
│   ├── pack.ts                   # Build + zip extension to /artifacts
│   └── verify.ts                 # Validate audit_v1 JSON against schema
│
├── tests/                        # Test specifications
│   ├── setup.ts                  # Test setup and mocks
│   └── e2e/
│       └── smoke.spec.ts         # Extension smoke tests
│
└── artifacts/                    # Generated outputs and templates
    ├── DEMO.md                   # Demo documentation
    ├── example-report.html       # Example HTML audit report
    ├── example-audit.json        # Example audit JSON data
    └── templates/
        ├── slack_digest.md       # Slack notification template
        └── linear_ticket.md      # Linear ticket template
```

## Directory Structure Rules
- `/docs/`: Truth files only - no implementation details
- `/packages/core/`: Shared schemas and utilities
- `/extension/`: Chrome extension code only
- `/backend/`: Serverless functions only
- `/artifacts/`: Generated outputs and templates
- `/tests/`: Test specifications only

## File Update Rules
1. **Truth files** (`/docs/*`) are source of truth - implementation must match
2. **Schema changes** require version bump and migration plan
3. **Extension changes** need manifest version compatibility check
4. **Backend changes** require API compatibility verification
5. **Test changes** must reference acceptance.md checklist items

## Update Process
1. Update truth files first
2. Run acceptance checklist
3. Update implementation to match
4. Verify with smoke tests
5. Generate artifacts

## Version Control
- Schema versions: audit_v1.json, audit_v2.json, etc.
- Feature branches must pass acceptance.md checklist
- Main branch protected - requires 2 approvals

## Build System
- **Package Manager**: pnpm with workspaces
- **Extension**: Vite + @crxjs/vite-plugin + Svelte + Tailwind
- **Backend**: TypeScript handlers for Vercel/CF Workers
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Scripts**: pack.ts (build + zip), verify.ts (schema validation)
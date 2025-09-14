# OnboardingAudit.ai Development Roadmap

## ✅ Done (Release-Ready MVP)
- ✅ Set up Chrome extension manifest v3 structure
- ✅ Implement content script for DOM analysis
- ✅ Create heuristic detection algorithms (5 heuristics)
- ✅ Build IndexedDB local storage layer
- ✅ Implement audit data validation against schema
- ✅ TypeScript hygiene with @types/chrome and strict mode
- ✅ Tailwind config warnings resolved
- ✅ Permission diet (removed host_permissions)
- ✅ Strengthened verify guards for service_worker, .ts refs, content_scripts
- ✅ Acceptance criteria locked with Release-Ready MVP section
- ✅ Ship-ready artifacts and documentation
- ✅ Known issues documented for SPA debounce + automation flakiness

**Links to acceptance.md**: Extension functionality, Heuristic detection, Data capture, Release-Ready MVP

## Now (Next Sprint)
- [ ] Develop serverless backend API endpoints
- [ ] Implement cross-domain proxy for public pages
- [ ] Create HTML report generation engine
- [ ] Build Slack webhook integration
- [ ] Add Linear/Jira ticket template generation

**Links to acceptance.md**: Report generation, Integration features, Cross-domain testing

## Next (Future Sprints)
- [ ] Implement companion web app for URL audits
- [ ] Add team collaboration features
- [ ] Create advanced analytics dashboard
- [ ] Build automated benchmarking system
- [ ] Implement A/B testing integration

**Links to acceptance.md**: Enterprise features, Advanced reporting, Scale testing

## Acceptance Criteria References
- All tasks must pass acceptance.md checklist
- Heuristic cap remains at 5 until 10 paying users
- Backend stays minimal (proxy + audits only)
- Truth files in /docs/ are source of authority
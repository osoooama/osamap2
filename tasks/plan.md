# Implementation Plan: Multi-Source Content Integration

## Overview
Integrate IPTV live channels, multi-provider embed streaming, and Arabic/Turkish content sources into OSAMA/>Dev V2. This will transform the platform from a TMDB-only metadata display into a fully functional streaming platform with 100+ live channels, 83+ embed providers, and 10+ Arabic/Turkish content sources.

## Architecture Decisions

### 1. IPTV: Parse M3U server-side, cache in MongoDB
- **Decision:** Fetch iptv-org/iptv M3U playlists via Node.js backend, parse with regex, store in existing `channels` collection
- **Rationale:** Avoids exposing raw M3U URLs, enables filtering/caching, matches existing Channel.model.ts schema
- **Risk:** M3U URLs can die quickly → implement health checks + periodic refresh

### 2. Embed Providers: Use tmdb-embed-providers NPM + TMDB-Embed-API as backup
- **Decision:** Install `tmdb-embed-providers` NPM package for URL generation (zero dependencies, 12 providers). Deploy TMDB-Embed-API as optional self-hosted fallback
- **Rationale:** NPM package is the simplest integration (just build URLs). TMDB-Embed-API adds 8 more providers but requires separate server
- **Risk:** Provider URLs may change → health check system via providerPerf.ts already exists

### 3. Arabic Sources: Extend provider-resolver.service.ts with new scrapers
- **Decision:** Add ArProv-style scraping logic directly to provider-resolver.service.ts for FaselHD, ArabSeed, Akwam, EgyBest, MyCima, Cima4u
- **Rationale:** Existing resolver already handles FaselHD/MyCima/ArabSeed. Extend the pattern
- **Risk:** Sites may block → use existing playwright-stealth patterns from scrapers/

### 4. Turkish Sources: Extend provider-resolver.service.ts + use Dizipal scraper
- **Decision:** Add HDFilmCehennemi, Qissat (already exists), Dizipal (already exists) to resolver
- **Rationale:** Dizipal and Qissat scrapers already exist in Python. Port the logic to Node.js resolver
- **Risk:** Dizipal changes frequently → periodic testing via scrape controller

## Dependency Graph

```
Phase 1: IPTV Backend (no frontend deps)
    └── Channel.model.ts (exists) → iptv.service.ts → iptv.controller.ts (update)

Phase 2: IPTV Frontend (depends on Phase 1)
    └── live/page.tsx (exists) → update with new categories + player

Phase 3: Embed Providers (independent of Phase 1-2)
    └── Install tmdb-embed-providers → embed.service.ts → streams.controller.ts (update)

Phase 4: Arabic/Turkish Sources (depends on Phase 3 patterns)
    └── Extend provider-resolver.service.ts → test via streams endpoint

Phase 5: Frontend Integration (depends on Phases 1-4)
    └── Update NetflixModal.tsx + InfoModal.tsx with new provider options

Phase 6: Verification
    └── TypeScript check + build + manual testing
```

## Task List

### Phase 1: IPTV Backend
- [ ] Task 1: Create iptv.service.ts (fetch + parse M3U, save to MongoDB)
- [ ] Task 2: Update iptv.controller.ts with category filtering + refresh endpoint
- [ ] Task 3: Test IPTV backend (verify channels in MongoDB)

### Phase 2: IPTV Frontend
- [ ] Task 4: Update live/page.tsx with category tabs + channel grid + player

### Phase 3: Embed Providers
- [ ] Task 5: Install tmdb-embed-providers + create embed.service.ts
- [ ] Task 6: Update streams.controller.ts with embed provider URLs
- [ ] Task 7: Add TMDB-Embed-API integration as fallback

### Phase 4: Arabic/Turkish Sources
- [ ] Task 8: Extend provider-resolver.service.ts with Arabic sources (ArProv-style)
- [ ] Task 9: Extend provider-resolver.service.ts with Turkish sources
- [ ] Task 10: Test all new sources via API

### Phase 5: Frontend Integration
- [ ] Task 11: Update NetflixModal.tsx server selector with new providers
- [ ] Task 12: Update InfoModal.tsx with Arabic/Turkish provider options

### Phase 6: Verification
- [ ] Task 13: TypeScript compilation check (backend + frontend)
- [ ] Task 14: Build check (npm run build)
- [ ] Task 15: Final documentation + commit

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| IPTV stream URLs die quickly | High | Health check system + periodic refresh via GitHub Actions |
| Embed provider URLs change | Medium | tmdb-embed-providers has built-in health checks |
| Arabic sites use Cloudflare | Medium | Use playwright-stealth from existing scrapers |
| Dizipal changes frequently | Medium | Already have Python scraper, can re-port |
| Large M3U files slow to parse | Low | Cache in MongoDB, only refresh on demand |

## Open Questions
- Should we deploy TMDB-Embed-API as a separate Render service? (Recommended: yes, for 8 extra providers)
- How often should IPTV channels be refreshed? (Recommended: every 6 hours via cron)

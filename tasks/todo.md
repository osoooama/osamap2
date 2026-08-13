# Task List: Multi-Source Content Integration

## Phase 1: IPTV Backend
- [ ] Task 1: Create iptv.service.ts (fetch + parse M3U, save to MongoDB)
- [ ] Task 2: Update iptv.controller.ts with category filtering + refresh endpoint
- [ ] Task 3: Test IPTV backend (verify channels in MongoDB)

## Phase 2: IPTV Frontend
- [ ] Task 4: Update live/page.tsx with category tabs + channel grid + player

## Phase 3: Embed Providers
- [ ] Task 5: Install tmdb-embed-providers + create embed.service.ts
- [ ] Task 6: Update streams.controller.ts with embed provider URLs
- [ ] Task 7: Add TMDB-Embed-API integration as fallback

## Phase 4: Arabic/Turkish Sources
- [ ] Task 8: Extend provider-resolver.service.ts with Arabic sources
- [ ] Task 9: Extend provider-resolver.service.ts with Turkish sources
- [ ] Task 10: Test all new sources via API

## Phase 5: Frontend Integration
- [ ] Task 11: Update NetflixModal.tsx server selector with new providers
- [ ] Task 12: Update InfoModal.tsx with Arabic/Turkish provider options

## Phase 6: Verification
- [ ] Task 13: TypeScript compilation check (backend + frontend)
- [ ] Task 14: Build check (npm run build)
- [ ] Task 15: Final documentation + commit

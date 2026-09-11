# Design Decisions

1. **App-local auth with server sessions** - Why not JWT? Session-based auth is simpler, more secure for a server-rendered app, and avoids token storage in browser.
2. **Separate queue and review state** - Queue status tracks solving progress. Review scheduling is independent. A solved problem stays solved during review.
3. **Immutable tracked handle** - Prevents data inconsistency. Handle switch would require orphaning or migrating all submission/queue data.
4. **Conservative CF rate limiting** - 1 req/2.5s vs documented 1/2s to avoid bans.
5. **Sync reliability** - DB-backed jobs with checkpointing enable resume after failures.
6. **Analytics transparency** - All metrics use explicit definitions. Small samples are labeled rather than hidden.

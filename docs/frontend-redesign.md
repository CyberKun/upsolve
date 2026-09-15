# Upsolve frontend redesign

## Run and review

From `frontend`, run `npm run dev` and open `/explore`. This public catalog works without signing in. `/today` includes the same redesigned catalog plus the real daily queue and due reviews. `/` retains its redirect to `/today`, and protected routes retain their authentication/setup guards.

The app remains React 19 + TypeScript, Vite, Tailwind CSS 4, React Router 7, and React Query. No dependencies were added. API requests, CSRF handling, authentication, mutations, demo restrictions, and backend contracts were retained.

## Design and components

- `src/shared/ui/AppHeader.tsx`: sticky navigation, mobile menu, skip link, and a slot for the theme control.
- `src/shared/ui/ThemeSwitcher.tsx`: labeled native select with explicit value, options, and change callback.
- `src/features/explore/components/`: `FilterNav`, `HeroSection`, `ProductCard`, `ProductGrid`, and decorative, theme-aware `CollectionArt`.
- `src/features/explore/ExplorePage.tsx`: composes the catalog, filters, collection preview dialog, and existing workspace links.
- `src/features/auth/AuthLayout.tsx`: shared sign-in/registration presentation.
- `src/styles/globals.css`: typography, controls, decorative geometry, reduced motion, chart styling, and responsive header heights.

The grid uses one column below 640px, two from 640px, and three from 1024px. The header switches from a 112px two-row layout to an 80px desktop layout at 1280px. The filter bar uses the same `--header-height` variable for its sticky offset. Chip overflow is confined to the filter strip.

## Edit palettes or the default

All authored UI color values are in **`src/styles/themes.css`**. Each `[data-theme]` block contains all seven required properties and the same supplementary tokens for contrast text, states, shadows, overlays, and artwork. Edit values here to recolor the entire interface, including existing workspace pages and charts.

**`src/styles/tokens.css`** maps these variables into Tailwind 4 semantic utilities using `@theme inline`. Use utilities such as `bg-primary-bg`, `text-secondary-text`, `border-border`, `text-accent`, and `shadow-theme`. Keep geometry and typography independent of theme selectors.

To change the default:

1. Set `DEFAULT_THEME` in **`src/shared/theme/themes.ts`** to one of the listed theme IDs.
2. Move the `:root,` selector in `themes.css` onto that theme's selector for a matching fallback before JavaScript loads.
3. Existing saved user preferences continue to take precedence; remove the `upsolve-theme` localStorage entry to test the new default.

The entry point applies the saved palette before React mounts. This is a client-rendered Vite app, so there is no hydration step. Invalid or inaccessible storage falls back to the default; blocked writes do not prevent switching. `ThemeProvider` also synchronizes changes across tabs.

## Replace sample data and connect actions

Edit **`src/features/explore/products.ts`** to change the six sample collections and filter categories. Its `Product` interface contains content and illustration metadata; sample counts are explicitly previews, not user progress.

To supply real data, adapt the results of an existing feature hook in **`ExplorePage.tsx`** into `Product[]`, then pass them to `ProductGrid`. Connect collection actions through its `onSelect` prop (forwarded to `ProductCard`). Change the hero destinations through `HeroSection`'s `practiceLink` and `reviewLink` props. The preview's queue action is composed in `ExplorePage`, where it can be replaced with a real collection-specific destination or mutation callback.

Existing backend actions remain in their feature containers/hooks:

- `features/queue/hooks.ts`: search, add, update, archive, and submissions.
- `features/notes/hooks.ts`: notes.
- `features/reviews/hooks.ts`: schedules and review outcomes.
- `features/settings/hooks.ts`: preferences and sync history.
- `features/auth/AuthProvider.tsx`: account and session actions.
- `shared/api/client.ts`: `/api/v1` requests and CSRF/session handling.

Presentation components do not make API calls. Real daily data is still loaded by `TodayActivity` in `TodayPage.tsx` and passed into the catalog as a composition slot.

## Validation

Commands from `frontend`:

```sh
npm run build
npm run lint
npm test
npm run audit:theme
npm run test:redesign
```

The redesign browser suite uses installed Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` for installed Edge, or modify the standalone config to use a Playwright browser. It uses mocked API responses and is independent of the full-stack runner.

Verified: production build, lint, type-check, 11 unit tests, color audit, and browser checks at 360/768/1440px across all five palettes. Browser assertions cover column counts, page overflow, filtering, sticky offsets, persisted themes, invalid/blocked storage, keyboard access, dialog focus return, reduced-motion mode, authenticated routes (including problem details), and demo restrictions. Sign-in and registration also have 320/1440px layout checks. Key text/button pairs pass a 4.5:1 contrast check. Desktop screenshots for all palettes and a mobile screenshot were visually reviewed. Screenshots are generated under `frontend/test-results/`.

Limitations:

- The Google Store reference URL could not be opened through the reference inspection tools. Its desktop/mobile appearance was not visually verified; the implementation follows the requested structural description.
- The full-stack suite initially could not start (`spawnSync docker ENOENT`). During sign-in troubleshooting, Docker was located at `C:/Users/adity/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe` (outside the sandbox and absent from PATH). Docker Desktop and the existing `db`/`backend` containers were started. Real demo sign-in, authenticated session persistence after reload, and live queue loading now pass through port 15174. Registration, sync, and mutation integration tests were not rerun; the full-stack suite still needs that Docker directory on PATH.
- Vite reports a non-failing warning for the main JavaScript chunk exceeding 500 kB before gzip.

### Local sign-in troubleshooting

The preview proxies `/api` to `http://localhost:8080`. Docker Desktop and the backend/database containers must be running for authentication. Start Docker Desktop, then run `docker compose start db backend` from the repository root. A request to `/api/v1/health` through the preview should return status `UP`. Empty server/proxy errors and network failures now display an actionable message; 13 unit tests, lint, and the build passed after this fix.

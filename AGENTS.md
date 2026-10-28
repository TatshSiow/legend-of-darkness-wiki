# Project instructions

SvelteKit + TypeScript Legend of Darkness Wiki. Use Traditional Chinese UI,
original game icons and the established dark brown / warm gold design.

- Node.js >=22.18. Run `npm ci`, `npm run dev` (port 5174).
- Validate changes with `npm run check` and `npm test`.
- Build: `npm run build`; output: `build/` including Pagefind search.
- Prefer live dev updates. Do not deploy unless requested.
- Do not push or deploy after local edits automatically; wait for the user's explicit instruction.
- Browser tests use Playwright; `npx playwright install chromium` installs browsers.
  `PLAYWRIGHT_PACKAGE` and `CHROMIUM_EXECUTABLE` optionally override local tooling.
- Raw data: `src/lib/server/assets/`; public evidence: `static/data/`.
- Keep full raw tables server-side. Load only relevant page data in the browser.
- Preserve original row indices; detail URLs use `row-N`.
- Use existing shared components and sortable tables for numeric comparisons.
- Item names use native quality colors; only equipment (item type 2) uses quality frames.
- Equipment secondary stats unlock at +12. Paragon gear preserves fixed affixes and
  fills to five unique types; affix rates are conditional, not independent rolls.
- Socket opening costs and item text colors are audited in `static/data/equipment-ui-native.json`.
- Display names, icons and monster levels; keep IDs in technical details.
- Acquisition clues are not confirmed drops. Never invent icons, sources,
  probabilities, backend limits or combat formulas.
- Exclude audited legacy gems 5013–5037 and 5154 from public catalogs;
  retain raw rows and never merge items by name alone.
- Achievement/type1 and title/type2 share the achievement table but have separate
  catalogs. Title links use `/data/title/`; old achievement URLs redirect.
- Title subtype52 requires ALL configured achievements; subtype51 uses points,
  subtype55 uses VIP. Do not apply subtype52 rules to subtype63.
- Currently 56 special titles have unresolved acquisition conditions. See
  `static/data/title-unlock-native.json` for evidence and limitations.
- Keep adventure maps, dungeon families, abyss and trials distinct.
- Trial wave limits are unconfirmed; tool ranges are not game caps.
- APKs, saves, phone tooling and private research backups are outside this repo
  and are not required for normal development, tests or builds.

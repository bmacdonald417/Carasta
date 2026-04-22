# Carmunity — Final repo-wide semantic drift scan

Narrow cleanup before new-agent reassessment / Phase 2 planning. **Scan:** hardcoded legacy pink (`#ff3b5c`), misused `variant="performance"` on non-urgent actions, and a few adjacent token fixes. **Preserved:** legitimate auction signal styling on the map popup using the **`signal`** token (same hue family as `--performance-red`, not a random hex).

## 1. Files created

- `CARMUNITY_FINAL_SEMANTIC_DRIFT_SCAN.md` (this file)

## 2. Files modified

| Area | File |
|------|------|
| Auth | `app/(auth)/auth/sign-in/sign-in-form.tsx`, `app/(auth)/auth/sign-up/sign-up-form.tsx` |
| App | `app/(app)/garage/add/add-garage-car-form.tsx`, `app/(app)/settings/settings-form.tsx`, `app/(app)/u/[handle]/marketing/presets/page.tsx` |
| Layout | `components/layout/nav.tsx` |
| Marketing | `components/marketing/carmunity-promo-panel.tsx`, `components/marketing/marketing-preset-form.tsx` |
| Sell / AI | `components/sell/listing-ai-assistant.tsx`, `components/sell/listing-ai-field-improve.tsx`, `components/sell/listing-ai-run-history.tsx` |
| Auctions / damage | `components/auctions/AuctionsMapView.tsx`, `components/auction/DamageImageGallery.tsx` |
| Other | `components/carasta/InstagramShowcase.tsx`, `components/reputation/ReputationBadge.tsx` |

## 3. Biggest semantic drift issues fixed

- **`variant="performance"`** removed from **normal primaries**: garage submit, marketing presets CTA, sign-in submit, nav **Sell** / **Sign up**, Carmunity **Publish**, marketing preset form save, listing AI **Generate** (now `default` + token panel).
- **Hardcoded `#ff3b5c`** removed from settings Save, listing AI shell/buttons/links, Instagram CTAs/hovers, damage thumbnail hover/focus, reputation **Apex** tier glow (now **primary**).
- **Auction map popup:** `Live` badge and **View auction** CTA use **`bg-signal`** (token) instead of hex; high bid text still uses performance red via existing semantic class where present.

## 4. Shared component fixes

- **`Button`**: no API change; mis-callsites corrected to **`default`** where the action is not auction-urgency.
- **`ReputationBadge`**: **Apex** tier styling aligned to **primary** (was legacy pink glow).
- **`AuctionsMapView`**: map callout uses **design-token `signal`** for live/CTA chrome.

## 5. What was intentionally deferred

- **`Button` `performance` variant** remains in `components/ui/button.tsx` for true auction/pressure surfaces.
- **`ReputationBadge` `ELITE`** still uses Tailwind **`amber`** for tier distinction; changing to **`caution`** tokens would be a separate micro-pass if desired.
- **Settings form** label/input neutral/dark styling not fully tokenized—only the **Save** CTA was corrected to avoid scope creep.
- **InstagramShowcase** section still uses a dark marketing shell (`bg-[#0a0a0f]/95`); only **accent drift** was normalized.

## 6. Recommendation for the reassessment phase

- Treat **Phase 1 + drift scans** as **complete** for semantic misuse of legacy pink and primary CTAs.
- Next agent should **inventory remaining `neutral-*` / hardcoded hex** only where it blocks parity or accessibility, not as a blanket restyle.
- Phase 2 planning can focus **IA, app/site parity, and trust/content** without reopening accent philosophy.

## Validation

- Run `npm run lint` and `npx tsc --noEmit` before merge.

Sanity: sign-in/up, nav (guest + session), settings save, garage add, marketing presets, listing AI panel, auctions map popup, homepage Instagram strip if enabled.

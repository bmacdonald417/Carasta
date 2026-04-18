# Carmunity Discussions Taxonomy (Gears & Lower Gears)

This document defines **20 Gears** (top-level `ForumSpace` targets) and **5–10 Lower Gears** each (`ForumCategory` targets). Slugs are **kebab-case**, unique per Gear; pair `(gearSlug, lowerGearSlug)` should be unique globally in product copy and seed scripts.

**Seeding strategy**

1. Insert **Gear** rows with `slug`, `title`, `sortOrder` (10, 20, …).
2. Insert **Lower Gear** rows with `spaceId`, `slug`, `title`, `sortOrder` (1…n within each space).
3. Ship a **minimal live set** (e.g. 5 Gears) first; keep inactive Gears `isActive: false` until moderation capacity exists.

**Sort order**: Lower Gears are listed in **discussion priority** (most traffic / moderation need first within each Gear).

---

## Gear 01 — Track & HPDE (`track-hpde`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `hpde-101` | HPDE & track days 101 |
| 2 | `coaching-line` | Coaching, instructors & line |
| 3 | `safety-equipment` | Helmets, HANS & safety gear |
| 4 | `telemetry-data` | Telemetry & data |
| 5 | `tracks-north-america` | Tracks & events (NA) |
| 6 | `tracks-international` | Tracks & events (international) |
| 7 | `competition-licensing` | Competition licensing & clubs |
| 8 | `open-lapping` | Open lapping & test days |

---

## Gear 02 — Road & Canyon (`road-canyon`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `scenic-drives` | Scenic drives & routes |
| 2 | `spirited-not-street-racing` | Spirited driving (legal, safe) |
| 3 | `photography-spots` | Photo spots & meets etiquette |
| 4 | `tourism-road-trips` | Tourism & road trips |
| 5 | `weather-conditions` | Weather & road conditions |
| 6 | `local-regulations` | Local regulations & noise |
| 7 | `group-drives` | Group drives & pace cars |

---

## Gear 03 — Engine & Drivetrain (`engine-drivetrain`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `engine-builds` | Engine builds & swaps |
| 2 | `forced-induction` | Forced induction |
| 3 | `fueling-tuning` | Fueling & tuning |
| 4 | `exhaust-emissions` | Exhaust & emissions |
| 5 | `cooling-oiling` | Cooling & oiling |
| 6 | `transmissions-diffs` | Transmissions & differentials |
| 7 | `diagnostics-dtc` | Diagnostics & DTCs |
| 8 | `reliability-daily` | Reliability for daily use |

---

## Gear 04 — Suspension & Chassis (`suspension-chassis`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `coilovers-shocks` | Coilovers & shocks |
| 2 | `springs-alignment` | Springs & alignment |
| 3 | `bushings-chassis` | Bushings & chassis hardware |
| 4 | `corner-weighting` | Corner weighting |
| 5 | `aero-balance` | Aero balance with mechanical grip |
| 6 | `street-vs-track-setup` | Street vs track setups |

---

## Gear 05 — Brakes & Safety (`brakes-safety`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `pad-rotor-selection` | Pad & rotor selection |
| 2 | `fluid-brake-lines` | Fluid & lines |
| 3 | `abs-esc` | ABS & stability control |
| 4 | `track-brake-temps` | Track brake temps & bedding |
| 5 | `fire-safety` | Fire safety & extraction |
| 6 | `street-safety-gear` | Street safety gear |

---

## Gear 06 — Electrical & Lighting (`electrical-lighting`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `wiring-harnesses` | Wiring & harnesses |
| 2 | `lighting-led` | Lighting & LED retrofits |
| 3 | `audio-head-units` | Audio integration (head units) |
| 4 | `batteries-charging` | Batteries & charging |
| 5 | `sensors-ecu` | Sensors & ECU interfaces |
| 6 | `ev-high-voltage-notes` | EV high-voltage notes (informational) |

---

## Gear 07 — Interior & Audio (`interior-audio`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `seats-harnesses` | Seats & harnesses |
| 2 | `steering-wheels` | Steering wheels & controls |
| 3 | `cabin-materials` | Cabin materials & trim |
| 4 | `sound-deadening` | Sound deadening |
| 5 | `carplay-android` | CarPlay & Android Auto |
| 6 | `sq-spl-builds` | SQ & SPL builds |

---

## Gear 08 — Exterior & Aero (`exterior-aero`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `body-panels` | Body panels & paint prep |
| 2 | `splitters-wings` | Splitters & wings |
| 3 | `canards-diffusers` | Canards & diffusers |
| 4 | `wraps-ppf` | Wraps & PPF |
| 5 | `weight-reduction` | Weight reduction (doors, glass) |
| 6 | `fitment-clearance` | Fitment & clearance |

---

## Gear 09 — Detailing & Care (`detailing-care`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `wash-methods` | Wash methods & two-bucket |
| 2 | `correction-ceramic` | Correction & ceramic |
| 3 | `interior-leather` | Interior leather & alcantara |
| 4 | `engine-bays` | Engine bays & show prep |
| 5 | `storage-covering` | Storage & covering |
| 6 | `products-tools` | Products & tools |

---

## Gear 10 — Tools & Shop (`tools-shop`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `home-garage-setup` | Home garage setup |
| 2 | `lifts-jacks` | Lifts & jacks |
| 3 | `torque-specs` | Torque specs & procedures |
| 4 | `specialty-tools` | Specialty tools |
| 5 | `compressed-air` | Compressed air & pneumatics |
| 6 | `workspace-safety` | Workspace safety |

---

## Gear 11 — Restoration & Classics (`restoration-classics`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `rust-repair` | Rust repair & metalwork |
| 2 | `period-correct` | Period-correct restorations |
| 3 | `sourcing-parts` | Sourcing NOS & reproduction parts |
| 4 | `paint-body` | Paint & body |
| 5 | `interiors-trim` | Interiors & trim |
| 6 | `documentation-history` | Documentation & history |
| 7 | `values-inspection` | Values & pre-purchase inspection |

---

## Gear 12 — Imports & JDM (`imports-jdm`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `import-process` | Import process & compliance (informational) |
| 2 | `jdm-icons` | JDM icons & chassis codes |
| 3 | `euro-imports` | Euro imports |
| 4 | `parts-forwarding` | Parts forwarding & brokers |
| 5 | `language-manuals` | Manuals & language barriers |
| 6 | `meet-culture` | Meet culture & etiquette |

---

## Gear 13 — Muscle & V8 (`muscle-v8`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `pushrod-builds` | Pushrod builds |
| 2 | `ls-swaps` | LS & modern V8 swaps |
| 3 | `carb-vs-efi` | Carb vs EFI |
| 4 | `cooling-big-blocks` | Cooling big blocks |
| 5 | `drag-strip-setup` | Drag strip setup |
| 6 | `muscle-restoration` | Muscle restoration |

---

## Gear 14 — EV & Hybrid (`ev-hybrid`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `charging-home-road` | Charging at home & on the road |
| 2 | `range-real-world` | Range & real-world use |
| 3 | `performance-ev` | Performance EV tuning (policy-bound) |
| 4 | `battery-health` | Battery health & warranty |
| 5 | `hybrid-systems` | Hybrid systems |
| 6 | `track-ev` | Track use & thermals |

---

## Gear 15 — Wheels & Tires (`wheels-tires`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `fitment-offsets` | Fitment & offsets |
| 2 | `tire-classes` | Tire classes & compounds |
| 3 | `track-tire-wear` | Track tire wear & heat cycles |
| 4 | `winter-all-season` | Winter & all-season |
| 5 | `tpm-sensors` | TPMS & sensors |
| 6 | `forged-vs-cast` | Forged vs cast wheels |

---

## Gear 16 — Overlanding & 4×4 (`overlanding-4x4`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `recovery-gear` | Recovery gear & techniques |
| 2 | `suspension-lift` | Suspension lift & articulation |
| 3 | `roof-racks-storage` | Roof racks & storage |
| 4 | `navigation-comms` | Navigation & comms |
| 5 | `camping-rigs` | Camping rigs |
| 6 | `trail-etiquette` | Trail etiquette & Tread Lightly |

---

## Gear 17 — Motorcycles & Two-Wheel (`motorcycles-two-wheel`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `gear-atgatt` | Gear & ATGATT |
| 2 | `trackdays-bikes` | Track days (bikes) |
| 3 | `commuting` | Commuting & lane filtering |
| 4 | `maintenance-chain` | Maintenance & chain care |
| 5 | `touring-luggage` | Touring & luggage |
| 6 | `culture-crossover` | Culture crossover with cars |

---

## Gear 18 — Watches & Horology (`watches-horology`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `drivers-watches` | Drivers’ watches & timing |
| 2 | `motorsport-collabs` | Motorsport collabs & editions |
| 3 | `servicing-authenticity` | Servicing & authenticity |
| 4 | `straps-track-use` | Straps & track use |
| 5 | `collecting-marketplace` | Collecting & marketplace etiquette |

---

## Gear 19 — Apparel & Kit (`apparel-kit`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `helmets-suits` | Helmets & suits |
| 2 | `gloves-footwear` | Gloves & footwear |
| 3 | `team-merch` | Team merch & drops |
| 4 | `lifestyle-brand` | Lifestyle brand discussion |
| 5 | `sizing-care` | Sizing & care |

---

## Gear 20 — Community & Meets (`community-meets`)

| Sort | Slug | Lower Gear title |
|-----:|------|------------------|
| 1 | `local-meets` | Local meets & Cars & Coffee |
| 2 | `club-organizing` | Club organizing |
| 3 | `charity-drives` | Charity drives |
| 4 | `new-members` | New members & introductions |
| 5 | `moderation-appeals` | Moderation & appeals (meta) |
| 6 | `feedback-product` | Product feedback for Carmunity |
| 7 | `photographers-media` | Photographers & media |

---

## Appendix — Slug rules

- Lowercase, hyphen-separated ASCII; max length **30** for DB ergonomics (truncate titles if needed).
- Avoid trademark-heavy slugs in seeds; use descriptive generics where possible.

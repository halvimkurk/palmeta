# Design system — locked from references (not adjectives)

**Method:** Start from real UI → lock structure → mood constraints → style.  
**Aesthetic source:** Palworld in-game HUD (dark slate pads, gold select, meadow/sky world) + Completionism list cockpit.

---

## Structure references (layout is fixed)

| Source | What we take |
| --- | --- |
| [Completionism](https://completionism.com/) | Missing-first list; dense icon+title+meta rows; pin/collections; ≤3 clicks to guide |
| Palworld HUD | Dark left rail, gold active mark, readable pads over bright world color |
| Our AppShell | Sticky left sidebar ~240px + mobile drawer |

**Locked frame**

```
[ sidebar 240px ] [ main: topbar(mobile) → content → footer ]
```

Do **not** invent new landing sections. Hub = progress + CTA + category jump; lists = filters + rows; detail = icon + steps.

---

## Aesthetic tokens (Completionism cockpit + Palworld brand)

Hub visual reference: Completionism collection cards (art plane, 3-col grid, emerald progress). Brand gold stays on wordmark.

| Token | Hex | Use |
| --- | --- | --- |
| `--emerald` | `#10B981` | Progress fills, primary CTA, active nav |
| `--pal-gold` | `#E8B920` | Brand accent (`ThePaldex` gold THE), pin highlight |
| `--bg` / `--slate` | `#12151A` | App ground + sidebar |
| `--surface` | `#1A1D23` | Panels / list rows |
| `--surface-2` | `#22262E` | Section bars, inputs |
| `--ink` | `#F0F2F5` | Primary text |
| `--muted` | `#9AA3B2` | Meta text |
| `--tag` | `#7C6BA8` | Soft badges on collection cards |

**Typography**

- Display: **Exo 2** (industrial HUD)
- Body: **IBM Plex Sans**
- Forbidden: Inter, Roboto, Outfit, Fredoka, Nunito, Geist, Chakra Petch (retired Dreamcast pass)

**Spacing:** 4 · 8 · 12 · 16 · 24 · 32  
**Radius:** 8–12px (Completionism-soft cards), not pill soup  
**Shadows:** soft depth under hover cards — no hard offset stacks, no neon glow

---

## Explicit anti-gimmick / anti-AI

1. No spinning conic swirls, orbs, diamond nav marks  
2. No purple / indigo gradients; no neon lime wellness  
3. No Dreamcast orange + Sega blue fan-fiction pairing  
4. No ALL-CAPS shouting on every control  
5. No hard `3px` charcoal borders + offset shadows on every card  
6. Icons: Steam JPGs where available  
7. Ads never between checkbox and label; never in hero CTA band  

---

## Iteration rule

Change **structure** and **style** in separate passes. This file locks structure + tokens; CSS/components follow tokens only.

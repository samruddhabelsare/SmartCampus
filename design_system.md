# SmartCampus — Design System

Paste this whole file into any Bolt/Antigravity prompt that touches UI, so styling stays consistent across sessions and tools.

**Direction:** a serious, modern SaaS registrar tool — not a marketing site, not a playful consumer app. Colleges run on codes (roll numbers, subject codes, room numbers) — that vocabulary is the signature, not decoration bolted on top.

---

## Color tokens

| Name | Hex | Use |
|---|---|---|
| `--ink` | `#1B2733` | Primary text, headers, nav, primary button background |
| `--paper` | `#F7F6F1` | Page background |
| `--surface` | `#FFFFFF` | Card/panel background |
| `--slate` | `#6B7684` | Secondary text |
| `--slate-muted` | `#9CA3AF` | Placeholder text, disabled state |
| `--brass` | `#A9792F` | Single accent — primary actions, active nav item, focus rings, links |
| `--brass-light` | `#F3E9D6` | Accent tint background (badges, selected row) |
| `--line` | `#E4E1D9` | Hairline borders/dividers |
| `--signal-red` | `#B3261E` | Errors, low-attendance flags, destructive actions only |
| `--signal-green` | `#2E7D4F` | Success states, present/active status |

Rules:
- One accent (`--brass`). Don't add a second bright color "for variety" — variety comes from spacing and type, not more hues.
- `--signal-red` / `--signal-green` are semantic only — never decorative.
- No gradients, anywhere.

## Typography

| Role | Face | Use |
|---|---|---|
| Display/headers | Serif — "Source Serif 4" or "Lora" | Page titles, section headers, key stat numbers (CGPA, attendance %) — used sparingly, never body copy |
| Body/UI | "Public Sans" | Everything else: labels, nav, table cells, buttons, form fields |
| Data/codes | "IBM Plex Mono" | Student IDs, roll numbers, subject/room codes, timestamps, QR tokens — always inside a bordered chip (see Components) |

Type scale: 12px (caption/mono chips) · 13px (secondary text, table cells) · 14px (body, labels) · 16px (section headers) · 20px (page title) · 28px (serif stat numbers).

Weights: 400 regular, 500 medium only. No bold (700) anywhere — use color/size for emphasis instead.

## Layout

- Standard SaaS shell: fixed left sidebar (grouped nav, matches PRD's page map) + top bar (page title, role badge, search) + content area.
- Corner radius: 6px on cards/buttons/inputs. Not the trendy 16–24px "friendly" rounding — this should read official, not playful.
- Borders over shadows: use `1px solid var(--line)` for card edges and dividers instead of drop shadows. One subtle shadow only, on modals/dropdowns.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32px. Content padding inside cards: 16–24px.
- Data-dense screens (admin tables) prioritize information density over whitespace — this is a registrar tool, not a landing page.

## Signature component: code chip

Every ID-like value (student code, roll number, subject code, room number, time slot) renders the same way:

```
<span class="code-chip">CS-204</span>
```

```css
.code-chip {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 2px 8px;
  color: var(--ink);
  background: var(--surface);
}
```

This one recurring pattern is what makes the app feel designed rather than templated — use it everywhere a code-like value appears, no exceptions.

## Component patterns

- **Metric cards** (dashboard stats): `--surface` background, 1px `--line` border, 6px radius, 16px padding. Label: 13px `--slate`. Number: 28px serif, 500 weight, `--ink` (or `--signal-red` when the metric is itself a warning, e.g. low-attendance count).
- **Primary button**: `--ink` background, white text, 6px radius, no shadow. One primary button per screen max — everything else is secondary (outline, `--line` border, `--ink` text) or ghost (no border, `--slate` text).
- **Tables**: 1px `--line` row dividers, no zebra striping, 13px cell text, code-like columns use the chip pattern. Row hover: `--paper` background.
- **Status badges** (student status, attendance status): pill shape (full radius), background = semantic color at 10% opacity equivalent (use `--brass-light` pattern for neutral/active, red/green tints for status-specific), text = the solid semantic color.
- **Empty states**: short headline naming what's missing + one-line explanation + a single action button. Never just "No data."
- **Forms** (including dynamically-rendered profile-section forms): label above field, 14px, `--ink`. Required fields marked with a small `--brass` asterisk, not red. Validation errors: 13px `--signal-red` text below the field, field border switches to `--signal-red`.

## What to avoid

- Gradients, glassmorphism, neon glows, mesh backgrounds
- Heavy drop shadows / floating-card-on-colored-background look
- More than one accent color
- Icon-only buttons without a label or tooltip (accessibility)
- Sans-serif for stat numbers where the serif is specified — the serif is doing identity work, don't drop it for convenience
- Rounded pill buttons for primary actions (reserve full-radius pills for status badges only, so the two don't get visually confused)

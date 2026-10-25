# Hasher & Samar — Animated Wedding Invitations

Mobile-first, animated web invitations for the **Nikkah**, **Barat** and **Walima** of
**Hasher Mehmood & Samar Amanat**. Guests open them from a WhatsApp or Instagram link.

One codebase builds **four separate invitations**, each deployed as its own site with its own link:

| Edition | Build command | What guests see |
| --- | --- | --- |
| **Full** | `npm run build` | Monogram loader → ornate doors → names and couple → greeting → all three days → countdown → contacts |
| **Nikkah** | `npm run build:nikkah` | Full-screen embossed envelope with an H & S wax seal → it opens and glides away → curtains part on a Mughal arch, mosque and the couple walking in → names → details → countdown → wish and contacts |
| **Barat** | `npm run build:barat` | The same flow in maroon and gold, with Barat outfits |
| **Walima** | `npm run build:walima` | The same flow in blush and plum, with Walima outfits |

**Stack:** Vite + React + TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Framer Motion · Howler ·
Rive (optional) · `ics`.

## Run locally

```bash
npm install
npm run dev            # full invitation → http://localhost:5173
npm run dev:barat      # Barat-only invitation (also dev:nikkah, dev:walima)
```

While `npm run dev` is running you can also switch editions with `?edition=nikkah`, `?edition=barat` or
`?edition=walima` in the address bar. This only works in development.

## Editing content: one file only

Everything lives in **`src/config/event.ts`**: names, dates, times, venues, map links, dress codes, wishes, colours,
outfit colours, envelope colours and contacts. Search the file for `TODO` to find what's still a placeholder.

- **Times** are Pakistan time (`timezoneOffset: '+05:00'`). The countdown and calendar files use them, so guests abroad
  still get the correct moment.
- **`mapUrl`**: in Google Maps, open the venue, tap **Share**, and paste the link.
- **Parents' names**: fill in `groomParents` / `brideParents` to show them under the couple's names.
- **Colours**: each day has `theme` (page colours), `outfit` (what the bride and groom wear) and `envelope`
  (paper, liner, wax seal colour) for its single-event edition.

## How the editions work

- `src/config/edition.ts` reads `VITE_EDITION` (`full`, `nikkah`, `barat` or `walima`) at build time.
- `.env.nikkah`, `.env.barat` and `.env.walima` set it for each `build:*` / `dev:*` script.
- `src/App.tsx` renders `editions/FullInvitation.tsx` or `editions/EventInvitation.tsx`.
- `vite.config.ts` fills in each edition's page title, description and WhatsApp preview image (`og-*.jpg`).

## Deploy to Render (all four sites)

1. Push this repo to GitHub or GitLab.
2. On Render, go to **New → Blueprint**, pick the repo and click **Apply**. `render.yaml` creates four static sites:

   | Site | URL (if the name is free) |
   | --- | --- |
   | Full | `https://hasher-weds-samar.onrender.com` |
   | Nikkah | `https://hasher-samar-nikkah.onrender.com` |
   | Barat | `https://hasher-samar-barat.onrender.com` |
   | Walima | `https://hasher-samar-walima.onrender.com` |

3. If Render gives a site a different URL, or you attach a custom domain, set that site's **`VITE_SITE_URL`** to the
   real address (in its Environment tab or in `render.yaml`) and redeploy. WhatsApp needs it for the preview image.

Every push to the main branch redeploys all four, so a design change reaches every invitation.

## Assets

| File | What |
| --- | --- |
| `public/audio/theme.mp3` | Background music (royalty-free/licensed, under ~3 MB). Without it the sound button stays hidden. |
| `public/og-image.jpg`, `og-nikkah.jpg`, `og-barat.jpg`, `og-walima.jpg` | WhatsApp/Instagram previews (1200×630), one per edition. Generated ones are included. |
| `public/rive/couple.riv` | Optional pro character for the full edition (see below). |

## Personalised links

Add `?guest=` to any edition's link:

```
https://hasher-samar-barat.onrender.com/?guest=Ahmed+Family
```

- `guest` → the name on the envelope (single-event editions) or on the doors and greeting (full edition).
- `days` (full edition only) → show only some days, for example `?days=2,3` for Barat and Walima.

Google Sheets formula to build links from a guest list (name in A2):

```
="https://hasher-samar-barat.onrender.com/?guest="&ENCODEURL(A2)
```

## Characters

- **Full edition:** flat illustrated bride and groom (`Character.tsx`).
- **Single-event editions:** the opening scene (`components/scene/WeddingScene.tsx`) shows the couple from behind,
  hand in hand, walking toward a mosque inside a carved arch with lanterns, roses and parting curtains
  (`CoupleBack.tsx`). Its colours come from each event's `scene` settings in `event.ts`.
- `CharacterRealistic.tsx` holds an alternative front-facing, semi-realistic couple (`look="real"` on `Couple`).

To use a professionally made Rive file instead, put it at `public/rive/couple.riv` and set `rive.src` in
`src/config/event.ts`. Brief your illustrator for a state machine named **`Couple`** with number inputs
`pose` (0 idle, 1 walk, 2 wave, 3 together) and `day` (0 intro, 1 Nikkah, 2 Barat, 3 Walima).

## Notes

- Animations only touch `transform`/`opacity`. Lenis drives smooth scrolling through GSAP's ticker.
- `prefers-reduced-motion` turns off pinning, petals and walking and shows a static layout.
- Rive and Howler load lazily, so the first load is about 190 KB of JS gzipped.
- Test on a real Android phone over mobile data, and send a test link to a few friends before the real send-out.

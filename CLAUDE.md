# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static, Slovenian-language marketing site for **Ekspres prevozi Marko Prpar s.p.** (meat/food delivery in Dolenjska and Ljubljana, since 1996). The company name is spelled "Ekspres" (not "Expres"). There is no build step, package manager, linter or test suite: plain HTML, CSS and JS.

## Running locally

`.claude/launch.json` defines a `website` server (`python -m http.server 8080`). Opening `index.html` via `file://` in the preview pane does not load CSS or images, so use the server at http://localhost:8080.

## Structure

- `index.html` is a single page with anchored sections (`#domov`, `#izdelki`, `#storitve`, `#o-nas`, `#kontakt`) and a sticky header. Nav links point at these anchors.
- `style.css` holds all styles; colours are CSS variables in `:root` (`--burgundy` is the dark espresso primary (name is legacy, it is not red)). Breakpoints are at 860px and 720px; below 720px the nav becomes a toggled dropdown (`.main-nav.open`).
- `izdelki.js` is the single source of product data (`KATEGORIJE`: categories with products and prices). `main.js` renders the category cards on the home page from it and the text-only price list on `kategorija.html?k=<id>`; it also handles the mobile menu and footer year. Both pages must load `izdelki.js` before `main.js`.
- `kategorija.html` is one template page for all categories (no images, product list with prices).
- `admin.html` + `admin.js` is the password-protected product editor (noindex). It talks to the Netlify function `netlify/functions/izdelki.mjs` at `/api/izdelki`: public GET returns saved products from Netlify Blobs; PUT (and `GET ?auth=1`) require `Authorization: Bearer <ADMIN_PASSWORD>`, checked server-side against the `ADMIN_PASSWORD` env var set in Netlify. Saved data is `{ <categoryId>: [{ime, opis, cena, enota}] }` and is merged over `KATEGORIJE` by `naloziKategorije()` in `izdelki.js`; if the API is unreachable (e.g. local python server) the site falls back to `izdelki.js`. Categories, titles and images are only editable in `izdelki.js`.
- `hvala.html` is the thank-you page the contact form redirects to.
- `images/` holds user-supplied AI-generated meat photos (`beef`, `pork`, `chicken`, `lamb`, `meat_products`, `main_image` for the hero) and `icon.png` (logo/favicon). The user supplies new images themselves; do not try to generate photos.

## Things to know

- Products and prices in `izdelki.js` are sample defaults; the owner edits live data through `admin.html`. All rendered product text must go through `esc()` because it is admin-supplied. "Ostala hrana" is an intentionally image-less category.
- Palette is minimal espresso-brown + muted tan accent (CSS variables in `:root`); avoid reintroducing red.
- The contact form uses Netlify Forms attributes (`data-netlify`, honeypot `bot-field`, hidden `form-name`). It only works once deployed on Netlify, not locally. The same is true of the admin login/saving; to test them locally you would need `netlify dev` (not installed here). Deploy needs `package.json` (`@netlify/blobs`) and `netlify.toml`.
- Contact details (phone 031 652 949, marko.prpar@gmail.com, Svetinja 6, 8211 Dobrnič) are repeated in the header, contact section, footer and the `tel:`/`mailto:` links, so update every occurrence when they change.
- Out of scope for now: online ordering and party-space rental (may be added later as a new section or page).

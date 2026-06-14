# The Jeffersonian — Website

A fast, fully static marketing website for **The Jeffersonian**, the adaptive-reuse
restoration of Jefferson, Iowa's historic 1921 schoolhouse into 25 apartments.

The site is built with plain **HTML, CSS, and JavaScript** — no build step and no
server required — so it can be hosted almost anywhere and will keep working for
years. All of the text, photos, apartments, and news are stored in simple content
files that the client can edit through a friendly visual editor (no code needed).

---

## ✨ What's included

- A polished single-page homepage (`index.html`) with hero, stats, the building's
  story, amenities, apartment previews, a restoration timeline, photo gallery,
  news, FAQ, and a contact form.
- A dedicated **Apartments & Floor Plans** page (`apartments.html`).
- A **visual content editor** at `/admin/` (Decap CMS) so non-technical editors
  can update everything from a web browser.
- Responsive, accessible design with smooth animations and a photo lightbox.
- SEO basics: meta descriptions, Open Graph tags, `sitemap.xml`, and `robots.txt`.

---

## 📁 Project structure

All of the website's files live in the **`public/`** folder — that folder *is*
the site that gets served. Everything outside it (README, host config) is just
project tooling and is never published.

```
.
├── public/                   # ← The website itself (this is what gets deployed)
│   ├── index.html            #   Homepage
│   ├── apartments.html       #   Apartments & floor plans page
│   ├── styles/main.css       #   All styling (design tokens at the top are easy to tweak)
│   ├── scripts/main.js       #   Loads content and powers the interactions
│   ├── content/              #   ← All editable text lives here (JSON files)
│   │   ├── site.json         #     Name, hero, stats, contact details
│   │   ├── about.json        #     The building's story
│   │   ├── amenities.json    #     "Living here" features
│   │   ├── apartments.json   #     Floor plans & availability
│   │   ├── timeline.json     #     Restoration milestones
│   │   ├── gallery.json      #     Photos + captions
│   │   ├── faq.json          #     Questions & answers
│   │   └── updates.json      #     News posts
│   ├── assets/               #   Logo, illustrations, favicon, and photos
│   │   └── images/           #     Gallery photos (placeholders until real ones added)
│   ├── admin/                #   The visual content editor (Decap CMS)
│   │   ├── index.html
│   │   └── config.yml        #     Defines the editor's forms
│   └── robots.txt / sitemap.xml
├── wrangler.jsonc            # Cloudflare deploy config (serves public/ as a static site)
├── netlify.toml              # Netlify hosting config (optional)
└── README.md
```

---

## 🖥️ Running it locally

Because the site loads content with `fetch`, it must be viewed over a local web
server (opening `index.html` directly with `file://` will not load the content).
Any static server works — for example, with Python (already on most machines):

```bash
# serve the public/ folder (that's the website)
cd public && python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

---

## ✏️ Editing the website (for the client)

You have two ways to make changes. Most of the time you'll use the visual editor.

### Option A — Visual editor (recommended, no code)

1. Go to **https://your-site-address/admin/**
2. Log in (see the one-time setup below).
3. Pick a section (e.g. *Apartments & Floor Plans*, *Photo Gallery*, *News*),
   change the fields, and click **Publish**.
4. Your change is saved and the live site updates automatically within a minute
   or two.

### Option B — Edit the content files directly

Every piece of text lives in a `.json` file in the `content/` folder. Open one,
change the text between the quotation marks, and save. (Keep the quotes, colons,
and commas exactly as they are.)

---

## 🚀 Deploying

The site is just static files, so it works on any static host. Pick one.

### Cloudflare (Workers) — what this repo is configured for

`wrangler.jsonc` tells Cloudflare to serve the `public/` folder as a static
site, so the **deploy command is simply `npx wrangler deploy`** with **no build
command**. Two things must be true for the build to succeed:

1. **Cloudflare must build a branch that actually exists and contains the code.**
   In your Workers project: **Settings → Build → Branch control**, set the branch
   to the one holding the site (e.g. `main`). A "could not fetch repository" error
   at the *Cloning* step almost always means the configured branch doesn't exist
   or Cloudflare lost access to the repo.
2. **Cloudflare's GitHub app needs access to the repo.** If cloning fails, go to
   **Settings → Build → Git repository → Manage** (or re-authorize the *Cloudflare
   Workers & Pages* GitHub app) and grant access to `jaredcws/TheJeffersonian`.

Build settings summary:

| Setting | Value |
| --- | --- |
| Build command | *(none)* |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Branch | your production branch (e.g. `main`) |

> Note: the visual editor's Git Gateway login and the contact form's automatic
> capture are Netlify features. On Cloudflare you can still edit `content/*.json`
> directly, configure Decap's GitHub backend, or wire the form to a service like
> Formspree. The form already falls back to opening the visitor's email app.

### Alternative: Netlify (easiest path to the visual editor + form submissions)

1. Push this repository to GitHub (already done if you're reading this there).
2. In [Netlify](https://app.netlify.com), choose **Add new site → Import an
   existing project** and pick this repo. No build command is needed; the
   publish directory is **`public`** (`netlify.toml` already sets this).
3. **Turn on the visual editor (one-time):**
   - In your Netlify site, go to **Integrations / Identity** and **enable
     Identity**.
   - Under **Identity → Services → Git Gateway**, click **Enable Git Gateway**.
   - Under **Identity → Registration**, set it to **Invite only**, then invite
     the client's email. They'll get a link to set a password.
   - Make sure `admin/config.yml` has `branch:` set to the branch Netlify
     deploys (usually `main`).
4. The contact form works automatically — submissions appear under
   **Forms** in the Netlify dashboard (and can be emailed to you via a
   notification). No backend code required.

### Alternative: GitHub Pages, or any static host

You can also drop these files on GitHub Pages, Cloudflare Pages, or a traditional
web host. Notes:

- The visual editor's Git Gateway login is a Netlify feature. On other hosts you
  can still edit the `content/*.json` files directly (Option B above), or
  configure Decap's GitHub backend (see the Decap CMS docs).
- The contact form's automatic capture is a Netlify feature; on other hosts the
  form gracefully falls back to opening the visitor's email app pre-filled.
- If hosting under a sub-path (e.g. a GitHub Pages *project* site at
  `username.github.io/repo/`), set `public_folder` in `admin/config.yml` to a
  matching path. Hosting at a domain root needs no change.

### Testing the editor locally (optional, for developers)

```bash
npx decap-server        # in one terminal
python3 -m http.server 8080   # in another, then open /admin/
```

`local_backend: true` in `admin/config.yml` enables this.

---

## 🎨 Tweaking the look

Open `styles/main.css`. The color palette, fonts, and spacing are defined as
CSS variables in the `:root` block at the very top — change a value there and it
updates everywhere consistently.

---

## 📝 A note on content accuracy

The starter text and apartment details were drawn from public reporting about the
project and are written as sensible, editable defaults. Before going live, please
review and confirm specifics — especially **apartment sizes, availability,
pricing, dates, and the phone number** — and replace the placeholder gallery
images with real photographs.

---

## Project facts referenced

- Built **1921**; designed by **Proudfoot, Bird & Rawson**; former Jefferson
  high school / middle school (closed 2020).
- **25 apartments**, 14 distinct floor plans, efficiency (~580 sq ft) to
  three-bedroom (up to ~1,590 sq ft), across four elevator-served levels.
- Developer **Chris Deal**; construction by **Woodruff Construction**;
  ~**$8.5M** project supported by historic preservation tax credits.
- Address: **203 W Harrison Street, Jefferson, IA** · 203WHarrison@gmail.com

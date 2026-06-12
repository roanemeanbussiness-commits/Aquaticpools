# Aquatic Pools Arizona — Website

Cinematic single-page marketing site for a custom pool builder. Vanilla HTML/CSS/JS,
no build step. Built around a loading screen → hero video → services → portfolio →
process → testimonials → service areas → quote form.

## Run it locally
Any static server works. Easiest:

```powershell
cd "C:\Users\hutch\OneDrive - SNHU\Desktop\AQUATICPOOLSAZ"
python -m http.server 5180
# then open http://localhost:5180
```

## File map
```
index.html            All page markup
css/style.css         Design system + every section's styling
js/main.js            Preloader, scroll reveals, count-ups, gallery loader, slider, form
favicon.svg           Water-wave + brand-drop favicon
assets/videos/        hero.mp4 (underwater) · projects.mp4 (built pools)
                      reel-01..03.mp4 (vertical "In Motion" clips)  ← all web-compressed
assets/images/        project-01..06.jpg (gallery) · reel-0N-poster.jpg
                      *-poster.jpg (video posters) · og-image.jpg
assets/logo/          ← DROP YOUR REAL LOGO HERE (see below)
```

## Swap in YOUR assets (no code knowledge needed)

### 1. The real logo (loading screen + nav)
Right now the logo is rebuilt as a script wordmark ("Aquatic Pools" in red) so the site
looks finished. To use your actual artwork:

1. Save your logo as **`assets/logo/aquatic-logo.png`** (transparent background, ~800px wide).
2. Tell me, and I'll wire it into the loading screen and nav in ~2 minutes.

### 2. More / better project photos (gallery)
The portfolio currently uses high-res stills pulled from your brand video. To use real
finished-pool photos instead, just drop files named exactly:

```
assets/images/project-01.jpg   (tall)
assets/images/project-02.jpg
assets/images/project-03.jpg
assets/images/project-04.jpg   (wide)
assets/images/project-05.jpg
assets/images/project-06.jpg
```

They load automatically — no code change. `.png` also works. Want more than 6 tiles?
Add the photos and tell me; I'll extend the grid.

### 3. New / different background videos
Drop a web-sized `.mp4` into `assets/videos/` and tell me which section it's for.
Keep clips short (10–20s) and compressed (< 10 MB). If you only have a big raw file,
hand it to me and I'll compress it (the originals here were compressed with ffmpeg).

## Still to wire up (when you're ready)
- **Contact form** currently shows a success message but doesn't send anywhere yet.
  Pick a service (Formspree, Netlify Forms, or email) and I'll connect it.
- **Real phone / email / city list** — placeholders are in the footer and contact section.
- **Domain + favicon/OG absolute URLs** once hosting is chosen.
```
```

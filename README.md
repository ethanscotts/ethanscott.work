# ethanscott.work

Personal site for Ethan Scott. Static HTML/CSS/JS, hosted on GitHub Pages.

The layout is writing-first (featured work, book cards) with a small gallery for covers and art. It uses the same *kind* of stack as [jayhefford/jayhefford.com](https://github.com/jayhefford/jayhefford.com) — no framework, no build step — but the structure, type, and palette are different on purpose.

## Local preview

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Put it on GitHub Pages

1. Create a public repo (suggested name: `ethanscott.work`).
2. Push this folder to the `main` branch.
3. Repo **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)`
4. In your domain registrar for `ethanscott.work`, add these DNS records (GitHub’s current Pages IPs):

   | Type | Name | Value |
   |------|------|--------|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `<your-github-user>.github.io` |

5. In Pages settings, set **Custom domain** to `ethanscott.work` and wait for DNS + HTTPS (often 10–60 minutes, sometimes longer).

`CNAME` in this repo is already set to `ethanscott.work`.

## What to edit first

All of this is marked with comments in `index.html`:

- Name, title, meta description
- Social `href="#"` links
- Featured serial: title, blurb, Royal Road / Patreon URLs, cover image
- Other works in `#works`
- Gallery images in `#gallery` (same pattern as Jay’s: `href` = full image, `src` = grid image, `alt` = caption)
- About paragraph
- Footer copyright line

Replace the SVG placeholders in `images/` with real covers and art. Keep `width` and `height` on each `<img>` so the page does not jump while loading.

## Files

| File | Role |
|------|------|
| `index.html` | Page structure and copy |
| `style.css` | Layout and theme |
| `script.js` | Lightbox + year |
| `404.html` | GitHub Pages not-found page |
| `CNAME` | Custom domain |
| `.nojekyll` | Serves files as-is on Pages |

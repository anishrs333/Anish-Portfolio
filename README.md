# Dev.Folio — 3D Animated Portfolio

A dark, motion-heavy developer portfolio built with **Three.js + vanilla HTML/CSS/JS**.
No build step, no framework — open `index.html` and it runs.

![stack](https://img.shields.io/badge/stack-Three.js%20·%20HTML%20·%20CSS%20·%20JS-d9f24f)

## ✨ What's inside

| Section | Motion |
|---|---|
| Preloader | cycling multilingual words, progress bar, panel wipe |
| Hero | Three.js noise-morphing metal blob, wireframe rings, floating particles, mouse parallax |
| Headline | char-by-char kinetic type reveal, outline stroke on second line |
| Marquee | infinite acid-lime ticker (pauses on hover) |
| About | word-by-word statement reveal, 3D tilt portrait frame, skill chips |
| Stack | full-row acid hover-invert service rows |
| Projects | 3D tilt cards, grayscale→color images, staggered layout, mini-rows |
| Journey | glowing timeline |
| Contact | shimmer gradient email (click to copy), floating-label form, magnetic button |
| Extras | custom cursor w/ VIEW label, scroll progress, live clock, film grain |

## 🚀 Run it

```bash
# just open it
start index.html          # Windows
open index.html           # macOS

# or serve it (recommended)
python -m http.server 5173
```

## 🎨 Make it yours (2 minutes)

1. **Name** — search for `Dev` in [index.html](index.html) and replace
   (hero subtitle, email `hello@yourname.dev`, footer `DEV.DEV`, page title).
2. **Photo** — swap [assets/portrait.png](assets/portrait.png).
3. **Projects** — edit the `.pcard` blocks; replace the `picsum.photos`
   images with your own screenshots.
4. **Colors** — tweak `--acid` and `--bg` at the top of [style.css](style.css).
5. **Form** — point `#contact-form` submit in [main.js](main.js) at your
   Django/DRF endpoint (`fetch('/api/contact/', {...})`).

## 🗂 Files

```
├── index.html    # all markup/sections
├── style.css     # design system + animations
├── scene.js      # Three.js hero scene
├── main.js       # interactions (preloader, cursor, reveals, tilt)
└── assets/portrait.png
```

## ⚡ Performance notes

- WebGL pauses when the hero scrolls out of view
- pixel ratio capped at 2
- `prefers-reduced-motion` disables all heavy animation
- touch devices get the native cursor back and skip tilt/magnetic effects

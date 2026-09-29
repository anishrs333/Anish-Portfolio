"""Build a self-contained preview.html (inline CSS, JS, portrait).
The multi-file index.html stays the real deliverable; this exists only
so a sandboxed preview server that serves a single file can show the site."""
import base64, pathlib, re

root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")

# 1) inline stylesheet
css = (root / "style.css").read_text(encoding="utf-8")
html = re.sub(
    r'<link rel="stylesheet" href="style.css"\s*/>',
    lambda m: "<style>\n" + css + "\n</style>",
    html,
)

# 2) inline local scripts
for name in ("scene.js", "main.js"):
    js = (root / name).read_text(encoding="utf-8")
    assert "</script>" not in js, f"{name} contains </script>"
    html = re.sub(
        r'<script src="' + name + r'"\s*defer></script>',
        lambda m, js=js: "<script>\n" + js + "\n</script>",
        html,
    )

# 3) portrait as data URI
png = (root / "assets" / "portrait.png").read_bytes()
b64 = base64.b64encode(png).decode("ascii")
html = html.replace('src="assets/portrait.png"', 'src="data:image/png;base64,' + b64 + '"')

(root / "preview.html").write_text(html, encoding="utf-8")
print("preview.html written:", len(html), "bytes")

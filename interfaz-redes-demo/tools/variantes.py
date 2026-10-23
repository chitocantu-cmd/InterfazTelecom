"""Genera las versiones reducidas de las imágenes del sitio: <nombre>-400.webp, -640.webp y -1024.webp.

El navegador elige la más chica que le alcanza según el ancho en pantalla (srcset en
src/data/media.ts), así los celulares y las tarjetas descargan menos. Sólo crea versiones
más angostas que el original y vuelve a generarlas si el original cambió.

Uso, desde interfaz-redes-demo/:  python tools/variantes.py      (requiere Pillow)
"""
from pathlib import Path

from PIL import Image

WIDTHS = (400, 640, 1024)
ROOT = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'img'

for src in sorted(ROOT.rglob('*.webp')):
    if src.stem.endswith(tuple(f'-{w}' for w in WIDTHS)):
        continue
    with Image.open(src) as im:
        for w in WIDTHS:
            out = src.with_name(f'{src.stem}-{w}.webp')
            if w >= im.width:
                out.unlink(missing_ok=True)
                continue
            if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
                continue
            h = round(im.height * w / im.width)
            im.convert('RGB').resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
            print(f'{out.relative_to(ROOT)}  {w}x{h}  {out.stat().st_size // 1024} KB')

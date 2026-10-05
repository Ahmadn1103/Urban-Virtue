import json, os
import numpy as np
from PIL import Image, ImageFilter

D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, '..', '..', 'public', 'hero')
os.makedirs(OUT, exist_ok=True)

empty = np.asarray(Image.open(f'{D}/final_empty.png').convert('RGB')).astype(np.float32) / 255
full = np.asarray(Image.open(f'{D}/final_full.png').convert('RGB')).astype(np.float32) / 255
cap = Image.open(f'{D}/final_cap.png').convert('RGBA')
info = json.load(open(f'{D}/final_full.png.json'))
H, W, _ = empty.shape

# ---- liquid mask from the difference between the filled and empty renders
diff = np.abs(full - empty).max(axis=2)
binm = diff > 0.035
y0 = int(info['liq_top'][1]) - 30
y1 = int(info['liq_bottom'][1]) + 30
xl = int(info['body_left'][0]) - 4
xr = int(info['body_right'][0]) + 4
mask = np.zeros((H, W), np.float32)
rows = []
for y in range(y0, y1):
    xs = np.where(binm[y, xl:xr])[0]
    if len(xs) > 20:
        a, b = xl + xs[0], xl + xs[-1]
        mask[y, a:b + 1] = 1
        rows.append((y, a, b))
# the bright refraction arch matches the empty render, so rebuild the body rows geometrically
valid = {r[0]: (r[1], r[2]) for r in rows}
top_y = min(valid)
liq_bot = int(round(info['liq_bottom'][1]))
body = [v for y, v in valid.items() if top_y + 60 < y < top_y + 200]
A = int(np.median([v[0] for v in body])); B = int(np.median([v[1] for v in body]))
mask[:] = 0
rows = []
for y in range(top_y, liq_bot + 1):
    a, b = valid[y] if (y in valid and y < top_y + 40) else (A, B)
    mask[y, a:b + 1] = 1
    rows.append((y, a, b))
# close small vertical gaps, then soften the edge
m = Image.fromarray((mask * 255).astype(np.uint8))
m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
mask = np.asarray(m).astype(np.float32) / 255
ys = [r[0] for r in rows]
top_y, bot_y = min(ys), max(ys)
mid = [r for r in rows if abs(r[0] - (top_y + bot_y) / 2) < 3][0]
print('liquid rows', top_y, bot_y, 'mid width', mid[1], mid[2])


def rgba(rgb, a):
    return Image.fromarray(np.dstack([rgb, a[..., None]]).clip(0, 1).__mul__(255).astype(np.uint8), 'RGBA')


CROP = (140, 150, 860, 1110)
CW, CH = CROP[2] - CROP[0], CROP[3] - CROP[1]
Image.fromarray((empty * 255).astype(np.uint8)).crop(CROP).save(f'{OUT}/bottle-empty.webp', quality=90)
rgba(full, mask).crop(CROP).save(f'{OUT}/bottle-liquid.webp', quality=90)
Image.fromarray(np.dstack([np.ones_like(mask)] * 3 + [mask]).__mul__(255).astype(np.uint8), 'RGBA').crop(CROP).save(f'{OUT}/liquid-mask.png', optimize=True)
lum = full @ np.array([.2126, .7152, .0722], np.float32)
lum_blur = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7))).astype(np.float32) / 255
hi = np.clip((lum - lum_blur - .03) / .12, 0, 1) * np.clip((lum - .82) / .1, 0, 1) * mask
rgba(np.ones_like(full), hi).crop(CROP).save(f'{OUT}/bottle-glints.webp', quality=90)
cap.crop(CROP).save(f'{OUT}/bottle-cap.webp', quality=90)

# backdrop colour (for the page ground) sampled from the render's edges
corner = np.concatenate([empty[40:200, 20:120].reshape(-1, 3), empty[40:200, -120:-20].reshape(-1, 3)])
bg = (corner.mean(0) * 255).round().astype(int)
print('backdrop', '#%02x%02x%02x' % tuple(bg))

# ---- tinted thumbnails for each note
NOTES = json.load(open(f'{D}/notes.json'))
capa = np.asarray(cap).astype(np.float32) / 255
cx = W // 2
crop_top = int(info['cap_top'][1]) - 40
crop_bot = int(info['base'][1]) + 70
side = min(int((crop_bot - crop_top) * 1.15), W - 10)
cy = (crop_top + crop_bot) // 2
box = (cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)
for n in NOTES:
    c = np.array([int(n['color'][i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
    c = 1 - (1 - c) * 0.9
    liq = full * c
    img = empty * (1 - mask[..., None]) + liq * mask[..., None]
    img = img * (1 - hi[..., None]) + hi[..., None]
    # soft wash of the note colour on the backdrop, like a coloured studio sweep
    wash = 1 - (1 - c) * 0.22
    bdm = 1 - np.clip(diff * 0 + mask, 0, 1)
    img = img * wash
    img = img * (1 - capa[..., 3:4]) + capa[..., :3] * capa[..., 3:4]
    out = Image.fromarray((img.clip(0, 1) * 255).astype(np.uint8)).crop(box).resize((360, 360), Image.LANCZOS)
    out.save(f'{OUT}/note-{n["id"]}.webp', quality=86)

fx = lambda x: (x - CROP[0]) / CW
fy = lambda y: (y - CROP[1]) / CH
geo = {
    'w': CW, 'h': CH,
    'liqTop': fy(top_y), 'liqBottom': fy(bot_y),
    'liqLeft': fx(mid[1]), 'liqRight': fx(mid[2]),
    'neckTop': fy(info['neck_top'][1]),
    'bodyLeft': fx(info['body_left'][0]), 'bodyRight': fx(info['body_right'][0]),
    'bg': '#%02x%02x%02x' % tuple(bg),
}
json.dump(geo, open(f'{D}/geo.json', 'w'), indent=1)
print(json.dumps(geo, indent=1))

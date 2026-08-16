#!/usr/bin/env python3
"""Compose 6.5" (1284x2778) App Store marketing screenshots from raw iPhone captures."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import os

SRC = "/mnt/user-data/uploads/Downloads"
OUT = "/home/claude/work/OneLine/store/appstore_screenshots"
os.makedirs(OUT, exist_ok=True)

W, H = 1284, 2778
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

SHOTS = [
    ("IMG_2842.PNG", "01_today.png", "One line.\nThirty seconds.", "The journal you’ll actually keep."),
    ("IMG_2843.PNG", "02_story.png", "Your days become\na story.", "Reread your life, one line at a time."),
    ("IMG_2844.PNG", "03_settings.png", "Private by design.", "No account. No cloud. Face ID lock."),
    ("IMG_2845.PNG", "04_pro.png", "Keep every line\nforever.", "Try OneLine Pro free for 7 days."),
]

def vertical_gradient(w, h, top, bottom):
    base = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / (h - 1)
        px = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        base.putpixel((0, y), px)
    return base.resize((w, h))

def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=radius, fill=255)
    out = ImageOps.fit(im, im.size)
    out.putalpha(mask)
    return out

title_font = ImageFont.truetype(BOLD, 104)
sub_font = ImageFont.truetype(REG, 54)

for src_name, out_name, title, subtitle in SHOTS:
    canvas = vertical_gradient(W, H, (42, 27, 16), (23, 16, 10))
    draw = ImageDraw.Draw(canvas)

    # headline
    y = 150
    for line in title.split("\n"):
        bbox = draw.textbbox((0, 0), line, font=title_font)
        lw = bbox[2] - bbox[0]
        draw.text(((W - lw) / 2, y), line, font=title_font, fill=(245, 237, 227))
        y += 128
    y += 26
    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    lw = bbox[2] - bbox[0]
    draw.text(((W - lw) / 2, y), subtitle, font=sub_font, fill=(232, 133, 61))
    y += 110

    # device screenshot with rounded corners + soft shadow
    shot = Image.open(os.path.join(SRC, src_name)).convert("RGB")
    target_h = H - y - 90
    target_w = int(shot.width * target_h / shot.height)
    if target_w > W - 160:
        target_w = W - 160
        target_h = int(shot.height * target_w / shot.width)
    shot = shot.resize((target_w, target_h), Image.LANCZOS)
    r = int(target_w * 0.11)
    shot_r = rounded(shot, r)

    # shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sx = (W - target_w) // 2
    sd.rounded_rectangle([sx - 6, y + 14, sx + target_w + 6, y + target_h + 26], radius=r, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow)

    # subtle border
    border = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(border)
    bd.rounded_rectangle([sx - 3, y - 3, sx + target_w + 3, y + target_h + 3], radius=r + 3, outline=(120, 84, 52, 255), width=3)
    canvas.paste(shot_r, (sx, y), shot_r)
    canvas = Image.alpha_composite(canvas, border)

    canvas.convert("RGB").save(os.path.join(OUT, out_name), "PNG")
    print(out_name, canvas.size)
print("done")

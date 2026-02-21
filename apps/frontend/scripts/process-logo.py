#!/usr/bin/env python3
"""
process-logo.py - Generate logo variants from logo-gamilit.jpeg

Generates:
  - logo-icon.png  : Icon only (graduation cap + star), transparent background
  - logo-full.png  : Full logo without background (transparent)
  - logo-full.jpg  : Full logo with original orange background
  - favicon.ico    : 64x64 favicon for browser tab

Requirements:
  pip install rembg Pillow

Usage:
  python process-logo.py
"""

import os
import sys

try:
    from PIL import Image
    from rembg import remove
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install rembg Pillow")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(SCRIPT_DIR, "..", "public")
SOURCE = os.path.join(PUBLIC_DIR, "logo-gamilit.jpeg")


def main():
    if not os.path.exists(SOURCE):
        print(f"ERROR: Source image not found: {SOURCE}")
        sys.exit(1)

    img = Image.open(SOURCE).convert("RGBA")
    w, h = img.size
    print(f"Source image: {w}x{h}")

    # --- 1. logo-full.png: Remove background (transparent) ---
    print("Removing background...")
    img_nobg = remove(img)
    img_nobg.save(os.path.join(PUBLIC_DIR, "logo-full.png"), "PNG")
    print("  -> logo-full.png saved")

    # --- 2. logo-full.jpg: Original with orange background ---
    img_jpg = Image.open(SOURCE).convert("RGB")
    img_jpg.save(os.path.join(PUBLIC_DIR, "logo-full.jpg"), "JPEG", quality=90)
    print("  -> logo-full.jpg saved")

    # --- 3. logo-icon.png: Icon only (crop out text at bottom) ---
    # The icon (graduation cap + star) occupies roughly the top 68% of the image.
    # The "GAMILIT" text starts at ~68% and "LEE Y GANA" goes to ~82%.
    # We crop top portion to isolate the icon only.
    icon_bottom = int(h * 0.63)
    icon_crop = img_nobg.crop((0, 0, w, icon_bottom))

    # Auto-crop transparent edges
    bbox = icon_crop.getbbox()
    if bbox:
        icon_crop = icon_crop.crop(bbox)

    # Make it square with padding
    iw, ih = icon_crop.size
    side = max(iw, ih)
    padding = int(side * 0.08)
    canvas_size = side + padding * 2
    icon_square = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_x = (canvas_size - iw) // 2
    offset_y = (canvas_size - ih) // 2
    icon_square.paste(icon_crop, (offset_x, offset_y), icon_crop)

    # Resize to a clean 512x512 for high quality
    icon_final = icon_square.resize((512, 512), Image.LANCZOS)
    icon_final.save(os.path.join(PUBLIC_DIR, "logo-icon.png"), "PNG")
    print("  -> logo-icon.png saved (512x512)")

    # --- 4. favicon.ico: 64x64 from the icon ---
    # Use the icon but with orange background for visibility in browser tab
    favicon_size = 64
    favicon_bg = Image.new("RGBA", (favicon_size, favicon_size), (249, 115, 22, 255))  # orange-500
    icon_small = icon_final.resize((favicon_size, favicon_size), Image.LANCZOS)
    favicon_bg.paste(icon_small, (0, 0), icon_small)
    favicon_rgb = favicon_bg.convert("RGB")

    # Save as ICO with multiple sizes
    favicon_16 = favicon_rgb.resize((16, 16), Image.LANCZOS)
    favicon_32 = favicon_rgb.resize((32, 32), Image.LANCZOS)
    favicon_48 = favicon_rgb.resize((48, 48), Image.LANCZOS)
    favicon_rgb.save(
        os.path.join(PUBLIC_DIR, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )
    print("  -> favicon.ico saved (16/32/48/64)")

    print("\nDone! All 4 files generated in public/")


if __name__ == "__main__":
    main()

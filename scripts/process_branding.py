import os
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

def make_transparent(im, mode='light'):
    """
    Remove paper background from calligraphy image and generate transparent RGBA.
    Sample corners for actual background/paper color.
    """
    im = im.convert('RGB')
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    
    # Sample background color from corners (each 20x20)
    c1 = arr[0:20, 0:20]
    c2 = arr[0:20, w-20:w]
    c3 = arr[h-20:h, 0:20]
    c4 = arr[h-20:h, w-20:w]
    bg_sample = np.mean(np.concatenate([c1, c2, c3, c4], axis=0), axis=(0, 1))
    
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    # Distance from sampled background paper color
    dist_from_bg = np.sqrt((bg_sample[0] - r)**2 + (bg_sample[1] - g)**2 + (bg_sample[2] - b)**2)
    
    # Smooth alpha ramp: pixels close to background color become transparent
    # Paper texture variations stay below threshold_low
    threshold_low = 18.0
    threshold_high = 50.0
    alpha = np.clip((dist_from_bg - threshold_low) / (threshold_high - threshold_low) * 255.0, 0.0, 255.0)
    
    # Identify gold vs charcoal
    is_gold_metric = (r - b) / (np.maximum(r, 1.0))
    gold_mask = (is_gold_metric > 0.16) & (r > 85) & (b < 175)
    
    out_arr = np.zeros((h, w, 4), dtype=np.uint8)
    
    if mode == 'light':
        alpha_norm = np.expand_dims(alpha / 255.0, axis=-1)
        bg_col = np.expand_dims(np.expand_dims(bg_sample, 0), 0)
        # Decontaminate foreground against paper background
        foreground = np.clip((arr - (1.0 - alpha_norm) * bg_col) / np.maximum(alpha_norm, 0.001), 0.0, 255.0)
        
        out_arr[:, :, 0:3] = foreground.astype(np.uint8)
        out_arr[:, :, 3] = alpha.astype(np.uint8)
    else:
        # Dark mode: Invert charcoal to brilliant white/platinum, keep gold radiant
        alpha_norm = np.expand_dims(alpha / 255.0, axis=-1)
        bg_col = np.expand_dims(np.expand_dims(bg_sample, 0), 0)
        fg = np.clip((arr - (1.0 - alpha_norm) * bg_col) / np.maximum(alpha_norm, 0.001), 0.0, 255.0)
        
        dark_fg = np.zeros_like(fg)
        
        # Non-gold (charcoal ink) -> radiant white / platinum
        luma = 0.299 * fg[:, :, 0] + 0.587 * fg[:, :, 1] + 0.114 * fg[:, :, 2]
        inverted_luma = 255.0 - luma
        charcoal_replacement = np.clip(inverted_luma * 1.15 + 10.0, 0.0, 255.0)
        
        for c in range(3):
            dark_fg[:, :, c] = np.where(gold_mask, fg[:, :, c], charcoal_replacement)
            
        # Give gold areas rich luminous glow in dark mode
        dark_fg[:, :, 0] = np.where(gold_mask, np.clip(fg[:, :, 0] * 1.18, 0, 255), dark_fg[:, :, 0])
        dark_fg[:, :, 1] = np.where(gold_mask, np.clip(fg[:, :, 1] * 1.12, 0, 255), dark_fg[:, :, 1])
        dark_fg[:, :, 2] = np.where(gold_mask, np.clip(fg[:, :, 2] * 0.85, 0, 255), dark_fg[:, :, 2])
        
        out_arr[:, :, 0:3] = dark_fg.astype(np.uint8)
        out_arr[:, :, 3] = alpha.astype(np.uint8)
        
    return Image.fromarray(out_arr)

def trim_transparent(im, padding=12):
    """Crop image to non-transparent bounding box with padding."""
    bbox = im.getbbox()
    if not bbox:
        return im
    w, h = im.size
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(w, bbox[2] + padding)
    bottom = min(h, bbox[3] + padding)
    return im.crop((left, top, right, bottom))

base_brain = "C:/Users/lakki/.gemini/antigravity-ide/brain/8967c19e-7fad-4ed4-bd15-a7dcee6814d3/.user_uploaded"
dest_dir = "h:/pranith's files/new project/frontend/public/branding"
os.makedirs(dest_dir, exist_ok=True)

# 1. English signature: media_1792904675962.jpg
im1 = Image.open(os.path.join(base_brain, 'media_1792904675962.jpg'))
t1_light = trim_transparent(make_transparent(im1, 'light'))
t1_dark = trim_transparent(make_transparent(im1, 'dark'))
t1_light.save(os.path.join(dest_dir, 'signature_english_light.png'), 'PNG')
t1_dark.save(os.path.join(dest_dir, 'signature_english_dark.png'), 'PNG')
t1_light.save(os.path.join(dest_dir, 'signature_english.png'), 'PNG')
print("Processed 1. English signature")

# 2. Telugu calligraphy: media_1792904683805.jpg
im2 = Image.open(os.path.join(base_brain, 'media_1792904683805.jpg'))
t2_light = trim_transparent(make_transparent(im2, 'light'))
t2_dark = trim_transparent(make_transparent(im2, 'dark'))
t2_light.save(os.path.join(dest_dir, 'signature_telugu_light.png'), 'PNG')
t2_dark.save(os.path.join(dest_dir, 'signature_telugu_dark.png'), 'PNG')
t2_light.save(os.path.join(dest_dir, 'signature_telugu.png'), 'PNG')
print("Processed 2. Telugu calligraphy")

# 3. Tony's Music script: media_1792904683831.jpg
im3 = Image.open(os.path.join(base_brain, 'media_1792904683831.jpg'))
t3_light = trim_transparent(make_transparent(im3, 'light'))
t3_dark = trim_transparent(make_transparent(im3, 'dark'))
t3_light.save(os.path.join(dest_dir, 'brand_wordmark_light.png'), 'PNG')
t3_dark.save(os.path.join(dest_dir, 'brand_wordmark_dark.png'), 'PNG')
t3_light.save(os.path.join(dest_dir, 'brand_wordmark.png'), 'PNG')
print("Processed 3. Brand wordmark script")

# 4. Tony's Music emblem + text: media_1792904689972.jpg
im4 = Image.open(os.path.join(base_brain, 'media_1792904689972.jpg'))
t4_light = trim_transparent(make_transparent(im4, 'light'))
t4_dark = trim_transparent(make_transparent(im4, 'dark'))
t4_light.save(os.path.join(dest_dir, 'logo_full_light.png'), 'PNG')
t4_dark.save(os.path.join(dest_dir, 'logo_full_dark.png'), 'PNG')
t4_light.save(os.path.join(dest_dir, 'logo_full.png'), 'PNG')
print("Processed 4. Full logo (emblem + text)")

# 5. Extract standalone circular emblem from Image 4
# Perfect crop of emblem: x from 60 to 380, y from 110 to 470
im4_emblem = im4.crop((60, 110, 380, 470))
emblem_light = trim_transparent(make_transparent(im4_emblem, 'light'))
emblem_dark = trim_transparent(make_transparent(im4_emblem, 'dark'))

def to_square(im, size=512):
    w, h = im.size
    scale = min(size * 0.9 / w, size * 0.9 / h)
    nw, nh = int(w * scale), int(h * scale)
    resized = im.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    offset = ((size - nw) // 2, (size - nh) // 2)
    canvas.paste(resized, offset, resized)
    return canvas

emblem_sq_light = to_square(emblem_light, 512)
emblem_sq_dark = to_square(emblem_dark, 512)

emblem_sq_light.save(os.path.join(dest_dir, 'logo_emblem_light.png'), 'PNG')
emblem_sq_dark.save(os.path.join(dest_dir, 'logo_emblem_dark.png'), 'PNG')
emblem_sq_light.save(os.path.join(dest_dir, 'logo_emblem.png'), 'PNG')

to_square(emblem_light, 64).save("h:/pranith's files/new project/frontend/public/favicon.png", 'PNG')
print("Processed 5. Standalone emblem & favicon")

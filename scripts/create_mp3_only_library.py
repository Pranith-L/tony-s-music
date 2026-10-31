import os
import sys
import json
import shutil

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath('H:/new project')
PRANITH_DIR = os.path.abspath("H:/pranith's files/new project")
MASTER_DIR = os.path.join(ROOT_DIR, 'Tony_Prakash_Master_Library')
TARGET_DIR = os.path.join(ROOT_DIR, 'Tony_Prakash_MP3_Library')
TARGET_DIR_PRANITH = os.path.join(PRANITH_DIR, 'Tony_Prakash_MP3_Library')

# Supabase Storage Base URL
SUPABASE_PROJECT_REF = 'mrehomunxqccvcwpkwxd'
SUPABASE_BUCKET = 'songs'
SUPABASE_BASE_URL = f"https://{SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/{SUPABASE_BUCKET}"

print(f"Reading Master Manifest from {MASTER_DIR}...")
manifest_path = os.path.join(MASTER_DIR, 'LIBRARY_MANIFEST.json')
with open(manifest_path, 'r', encoding='utf-8') as f:
    master_manifest = json.load(f)

# Clear and prepare target directories
for target in [TARGET_DIR, TARGET_DIR_PRANITH]:
    if os.path.exists(target):
        print(f"Removing old target at {target}...")
        shutil.rmtree(target)
    os.makedirs(target, exist_ok=True)
    os.makedirs(os.path.join(target, '01_Devotional_Songs'), exist_ok=True)
    os.makedirs(os.path.join(target, '02_Albums', 'Naa_Aasha'), exist_ok=True)
    os.makedirs(os.path.join(target, '02_Albums', 'Nee_Sannidhi'), exist_ok=True)
    os.makedirs(os.path.join(target, '02_Albums', 'Neetho'), exist_ok=True)
    os.makedirs(os.path.join(target, '03_Studio_Minus_One_Tracks'), exist_ok=True)

mp3_catalog = []
total_copied = 0
total_bytes = 0

for track in master_manifest['tracks']:
    folder = track['folder']
    orig_mp3_name = track['mp3File']
    src_mp3_path = os.path.join(MASTER_DIR, folder, orig_mp3_name)

    if not os.path.exists(src_mp3_path):
        print(f"WARNING: File not found: {src_mp3_path}")
        continue

    # Clean filename for track 125 or any non-ASCII name to prevent S3/Supabase upload issues
    clean_mp3_name = orig_mp3_name
    if track['index'] == 125:
        clean_mp3_name = "125_Nuthanamainadhi_Nee_Vathsalyamu_Song_Track.mp3"

    # Copy to both locations
    dst_path_1 = os.path.join(TARGET_DIR, folder, clean_mp3_name)
    shutil.copy2(src_mp3_path, dst_path_1)

    dst_path_2 = os.path.join(TARGET_DIR_PRANITH, folder, clean_mp3_name)
    shutil.copy2(src_mp3_path, dst_path_2)

    file_size = os.path.getsize(dst_path_1)
    total_bytes += file_size
    total_copied += 1

    # Supabase public streaming URL for this track
    supabase_storage_path = f"{folder}/{clean_mp3_name}".replace('\\', '/')
    public_streaming_url = f"{SUPABASE_BASE_URL}/{supabase_storage_path}"

    mp3_catalog.append({
        'index': track['index'],
        'id': track['id'],
        'titleEnglish': track['titleEnglish'],
        'titleTelugu': track['titleTelugu'],
        'category': track['category'],
        'album': track['album'],
        'duration': track['duration'],
        'folder': folder,
        'mp3FileName': clean_mp3_name,
        'sizeMB': round(file_size / (1024 * 1024), 2),
        'supabaseStoragePath': supabase_storage_path,
        'publicStreamingUrl': public_streaming_url
    })

print(f"\nSUCCESS: Copied {total_copied} pure MP3 files ({total_bytes / (1024*1024):.2f} MB / {total_bytes / (1024**3):.2f} GB)")

catalog_summary = {
    'title': "Tony Prakash Official Pure MP3 Streaming Library",
    'version': "2.0.0",
    'supabaseProject': SUPABASE_PROJECT_REF,
    'supabaseBucket': SUPABASE_BUCKET,
    'totalTracks': total_copied,
    'totalSizeMB': round(total_bytes / (1024 * 1024), 2),
    'totalSizeGB': round(total_bytes / (1024**3), 2),
    'breakdown': {
        '01_Devotional_Songs': len([t for t in mp3_catalog if t['folder'] == '01_Devotional_Songs']),
        '02_Albums_Naa_Aasha': len([t for t in mp3_catalog if 'Naa_Aasha' in t['folder']]),
        '02_Albums_Nee_Sannidhi': len([t for t in mp3_catalog if 'Nee_Sannidhi' in t['folder']]),
        '02_Albums_Neetho': len([t for t in mp3_catalog if 'Neetho' in t['folder']]),
        '03_Studio_Minus_One_Tracks': len([t for t in mp3_catalog if t['folder'] == '03_Studio_Minus_One_Tracks'])
    },
    'tracks': mp3_catalog
}

# Write MP3 catalog JSON
for target in [TARGET_DIR, TARGET_DIR_PRANITH]:
    catalog_file = os.path.join(target, 'MP3_CATALOG.json')
    with open(catalog_file, 'w', encoding='utf-8') as f:
        json.dump(catalog_summary, f, indent=2, ensure_ascii=False)

print(f"Catalog JSON written to both directories.")

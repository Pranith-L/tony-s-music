import os
import sys
import json
import shutil
import urllib.parse
import av

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath('H:/new project')
TARGET_DIR = os.path.join(ROOT_DIR, 'Tony_Prakash_Master_Library')

DEVOTIONAL_DIR = os.path.join(TARGET_DIR, '01_Devotional_Songs')
ALBUMS_DIR = os.path.join(TARGET_DIR, '02_Albums')
TRACKS_DIR = os.path.join(TARGET_DIR, '03_Studio_Minus_One_Tracks')

for d in [DEVOTIONAL_DIR, ALBUMS_DIR, TRACKS_DIR]:
    os.makedirs(d, exist_ok=True)

def transcode_mp3_to_wav(src_path, dst_path):
    """Converts MP3 to high-fidelity 16-bit 44.1kHz stereo WAV"""
    in_container = av.open(src_path)
    in_stream = in_container.streams.audio[0]

    out_container = av.open(dst_path, 'w')
    out_stream = out_container.add_stream('pcm_s16le', rate=44100)
    out_stream.layout = 'stereo'

    resampler = av.AudioResampler(format='s16', layout='stereo', rate=44100)

    for frame in in_container.decode(in_stream):
        frame.pts = None
        for r_frame in resampler.resample(frame):
            for packet in out_stream.encode(r_frame):
                out_container.mux(packet)

    for packet in out_stream.encode():
        out_container.mux(packet)

    in_container.close()
    out_container.close()

# Load catalog
catalog_path = os.path.join(ROOT_DIR, 'frontend/src/services/generatedTracks.json')
with open(catalog_path, 'r', encoding='utf-8') as f:
    catalog_tracks = json.load(f)

# Build search index for all audio files across the workspace
audio_index = {}
for base in ['Tony Prakash songs', 'Tony prakas neetho Trk']:
    base_dir = os.path.join(ROOT_DIR, base)
    if not os.path.exists(base_dir):
        continue
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ['.mp3', '.wav']:
                base_name = os.path.splitext(f)[0].lower()
                clean_key = "".join([c for c in base_name if c.isalnum()])
                audio_index.setdefault(clean_key, {})[ext] = os.path.join(root, f)

manifest = []
converted_to_wav = 0
copied_wav = 0
copied_mp3 = 0

print(f"Catalog has {len(catalog_tracks)} tracks. Processing...")

for idx, t in enumerate(catalog_tracks):
    tid = t.get('id')
    title_en = t.get('titleEnglish', f'Track_{idx+1}')
    title_te = t.get('titleTelugu', '')
    category = t.get('category', 'Devotional')
    album_id = t.get('albumId')
    is_track = t.get('isTrack') or category == 'Track' or 'track' in title_en.lower() or 'trk' in title_en.lower()

    # Determine destination subfolder
    if album_id:
        if 'na-asha' in album_id:
            subfolder = os.path.join(ALBUMS_DIR, 'Naa_Aasha')
            album_name = 'Naa Aasha'
        elif 'nee-sannidhi' in album_id:
            subfolder = os.path.join(ALBUMS_DIR, 'Nee_Sannidhi')
            album_name = 'Nee Sannidhi'
        elif 'neetho' in album_id:
            subfolder = os.path.join(ALBUMS_DIR, 'Neetho')
            album_name = 'Neetho'
        else:
            subfolder = os.path.join(ALBUMS_DIR, album_id.replace('album-', '').replace('-', '_').title())
            album_name = album_id
    elif is_track:
        subfolder = TRACKS_DIR
        album_name = None
    else:
        subfolder = DEVOTIONAL_DIR
        album_name = None

    os.makedirs(subfolder, exist_ok=True)

    # Standard clean filename
    clean_title = title_en.split('(')[0].strip()
    clean_title = "".join([c if c.isalnum() or c in [' ', '_', '-'] else '' for c in clean_title]).strip()
    clean_title = clean_title.replace(' ', '_')
    clean_name = f"{idx+1:03d}_{clean_title}"

    dst_wav = os.path.join(subfolder, f"{clean_name}.wav")
    dst_mp3 = os.path.join(subfolder, f"{clean_name}.mp3")

    # Locate source file from audioUrl
    rel_audio = urllib.parse.unquote(t.get('audioUrl', '').replace('/api/audio/', ''))
    src_file = os.path.join(ROOT_DIR, 'Tony Prakash songs', rel_audio)
    if not os.path.exists(src_file):
        src_file = os.path.join(ROOT_DIR, 'Tony prakas neetho Trk', rel_audio)

    # Determine WAV and MP3 sources
    src_wav = None
    src_mp3 = None

    if os.path.exists(src_file):
        ext = os.path.splitext(src_file)[1].lower()
        if ext == '.wav':
            src_wav = src_file
            candidate_mp3 = os.path.splitext(src_file)[0] + '.mp3'
            if os.path.exists(candidate_mp3):
                src_mp3 = candidate_mp3
        elif ext == '.mp3':
            src_mp3 = src_file
            candidate_wav = os.path.splitext(src_file)[0] + '.wav'
            if os.path.exists(candidate_wav):
                src_wav = candidate_wav

    # Fallback search using clean key in index
    if not src_wav or not src_mp3:
        clean_key = "".join([c for c in os.path.splitext(os.path.basename(rel_audio))[0].lower() if c.isalnum()])
        matches = audio_index.get(clean_key, {})
        if not src_wav and '.wav' in matches:
            src_wav = matches['.wav']
        if not src_mp3 and '.mp3' in matches:
            src_mp3 = matches['.mp3']

    # 1. Provide WAV
    if src_wav and os.path.exists(src_wav):
        if not os.path.exists(dst_wav) or os.path.getsize(dst_wav) == 0:
            shutil.copy2(src_wav, dst_wav)
            copied_wav += 1
    elif src_mp3 and os.path.exists(src_mp3):
        # Convert MP3 to WAV!
        if not os.path.exists(dst_wav) or os.path.getsize(dst_wav) == 0:
            try:
                transcode_mp3_to_wav(src_mp3, dst_wav)
                converted_to_wav += 1
            except Exception as e:
                print(f"Error converting {src_mp3} to WAV: {e}")

    # 2. Provide MP3
    if src_mp3 and os.path.exists(src_mp3):
        if not os.path.exists(dst_mp3) or os.path.getsize(dst_mp3) == 0:
            shutil.copy2(src_mp3, dst_mp3)
            copied_mp3 += 1

    wav_size = os.path.getsize(dst_wav) if os.path.exists(dst_wav) else 0
    mp3_size = os.path.getsize(dst_mp3) if os.path.exists(dst_mp3) else 0

    manifest.append({
        'id': tid,
        'index': idx + 1,
        'titleEnglish': title_en,
        'titleTelugu': title_te,
        'category': category,
        'album': album_name,
        'folder': os.path.relpath(subfolder, TARGET_DIR).replace('\\', '/'),
        'wavFile': os.path.basename(dst_wav) if wav_size > 0 else None,
        'mp3File': os.path.basename(dst_mp3) if mp3_size > 0 else None,
        'wavSizeMB': round(wav_size / (1024 * 1024), 2),
        'mp3SizeMB': round(mp3_size / (1024 * 1024), 2),
        'duration': t.get('duration', 'N/A')
    })

print(f"Catalog processing complete.")
print(f"WAVs Copied: {copied_wav}, MP3s converted to WAV: {converted_to_wav}, MP3s Copied: {copied_mp3}")

# Save manifest
manifest_path = os.path.join(TARGET_DIR, 'LIBRARY_MANIFEST.json')
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump({
        'title': "Rev. Tony Prakash Official Music Master Library",
        'totalTracks': len(manifest),
        'summary': {
            'devotionalSongs': len([m for m in manifest if m['folder'] == '01_Devotional_Songs']),
            'albumSongs': len([m for m in manifest if '02_Albums' in m['folder']]),
            'studioBackingTracks': len([m for m in manifest if m['folder'] == '03_Studio_Minus_One_Tracks'])
        },
        'tracks': manifest
    }, f, indent=2, ensure_ascii=False)

print(f"Manifest written to: {manifest_path}")

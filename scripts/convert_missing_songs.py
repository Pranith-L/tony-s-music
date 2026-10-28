import os
import sys
import soundfile as sf
from mutagen.mp3 import MP3

sys.stdout.reconfigure(encoding='utf-8')

trk_base = "h:/pranith's files/new project/Tony prakas neetho Trk"
serv_base = "h:/pranith's files/new project/Tony Prakash songs"

tasks = []

# 1. NA ASHA album tracks
na_asha_src = os.path.join(trk_base, "NA ASHA")
na_asha_dst = os.path.join(serv_base, "na asha")
os.makedirs(na_asha_dst, exist_ok=True)

na_asha_files = [
    ("01 Intro.mp3", "01_Intro.wav"),
    ("02 Asha Asha .mp3", "02_Asha_Asha.wav"),
    ("03 An∂haru.mp3", "03_Andharu_Nannu_Vidichina.wav"),
    ("04 maruvalenu.mp3", "04_Maruvalenu_Yesayya.wav"),
    ("05 Yesaiah.mp3", "05_Yesaiah_Naaku_Oka_Asha.wav"),
    ("06 Devadhi deva.mp3", "06_Devadhi_Deva.wav"),
    ("07 Ara∂hinthinu.mp3", "07_Aradhinthunu.wav"),
    ("08 Naaganam.mp3", "08_Naa_Ganamu.wav"),
    ("09 Oo nestthama.mp3", "09_Oo_Nesthama.wav"),
    ("10 Chatu∂ham.mp3", "10_Chatudham_Yesu_Premanu.wav"),
]
for src, dst in na_asha_files:
    tasks.append((os.path.join(na_asha_src, src), os.path.join(na_asha_dst, dst), "Album: Naa Asha"))

# 2. NEE SANNIDHI album tracks
nee_san_src = os.path.join(trk_base, "NEE SANNIDHI")
nee_san_dst = os.path.join(serv_base, "nee sannidhi")
os.makedirs(nee_san_dst, exist_ok=True)

nee_san_files = [
    ("01 Prayer.mp3", "01_Prayer.wav"),
    ("02 Prabhuva Nee.mp3", "02_Prabhuva_Nee_Sannidhilo.wav"),
    ("03 Tharatharalalo.mp3", "03_Tharatharalalo.wav"),
    ("04 Priyamaina.mp3", "04_Priyamaina_Yesu.wav"),
    ("05 Pramavya∂yu∂a.mp3", "05_Parama_Vaidhyuda.wav"),
    ("06 Yesuprema.mp3", "06_Yesu_Prema_Kanna.wav"),
    ("07 Repomapo.mp3", "07_Repu_Maapu.wav"),
    ("08 Neekruppa.mp3", "08_Nee_Krupa_Chalunu.wav"),
    ("09 Naakunna.mp3", "09_Naakunna_Madhura_Swaram.wav"),
    ("10 Manohara.mp3", "10_Manohara.wav"),
]
for src, dst in nee_san_files:
    tasks.append((os.path.join(nee_san_src, src), os.path.join(nee_san_dst, dst), "Album: Nee Sannidhi"))

# 3. Missing songs from Tony Prakash Hits
hits_src = os.path.join(trk_base, "Tony Prakash Hits")
hits_dst = os.path.join(serv_base, "tonyprakash song")
os.makedirs(hits_dst, exist_ok=True)

missing_hits = [
    ("064 yesuva naa kristh.mp3", "064_yesuva_naa_kristhu.wav"),
    ("065 OO YESAIYA F.mp3", "065_OO_YESAIYA_F.wav"),
    ("066 poraattam.mp3", "066_poraattam.wav"),
    ("072. prayer.mp3", "072_prayer_vocal.wav"),
    ("073. sthuthulaku.mp3", "073_sthuthulaku_vocal.wav"),
    ("074.neetho undipo.mp3", "074_neetho_undipo_vocal.wav"),
    ("075.nee mandhiramulo.mp3", "075_nee_mandhiramulo.wav"),
    ("076.neethone ne nadavalani.mp3", "076_neethone_ne_nadavalani.wav"),
    ("077.hrudhayama.mp3", "077_hrudhayama.wav"),
    ("078.mosapokudi.mp3", "078_mosapokudi.wav"),
    ("079.krotha patta.mp3", "079_kroththa_paata.wav"),
    ("080.nee krupa.mp3", "080_nee_krupa.wav"),
    ("081.rende rende.mp3", "081_rende_rendu.wav"),
    ("082.naa pattaku.mp3", "082_naa_paataku.wav"),
    ("083.neetho undiponi.mp3", "083_neetho_undiponi.wav"),
]
for src, dst in missing_hits:
    tasks.append((os.path.join(hits_src, src), os.path.join(hits_dst, dst), "Hits Collection"))

print(f"Total files to convert to WAV: {len(tasks)}")

converted_count = 0
for idx, (src_file, dst_file, group) in enumerate(tasks):
    if not os.path.exists(src_file):
        print(f"[{idx+1}/{len(tasks)}] WARNING: Source missing: {src_file}")
        continue
    
    print(f"[{idx+1}/{len(tasks)}] Converting ({group}): {os.path.basename(src_file)} -> {os.path.basename(dst_file)}...")
    try:
        data, sr = sf.read(src_file)
        # Write to uncompressed 16-bit PCM WAV
        sf.write(dst_file, data, sr, subtype='PCM_16')
        dur = len(data) / sr
        size_mb = os.path.getsize(dst_file) / (1024 * 1024)
        print(f"   Done: {dur:.1f}s, {sr}Hz, {size_mb:.2f} MB")
        converted_count += 1
    except Exception as e:
        print(f"   ERROR converting {src_file}: {e}")

print(f"\nSuccessfully converted {converted_count}/{len(tasks)} files to WAV!")

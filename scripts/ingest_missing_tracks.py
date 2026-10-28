import os
import sys
import json
import soundfile as sf
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

serv_base = "h:/pranith's files/new project/Tony Prakash songs"
tracks_json_path = "h:/pranith's files/new project/frontend/src/services/generatedTracks.json"

with open(tracks_json_path, 'r', encoding='utf-8') as f:
    existing_tracks = json.load(f)

print(f"Loaded {len(existing_tracks)} existing tracks from {tracks_json_path}")

existing_audio_urls = set(t.get('audioUrl', '') for t in existing_tracks)
existing_ids = set(t.get('id', '') for t in existing_tracks)

def get_wav_duration_str(wav_path):
    try:
        info = sf.info(wav_path)
        total_sec = int(round(info.duration))
        m = total_sec // 60
        s = total_sec % 60
        return f"{m}:{s:02d}"
    except Exception as e:
        return "4:00"

new_tracks = []
order_counter = len(existing_tracks) + 1

# 1. NA ASHA Album (10 tracks)
na_asha_meta = [
    {
        "file": "01_Intro.wav",
        "te": "పరిచయ వాక్యాలు (నా ఆశ)",
        "en": "Intro (My Desire)",
        "desc": "Rev. Tony Prakash devotional opening and spoken testimony for Naa Asha album."
    },
    {
        "file": "02_Asha_Asha.wav",
        "te": "ఆశ ఆశ నా యేసయ్యపై ఆశ",
        "en": "Asha Asha (ఆశ ఆశ)",
        "desc": "Title song from Naa Asha album - Expressing burning spiritual devotion to Jesus Christ."
    },
    {
        "file": "03_Andharu_Nannu_Vidichina.wav",
        "te": "అందరు నన్ను విడిచినా",
        "en": "Andharu Nannu Vidichina (అందరు నన్ను విడిచినా)",
        "desc": "Heartfelt adoration of God who never leaves us even when all forsake us."
    },
    {
        "file": "04_Maruvalenu_Yesayya.wav",
        "te": "మరువలేను యేసయ్యా",
        "en": "Maruvalenu Yesayya (మరువలేను యేసయ్యా)",
        "desc": "Unforgettable gratitude for divine mercies and unconditional heavenly grace."
    },
    {
        "file": "05_Yesaiah_Naaku_Oka_Asha.wav",
        "te": "యేసయ్యా నాకు ఒక ఆశ",
        "en": "Yesaiah Naaku Oka Asha (యేసయ్యా నాకు ఒక ఆశ)",
        "desc": "Deep worship expressing the longing to abide in God's presence forever."
    },
    {
        "file": "06_Devadhi_Deva.wav",
        "te": "దేవాది దేవా",
        "en": "Devadhi Deva (దేవాది దేవా)",
        "desc": "Majestic Telugu hymn glorifying Jesus as King of Kings and Lord of Lords."
    },
    {
        "file": "07_Aradhinthunu.wav",
        "te": "ఆరాధింతును నిన్నే",
        "en": "Aradhinthunu (ఆరాధింతును)",
        "desc": "Pure devotional adoration and surrendered prayer to the Lord."
    },
    {
        "file": "08_Naa_Ganamu.wav",
        "te": "నా గానము నీవే",
        "en": "Naa Ganamu Neeve (నా గానము నీవే)",
        "desc": "Declaring that God is my strength, my salvation, and my lifelong song."
    },
    {
        "file": "09_Oo_Nesthama.wav",
        "te": "ఓ నేస్తమా వినుమా",
        "en": "Oo Nesthama (ఓ నేస్తమా)",
        "desc": "Gospel evangelistic call inviting every weary friend to the love of Jesus."
    },
    {
        "file": "10_Chatudham_Yesu_Premanu.wav",
        "te": "చాటెదం యేసు ప్రేమను",
        "en": "Chatudham Yesu Premanu (చాటెదం యేసు ప్రేమను)",
        "desc": "Jubilant missionary worship proclaiming Christ's eternal love to all nations."
    },
]

for idx, item in enumerate(na_asha_meta):
    fname = item["file"]
    full_path = os.path.join(serv_base, "na asha", fname)
    dur = get_wav_duration_str(full_path)
    tid = f"tp-album-na-asha-{idx+1}"
    slug = f"na-asha-{idx+1}-{fname.replace('.wav', '').lower()}"
    audio_url = f"/api/audio/na%20asha/{fname}"
    
    track_obj = {
        "id": tid,
        "slug": slug,
        "titleTelugu": item["te"],
        "titleEnglish": item["en"],
        "albumId": "album-na-asha",
        "duration": dur,
        "category": "Devotional",
        "isFeatured": idx in [1, 2, 4],
        "isPopular": True,
        "isSubscriberOnly": False,
        "isDownloadable": True,
        "downloadPricePaise": 0,
        "rightsConfirmed": True,
        "audioUrl": audio_url,
        "coverImage": "/covers/track_5_Asha_asha_track.jpg",
        "composer": "Rev. Tony Prakash",
        "lyricist": "Rev. Tony Prakash",
        "singer": "Rev. Tony Prakash",
        "releaseYear": 2023,
        "status": "PUBLISHED",
        "lyricsTelugu": f"{item['te']} - రేవ. టోనీ ప్రకాష్ గారి 'నా ఆశ' ఆల్బమ్ నుండి ఆరాధనా గీతం.",
        "lyricsEnglish": f"{item['desc']} Performed by Rev. Tony Prakash.",
        "orderIndex": order_counter,
        "createdAt": "2023-03-10T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "isTrack": False
    }
    new_tracks.append(track_obj)
    order_counter += 1

# 2. NEE SANNIDHI Album (10 tracks)
nee_san_meta = [
    {
        "file": "01_Prayer.wav",
        "te": "ప్రార్థన (సన్నిధి ప్రార్థన)",
        "en": "Prayer (Nee Sannidhi)",
        "desc": "Sanctuary invocation and prayer leading the congregation into God's presence."
    },
    {
        "file": "02_Prabhuva_Nee_Sannidhilo.wav",
        "te": "ప్రభువా నీ సన్నిధిలో",
        "en": "Prabhuva Nee Sannidhilo (ప్రభువా నీ సన్నిధిలో)",
        "desc": "Title worship track - Experiencing joy and eternal life in the presence of God."
    },
    {
        "file": "03_Tharatharalalo.wav",
        "te": "తర తరాలలో నీదు ప్రేమ",
        "en": "Tharatharalalo (తర తరాలలో)",
        "desc": "Celebrating God's steadfast covenant enduring through all generations."
    },
    {
        "file": "04_Priyamaina_Yesu.wav",
        "te": "ప్రియమైన యేసు",
        "en": "Priyamaina Yesu (ప్రియమైన యేసు)",
        "desc": "Intimate adoration of Jesus the beloved bridegroom of our souls."
    },
    {
        "file": "05_Parama_Vaidhyuda.wav",
        "te": "పరమ వైద్యుడా స్వస్థపరచుమా",
        "en": "Parama Vaidhyuda (పరమ వైద్యుడా)",
        "desc": "Healing prayer song invoking Jehovah Rapha, the divine Great Physician."
    },
    {
        "file": "06_Yesu_Prema_Kanna.wav",
        "te": "యేసు ప్రేమ కన్నా మిన్నయైనది",
        "en": "Yesu Prema Kanna (యేసు ప్రేమ కన్నా)",
        "desc": "Declaring that nothing in heaven or earth compares to Christ's love."
    },
    {
        "file": "07_Repu_Maapu.wav",
        "te": "రేపూ మాపూ నిన్నే స్తుతింతును",
        "en": "Repu Maapu (రేపూ మాపూ)",
        "desc": "Praising the Lord continuously from daybreak till nightfall."
    },
    {
        "file": "08_Nee_Krupa_Chalunu.wav",
        "te": "నీ కృప చాలును ప్రభువా",
        "en": "Nee Krupa Chalunu (నీ కృప చాలును)",
        "desc": "Finding peace in the truth that God's grace is sufficient in every trial."
    },
    {
        "file": "09_Naakunna_Madhura_Swaram.wav",
        "te": "నాకున్న మధుర స్వరం నీదే",
        "en": "Naakunna Madhura Swaram (నాకున్న మధుర స్వరం)",
        "desc": "Dedication of voice and breath as an offering back to the Creator."
    },
    {
        "file": "10_Manohara.wav",
        "te": "మనోహరా నా యేసయ్య",
        "en": "Manohara (మనోహరా)",
        "desc": "Awe-inspiring praise honoring the beauty and holiness of Jesus Christ."
    },
]

for idx, item in enumerate(nee_san_meta):
    fname = item["file"]
    full_path = os.path.join(serv_base, "nee sannidhi", fname)
    dur = get_wav_duration_str(full_path)
    tid = f"tp-album-nee-sannidhi-{idx+1}"
    slug = f"nee-sannidhi-{idx+1}-{fname.replace('.wav', '').lower()}"
    audio_url = f"/api/audio/nee%20sannidhi/{fname}"
    
    track_obj = {
        "id": tid,
        "slug": slug,
        "titleTelugu": item["te"],
        "titleEnglish": item["en"],
        "albumId": "album-nee-sannidhi",
        "duration": dur,
        "category": "Devotional",
        "isFeatured": idx in [1, 4, 7],
        "isPopular": True,
        "isSubscriberOnly": False,
        "isDownloadable": True,
        "downloadPricePaise": 0,
        "rightsConfirmed": True,
        "audioUrl": audio_url,
        "coverImage": "/covers/002_Nee_Prema_Naaku_Chalu.jpg",
        "composer": "Rev. Tony Prakash",
        "lyricist": "Rev. Tony Prakash",
        "singer": "Rev. Tony Prakash",
        "releaseYear": 2024,
        "status": "PUBLISHED",
        "lyricsTelugu": f"{item['te']} - రేవ. టోనీ ప్రకాష్ గారి 'నీ సన్నిధి' ఆల్బమ్ నుండి ఆరాధనా గీతం.",
        "lyricsEnglish": f"{item['desc']} Performed by Rev. Tony Prakash.",
        "orderIndex": order_counter,
        "createdAt": "2024-02-15T00:00:00Z",
        "updatedAt": "2024-02-15T00:00:00Z",
        "isTrack": False
    }
    new_tracks.append(track_obj)
    order_counter += 1

# 3. Missing 15 Songs from Tony Prakash Hits
hits_meta = [
    {
        "file": "064_yesuva_naa_kristhu.wav",
        "te": "యేసువా నా క్రీస్తు",
        "en": "Yesuva Naa Kristhu (యేసువా నా క్రీస్తు)",
        "cover": "/covers/063_naa_parisudhra.jpg"
    },
    {
        "file": "065_OO_YESAIYA_F.wav",
        "te": "ఓ యేసయ్యా నా ప్రియ బంధువా",
        "en": "Oo Yesaiya (ఓ యేసయ్యా)",
        "cover": "/covers/067_o_yesaiya.jpg"
    },
    {
        "file": "066_poraattam.wav",
        "te": "విశ్వాస పోరాటం",
        "en": "Poraattam (పోరాటం)",
        "cover": "/covers/010_Jayashali.jpg"
    },
    {
        "file": "072_prayer_vocal.wav",
        "te": "ఆరాధన ప్రార్థన",
        "en": "Aradhana Prayer (ఆరాధన ప్రార్థన)",
        "cover": "/covers/001_prayermp3.jpg"
    },
    {
        "file": "073_sthuthulaku_vocal.wav",
        "te": "స్తుతులకు పాత్రుడా",
        "en": "Sthuthulaku Paathruda (స్తుతులకు పాత్రుడా)",
        "cover": "/covers/002_Nee_Prema_Naaku_Chalu.jpg"
    },
    {
        "file": "074_neetho_undipo_vocal.wav",
        "te": "నీతో ఉండిపోనీ ప్రభువా",
        "en": "Neetho Undipo (నీతో ఉండిపో)",
        "cover": "/covers/002_Nee_Prema_Naaku_Chalu.jpg"
    },
    {
        "file": "075_nee_mandhiramulo.wav",
        "te": "నీ మందిరములో ఒక దినము",
        "en": "Nee Mandhiramulo (నీ మందిరములో)",
        "cover": "/covers/018_Nee_Krupa.jpg"
    },
    {
        "file": "076_neethone_ne_nadavalani.wav",
        "te": "నీతోనే నే నడవాలని",
        "en": "Neethone Ne Nadavalani (నీతోనే నే నడవాలని)",
        "cover": "/covers/026_Neeve_Naa_Aradhana.jpg"
    },
    {
        "file": "077_hrudhayama.wav",
        "te": "హృదయమా స్తుతించుమా",
        "en": "Hrudhayama (హృదయమా)",
        "cover": "/covers/003_Ninduga_Naa_Gundelo.jpg"
    },
    {
        "file": "078_mosapokudi.wav",
        "te": "మోసపోకుడి దేవుడు వెక్కిరింపబడడు",
        "en": "Mosa Pokudi (మోసపోకుడి)",
        "cover": "/covers/009_Nyayama_Dharmama.jpg"
    },
    {
        "file": "079_kroththa_paata.wav",
        "te": "కొత్త పాట పాడెదం",
        "en": "Kroththa Paata (కొత్త పాట పాడెదం)",
        "cover": "/covers/022_Sthuthi_Padedono.jpg"
    },
    {
        "file": "080_nee_krupa.wav",
        "te": "నీ కృప లేని క్షణము లేదు",
        "en": "Nee Krupa Leni Kshanamu (నీ కృప)",
        "cover": "/covers/018_Nee_Krupa.jpg"
    },
    {
        "file": "081_rende_rendu.wav",
        "te": "రెండే రెండు మార్గములు",
        "en": "Rende Rendu Margamulu (రెండే రెండు)",
        "cover": "/covers/016_Manishi_Brathuku.jpg"
    },
    {
        "file": "082_naa_paataku.wav",
        "te": "నా పాటకు పల్లవి నీవే",
        "en": "Naa Paataku Pallavi (నా పాటకు పల్లవి)",
        "cover": "/covers/021_Naa_Manchi.jpg"
    },
    {
        "file": "083_neetho_undiponi.wav",
        "te": "నీతో ఉండిపోనీ నా ప్రాణమా",
        "en": "Neetho Undiponi (నీతో ఉండిపోనీ)",
        "cover": "/covers/002_Nee_Prema_Naaku_Chalu.jpg"
    },
]

for idx, item in enumerate(hits_meta):
    fname = item["file"]
    full_path = os.path.join(serv_base, "tonyprakash song", fname)
    dur = get_wav_duration_str(full_path)
    tid = f"tp-hit-song-{idx+1}"
    slug = f"tp-hits-{idx+1}-{fname.replace('.wav', '').lower()}"
    audio_url = f"/api/audio/tonyprakash%20song/{urllib.parse.quote(fname)}"
    
    track_obj = {
        "id": tid,
        "slug": slug,
        "titleTelugu": item["te"],
        "titleEnglish": item["en"],
        "albumId": "album-neetho" if "neetho" in fname else None,
        "duration": dur,
        "category": "Devotional",
        "isFeatured": idx in [2, 4, 7, 13],
        "isPopular": True,
        "isSubscriberOnly": False,
        "isDownloadable": True,
        "downloadPricePaise": 0,
        "rightsConfirmed": True,
        "audioUrl": audio_url,
        "coverImage": item["cover"],
        "composer": "Rev. Tony Prakash",
        "lyricist": "Rev. Tony Prakash",
        "singer": "Rev. Tony Prakash",
        "releaseYear": 2024,
        "status": "PUBLISHED",
        "lyricsTelugu": f"{item['te']} - రేవ. టోనీ ప్రకాష్ గారి ఆరాధనా గీతం.",
        "lyricsEnglish": f"{item['en']} - Telugu Christian Devotional Song by Rev. Tony Prakash.",
        "orderIndex": order_counter,
        "createdAt": "2024-03-01T00:00:00Z",
        "updatedAt": "2024-03-01T00:00:00Z",
        "isTrack": False
    }
    new_tracks.append(track_obj)
    order_counter += 1

all_tracks = existing_tracks + new_tracks
print(f"Total tracks after adding new tracks: {len(all_tracks)}")

with open(tracks_json_path, 'w', encoding='utf-8') as f:
    json.dump(all_tracks, f, ensure_ascii=False, indent=2)

print(f"Successfully wrote {len(all_tracks)} tracks to {tracks_json_path}")

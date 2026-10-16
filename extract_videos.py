import json
import re

path = r"C:\Users\lakki\.gemini\antigravity-ide\brain\8967c19e-7fad-4ed4-bd15-a7dcee6814d3\.system_generated\steps\2355\content.md"

with open(path, "r", encoding="utf-8") as f:
    text = f.read()

m = re.search(r"var ytInitialData = (\{.*?\});</script>", text)
data = json.loads(m.group(1))

videos = []
seen = set()

def parse_time(label):
    match = re.search(r'(\d+)\s*minutes?(?:,\s*(\d+)\s*seconds?)?', label)
    if match:
        mins = int(match.group(1))
        secs = int(match.group(2)) if match.group(2) else 0
        return f"{mins}:{secs:02d}"
    return "5:30"

def categorize(title):
    t = title.lower()
    if "live" in t or "worship" in t:
        return "Live Worship"
    if "promo" in t or "trailer" in t:
        return "Special Promo"
    if "lyric" in t or "official" in t:
        return "Official Music Video"
    return "Devotional Release"

def extract_lockup(obj):
    if isinstance(obj, dict):
        if "lockupViewModel" in obj:
            lvm = obj["lockupViewModel"]
            renderer = lvm.get("rendererContext", {})
            command = renderer.get("commandContext", {}).get("onTap", {}).get("innertubeCommand", {})
            watch = command.get("watchEndpoint", {})
            vid = watch.get("videoId")
            
            meta = lvm.get("metadata", {}).get("lockupMetadataViewModel", {})
            title = meta.get("title", {}).get("content", "").strip()
            
            acc_label = renderer.get("accessibilityContext", {}).get("label", "")
            duration = parse_time(acc_label)

            rows = meta.get("metadata", {}).get("contentMetadataViewModel", {}).get("metadataRows", [])
            views = ""
            published = ""
            for row in rows:
                for part in row.get("metadataParts", []):
                    content = part.get("text", {}).get("content", "").strip()
                    acc = part.get("accessibilityLabel", "").strip()
                    if "view" in acc.lower() or "view" in content.lower():
                        views = acc if acc else f"{content} views"
                    elif "ago" in acc.lower() or "ago" in content.lower():
                        published = acc if acc else content

            if vid and vid not in seen:
                seen.add(vid)
                category = categorize(title)
                videos.append({
                    "id": f"yt-{vid}",
                    "youtubeId": vid,
                    "title": title,
                    "category": category,
                    "description": f"Official video release by Rev. Tony Prakash. {published} • {views}",
                    "thumbnail": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                    "embedUrl": f"https://www.youtube-nocookie.com/embed/{vid}",
                    "youtubeUrl": f"https://www.youtube.com/watch?v={vid}",
                    "duration": duration,
                    "published": published,
                    "views": views,
                    "isFeatured": len(videos) < 6,
                    "orderIndex": len(videos) + 1,
                    "status": "PUBLISHED"
                })

        for v in obj.values():
            extract_lockup(v)
    elif isinstance(obj, list):
        for item in obj:
            extract_lockup(item)

extract_lockup(data)

print(f"Extracted {len(videos)} official YouTube videos from Dad's channel @TonyPrakashOfficial:")
for i, v in enumerate(videos):
    safe_title = v['title'].encode('ascii', 'replace').decode('ascii')
    print(f"{i+1:2d}. [{v['duration']}] {v['youtubeId']} | {safe_title[:50]}... | {v['views']} | {v['published']}")

with open(r"h:\pranith's files\new project\frontend\src\services\tonyVideos.json", "w", encoding="utf-8") as out:
    json.dump(videos, out, indent=2, ensure_ascii=False)

# Also write to backend seeds or public json if needed
with open(r"h:\pranith's files\new project\backend\src\data\tonyVideos.json", "w", encoding="utf-8") as out:
    json.dump(videos, out, indent=2, ensure_ascii=False)

print("\nSuccessfully saved to frontend and backend tonyVideos.json!")

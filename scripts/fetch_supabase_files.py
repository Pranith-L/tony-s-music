import requests
import json

SUPABASE_URL = "https://mrehomunxqccvcwpkwxd.supabase.co"
API_KEY = "sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9"

headers = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def list_folder(prefix=""):
    url = f"{SUPABASE_URL}/storage/v1/object/list/songs"
    payload = {
        "prefix": prefix,
        "limit": 1000,
        "offset": 0,
        "sortBy": {"column": "name", "order": "asc"}
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=15)
    if resp.status_code == 200:
        return resp.json()
    else:
        print(f"Error listing {prefix}: {resp.status_code} {resp.text}")
        return []

all_objects = []

# List root
root_items = list_folder("")
print(f"Root items ({len(root_items)}):")
for item in root_items:
    name = item.get("name", "")
    print(f"  - {name} (id: {item.get('id')})")
    if item.get("id") is None: # It's a folder!
        sub_items = list_folder(name)
        print(f"    Sub-folder '{name}' has {len(sub_items)} items:")
        for s in sub_items:
            s_name = f"{name}/{s.get('name')}"
            if s.get("id") is None: # nested folder (like albums/...)
                nested = list_folder(s_name)
                print(f"      Nested '{s_name}' has {len(nested)} items:")
                for n in nested:
                    all_objects.append(f"{s_name}/{n.get('name')}")
            else:
                all_objects.append(s_name)
    else:
        all_objects.append(name)

print(f"\nTOTAL FILES IN SUPABASE 'songs' BUCKET: {len(all_objects)}")
with open("H:/new project/scripts/supabase_all_files.json", "w", encoding="utf-8") as f:
    json.dump(all_objects, f, indent=2)
print("Saved to H:/new project/scripts/supabase_all_files.json")


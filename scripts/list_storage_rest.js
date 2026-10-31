const fetch = globalThis.fetch;

async function listFolder(prefix) {
  const url = `https://mrehomunxqccvcwpkwxd.supabase.co/storage/v1/object/list/songs`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': 'sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9',
      'Authorization': 'Bearer sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prefix: prefix,
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })
  });

  const data = await res.json();
  console.log(`Prefix "${prefix}": status ${res.status}, items:`, data.length, data.slice(0, 5));
  return data;
}

async function main() {
  await listFolder('');
  await listFolder('devotional');
  await listFolder('albums');
  await listFolder('tracks');
}

main().catch(console.error);


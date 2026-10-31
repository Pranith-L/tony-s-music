$baseUrl = "https://mrehomunxqccvcwpkwxd.supabase.co/storage/v1/object/public/songs"
$testPaths = @(
    "01_Devotional_Songs/001_Prayer.mp3",
    "01_Devotional_Songs/002_Nee_Prema_Naaku_Chalu.mp3",
    "02_Albums/Naa_Aasha/084_Naa_Aasha_Neeve.mp3",
    "02_Albums/Neetho/171_Neeve_Naa_Paataku.mp3",
    "03_Studio_Minus_One_Tracks/069_Manasunna_Manchi_Devuda.mp3",
    "001_Prayer.mp3",
    "Tony_Prakash_MP3_Library/01_Devotional_Songs/001_Prayer.mp3"
)

foreach ($p in $testPaths) {
    $url = "$baseUrl/$p"
    try {
        $res = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -ErrorAction Stop
        Write-Host "[SUCCESS 200] $url (Bytes: $($res.RawContentLength))"
    } catch {
        $msg = $_.Exception.Message
        Write-Host "[FAIL] $url -> $msg"
    }
}


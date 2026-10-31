$tracks = Get-Content "H:\new project\frontend\src\services\generatedTracks.json" | ConvertFrom-Json
$wavFiles = Get-ChildItem -Path "H:\new project\Tony_Prakash_Master_Library" -Recurse -Filter *.wav
Write-Host "Tracks in JSON: $($tracks.Count)"
Write-Host "WAV files on disk: $($wavFiles.Count)"

$unmatched = @()
foreach ($t in $tracks) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($t.audioUrl)
    $found = $wavFiles | Where-Object { $_.BaseName -eq $baseName }
    if (-not $found) {
        $unmatched += $baseName
    }
}

Write-Host "Unmatched track filenames: $($unmatched.Count)"
if ($unmatched.Count -gt 0) {
    $unmatched | Select-Object -First 10
}


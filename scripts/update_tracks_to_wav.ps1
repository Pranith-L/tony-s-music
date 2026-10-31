$jsonPath = "H:\new project\frontend\src\services\generatedTracks.json"
$tracks = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($t in $tracks) {
    if ($t.audioUrl) {
        $t.audioUrl = $t.audioUrl -replace '\.mp3$', '.wav'
    }
    $t | Add-Member -NotePropertyName "wavStoragePath" -NotePropertyValue ($t.mp3StoragePath -replace '\.mp3$', '.wav') -Force
    $t | Add-Member -NotePropertyName "wavFileName" -NotePropertyValue ($t.mp3FileName -replace '\.mp3$', '.wav') -Force
}

$updatedJson = $tracks | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($jsonPath, $updatedJson, [System.Text.Encoding]::UTF8)

Write-Host "Updated $($tracks.Count) tracks in generatedTracks.json with .wav URLs."


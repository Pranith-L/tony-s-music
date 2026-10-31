$raw = Get-Content "H:\new project\frontend\src\services\generatedTracks.json" -Raw | ConvertFrom-Json
$first = $raw[0]
Write-Host "id: $($first.id)"
Write-Host "title: $($first.titleEnglish)"
Write-Host "audioUrl: $($first.audioUrl)"
Write-Host "mp3StoragePath: $($first.mp3StoragePath)"


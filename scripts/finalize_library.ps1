# 1. Rename WAV in Master Library
$wavDir = "H:\new project\Tony_Prakash_Master_Library\03_Studio_Minus_One_Tracks"
Get-ChildItem -LiteralPath $wavDir | Where-Object { $_.Name -like "*125*" } | ForEach-Object {
    $targetName = "125_Nuthanamainadhi_Nee_Vathsalyamu_Song_Track.wav"
    if ($_.Name -ne $targetName) {
        $dest = Join-Path $wavDir $targetName
        Move-Item -LiteralPath $_.FullName -Destination $dest -Force
        Write-Host "Renamed WAV to $targetName"
    }
}

# 2. In MP3 directories, delete the Telugu duplicate
$mp3Dirs = @(
    "H:\new project\Tony_Prakash_MP3_Library\03_Studio_Minus_One_Tracks",
    "H:\pranith's files\new project\Tony_Prakash_MP3_Library\03_Studio_Minus_One_Tracks"
)

foreach ($dir in $mp3Dirs) {
    if (Test-Path -LiteralPath $dir) {
        Get-ChildItem -LiteralPath $dir | Where-Object { $_.Name -like "*125*" } | ForEach-Object {
            if ($_.Name -ne "125_Nuthanamainadhi_Nee_Vathsalyamu_Song_Track.mp3") {
                Remove-Item -LiteralPath $_.FullName -Force
                Write-Host "Deleted duplicate file: $($_.Name)"
            }
        }
    }
}

# 3. Final counts
$masterWavCount = (Get-ChildItem -Path "H:\new project\Tony_Prakash_Master_Library" -Recurse -Filter *.wav).Count
$masterMp3Count = (Get-ChildItem -Path "H:\new project\Tony_Prakash_Master_Library" -Recurse -Filter *.mp3).Count
$mp3Dir1Count = (Get-ChildItem -Path "H:\new project\Tony_Prakash_MP3_Library" -Recurse -Filter *.mp3).Count
$mp3Dir2Count = (Get-ChildItem -Path "H:\pranith's files\new project\Tony_Prakash_MP3_Library" -Recurse -Filter *.mp3).Count

Write-Host "================ FINAL VERIFICATION ================"
Write-Host "Tony_Prakash_Master_Library WAV: $masterWavCount"
Write-Host "Tony_Prakash_Master_Library MP3: $masterMp3Count"
Write-Host "Tony_Prakash_MP3_Library 1 MP3:  $mp3Dir1Count"
Write-Host "Tony_Prakash_MP3_Library 2 MP3:  $mp3Dir2Count"
Write-Host "===================================================="

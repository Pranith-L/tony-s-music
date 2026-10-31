$masterDir = "H:\new project\Tony_Prakash_Master_Library"
$mp3Dir1 = "H:\new project\Tony_Prakash_MP3_Library"
$mp3Dir2 = "H:\pranith's files\new project\Tony_Prakash_MP3_Library"

# 1. Rename any question mark WAV or MP3 files in master library
$badWav = Join-Path $masterDir "03_Studio_Minus_One_Tracks\125_??????_?_??????____Song_Track.wav"
$goodWav = Join-Path $masterDir "03_Studio_Minus_One_Tracks\125_Nuthanamainadhi_Nee_Vathsalyamu_Song_Track.wav"

if (Test-Path -LiteralPath $badWav) {
    Move-Item -LiteralPath $badWav -Destination $goodWav -Force
    Write-Host "Renamed question-mark WAV to 125_Nuthanamainadhi_Nee_Vathsalyamu_Song_Track.wav"
}

# 2. In MP3 directories, remove the duplicate question mark mp3
$badMp3_1 = Join-Path $mp3Dir1 "03_Studio_Minus_One_Tracks\125_??????_?_??????____Song_Track.mp3"
$badMp3_2 = Join-Path $mp3Dir2 "03_Studio_Minus_One_Tracks\125_??????_?_??????____Song_Track.mp3"

if (Test-Path -LiteralPath $badMp3_1) {
    Remove-Item -LiteralPath $badMp3_1 -Force
    Write-Host "Removed bad MP3 from MP3 Library 1"
}
if (Test-Path -LiteralPath $badMp3_2) {
    Remove-Item -LiteralPath $badMp3_2 -Force
    Write-Host "Removed bad MP3 from MP3 Library 2"
}

# 3. Remove ALL MP3 files from Master Library
$masterMp3s = Get-ChildItem -Path $masterDir -Recurse -Filter *.mp3
Write-Host "Found $($masterMp3s.Count) MP3 files in Master Library to remove."
$removedCount = 0
foreach ($f in $masterMp3s) {
    Remove-Item -LiteralPath $f.FullName -Force
    $removedCount++
}
Write-Host "Removed $removedCount MP3 files from $masterDir."

# 4. Verify counts
$masterWavCount = (Get-ChildItem -Path $masterDir -Recurse -Filter *.wav).Count
$masterMp3Count = (Get-ChildItem -Path $masterDir -Recurse -Filter *.mp3).Count
$mp3Dir1Count = (Get-ChildItem -Path $mp3Dir1 -Recurse -Filter *.mp3).Count
$mp3Dir2Count = (Get-ChildItem -Path $mp3Dir2 -Recurse -Filter *.mp3).Count

Write-Host "================ VERIFICATION ================"
Write-Host "Tony_Prakash_Master_Library WAV files: $masterWavCount (Expected: 171)"
Write-Host "Tony_Prakash_Master_Library MP3 files: $masterMp3Count (Expected: 0)"
Write-Host "Tony_Prakash_MP3_Library 1 MP3 files:  $mp3Dir1Count (Expected: 171)"
Write-Host "Tony_Prakash_MP3_Library 2 MP3 files:  $mp3Dir2Count (Expected: 171)"
Write-Host "=============================================="


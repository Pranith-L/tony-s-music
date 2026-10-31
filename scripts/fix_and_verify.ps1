$mp3Dir1 = "H:\new project\Tony_Prakash_MP3_Library\03_Studio_Minus_One_Tracks"
$mp3Dir2 = "H:\pranith's files\new project\Tony_Prakash_MP3_Library\03_Studio_Minus_One_Tracks"

$files1 = Get-ChildItem -LiteralPath $mp3Dir1
foreach ($f in $files1) {
    if ($f.Name -match '\?{2,}') {
        Write-Host "Found corrupted name in dir 1: $($f.Name)"
        Remove-Item -LiteralPath $f.FullName -Force
    }
}

$files2 = Get-ChildItem -LiteralPath $mp3Dir2
foreach ($f in $files2) {
    if ($f.Name -match '\?{2,}') {
        Write-Host "Found corrupted name in dir 2: $($f.Name)"
        Remove-Item -LiteralPath $f.FullName -Force
    }
}

$count1 = (Get-ChildItem -Path "H:\new project\Tony_Prakash_MP3_Library" -Recurse -Filter *.mp3).Count
$count2 = (Get-ChildItem -Path "H:\pranith's files\new project\Tony_Prakash_MP3_Library" -Recurse -Filter *.mp3).Count
$masterWavCount = (Get-ChildItem -Path "H:\new project\Tony_Prakash_Master_Library" -Recurse -Filter *.wav).Count
$masterMp3Count = (Get-ChildItem -Path "H:\new project\Tony_Prakash_Master_Library" -Recurse -Filter *.mp3).Count

Write-Host "Tony_Prakash_Master_Library: WAV = $masterWavCount, MP3 = $masterMp3Count"
Write-Host "Tony_Prakash_MP3_Library (H:\new project): MP3 = $count1"
Write-Host "Tony_Prakash_MP3_Library (H:\pranith's files): MP3 = $count2"


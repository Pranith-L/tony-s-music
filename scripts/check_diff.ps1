$sourceDir = "H:\new project\Tony_Prakash_Master_Library\"
$targetDir = "H:\new project\Tony_Prakash_MP3_Library\"

$masterMp3s = (Get-ChildItem -Path $sourceDir -Recurse -Filter *.mp3).FullName | ForEach-Object { $_.Substring($sourceDir.Length) }
$targetMp3s = (Get-ChildItem -Path $targetDir -Recurse -Filter *.mp3).FullName | ForEach-Object { $_.Substring($targetDir.Length) }

Write-Host "Master count: $($masterMp3s.Count)"
Write-Host "Target count: $($targetMp3s.Count)"

$diff = Compare-Object -ReferenceObject $masterMp3s -DifferenceObject $targetMp3s
$diff | Format-Table -AutoSize


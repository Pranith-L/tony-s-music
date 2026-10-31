$sourceDir = "H:\new project\Tony_Prakash_Master_Library"
$targetMp3Dir1 = "H:\new project\Tony_Prakash_MP3_Library"
$targetMp3Dir2 = "H:\pranith's files\new project\Tony_Prakash_MP3_Library"

# 1. Create target MP3 directories
New-Item -ItemType Directory -Force -Path $targetMp3Dir1 | Out-Null
New-Item -ItemType Directory -Force -Path $targetMp3Dir2 | Out-Null

# 2. Get all MP3 files
$mp3Files = Get-ChildItem -Path $sourceDir -Recurse -Filter *.mp3
Write-Host "Found $($mp3Files.Count) MP3 files in Master Library."

# 3. Copy MP3s to new dedicated MP3 libraries
foreach ($file in $mp3Files) {
    $relativePath = $file.FullName.Substring($sourceDir.Length).TrimStart('\', '/')
    $dest1 = Join-Path $targetMp3Dir1 $relativePath
    $dest2 = Join-Path $targetMp3Dir2 $relativePath
    
    $parent1 = Split-Path $dest1 -Parent
    $parent2 = Split-Path $dest2 -Parent
    
    if (-not (Test-Path $parent1)) { New-Item -ItemType Directory -Force -Path $parent1 | Out-Null }
    if (-not (Test-Path $parent2)) { New-Item -ItemType Directory -Force -Path $parent2 | Out-Null }
    
    Copy-Item -Path $file.FullName -Destination $dest1 -Force
    Copy-Item -Path $file.FullName -Destination $dest2 -Force
}

$copied1 = (Get-ChildItem -Path $targetMp3Dir1 -Recurse -Filter *.mp3).Count
$copied2 = (Get-ChildItem -Path $targetMp3Dir2 -Recurse -Filter *.mp3).Count
Write-Host "Copied $copied1 MP3s to $targetMp3Dir1"
Write-Host "Copied $copied2 MP3s to $targetMp3Dir2"

# 4. Remove all MP3s from Tony_Prakash_Master_Library
if ($copied1 -eq 171) {
    $removed = 0
    foreach ($file in $mp3Files) {
        Remove-Item -Path $file.FullName -Force
        $removed++
    }
    Write-Host "Successfully removed $removed MP3 files from $sourceDir."
} else {
    Write-Error "Safety check failed: copied count ($copied1) does not equal 171. Did not delete."
}


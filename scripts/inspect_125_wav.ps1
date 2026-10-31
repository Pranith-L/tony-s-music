$wavDir = "H:\new project\Tony_Prakash_Master_Library\03_Studio_Minus_One_Tracks"
Get-ChildItem -LiteralPath $wavDir | Where-Object { $_.Name -like "*125*" } | ForEach-Object {
    Write-Host "Name: $($_.Name)"
    Write-Host "Length: $($_.Length)"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($_.Name)
    Write-Host "Bytes: $($bytes -join ' ')"
}


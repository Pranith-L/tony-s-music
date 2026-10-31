$url = "https://mrehomunxqccvcwpkwxd.supabase.co/storage/v1/object/public/songs/01_Devotional_Songs/001_Prayer.mp3"
try {
    $req = [System.Net.WebRequest]::Create($url)
    $res = $req.GetResponse()
    Write-Host "Success: $($res.StatusCode)"
} catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($resp) {
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Status: $([int]$resp.StatusCode) ($($resp.StatusCode))"
        Write-Host "Body: $body"
    } else {
        Write-Host "Exception: $($_.Exception.Message)"
    }
}


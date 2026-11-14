Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\Admin\.gemini\antigravity\brain\4d223c7a-b75a-4019-891d-4a395a68d658\.user_uploaded\media_1794058886934_12b602d6.jpg'
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$src = [System.Drawing.Image]::FromFile($srcPath)
Write-Output "Source loaded: $($src.Width)x$($src.Height)"

# Square center crop
$cropSize = $src.Height
$cropX = [int](($src.Width - $cropSize) / 2)
$cropY = 0

function Create-Icon($targetSize, $destPath, $isRound = $false) {
    $bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $targetSize, $targetSize)
        $g.SetClip($path)
    }

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetSize, $targetSize)
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)

    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    if ($isRound) {
        $borderW = [Math]::Max(2, [int]($targetSize / 40))
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 243, 255), $borderW)
        $g.ResetClip()
        $g.DrawEllipse($pen, [int]($borderW/2), [int]($borderW/2), $targetSize - $borderW, $targetSize - $borderW)
        $pen.Dispose()
    }

    $g.Dispose()

    $dir = [System.IO.Path]::GetDirectoryName($destPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated: $destPath ($targetSize x $targetSize)"
}

# 1. Root web / PWA icons
Create-Icon 512 "$PSScriptRoot\icon-512.png"
Create-Icon 192 "$PSScriptRoot\icon-192.png"
Create-Icon 512 "$PSScriptRoot\logo.png"

# 2. Android app assets copy
Create-Icon 512 "$PSScriptRoot\android\app\src\main\assets\icon-512.png"
Create-Icon 192 "$PSScriptRoot\android\app\src\main\assets\icon-192.png"

# 3. Android Native Mipmap Launcher icons (standard & round)
Create-Icon 48  "$PSScriptRoot\android\app\src\main\res\mipmap-mdpi\ic_launcher.png"
Create-Icon 48  "$PSScriptRoot\android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png" $true

Create-Icon 72  "$PSScriptRoot\android\app\src\main\res\mipmap-hdpi\ic_launcher.png"
Create-Icon 72  "$PSScriptRoot\android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png" $true

Create-Icon 96  "$PSScriptRoot\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png"
Create-Icon 96  "$PSScriptRoot\android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png" $true

Create-Icon 144 "$PSScriptRoot\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png"
Create-Icon 144 "$PSScriptRoot\android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png" $true

Create-Icon 192 "$PSScriptRoot\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"
Create-Icon 192 "$PSScriptRoot\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png" $true

$src.Dispose()
Write-Output "All icons successfully created from user uploaded image!"


param(
  [Parameter(Mandatory = $true)]
  [string]$Source,

  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory,

  [Parameter(Mandatory = $true)]
  [string]$Brand,

  [string]$BackgroundColor = "#FBDB04",
  [double]$MarkFraction = 0.52
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $Source -PathType Leaf)) {
  throw "Source image not found: $Source"
}

if ($MarkFraction -le 0 -or $MarkFraction -gt 0.7) {
  throw "MarkFraction must be greater than 0 and at most 0.7."
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputDirectory "store") -Force | Out-Null

$sourceImage = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $Source))

try {
  $minX = $sourceImage.Width
  $minY = $sourceImage.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $sourceImage.Height; $y++) {
    for ($x = 0; $x -lt $sourceImage.Width; $x++) {
      if ($sourceImage.GetPixel($x, $y).A -gt 8) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    throw "The source image does not contain a visible mark."
  }

  $sourceBounds = [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)

  function New-Canvas {
    param(
      [int]$Size,
      [bool]$Transparent,
      [bool]$Monochrome = $false
    )

    $pixelFormat = if ($Transparent) {
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    } else {
      [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
    }
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, $pixelFormat)
    $bitmap.SetResolution(72, 72)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

      if ($Transparent) {
        $graphics.Clear([System.Drawing.Color]::Transparent)
      } else {
        $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($BackgroundColor))
      }

      $maxMarkSize = $Size * $MarkFraction
      $scale = [Math]::Min($maxMarkSize / $sourceBounds.Width, $maxMarkSize / $sourceBounds.Height)
      $width = [Math]::Max(1, [int][Math]::Round($sourceBounds.Width * $scale))
      $height = [Math]::Max(1, [int][Math]::Round($sourceBounds.Height * $scale))
      $left = [int][Math]::Round(($Size - $width) / 2)
      $top = [int][Math]::Round(($Size - $height) / 2)
      $destination = New-Object System.Drawing.Rectangle($left, $top, $width, $height)

      if ($Monochrome) {
        $matrix = New-Object System.Drawing.Imaging.ColorMatrix
        $matrix.Matrix00 = 0; $matrix.Matrix01 = 0; $matrix.Matrix02 = 0; $matrix.Matrix03 = 0; $matrix.Matrix04 = 0
        $matrix.Matrix10 = 0; $matrix.Matrix11 = 0; $matrix.Matrix12 = 0; $matrix.Matrix13 = 0; $matrix.Matrix14 = 0
        $matrix.Matrix20 = 0; $matrix.Matrix21 = 0; $matrix.Matrix22 = 0; $matrix.Matrix23 = 0; $matrix.Matrix24 = 0
        $matrix.Matrix30 = 0; $matrix.Matrix31 = 0; $matrix.Matrix32 = 0; $matrix.Matrix33 = 1; $matrix.Matrix34 = 0
        $matrix.Matrix40 = 1; $matrix.Matrix41 = 1; $matrix.Matrix42 = 1; $matrix.Matrix43 = 0; $matrix.Matrix44 = 1
        $attributes = New-Object System.Drawing.Imaging.ImageAttributes
        try {
          $attributes.SetColorMatrix($matrix)
          $graphics.DrawImage($sourceImage, $destination, $sourceBounds.X, $sourceBounds.Y, $sourceBounds.Width, $sourceBounds.Height, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
        } finally {
          $attributes.Dispose()
        }
      } else {
        $graphics.DrawImage($sourceImage, $destination, $sourceBounds, [System.Drawing.GraphicsUnit]::Pixel)
      }
    } finally {
      $graphics.Dispose()
    }

    return $bitmap
  }

  function Save-Png {
    param(
      [System.Drawing.Bitmap]$Bitmap,
      [string]$Path
    )

    try {
      $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $Bitmap.Dispose()
    }
  }

  Save-Png (New-Canvas -Size 1024 -Transparent $false) (Join-Path $OutputDirectory "$Brand-icon.png")
  Save-Png (New-Canvas -Size 1024 -Transparent $true) (Join-Path $OutputDirectory "$Brand-adaptive-foreground.png")
  Save-Png (New-Canvas -Size 1024 -Transparent $true -Monochrome $true) (Join-Path $OutputDirectory "$Brand-monochrome.png")
  Save-Png (New-Canvas -Size 1024 -Transparent $true) (Join-Path $OutputDirectory "$Brand-splash.png")
  Save-Png (New-Canvas -Size 512 -Transparent $false) (Join-Path (Join-Path $OutputDirectory "store") "$Brand-google-play-icon-512.png")
  Save-Png (New-Canvas -Size 48 -Transparent $false) (Join-Path $OutputDirectory "$Brand-favicon.png")

  Write-Output "Generated $Brand assets with mark fraction $MarkFraction from bounds $sourceBounds."
} finally {
  $sourceImage.Dispose()
}

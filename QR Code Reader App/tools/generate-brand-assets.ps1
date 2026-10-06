param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

Add-Type -AssemblyName System.Drawing

$assetRoot = Join-Path $ProjectRoot "assets"
$brandRoot = Join-Path $assetRoot "brand"
New-Item -ItemType Directory -Force -Path $brandRoot | Out-Null

$dark = [System.Drawing.ColorTranslator]::FromHtml("#0B0F17")
$green = [System.Drawing.ColorTranslator]::FromHtml("#59C639")

function New-QodeArtwork {
  param(
    [int]$Size,
    [bool]$TransparentBackground,
    [double]$ArtworkScale = 1.0,
    [string]$OutputPath
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bitmap.SetResolution(144, 144)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  if ($TransparentBackground) {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear($dark)
  }

  $scale = $Size / 1024.0
  $pen = New-Object System.Drawing.Pen($green, (84 * $scale * $ArtworkScale))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  function Point([double]$x, [double]$y) {
    $scaledX = 512 + (($x - 512) * $ArtworkScale)
    $scaledY = 512 + (($y - 512) * $ArtworkScale)
    return New-Object System.Drawing.PointF(($scaledX * $scale), ($scaledY * $scale))
  }

  $graphics.DrawLines($pen, [System.Drawing.PointF[]]@(
    (Point 452 258), (Point 350 258), (Point 304 274), (Point 274 304), (Point 258 350), (Point 258 452)
  ))
  $graphics.DrawLines($pen, [System.Drawing.PointF[]]@(
    (Point 572 258), (Point 674 258), (Point 720 274), (Point 750 304), (Point 766 350), (Point 766 452)
  ))
  $graphics.DrawLines($pen, [System.Drawing.PointF[]]@(
    (Point 258 572), (Point 258 674), (Point 274 720), (Point 304 750), (Point 350 766), (Point 452 766)
  ))
  $graphics.DrawLines($pen, [System.Drawing.PointF[]]@(
    (Point 766 572), (Point 766 674), (Point 750 720), (Point 720 750), (Point 674 766), (Point 572 766)
  ))
  $graphics.DrawLine($pen, (Point 724 724), (Point 840 840))

  $brush = New-Object System.Drawing.SolidBrush($green)
  $centerSize = 92 * $ArtworkScale
  $centerOffset = 512 - ($centerSize / 2)
  $centerRect = New-Object System.Drawing.RectangleF(($centerOffset * $scale), ($centerOffset * $scale), ($centerSize * $scale), ($centerSize * $scale))
  $graphics.FillRectangle($brush, $centerRect)

  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $brush.Dispose()
  $pen.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-QodeArtwork -Size 1024 -TransparentBackground $false -OutputPath (Join-Path $assetRoot "qode-icon.png")
# Android crops adaptive foreground layers beyond the central safe zone. Keep the
# mark smaller here so every launcher mask shows the complete Q and its tail.
New-QodeArtwork -Size 1024 -TransparentBackground $true -ArtworkScale 0.78 -OutputPath (Join-Path $assetRoot "qode-adaptive-foreground.png")
New-QodeArtwork -Size 1024 -TransparentBackground $true -OutputPath (Join-Path $assetRoot "qode-splash.png")
New-QodeArtwork -Size 512 -TransparentBackground $false -OutputPath (Join-Path $brandRoot "qode-play-store-icon.png")

Write-Output "Generated Qode brand assets in $assetRoot"

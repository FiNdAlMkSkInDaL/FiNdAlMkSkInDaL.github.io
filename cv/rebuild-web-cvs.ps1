# Rebuild public CV PDFs with the phone number stripped.
# Application sources under Desktop/CV_Optimized are not modified.
$ErrorActionPreference = "Stop"

$cvRoot = Join-Path $env:USERPROFILE "OneDrive - University College London\Desktop\CV_Optimized"
$webCv = Split-Path -Parent $MyInvocation.MyCommand.Path

$typst = Get-Command typst -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $typst) {
  $typst = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages\Typst.Typst_Microsoft.Winget.Source_8wekyb3d8bbwe\typst-aarch64-pc-windows-msvc\typst.exe"
}
if (-not (Test-Path $typst)) { throw "Typst CLI not found." }
if (-not (Test-Path $cvRoot)) { throw "CV_Optimized not found at $cvRoot" }

$jobs = @(
  @{ Track = "track-quant"; Out = "Finlay_Phillips_CV_Software_Data.pdf" },
  @{ Track = "track-ml";    Out = "Finlay_Phillips_CV_ML.pdf" },
  @{ Track = "track-eee";   Out = "Finlay_Phillips_CV_EEE.pdf" }
)

foreach ($j in $jobs) {
  $src = Join-Path $cvRoot "$($j.Track)\cv.typ"
  $tmp = Join-Path $cvRoot "$($j.Track)\cv-web.typ"
  $out = Join-Path $webCv $j.Out
  $text = Get-Content -Raw -Path $src
  if ($text -notmatch '\+44 7943 850187') {
    throw "Phone line missing in $src — aborting so a numbered CV cannot ship by accident."
  }
  $stripped = $text -replace '(?m)^\s*"\+44 7943 850187",\r?\n', ''
  if ($stripped -eq $text) { throw "Failed to strip phone from $src" }
  Set-Content -Path $tmp -Value $stripped -NoNewline -Encoding utf8
  try {
    & $typst compile --root $cvRoot $tmp $out
    if ($LASTEXITCODE -ne 0) { throw "typst failed for $($j.Track)" }
  } finally {
    if (Test-Path $tmp) { Remove-Item -Force $tmp }
  }
}

Get-ChildItem $webCv -Filter "Finlay_Phillips_CV_*.pdf" |
  ForEach-Object {
    if (Select-String -Path $_.FullName -Pattern "7943|850187") {
      throw "Phone number still present in $($_.Name)"
    }
    Write-Host "ok $($_.Name)"
  }

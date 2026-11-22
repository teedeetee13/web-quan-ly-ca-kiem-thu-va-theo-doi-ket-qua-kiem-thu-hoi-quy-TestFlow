# Cập nhật mục lục, danh mục bảng/hình (số trang) bằng Microsoft Word rồi xuất PDF;
# xuất PDF cho slide bằng PowerPoint. Cần cài Microsoft Office.
# Chạy: npm run pdf   (hoặc: powershell -ExecutionPolicy Bypass -File export-pdf.ps1)
$ErrorActionPreference = 'Stop'
$out = Resolve-Path (Join-Path $PSScriptRoot '..\..\HO_SO_NOP')

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  foreach ($f in Get-ChildItem $out -Filter *.docx) {
    if ($f.Name.StartsWith('~$')) { continue }
    $doc = $word.Documents.Open($f.FullName)
    # Cập nhật hai lần: lần đầu điền mục lục làm dịch trang, lần hai sửa lại số trang.
    for ($i = 0; $i -lt 2; $i++) {
      foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
      $doc.Fields.Update() | Out-Null
    }
    $doc.Save()
    $pdf = [IO.Path]::ChangeExtension($f.FullName, '.pdf')
    $doc.ExportAsFixedFormat($pdf, 17)   # 17 = wdExportFormatPDF
    "Word  -> $pdf  ($($doc.ComputeStatistics(2)) trang)"
    $doc.Close()
  }
} finally { $word.Quit() }

$pptFiles = Get-ChildItem $out -Filter *.pptx
if ($pptFiles) {
  $ppt = New-Object -ComObject PowerPoint.Application
  try {
    foreach ($f in $pptFiles) {
      $p = $ppt.Presentations.Open($f.FullName, $true, $false, $false)
      $pdf = [IO.Path]::ChangeExtension($f.FullName, '.pdf')
      $p.SaveAs($pdf, 32)                # 32 = ppSaveAsPDF
      "Slide -> $pdf  ($($p.Slides.Count) trang)"
      $p.Close()
    }
  } finally { $ppt.Quit() }
}

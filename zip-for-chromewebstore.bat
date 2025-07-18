@echo off
REM Tabscape Chrome Extension - Zip for Chrome Web Store
REM Usage: Double-click this file in the extension folder

setlocal
set ZIPNAME=tabscape-extension.zip
set EXCLUDE_LIST=.git .gitignore *.zip *.bat

REM Remove old zip if exists
if exist %ZIPNAME% del %ZIPNAME%

REM Use PowerShell's Compress-Archive, excluding common dev files
REM (PowerShell 5+ is default on Windows 10/11)

REM Build exclusion string for PowerShell
set EXCLUDES=
for %%E in (%EXCLUDE_LIST%) do set EXCLUDES=!EXCLUDES! -Exclude %%E

REM Actually run the zip (excluding .git, .gitignore, previous zips, batch files)
REM Note: PowerShell's -Exclude only works for file patterns, not folders, so we remove .git after zipping
powershell -Command "Compress-Archive -Path * -DestinationPath '%ZIPNAME%' -Force -Exclude '.git', '.gitignore', '*.zip', '*.bat'"

REM Remove .git folder from zip if present (workaround for PowerShell limitation)
if exist .git (
  powershell -Command "Add-Type -A 'System.IO.Compression.FileSystem'; $zip = [IO.Compression.ZipFile]::Open('%ZIPNAME%', 'Update'); $entry = $zip.Entries | Where-Object { $_.FullName -like '.git/*' }; foreach ($e in $entry) { $e.Delete() }; $zip.Dispose()"
)

echo Created %ZIPNAME% for Chrome Web Store upload.
pause
endlocal

@echo off
REM Tabscape Chrome Extension - Zip for Chrome Web Store
REM Usage: Double-click this file in the extension folder

setlocal
set ZIPNAME=tabscape-extension.zip
set TMPDIR=%TEMP%\tabscape_zip_tmp

REM Remove old zip and temp folder if exist
if exist %ZIPNAME% del %ZIPNAME%
if exist "%TMPDIR%" rmdir /s /q "%TMPDIR%"

REM Create exclusion list file
set EXCLUDEFILE=zip-exclude.txt
echo .git> %EXCLUDEFILE%
echo .gitignore>> %EXCLUDEFILE%
echo *.zip>> %EXCLUDEFILE%
echo *.bat>> %EXCLUDEFILE%
echo _tabscape_zip_tmp>> %EXCLUDEFILE%
echo docs>> %EXCLUDEFILE%

REM Copy all files except excluded to temp folder
mkdir "%TMPDIR%"
xcopy * "%TMPDIR%" /E /I /Y /EXCLUDE:%EXCLUDEFILE%

REM Zip the temp folder contents
powershell -Command "Compress-Archive -Path '%TMPDIR%\\*' -DestinationPath '%CD%\\%ZIPNAME%' -Force"

REM Clean up temp folder and exclude file
rmdir /s /q "%TMPDIR%"
del %EXCLUDEFILE%

echo Created %ZIPNAME% for Chrome Web Store upload.
echo Output directory: %CD%
endlocal
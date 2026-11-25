@echo off
setlocal
cd /d "%~dp0"
where flutter >nul 2>&1
if errorlevel 1 (
  echo Flutter was not found in PATH.
  echo Open Android Studio Terminal after installing/configuring Flutter.
  pause
  exit /b 1
)
if exist android (
  echo Android folder already exists. Nothing to do.
  pause
  exit /b 0
)
echo Creating Android platform files...
flutter create --platforms=android --project-name campuscart_flutter .
if errorlevel 1 (
  echo Failed to create Android platform files.
  pause
  exit /b 1
)
echo Android platform created successfully.
pause

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$Repo = Split-Path -Parent $PSScriptRoot
Set-Location "$Repo\apps\desktop"
if (!(Test-Path "node_modules")) { npm install }
npm run tauri

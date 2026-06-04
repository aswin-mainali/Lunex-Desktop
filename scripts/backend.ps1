Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$Repo = Split-Path -Parent $PSScriptRoot
Set-Location "$Repo\backend"
if (!(Test-Path ".venv")) { python -m venv .venv }
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8787

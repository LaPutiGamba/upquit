$ErrorActionPreference = "Stop"

$ENV_FILE = ".env"
$EXAMPLE_FILE = ".env.example"

if (Test-Path $ENV_FILE) {
    Write-Host "Error: $ENV_FILE already exists. Delete it to re-run setup."
    exit 1
}

if (-not (Test-Path $EXAMPLE_FILE)) {
    Write-Host "Error: $EXAMPLE_FILE not found. Cannot create $ENV_FILE."
    exit 1
}

Write-Host "Copying $EXAMPLE_FILE -> $ENV_FILE..."
Copy-Item $EXAMPLE_FILE $ENV_FILE

function Generate-Secret {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes) -replace '-', ''
}

Write-Host "Generating JWT_ACCESS_SECRET..."
$JWT_ACCESS_SECRET = Generate-Secret

Write-Host "Generating JWT_REFRESH_SECRET..."
$JWT_REFRESH_SECRET = Generate-Secret

Write-Host "Generating POSTGRES_PASSWORD..."
$POSTGRES_PASSWORD = Generate-Secret

Write-Host ""
Write-Host "Enter your Resend API key (https://resend.com/api-keys)."
Write-Host "Press Enter to skip - emails will be logged to console: "
$RESEND_API_KEY = Read-Host

Write-Host ""
Write-Host "Updating $ENV_FILE..."

$content = Get-Content $ENV_FILE -Raw
$content = $content -replace '^JWT_ACCESS_SECRET=.*', "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
$content = $content -replace '^JWT_REFRESH_SECRET=.*', "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
$content = $content -replace '^POSTGRES_PASSWORD=.*', "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
if ($RESEND_API_KEY) {
    $content = $content -replace '^RESEND_API_KEY=.*', "RESEND_API_KEY=$RESEND_API_KEY"
}
$content | Set-Content $ENV_FILE

Write-Host ""
Write-Host "Done. Generated secrets:"
Write-Host "  - JWT_ACCESS_SECRET"
Write-Host "  - JWT_REFRESH_SECRET"
Write-Host "  - POSTGRES_PASSWORD"
if (-not $RESEND_API_KEY) { Write-Host "  - RESEND_API_KEY (skipped - emails will print to console)" }
Write-Host ""
Write-Host "Run: docker compose up -d"
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
$content = $content -replace '(?m)^JWT_ACCESS_SECRET=.*', "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
$content = $content -replace '(?m)^JWT_REFRESH_SECRET=.*', "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
$content = $content -replace '(?m)^POSTGRES_PASSWORD=.*', "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
if ($RESEND_API_KEY) {
    $content = $content -replace '(?m)^RESEND_API_KEY=.*', "RESEND_API_KEY=$RESEND_API_KEY"
}
$content | Set-Content $ENV_FILE

Write-Host ""
Write-Host "Is this a local development machine? (y/N)"
$IS_LOCAL = Read-Host
if ($IS_LOCAL -notmatch '^[Yy]') {
    $AUTO_IP = ""
    try {
        $addresses = [System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList | Where-Object { $_.AddressFamily -eq 'InterNetwork' -and -not $_.IsLoopback }
        if ($addresses -and $addresses.Length -gt 0) {
            $AUTO_IP = $addresses[0].ToString()
            Write-Host "Auto-detected IP: $AUTO_IP"
        }
    } catch {
    }

    Write-Host "Enter the machine IP to expose services on (leave empty to use auto-detected IP):"
    $MACHINE_IP = Read-Host
    if (-not $MACHINE_IP) { $MACHINE_IP = $AUTO_IP }

    if ($MACHINE_IP) {
        Write-Host "Setting FRONTEND_URL and NEXT_PUBLIC_BACKEND_URL to use $MACHINE_IP"
        $content = Get-Content $ENV_FILE -Raw
        $content = $content -replace '(?m)^FRONTEND_URL=.*', "FRONTEND_URL=http://$MACHINE_IP:3000"
        $content = $content -replace '(?m)^NEXT_PUBLIC_BACKEND_URL=.*', "NEXT_PUBLIC_BACKEND_URL=http://$MACHINE_IP:8080"
        $content | Set-Content $ENV_FILE
    } else {
        Write-Host "No machine IP provided or detected; keeping defaults (localhost)."
    }
}

Write-Host ""
Write-Host "Creating symlinks for apps..."

$TARGETS = @("apps/frontend/.env", "apps/backend/.env")
$AbsoluteEnv = Join-Path $PWD $ENV_FILE

function Test-IsSymlink {
    param([string]$Path)
    try {
        $item = Get-Item $Path -Force -ErrorAction Stop
        return ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0
    } catch {
        return $false
    }
}

$cmdArgs = "/c "
foreach ($target in $TARGETS) {
    if (Test-Path $target) {
        Remove-Item $target -Force -ErrorAction SilentlyContinue
    }
    $absTarget = Join-Path $PWD $target
    $cmdArgs += "mklink `"$absTarget`" `"$AbsoluteEnv`" & "
}
$cmdArgs += "exit"

$pinfo = New-Object System.Diagnostics.ProcessStartInfo
$pinfo.FileName = "cmd.exe"
$pinfo.Arguments = $cmdArgs
$pinfo.UseShellExecute = $false
$pinfo.RedirectStandardError = $true
$pinfo.RedirectStandardOutput = $true
$pinfo.CreateNoWindow = $true
$pinfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$proc = [System.Diagnostics.Process]::Start($pinfo)
$proc.WaitForExit()

$allSymlinksCreated = $true
foreach ($target in $TARGETS) {
    if (-not (Test-IsSymlink -Path $target)) {
        $allSymlinksCreated = $false
    }
}

if ($allSymlinksCreated) {
    foreach ($target in $TARGETS) {
        Write-Host "  - Created symlink: $target -> $ENV_FILE"
    }
} else {
    Write-Host "  - Symlinks require admin privileges."
    Write-Host "  - [S] Create symlinks (will prompt for admin)"
    Write-Host "  - [C] Copy .env instead (default)"
    $choice = Read-Host "  - Choose (S/C): "
    
    if ($choice -eq "S" -or $choice -eq "s") {
        foreach ($target in $TARGETS) {
            if (Test-Path $target) { Remove-Item $target -Force -ErrorAction SilentlyContinue }
        }
        
        Start-Process -FilePath "cmd.exe" -ArgumentList $cmdArgs -Verb RunAs -Wait
        
        Start-Sleep 1
        
        $allSymlinksCreated = $true
        foreach ($target in $TARGETS) {
            if (-not (Test-IsSymlink -Path $target)) {
                $allSymlinksCreated = $false
            } else {
                Write-Host "  - Created symlink: $target -> $ENV_FILE"
            }
        }
    }
    
    if (-not $allSymlinksCreated) {
        foreach ($target in $TARGETS) {
            Copy-Item $ENV_FILE $target
            Write-Host "  - Created copy: $target ($ENV_FILE)"
        }
    }
}

Write-Host ""
Write-Host "Done. Generated secrets:"
Write-Host "  - JWT_ACCESS_SECRET"
Write-Host "  - JWT_REFRESH_SECRET"
Write-Host "  - POSTGRES_PASSWORD"
if (-not $RESEND_API_KEY) { Write-Host "  - RESEND_API_KEY (skipped - emails will print to console)" }
Write-Host ""
Write-Host "Run: docker compose up -d"
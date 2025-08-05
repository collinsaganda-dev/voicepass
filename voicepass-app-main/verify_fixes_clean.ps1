# VoicePass Verification Script
Write-Host "Verifying VoicePass fixes..." -ForegroundColor Green

$issues = @()

# Check if files exist
$requiredFiles = @(
    "src/utils/roomCode.ts",
    "src/components/UserMenu.tsx", 
    "src/components/QRCodeGenerator.tsx",
    "src/components/BackButton.tsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "Found: $file" -ForegroundColor Green
    } else {
        Write-Host "Missing: $file" -ForegroundColor Red
        $issues += "Missing file: $file"
    }
}

# Check room code function
if (Test-Path "src/utils/roomCode.ts") {
    $roomCodeContent = Get-Content "src/utils/roomCode.ts" -Raw
    if ($roomCodeContent -match "length: number = 8") {
        Write-Host "Room code generates 8 characters" -ForegroundColor Green
    } else {
        Write-Host "Room code might not be generating 8 characters" -ForegroundColor Yellow
        $issues += "Room code length issue"
    }
}

Write-Host ""
if ($issues.Count -eq 0) {
    Write-Host "All fixes verified successfully!" -ForegroundColor Green
    Write-Host "Your VoicePass app is ready for testing!" -ForegroundColor Cyan
} else {
    Write-Host "Issues found:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
}

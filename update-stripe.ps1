$zipUrl = "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_windows_x86_64.zip"
$installDir = "$env:USERPROFILE\.stripe-cli"
$zipPath = "$env:TEMP\stripe-cli-latest.zip"

Write-Host "Downloading latest Stripe CLI..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

Write-Host "Updating to $installDir..."
Expand-Archive -Path $zipPath -DestinationPath $installDir -Force

$stripePath = "$installDir\stripe.exe"
& $stripePath --version
Write-Host "Done! You can now run 'stripe login' again."

$zipUrl = "https://github.com/stripe/stripe-cli/releases/download/v1.20.0/stripe_1.20.0_windows_x86_64.zip"
$installDir = "$env:USERPROFILE\.stripe-cli"
$zipPath = "$env:TEMP\stripe-cli.zip"

Write-Host "Downloading Stripe CLI..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

Write-Host "Installing to $installDir..."
Expand-Archive -Path $zipPath -DestinationPath $installDir -Force

$stripePath = "$installDir\stripe.exe"
Write-Host "Adding to PATH..."
$env:Path = "$env:Path;$installDir"
[System.Environment]::SetEnvironmentVariable('Path', "$([System.Environment]::GetEnvironmentVariable('Path', 'User'));$installDir", 'User')

Write-Host "Installed! Run 'stripe --version' to verify."

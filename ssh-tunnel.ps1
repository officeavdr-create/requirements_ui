# Write-Host "Establishing SSH tunnel..."
# Write-Host "Local: 0.0.0.0:11437 -> Remote: localhost:7777"
# Write-Host ""

# $password = "UeTCVM%SJ@dW$X2Q!^pYZUg^Af3Twr" | ConvertTo-SecureString -AsPlainText -Force
# $cred = New-Object System.Management.Automation.PSCredential("ubuntu", $password)

# ssh -N -L 0.0.0.0:11437:localhost:7777 ubuntu@192.168.127.2 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3

# ssh -N -L 0.0.0.0:11437:localhost:7777 ubuntu@45.32.29.197 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3

Write-Host "Establishing SSH tunnel..."
Write-Host "Local: 0.0.0.0:11437 -> Remote: localhost:7777"
Write-Host ""

$password = "UeTCVM%SJ@dW$X2Q!^pYZUg^Af3Twr"

# & "C:\Tools\plink.exe" -ssh -N -L 0.0.0.0:11437:localhost:7777 ubuntu@192.168.127.2 `
& "C:\Users\vpuli\Downloads\old\PuTTYPortable\App\putty\plink.exe" -ssh -N -L 0.0.0.0:11437:localhost:7777 ubuntu@45.32.29.197 `

  -pw ("$password") `
  -o StrictHostKeyChecking=no `
  -o ServerAliveInterval=30 `
  -o ServerAliveCountMax=3
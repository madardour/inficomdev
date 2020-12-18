param (
	[Parameter(Mandatory=$true)][string]$DeployAppPool
)

Write-Output "****"
Write-Output "**** Volgende onderdeel: Stop IIS AppPool"

Write-Output "**** START: Stop IIS AppPool"

if((Get-WebAppPoolState -Name $DeployAppPool).Value -ne 'Stopped'){
    Stop-WebAppPool -Name $DeployAppPool

    if ($LASTEXITCODE -ne 0) {
        throw "Error stopping appool '$DeployAppPool': "+$Error[0];
    }
}



Write-Output "Application pool '$DeployAppPool' stopped.";
Write-Output "**** EINDE: Stop IIS AppPool"
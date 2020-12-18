param (
    [Parameter(Mandatory=$true)][string]$WebServerDeployDir
)

Write-Output "****"
Write-Output "**** Volgende onderdeel: Website online zetten"

Write-Output "**** START: Hernoem Offline.txt naar Online.txt"

if(!(Test-Path -Path $WebServerDeployDir )){
    throw "Directory $WebServerDeployDir not found"
}

$filePath = "$WebServerDeployDir\Offline.txt"
if(!(Test-Path -Path $filePath )){
    throw "File does not exist. File missing or website already online."
}

Rename-Item -Path $filePath -NewName "Online.txt"

Write-Output "**** $filePath renamed to Online.txt"
Write-Output "**** END: Hernoem Offline.txt naar Online.txt"
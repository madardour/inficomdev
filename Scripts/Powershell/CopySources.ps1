param (
	[Parameter(Mandatory=$true)][boolean]$CleanDeployDir,
    [Parameter(Mandatory=$true)][string]$WebServerDeployDir
)

$sourceDir = Resolve-Path -Path "UWV.BRAVO.RAPTOR";

Write-Output "****"
Write-Output "**** Volgende onderdeel: Kopieren van nieuwe bronbestanden"

Write-Output "**** START: Kopieren nieuwe bestanden"

if(!(Test-Path -Path $WebServerDeployDir )){
    throw "Directory $WebServerDeployDir not found"
}

if(!(Test-Path -Path $sourceDir )){
    throw "Directory $sourceDir not found"
}

if($CleanDeployDir){
    Write-Output "Deleting $WebServerDeployDir"
    Remove-Item "$WebServerDeployDir\*" -recurse -Force
} elseif(Test-Path -Path "$WebServerDeployDir\Online.txt"){
    Remove-Item "$WebServerDeployDir\Online.txt" -Force
}

Write-Output "Copying $sourceDir to $WebServerDeployDir"
Copy-Item $sourceDir\* $WebServerDeployDir -recurse -Force

Write-Output "**** EINDE: Kopieren nieuwe bestanden"
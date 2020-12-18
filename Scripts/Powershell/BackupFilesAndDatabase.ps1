param (
	[Parameter(Mandatory=$true)][string]$WebServerDeployDir,
    [Parameter(Mandatory=$true)][string]$WebServerBackupRoot,
    [Parameter(Mandatory=$true)][string]$DatabaseServer,
    [Parameter(Mandatory=$true)][string]$DatabaseName
)

$ErrorActionPreference = "Stop"

# Make sure directory is set to script location
$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir

$curDateTime = (Get-Date).tostring("yyyyMMdd_HHmmss");

$raptorDllLoc = Resolve-Path -Path "UWV.BRAVO.RAPTOR\bin\UWV.BRAVO.RAPTOR.dll"
$releaseVersion = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($raptorDllLoc).FileVersion;

$backupDir="$WebServerBackupRoot\rel`_$releaseVersion`_$curdateTime";
md $backupDir;
Copy-Item "$WebServerDeployDir" -Destination "$backupDir\" -Recurse -Force
Write-Output "Created backup in $backupDir";

# BACKUP DATABASE
Write-Output "****"
Write-Output "**** Volgende onderdeel: Backup Database Bravo Frontend"

Write-Output "**** START: Backup Database Bravo Frontend"

Write-Output "**** Backup van database wordt gemaakt $backupDir\Database\backup_$DatabaseName.bak"	
mkdir "$backupDir\Database" 

Write-Output "**** Run: sqlcmd -E -S $DatabaseServer -d master -Q 'BACKUP DATABASE [$DatabaseName] TO DISK='$backupDir\Database\backup_$DatabaseName.bak'"

sqlcmd -E -S $DatabaseServer -d master -Q "BACKUP DATABASE [$DatabaseName] TO DISK='$backupDir\Database\backup_$DatabaseName.bak'"

Write-Output "**** Backup Succesvol aangemaakt!!"
Write-Output "**** EINDE: Backup Database Bravo Frontend"
# END BACKUP DATABASE

# ZIP BACKUP AND REMOVE FOLDER
Write-Output "****"
Write-Output "**** Volgende onderdeel: Zippen van backup"

Write-Output "**** START: Zippen van backup"

$zipDestination = "$WebServerBackupRoot\rel`_$releaseVersion`_$curdateTime.zip";
[Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem")
[System.IO.Compression.ZipFile]::CreateFromDirectory($backupDir, $zipDestination)
Write-Output "Created zip file $zipDestination";

Remove-Item -recurse $backupDir
Write-Output "Deleted temp dir $backupDir";

Write-Output "**** EINDE: Zippen van backup"
# END ZIP BACKUP AND REMOVE FOLDER
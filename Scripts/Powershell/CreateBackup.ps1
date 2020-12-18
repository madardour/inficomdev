param (
    [Parameter(Mandatory=$true)][string]$databaseServer,
    [Parameter(Mandatory=$true)][string]$databaseName,
    [Parameter(Mandatory=$true)][string]$backupFileName
)

$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir

$ErrorActionPreference = "Stop"


# RESTORE FAT BACKUP

Write-Output "****"
Write-Output "**** Volgende onderdeel: backup in SVN bijwerken"

Write-Output "**** START: Create backup file"

# Backup to file
Write-Output "**** Creating file of database $databaseName on $sourceDatabaseServer"
$backupFile = "$currentDir\$backupFileName";

# Remove file if exists
if(Test-Path $backupFile){
    Remove-Item –path $backupFile;
}

sqlcmd -E -S $databaseServer -d master -Q "BACKUP DATABASE [$databaseName] TO DISK='$backupFile'"


Write-Output "**** EINDE: Create backup file"

# END RESTORE FAT BACKUP

# Make sure directory is set to script location
$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir
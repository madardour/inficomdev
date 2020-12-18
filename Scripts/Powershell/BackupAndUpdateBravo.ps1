param (
    [Parameter(Mandatory=$true)][string]$WebServerDeployDir,
    [Parameter(Mandatory=$true)][string]$DeployAppPool,
    [Parameter(Mandatory=$true)][string]$DatabaseServer,
    [Parameter(Mandatory=$true)][string]$DatabaseName,
    [Parameter(Mandatory=$true)][string]$MdfLdfDir,
    [Parameter(Mandatory=$true)][string]$SourceDatabaseServer,
    [Parameter(Mandatory=$true)][string]$SourceDatabaseName,
    [Parameter(Mandatory=$true)][string]$WebServerBackupRoot,
    [Parameter(Mandatory=$true)][boolean]$CleanDeployDir,
    [Parameter(Mandatory=$true)][boolean]$CreateBackup,
    [Parameter(Mandatory=$true)][boolean]$RestoreDb,
    [Parameter(Mandatory=$true)][boolean]$UpdateDb,
	[Parameter(Mandatory=$true)][boolean]$UpdateSite,
    [Parameter(Mandatory=$true)][boolean]$RestoreFromDatabase,
    [Parameter(Mandatory=$true)][boolean]$BringOnline	
)

$ErrorActionPreference = "Stop"

# Make sure directory is set to script location
$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir

# SHOW PARAMETERS
Write-Output "****"
Write-Output "**** Parameter values"
Write-Output "****"
Write-Output "**** WebServerDeployDir:   $WebServerDeployDir"
Write-Output "**** DeployAppPool: 	     $DeployAppPool"
Write-Output "**** RestoreDbAndUpdate: 	 $RestoreDbAndUpdate"
Write-Output "**** DatabaseServer: 	     $DatabaseServer"
Write-Output "**** DatabaseName: 	     $DatabaseName"
Write-Output "**** MdfLdfDir: 	         $MdfLdfDir"
Write-Output "**** SourceDatabaseServer: $SourceDatabaseServer"
Write-Output "**** SourceDatabaseName: 	 $SourceDatabaseName"
Write-Output "**** WebServerBackupRoot:  $WebServerBackupRoot"

Write-Output "**** CleanDeployDir: 	     $CleanDeployDir"
Write-Output "**** CreateBackup: 	     $CreateBackup"
Write-Output "**** RestoreDb: 	 	     $RestoreDb"
Write-Output "**** UpdateDb: 	 	     $UpdateDb"
Write-Output "**** RestoreFromDatabase:  $RestoreFromDatabase"
Write-Output "**** BringOnline: 	     $BringOnline"
Write-Output "****"
# END SHOW ENVIRONMENT

if($CreateBackup){
    & .\BackupFilesAndDatabase.ps1 -WebServerDeployDir $WebServerDeployDir -WebServerBackupRoot $WebServerBackupRoot -DatabaseServer $DatabaseServer -DatabaseName $DatabaseName
}

if($RestoreDb){
    if($RestoreFromDatabase){
        & .\RestoreDbFromDatabase.ps1 -sourceDatabaseServer $SourceDatabaseServer -sourceDatabaseName $SourceDatabaseName -destDatabaseServer $DatabaseServer -destDatabaseName $DatabaseName -MdfLdfDir $MdfLdfDir
    } else {
        & .\RestoreDbFromFile.ps1 -databaseServer $DatabaseServer -databaseName $DatabaseName -MdfLdfDir $MdfLdfDir
    }
}

if($UpdateDb){
    & .\UpdateDb.ps1 -databaseServer $DatabaseServer -databaseName $DatabaseName
}

if($UpdateSite){
	& .\StopIISAppPool.ps1 -DeployAppPool $DeployAppPool
	& .\CopySources.ps1 -CleanDeployDir $CleanDeployDir -WebServerDeployDir $WebServerDeployDir
	& .\StartIISAppPool.ps1 -DeployAppPool $DeployAppPool
}

if($BringOnline){
    & .\BringOnline.ps1 -WebServerDeployDir $WebServerDeployDir
}
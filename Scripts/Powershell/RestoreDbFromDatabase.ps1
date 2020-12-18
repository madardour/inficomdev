param (
    [Parameter(Mandatory=$true)][string]$sourceDatabaseServer,
    [Parameter(Mandatory=$true)][string]$sourceDatabaseName,
    [Parameter(Mandatory=$true)][string]$destDatabaseServer,
    [Parameter(Mandatory=$true)][string]$destDatabaseName,
    [Parameter(Mandatory=$true)][string]$MdfLdfDir
)

$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir

$ErrorActionPreference = "Stop"
 
function Test-SqlServer {
    [CmdletBinding()]
    param(
        [parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]
        [string]$Server,
        [parameter(Mandatory=$false)]
        [ValidateNotNullOrEmpty()]
        [string]$Database
    )

    if ($Database) {
        $Database = Encode-SqlName $Database
    }

    $parts = $Server.Split('\');
    $hostName = Encode-SqlName $parts[0];
    $instance = if ($parts.Count -eq 1) {'DEFAULT'} else { Encode-SqlName $parts[1] }

    #Test-Path will only fail after a timeout. Reduce the timeout for the local scope to 
    Set-Variable -Scope Local -Name SqlServerConnectionTimeout 5
    $path = "SQLSERVER:\Sql\$hostName\$instance"

    if (!(Test-Path $path -EA SilentlyContinue)) {
        throw "Unable to connect to SQL Instance '$Server'"
        return
    }
    elseif ($Database) {
        $path = Join-Path $path "Databases\$Database"

        if (!(Test-Path $path -EA SilentlyContinue)) {
            throw "Database '$Database' does not exist on server '$Server'"
            return
        }
    }
    $true
}


# RESTORE FAT BACKUP

Write-Output "****"
Write-Output "**** Volgende onderdeel: Terugzetten fat backup"

Write-Output "**** START: Restore FAT backup"

$sourceDatabaseExists = Test-SqlServer -Server $sourceDatabaseServer -Database $sourceDatabaseName -EA SilentlyContinue
$destDatabaseExists = Test-SqlServer -Server $destDatabaseServer -Database $destDatabaseName -EA SilentlyContinue

if(!$sourceDatabaseExists){
    throw "Database $sourceDatabaseName on $sourceDatabaseServer does not exist";
}

#Remove old database
Write-Output "**** Deleting old database if exists $destDatabaseName on $destDatabaseServer"
if($destDatabaseExists)
{
    Invoke-SqlCmd -ServerInstance $destDatabaseServer -Query "USE [master]; ALTER DATABASE [$destDatabaseName] SET  SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$destDatabaseName]"
}

# Backup to file
Write-Output "**** Creating file of database $sourceDatabaseName on $sourceDatabaseServer"
$fatBackupFile = "$currentDir\backup_$sourceDatabaseName.bak";

# Remove file if exists
if(Test-Path $fatBackupFile){
    Remove-Item –path $fatBackupFile;
}

sqlcmd -E -S $sourceDatabaseServer -d master -Q "BACKUP DATABASE [$sourceDatabaseName] TO DISK='$fatBackupFile'"

$RelocateData = New-Object 'Microsoft.SqlServer.Management.Smo.RelocateFile, Microsoft.SqlServer.SmoExtended, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91'`
    -ArgumentList "UWV_BRaVO_DEMO", "$MdfLdfDir\$destDatabaseName.mdf"
$RelocateLog = New-Object 'Microsoft.SqlServer.Management.Smo.RelocateFile, Microsoft.SqlServer.SmoExtended, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91'`
    -ArgumentList "UWV_BRaVO_DEMO_log", "$MdfLdfDir\$destDatabaseName.ldf"

Write-Output "**** Restoring to $destDatabaseName on $destDatabaseServer"
Restore-SqlDatabase -ServerInstance $destDatabaseServer -Database $destDatabaseName -BackupFile $fatBackupFile -RelocateFile @($RelocateData,$RelocateLog)

Write-Output "**** Removing temporary file"
Remove-Item –path $fatBackupFile;

Write-Output "**** EINDE: Restore FAT backup"

# END RESTORE FAT BACKUP

# Make sure directory is set to script location
$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir
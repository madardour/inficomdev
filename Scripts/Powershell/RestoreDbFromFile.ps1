param (
    [Parameter(Mandatory=$true)][string]$databaseServer,
    [Parameter(Mandatory=$true)][string]$databaseName,
    [Parameter(Mandatory=$true)][string]$MdfLdfDir
)

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

# Make sure directory is set to script location
$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir

$updateBravoDbDir = Resolve-Path -Path "DbUpdateScripts"
$backupBakDir="$updateBravoDbDir\Backup"

# CHECK GIVEN FOLDERS

if(!(Test-Path -Path $updateBravoDbDir )){
    throw "Directory $updateBravoDbDir not found"
}

if(!(Test-Path -Path $backupBakDir )){
    throw "Directory $backupBakDir not found"
}

# END CHECK GIVEN FOLDERS


# RESTORE FAT BACKUP

$fatBackupFile = Get-ChildItem -Path $backupBakDir -Filter *.bak | Sort-Object LastAccessTime -Descending | Select-Object -First 1
if($fatBackupFile -eq $null){
    throw "No backup file (.bak) found in directory $backupBakDir"
}
$fatBackupFile = $fatBackupFile.FullName

Write-Output "****"
Write-Output "**** Volgende onderdeel: Terugzetten fat backup"

Write-Output "**** START: Restore FAT backup"

Write-Output "**** Deleting old database if exists $databaseName on $databaseServer"

if(Test-SqlServer -Server $databaseServer -Database $databaseName -EA SilentlyContinue)
{
    Invoke-SqlCmd -ServerInstance $databaseServer -Query "USE [master]; ALTER DATABASE [$databaseName] SET  SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$databaseName]"
}

$RelocateData = New-Object 'Microsoft.SqlServer.Management.Smo.RelocateFile, Microsoft.SqlServer.SmoExtended, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91'`
    -ArgumentList "UWV_BRaVO_DEMO", "$MdfLdfDir\$databaseName.mdf"
$RelocateLog = New-Object 'Microsoft.SqlServer.Management.Smo.RelocateFile, Microsoft.SqlServer.SmoExtended, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91'`
    -ArgumentList "UWV_BRaVO_DEMO_log", "$MdfLdfDir\$databaseName.ldf"

Write-Output "**** Restoring to $databaseName on $databaseServer"
Restore-SqlDatabase -ServerInstance $databaseServer -Database $databaseName -BackupFile $fatBackupFile -RelocateFile @($RelocateData,$RelocateLog)

Write-Output "**** EINDE: Restore FAT backup"

# END RESTORE FAT BACKUP

# Make sure directory is set to script location
$currentDir = split-path $SCRIPT:MyInvocation.MyCommand.Path -parent
cd $currentDir
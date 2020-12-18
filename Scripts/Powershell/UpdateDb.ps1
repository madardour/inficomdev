param (
    [Parameter(Mandatory=$true)][string]$databaseServer,
    [Parameter(Mandatory=$true)][string]$databaseName
)
 
$ErrorActionPreference = "Stop"

$updateBravoDbDir = Resolve-Path -Path "DbUpdateScripts"
$sqlscriptsDir="$updateBravoDbDir\SqlScripts"
$updateXsdDir="$updateBravoDbDir\UpdateXsd"
$SqlOutput="$updateBravoDbDir\Output"

$sqlscriptsDir2 = "DevFatOnlyScripts"

# CHECK GIVEN FOLDERS

if(!(Test-Path -Path $updateBravoDbDir )){
    throw "Directory $updateBravoDbDir not found"
}

if(!(Test-Path -Path $updateXsdDir )){
    throw "Directory $updateXsdDir not found"
}

if(!(Test-Path -Path $SqlOutput )){
    throw "Directory $SqlOutput not found"
}

# END CHECK GIVEN FOLDERS

# UPDATE XSD
Write-Output "****"
Write-Output "**** Volgende onderdeel: Update PDC xsd in database"

Write-Output "**** START: Update PDC xsd in database"

cscript //nologo $updateBravoDbDir\updateDatabaseXsd.vbs $databaseServer $databaseName $updateXsdDir $SqlOutput

Write-Output "**** EINDE: Update PDC xsd in database"
# END UPDATE XSD

# EXECUTE SQL Scripts
Write-Output "****"
Write-Output "**** Volgende onderdeel: Uitvoeren sqls uit sql directory: $sqlscriptsDir"
Write-Output "**** START: Uitvoeren van de sqlsscripts op de database"

if((Test-Path -Path $sqlscriptsDir )){
    Get-ChildItem -Path "$sqlscriptsDir" -Filter *.sql -Recurse -File -Name| ForEach-Object {
        $file = [System.IO.Path]::GetFileName($_)
        $path = "$sqlscriptsDir\$file"
        Write-Output "**** Execute: sqlcmd -S $databaseServer -d $databaseName -i $path"
        sqlcmd -S $databaseServer -d $databaseName -i $path -b

        if ($LASTEXITCODE -ne 0) {
            throw $errorMsg;
        }
    }
} else {
    Write-Output "**** Geen folder $sqlscriptsDir"
}

if((Test-Path -Path $sqlscriptsDir2 )){
    Get-ChildItem -Path "$sqlscriptsDir2" -Filter *.sql -Recurse -File -Name| ForEach-Object {
        $file = [System.IO.Path]::GetFileName($_)
        $path = "$sqlscriptsDir2\$file"
        Write-Output "**** Execute: sqlcmd -S $databaseServer -d $databaseName -i $path"
        sqlcmd -S $databaseServer -d $databaseName -i $path -b

        if ($LASTEXITCODE -ne 0) {
            throw $errorMsg;
        }
    }
} else {
    Write-Output "**** Geen folder $sqlscriptsDir2"
}

Write-Output "**** EINDE: Uitvoeren van de sql scripts op de database"
# END EXECUTE SQL SCRIPTS


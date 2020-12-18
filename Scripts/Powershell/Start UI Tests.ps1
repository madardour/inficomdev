param (
    [Parameter(Mandatory=$true)][int]$nrOfSimultaneousIETests,
    [Parameter(Mandatory=$true)][int]$nrOfSimultaneousChromeTests,
    [Parameter(Mandatory=$true)][string]$seleniumGridAddress,
    [Parameter(Mandatory=$true)][string]$subSet,
    [Parameter(Mandatory=$true)][string]$excludeList,
    [Parameter(Mandatory=$true)][int]$nrOfRetries,
    [Parameter(Mandatory=$true)][string]$wait,
    [Parameter(Mandatory=$true)][boolean]$ieOnly,
    [Parameter(Mandatory=$true)][string]$workingDir
)

$nunitConsolePath = "$workingDir/BravoBuild/drop/packages/NUnit.ConsoleRunner.3.10.0/tools/nunit3-console.exe"
$projectPath = "$workingDir/BravoBuild/drop/UWV.BRAVO.UITests/UWV.BRAVO.UITests.csproj"
$ieOnlyList = "$workingDir/BravoBuild/drop/UWV.BRAVO.UITests/IEFeatures.csv"
$testResultsFolder = "$workingDir/TestResults"

$ErrorActionPreference = "Stop";

# Create results directories
New-Item -ItemType Directory -Force -Path "$testResultsFolder"
New-Item -ItemType Directory -Force -Path "$testResultsFolder/Images"
New-Item -ItemType Directory -Force -Path "$testResultsFolder/Logs"

$testSet = & $nunitConsolePath --explore $projectPath;
$testSet = $testSet | Where-Object {$_  -like "UWV.BRAVO.UITests.*"};

if($subSet.Length -gt 0 -and $subSet -ne "-"){
    $subSetList = $subSet.Split(",") | ForEach-Object { 
        $item = $_.Trim()
        $foundTest = $testSet | Where-Object {$_ -match $item+"Feature"}
        if($foundTest.Length -gt 0){
            $foundTest
        }
    }
    $testSet = $subSetList
}

if($excludeList.Length -gt 0){
    $excludeList.Split(",") | ForEach-Object { 
        $item = $_.Trim()
        $foundTest = $testSet | Where-Object {$_ -match $item+"Feature"}
        if($foundTest.Length -gt 0){
            $testSet = $testSet | Where-Object { $_ –ne $foundTest }
        }
    }
}

# Set commandline arguments
$arguments = "--x86 "
$arguments += "--testparam:wait=$wait "
$arguments += "--testparam:nrofretries=$nrOfRetries "
$arguments += "--testparam:imageFolderLocation=$testResultsFolder\Images "
$arguments += "--testparam:logsFolderLocation=$testResultsFolder\Logs "
$arguments += "--testparam:remote='$seleniumGridAddress' "

$ErrorActionPreference = "Continue";
if($ieOnly){
    $ieSet = $testSet -join ","
    $arguments += "--workers=$nrOfSimultaneousIETests "
    $arguments += "--result=$testResultsFolder\TestResults.xml "
    $arguments += "--testparam:browser='Internet Explorer' "
    $arguments += "--test='$ieSet' "

    # Start tests
    Invoke-Expression "$nunitConsolePath $arguments $projectPath"

    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed. Please check the log and testresults for more details."
    }
} else {
    $ieOnlyTests = Import-Csv -Path $ieOnlyList | select -ExpandProperty TestName;
    $ieOnlyTests = $ieOnlyTests | ForEach-Object { 
        $item = $testSet -match $_+"Feature";
        $item
    }

    $ieOnlySubSet = $ieOnlyTests | ?{$testSet -contains $_} 
    $chromeSubSet = ($testSet | ?{$ieOnlySubSet -notcontains $_}) -join ',' 
    $ieOnlySubSetJoined = $ieOnlySubSet -join ','

    $chromeArguments = $arguments + "--testparam:browser='Chrome' "
    # $chromeArguments += "--testparam:headless='true' "
    $chromeArguments += "--result=$testResultsFolder\TestResultsChrome.xml "
    $chromeArguments += "--test='$chromeSubSet' "
    $chromeArguments += "--workers=$nrOfSimultaneousChromeTests "

    $IEArguments = $arguments + "--testparam:browser='Internet Explorer' "
    $IEArguments += "--result=$testResultsFolder\TestResultsIE.xml "
    $IEArguments += "--test='$ieOnlySubSetJoined' "
    $IEArguments += "--workers=$nrOfSimultaneousIETests "

    if($chromeSubSet.Length -gt 0){
        Start-Job -Scriptblock { 
            Param(
                [string] $nunitConsolePath,
                [string] $chromeArguments,
                [string] $projectPath
            )

            Invoke-Expression "$nunitConsolePath $chromeArguments $projectPath" -ErrorVariable e

            if ($LASTEXITCODE -ne 0) {
                throw $e[0]
            }

        } -ArgumentList $nunitConsolePath,$chromeArguments,$projectPath
    }

    if($ieOnlySubSetJoined.Length -gt 0){
        Start-Job -Scriptblock { 
            Param(
                [string] $nunitConsolePath,
                [string] $IEArguments,
                [string] $projectPath
            )

            Invoke-Expression "$nunitConsolePath $IEArguments $projectPath" -ErrorVariable e

            if ($LASTEXITCODE -ne 0) {
                throw $e[0]
            }
        } -ArgumentList $nunitConsolePath,$IEArguments,$projectPath
    }

    #Wait for all jobs to finish.
    While ((Get-Job -State Running).count -gt 0){
        start-sleep 1
    }

    #Get information from each job.
    $success = $true;
    foreach($job in Get-Job){
        $info = Receive-Job -Id ($job.Id)
        $info 

        $jobStateFailed = $job.State -eq 'Failed'
        if ($jobStateFailed ) {
            Write-Host ($job.ChildJobs[0].JobStateInfo.Reason.Message) -ForegroundColor Red;
            $success = $false
        } 
    }
    
    #Remove all jobs created.
    Get-Job | Remove-Job

    if(!$success){
        throw "Test run failed. Read above for errors or check the report."
    }
}
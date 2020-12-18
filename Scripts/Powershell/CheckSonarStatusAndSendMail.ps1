param (
    [Parameter(Mandatory=$true)][string]$sonarAddress,
    [Parameter(Mandatory=$true)][string]$projectKey,
    [Parameter(Mandatory=$true)][string]$tokenKey,
    [Parameter(Mandatory=$true)][string[]]$recipients
)
$ErrorActionPreference = "Stop" 
$Timeout = 600 ## 10 minutes

$token = [System.Text.Encoding]::UTF8.GetBytes($tokenKey + ":")
$base64 = [System.Convert]::ToBase64String($token)
$basicAuth = [string]::Format("Basic {0}", $base64)
$headers = @{ Authorization = $basicAuth }

$analysis = Invoke-WebRequest "http://$sonarAddress/api/project_analyses/search?project=UWV.AOC.BRAVO" -Headers $headers | ConvertFrom-Json

#Check current run if faulty or if using profiles again
$currentRunFaulty = $false;
$currentRunFixed = $false;
if($analysis.analyses.Count -gt 0){
    $curAnalysis = $analysis.analyses[0];

    Foreach ($event in $prevAnalysis.events) {
        if($event.name.StartsWith("Stop using ")){
            $currentRunFaulty = $true;
        }
        if($event.name.StartsWith("Use ")){
            $currentRunFixed = $true;
        }
    }
}

#Remove previous run if faulty
if(!$currentRunFaulty -and $currentRunFixed -and $analysis.analyses.Count -gt 1){
    $prevAnalysis = $analysis.analyses[1];

    $faulty = $false;
    Foreach ($event in $prevAnalysis.events) {
        if($event.name.StartsWith("Stop using ")){
            $faulty = $true;
        }
    }

    if($faulty){
        Write-Output("Removing analysis with key $($prevAnalysis.key), date $($prevAnalysis.date)")
        Invoke-WebRequest "http://$sonarAddress/api/project_analyses/delete?analysis=$($prevAnalysis.key)" -Headers $headers -Method Post
    }
}

#Wait for sonarqube to finish
$timer = [Diagnostics.Stopwatch]::StartNew()

function GetSonarAnalysisQueue(){
    $response = Invoke-WebRequest "http://$sonarAddress/api/ce/component?component=$projectKey" -Headers $headers | ConvertFrom-Json
    return $response.queue;
}

$queue = GetSonarAnalysisQueue
while(($timer.Elapsed.TotalSeconds -lt $Timeout) -and ($queue.status -eq "IN_PROGRESS"))
{
    start-sleep -Seconds 10
    $queue = GetSonarAnalysisQueue
}

$timer.Stop()

if($queue.status -eq "IN_PROGRESS"){
    throw "Timeout in processing quality gate";
}

#Send status email
Function comparatorToChar($comparator, $tresholdAvailable) {
    if($tresholdAvailable -eq $null){
        if($comparator -eq "GT"){
            return "&gt;"
        } else {
            return "&lt;"
        }
    }
}

$struct = Invoke-WebRequest "http://$sonarAddress/api/qualitygates/project_status?projectKey=$projectKey" -Headers $headers |
ConvertFrom-Json

$sqStatus = $struct.projectStatus.status;
$status = "Success";
$color = "green";
$mailheader = "<p>SonarQube quality gate resulted without errors.</p>";
if($currentRunFaulty){
    $status = "Error loading profiles"
    $color = "red";
    $mailheader = "<p>SonarQube quality gate resulted with errors.</p>";
}
elseif ($sqStatus -eq "ERROR")  { 
    $status = "Failed"
    $color = "red";
    $mailheader = "<p>SonarQube quality gate resulted with to many issues.</p>";
}

$mailBody = "<h1 style='color: $color'>SonarQube result: $status</h1>"
$mailBody += $mailheader

if(!$currentRunFaulty){
    $mailBody += "<table style='border-collapse: collapse;'>";

    $mailBody += "<tr style='margin:0;'>";
    $mailBody += "<td style='border: 1px solid black;padding: 5px;'>Status</td>";
    $mailBody += "<td style='border: 1px solid black;padding: 5px;'>Metric</td>";
    $mailBody += "<td style='border: 1px solid black;padding: 5px;'>Warning treshold</td>";
    $mailBody += "<td style='border: 1px solid black;padding: 5px;'>Error treshold</td>";
    $mailBody += "<td style='border: 1px solid black;padding: 5px;'>Current value</td>";
    $mailBody += "</tr>";

    foreach ($condition in $struct.projectStatus.conditions) {
        $conditionColor = 'green';
        if($($condition.status) -eq "WARN"){
            $conditionColor = 'orange';
        }
        if($($condition.status) -eq "ERROR"){
            $conditionColor = 'red';
        }
        $mailBody += "<tr style='margin:0; padding: 5px;'>";
        $mailBody += "<td style='border: 1px solid black; color: $conditionColor; padding: 5px;'>$($condition.status)</td>";
        $mailBody += "<td style='border: 1px solid black; padding: 5px;'>$($condition.metricKey) $(if($condition.metricKey.startswith('new')){'(since '+$struct.projectStatus.periods[0].parameter+')'} else {''})</td>";
        $mailBody += "<td style='border: 1px solid black; padding: 5px;'>$(comparatorToChar($condition.comparator, $condition.warningThreshold)) $($condition.warningThreshold)</td>";
        $mailBody += "<td style='border: 1px solid black; padding: 5px;'>$(comparatorToChar($condition.comparator, $condition.errorThreshold)) $($condition.errorThreshold)</td>";
        $mailBody += "<td style='border: 1px solid black; padding: 5px;'>$($condition.actualValue)</td>";
        $mailBody += "</tr>";
    }
    $mailBody += "</table>";
}

$mailBody += "<p>Click <a href='http://$sonarAddress/dashboard?id=UWV.AOC.BRAVO.BEHEERMODULE'>here</a> to see the latest report. </p>"

Send-MailMessage -From "no-reply@uwv.nl" -To $recipients -Subject "SonarQube result: $status" -Body "$mailBody" -BodyAsHtml -SmtpServer "uwvmailrelay.voorzieningen.uwv.nl"
$ErrorActionPreference = "Stop"

#------------------------------------------------------------------------------------------------------
# Run when load test is finished
#------------------------------------------------------------------------------------------------------
Set-ExecutionPolicy Bypass

write-host "*------------------------------------------------"
write-host "  BRAVO PERFORMANCE TEST FINISHED"
write-host "*------------------------------------------------"
write-host ""


# PARAMETERS
$resultsFolder = "C:\Users\Bravo_Jmeter\Uitslagen\";

function UpdateRunningStatus() {
	Get-ChildItem -Path $resultsFolder -Filter "*_StartedBy.txt" | foreach { $_.Delete()}
}

try {
	
	UpdateRunningStatus
	
} catch {
	throw "Er is een fout opgetreden!`n $($Error[0])"
}
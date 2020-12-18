param (
	[Parameter(Mandatory=$true)][string]$DeployAppPool
)

Write-Output "****"
Write-Output "**** Volgende onderdeel: Start IIS AppPool"

Write-Output "**** START: Start IIS AppPool"


try{    
   & "c:\Windows\System32\inetsrv\appcmd" start apppool $DeployAppPool

   if ($LASTEXITCODE -ne 0) {
       throw "Error starting appool '$DeployAppPool': "+$Error[0];
   }
} catch {
   # Try again on fail after 5 seconds
   Start-Sleep -s 5
   & "c:\Windows\System32\inetsrv\appcmd" start apppool $DeployAppPool

   if ($LASTEXITCODE -ne 0) {
       throw "Error starting appool '$DeployAppPool': "+$Error[0];
   }
}

Write-Output "Application pool '$DeployAppPool' started.";

Write-Output "**** EINDE: Start IIS AppPool"
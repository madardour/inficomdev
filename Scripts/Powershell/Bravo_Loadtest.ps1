param (

	[Parameter(Mandatory=$true)][string]$webServer,
	[Parameter(Mandatory=$true)][string]$siteUrl,
	[Parameter(Mandatory=$true)][string]$loginUser, 
	[Parameter(Mandatory=$true)][string]$loginPassword,
	[Parameter(Mandatory=$true)][string]$pdcRootDir,
	[Parameter(Mandatory=$true)][string]$backupRootDir,
	[Parameter(Mandatory=$true)][string]$bravoDatabaseName,
	[Parameter(Mandatory=$true)][string]$bravoDatabaseServer,
	[Parameter(Mandatory=$true)][string]$pdcDatabaseName,
	[Parameter(Mandatory=$true)][string]$pdcDatabaseServer,
	[Parameter(Mandatory=$true)][string]$userName,       
	[Parameter(Mandatory=$true)][string]$pdcServer
)
	
$ErrorActionPreference = "Stop"

#------------------------------------------------------------------------------------------------------
# Run generate bravo versions overview
#------------------------------------------------------------------------------------------------------
Set-ExecutionPolicy Bypass

write-host "*------------------------------------------------"
write-host "  BRAVO PERFORMANCE TEST"
write-host ""
write-host "  - Frontendserver: $webServer" -ForeGroundColor DarkGray
write-host "  - PDC server: $pdcServer" -ForeGroundColor DarkGray
write-host "*------------------------------------------------"
write-host ""

# PDC PARAMETERS
$domainUser = $loginUser;
if($domainUser -notcontains '\') {
	$domainUser = "test\$domainUser"
}
$pass = ConvertTo-SecureString -AsPlainText $loginPassword -Force
$cred = New-Object System.Management.Automation.PSCredential -ArgumentList $domainUser,$pass

# JMETER PARAMETERS
$location = [System.IO.Path]::GetDirectoryName($myInvocation.MyCommand.Definition); #(Get-Location).path
write-host $location;
$StartJmeterNoGUI = "C:\Bravo_Jmeter\Bravo\apache-jmeter-3.2\bin\jmeter";
$StartReportGen = "C:\Bravo_Jmeter\Bravo\apache-jmeter-3.2\bin\jmeter.bat";
$resultsFolder = $location + "\Uitslagen\";
$runTime = 900; #900 seconden DEVTEST

# RAPPORT PARAMETERS
$userName = $userName.Split(' ')[0].ToLower();
$userFolder = $resultsFolder + $userName + "\";
$TestPlanWarmingUp = $location + "\Bravo_PerformancetestWarmingUp.jmx";
$TestPlan = $location + "\Bravo_Performancetest.jmx";
$restartPdc = $true;
$runJmeter = $true;
$htmlRapport = "\statistics.html";
$rptDocsCount = 1;
$rptStatisticsCount = 1;
$averageLimit = 2000;
$sendMailToAll = $false;
$thresholdVa = 70; 
$thresholdAd = 180;
$performanceMarge = 5;
$performanceIsOk = $true;
$jmeterLog = $location + "\Logfiles";
$jmeterLogFile = $location + "\Logfiles\jmeter.log";
$logPath = "X:\";

if (!(Test-Path $logPath)) {
	$logPath = "C:\Logfiles";
}

if( $userName -eq "pdcwebuser") {
	$sendMailToAll = $true;	
	$rptDocsCount = 5;
	$rptStatisticsCount = 5;
}
	
function Set-Culture([System.Globalization.CultureInfo] $culture)
{
    [System.Threading.Thread]::CurrentThread.CurrentUICulture = $culture
    [System.Threading.Thread]::CurrentThread.CurrentCulture = $culture
}

function ConvertDate($date) {
	Set-Culture nl-NL;
	$dateParts = $date.Split('/');
	$date = $dateParts[1]+"-"+$dateParts[0]+"-"+$dateParts[2];
	[datetime]$date = $date;
	return $date;
}

function WriteArgsToCsv() {
	Set-Content -Path "$location\Args.csv" -Value "$webServer,$siteUrl,$pdcRootDir,$backupRootDir,$bravoDatabaseName,$bravoDatabaseServer,$pdcDatabaseName,$pdcDatabaseServer,$pdcServer"
}

function EnsureFolders() {
	if(!(Test-Path $resultsFolder)) {
		write-host "Folder $resultsFolder niet gevonden!" -ForeGroundColor Red
		exit;
	}
	
	if(!(Test-Path $userFolder)) {
		New-Item $userFolder -ItemType directory | Out-Null;
	}
}

function IsSucceded($file_path) {
	$errors = Import-Csv $file_path | ? success -eq "false";	
		
	return $errors.Length -eq 0;
}

function CleanTestData() {
	write-host " - Database opschonen: $bravoDatabaseName"
	sqlcmd -S $bravoDatabaseServer -d $bravoDatabaseName -b -U perfromanceUser -P perfromanceUser -i "$location\Scripts\SchoningBravoDB.sql" | Out-Null;
	write-host " - Database opschonen: $pdcDatabaseName"
	sqlcmd -S $pdcDatabaseServer -d $pdcDatabaseName -b -U perfromanceUser -P perfromanceUser -i "$location\Scripts\OdinCleanProcess.sql" | Out-Null;		
	write-host " - PDC files verwijderen: $pdcRootDir"
	$pdcPath = "$pdcRootDir\MwsClient\*"
	Invoke-Command -ComputerName $pdcServer -credential $cred -ErrorAction Stop -ScriptBlock { Remove-Item -Path $using:pdcPath -Recurse } | Out-Null;
	$pdcPath = "$pdcRootDir\Odin\*"
	Invoke-Command -ComputerName $pdcServer -credential $cred -ErrorAction Stop -ScriptBlock { Remove-Item -Path $using:pdcPath -Recurse } | Out-Null;
	$pdcPath = "$pdcRootDir\PdcArchiveFolder\*"
	Invoke-Command -ComputerName $pdcServer -credential $cred -ErrorAction Stop -ScriptBlock { Remove-Item -Path $using:pdcPath -Recurse } | Out-Null;
}

function CheckRunningStatus() {
	write-host " - Check status..."
	$file = Get-ChildItem -Path $resultsFolder -Filter "*_StartedBy.txt" | Sort -Property {$_.FullName} -Descending | select -first 1
	if(($file -ne $null) -and ($file.LastWriteTime.Date -eq [datetime]::Today)) {
		throw "Een loadtest wordt nu uitgevoerd door $($file.Name.split('_')[0])"
	}
	$StartedBy = $resultsFolder + $userName + "_StartedBy.txt";
	New-Item $StartedBy -ItemType file | Out-Null;
}

# RESTART PDC
function RestartPdcServices() {
	try {
		if($restartPdc) {
			Write-Host " - Restart PDC Services..."	
			$stopCmd = "\\$pdcServer\e$\pdc\ModusService\ModusStop.cmd";
			$startCmd = "\\$pdcServer\e$\pdc\ModusService\ModusStart.cmd";
			Invoke-Command -ComputerName $pdcServer -credential $cred -ErrorAction Stop -ScriptBlock { Invoke-Expression -Command: "cmd.exe /c $using:stopCmd" } | Out-Null;
			Invoke-Command -ComputerName $pdcServer -credential $cred -ErrorAction Stop -ScriptBlock { Invoke-Expression -Command: "cmd.exe /c $using:startCmd" } | Out-Null;
			
			Start-Sleep -s 3
		}
	} catch {
		throw "Kan PDC Services niet restarten!`n"
	}
}

function DeleteReportsAndLogs() {	
	write-host " - Verwijder oude rapportages en logfiles..."
	if(!(Test-Path $userFolder)) {
		return;
	}
	
	try {
		Remove-Item -Path "$logPath\*" -Recurse	
		
		if($userName -eq "pdcwebuser") {
			$files = Get-ChildItem -Path $userFolder -Filter "loadtest_*.csv" | Sort -Property {$_.FullName} -Descending | select -first ($rptDocsCount + 5)
			$index = 1;
			foreach ($file in $files) {	
				$rptPath = $userFolder + $file.Name.split('.')[0]			
				if((Test-Path $rptPath) -and $index -gt $rptDocsCount) {
					Remove-Item $file.FullName
					Remove-Item -Path "$rptPath" -Recurse
				}
				$index++;
			}
			
			Remove-Item -Path "$jmeterLog\*" -Recurse
		}
		else {
			Remove-Item -Path "$userFolder\*" -Recurse		
		}
	} catch {
		write-host " - Logfiles/rapportages verwijderen is mislukt!" -ForeGroundColor Yellow;
	}
}

function StartWarmingUp() {	
	# RUN WARMING-UP LOAD TEST
	if($runJmeter) {
		write-host " - Site voorbereiden:" $siteUrl;
		cmd /c $StartJmeterNoGUI -n -t $TestPlanWarmingUp -j $jmeterLogFile -J LoginUser=$loginUser -J LoginPassword=$loginPassword -J ReportDir=$userFolder | Out-Null;
	}
}

function StartLoadTest() {	
	if($runJmeter) {	
		# RUN LOAD TEST 1: DEV_TEST		
		write-host " - Loadtest uitvoeren:" $siteUrl;
		cmd /c $StartJmeterNoGUI -n -t $TestPlan -j $jmeterLogFile -J LoginUser=$loginUser -J LoginPassword=$loginPassword -J ReportDir=$userFolder -J ExecutionTime=$runTime | Out-Null;
	}
}

function UpdateRunningStatus() {
	Get-ChildItem -Path $resultsFolder -Filter "*_StartedBy.txt" | foreach { $_.Delete()}
}

function CheckPerformance($file_path) {
	$lines = Import-Csv $file_path | ? success -eq "true";
	if($lines) {
		$docsAD = ($lines | where {$_.label -Like '*KP01_03_Aanmaken_document*'}).Count;
		$docsVA = ($lines | where {$_.label -Like '*KP02_03_Aanmaken_document*'}).Count;
		$verschilAd = $thresholdAd - $docsAD
		$veschilVa = $thresholdVa - $docsVA
		if($verschilAd -ge  $performanceMarge -or $veschilVa -ge $performanceMarge) {
			return $false;
		}
	}
	
	return $true;
}

function CreateReport() {
	write-host " - Rapport genereren..."
	$file = Get-ChildItem -Path $userFolder -Filter "loadtest_*.csv" | Sort -Property {$_.FullName} -Descending | select -first 1		
	$lines = Import-Csv $file.FullName | ? label -like "Parameters*";
	$errors = Import-Csv $file.FullName | ? success -like "false";

	$lines | Foreach-Object {
		$pars = $_.label.split(';');
		$par1 = $pars[1];
		$par2 = $pars[2];
		$par3 = $pars[3];
		$par4 = $pars[4];
		$par5 = $pars[5];
		$par6 = $pars[6];
		$par7 = $pars[7];
		$par8 = $pars[8];
	}
			
	# Documents count overview	
	$body += "<br/>"
	
	if($errors) {
		$body = "<br/><div style=color:red>Fout in: " + $errors[0].label + "<br/>" + $errors[0].responseMessage + "</div><br/>"
	}

	if(!$performanceIsOk) {
		$body += "<br/><div style=color:red>LETOP: Performance is slecht geworden t.o.v. de baseline!</div><br/>";
	}
	
	$body += "<div style='font-size:20; font-weight: bold'>Documents:</div>"
	$body += "<table>"
	$body += "<tr><td style='width: 130px'>Versie</td><td style='width: 140px'>Datum</td><td style='width: 130px'>#VA acties</td><td style='width: 150px'>#VA Documenten</td><td style='width: 130px'>#AD acties</td><td style='width: 130px'>#AD documenten</td><td style='width: 80px'>#Errors</td><td>Site</td></tr>"
	
	$files = Get-ChildItem -Path $userFolder -Filter "loadtest_*.csv" | Sort -Property {$_.FullName} -Descending | select -first $rptDocsCount
	foreach ($file in $files) {		
		$lines = Import-Csv $file.FullName | ? success -eq "true";
		$errors = Import-Csv $file.FullName | ? success -eq "false";
		$actionsVA = 0;
		$docsVA = 0;
		$actionsAD = 0;
		$docsAD = 0;
		$version = "";
		$url = "";		
		
		if(!$lines) {
			continue;
		}
		
		$rptPath = $userFolder + $file.Name.split('.')[0]			
		if(!(Test-Path $rptPath) -and $lines.Length -gt 10) {
			$csv = $userFolder + $file.Name
			cmd /c $StartReportGen -g $csv -o ($csv.Substring(0,$csv.Length-4))
			
			# Unblock files
			Get-ChildItem -Path $rptPath -Filter "*.js" -recurse | %{
				Unblock-File -Path $_.FullName | Out-Null;
			}		
		}
		
		if($errors) {
			$fileDate = $errors[0].timeStamp
		} else {
			$fileDate = $lines[0].timeStamp			
		}
		$time = $file.FullName.split('-')[1];
		$time = $time.Substring(0,2) + ":" + $time.Substring(2,2)
		
		$docsAD = ($lines | where {$_.label -Like '*KP01_03_Aanmaken_document*'}).Count;
		$docsVA = ($lines | where {$_.label -Like '*KP02_03_Aanmaken_document*'}).Count;
		$actionsAD = ($lines | where {$_.label -Like '*KP01_*'}).Count;
		$actionsVA = ($lines | where {$_.label -Like '*KP02_*'}).Count;
		$pars = ($lines | where {$_.label -Like 'Parameters*'});	
		if($pars -ne $null) {
			$version = $pars.label.split(';')[1];
			$url = $pars.label.split(';')[3];
		}
					
		if($errors) {			
			$body += "<tr style=color:red>"
		} else {
			$body += "<tr>"
		}
		
		$body += "<td>" + $version + "</td>"
		$body += "<td>" + $fileDate + " " + $time + "</td>"
		$body += "<td>" + $actionsVA + "</td>"
		$body += "<td>" + $docsVA  + "</td>"
		$body += "<td>" + $actionsAD + "</td>"
		$body += "<td>" + $docsAD  + "</td>"
		$body += "<td>" + $errors.Length  + "</td>"
		$body += "<td>" + $url + "</td>"
		$body += "</tr>"	
		
	}	

	$body += "<tr style='color: gray; height: 40px'><td style='width: 130px'>Basissnelheid</td><td style='width: 140px'></td><td style='width: 130px'>6224</td><td style='width: 150px'>"+$thresholdVa+"</td><td style='width: 130px'>3295</td><td style='width: 130px'>"+$thresholdAd+"</td><td style='width: 80px'></td><td></td></tr>"

	$body += "</table>"	

	# Statistics overview
	$temp = "<tbody>"
	for ($i=0; $i -le 150; $i++) 
	{
		$temp += "<tr>";
		for ($j=0; $j -le $rptStatisticsCount; $j++) 
		{
			if($i -eq 0) {
				$temp += "<td style='padding-right: 30px; font-weight: bold; border-bottom: 1px solid gray'></td>";
			} else {
				$temp += "<td style='padding-right: 30px'></td>";
			}
		}
		$temp += "</tr>";
	} 
	$temp += "</tbody>"
	$xmlTemp = [xml]$temp;
	
	$rptSrc = $location + $htmlRapport
	if(!(Test-Path $rptSrc)) {
		$rptStatisticsCount = 0;
	}
	
	$ie = New-Object -com InternetExplorer.Application
	$ie.visible=$false
	#$raports = Get-ChildItem -Path $userFolder | ?{$_.PSIsContainer -and $_.name -like "loadtest_*" } | Sort -Property {$_.FullName} -Descending | select -first $rptStatisticsCount	
	$raports = Get-ChildItem -Path $userFolder -Filter "loadtest_*.csv" | Sort -Property {$_.FullName} -Descending | select -first $rptStatisticsCount
	$colIndex = 1;	
	foreach ($rpt in $raports) {
		$rptFolder = $rpt.FullName.split('.')[0];
		$htmlRapportPath = $rptFolder + $htmlRapport;
		if(Test-Path $rptFolder) {
			Copy-Item $rptSrc $htmlRapportPath
		}
		
		if(Test-Path $htmlRapportPath) {
			$ie.navigate($htmlRapportPath);
			while($ie.ReadyState -ne 4) {start-sleep -m 3000}

			$table = [System.__ComObject].InvokeMember("getElementById",[System.Reflection.BindingFlags]::InvokeMethod, $null, $ie.Document, 'statisticsTable')		
			$statistics = [xml]$table.lastChild.outerHTML;	
			
			if($statistics -eq $null) {
				Continue;
			}
			
			# Fill Version number
			$pars = $statistics.SelectNodes("//tr") | ?{$_.td -like 'Parameters*'};
			$siteName = "devtest"
			if($pars -ne $null) {
				$pars = $pars.childNodes[0].InnerText.Split(';')
				$version = $pars[1]
				if($pars[3] -like '*_*') { $siteName = $pars[3].Split('_')[1]}
				$firstRow = $xmlTemp.SelectNodes("//tr") | select -first 1;
				$firstRow.childNodes[0].InnerText = "Actie/Versie";
				$firstRow.childNodes[$colIndex].InnerXml = $version + "<div>"+$siteName+"</div>";
			}
			
			# Fill Average number
			$rows = $statistics.SelectNodes("//tr");			
			for ($i=0; $i -le $rows.Count-1; $i++) 
			{ 
				$label = $rows[$i].childNodes[0].InnerText
				if($label.startsWith('KP01') -or $label.startsWith('KP02')) {
					$average = $rows[$i].childNodes[4].InnerText
					$row = $xmlTemp.SelectNodes("//tr") | ?{$_.td[0].InnerText -eq $label};
					if($row -eq $null) {
						$row = $xmlTemp.SelectNodes("//tr") | ?{$_.td[0].InnerText -eq ''} | select -first 1;					
					}
					if($row -ne $null) {
						$row.childNodes[0].InnerText = $label;
						$row.childNodes[$colIndex].InnerText = $average;
					}
				}
			}		
			$colIndex += 1;						
		}
	}
	
	# Remove empty rows
	$rows = $xmlTemp.SelectNodes("//tr") | ?{$_.td[0].InnerText -eq ""};
	for ($i=0; $i -le $rows.Count-1; $i++) 
	{
		$xmlTemp.childNodes.RemoveChild($rows[$i]) | Out-Null;
	}

	# Add styling
	if($colIndex -gt 2) {
		$rows = $xmlTemp.SelectNodes("//tr") | ?{$_.td[0].InnerText -ne ""};
		for ($i=1; $i -le $rows.Count-1; $i++) 
		{
			# Red
			$current = $rows[$i].childNodes[1].InnerText;
			$prev = $rows[$i].childNodes[2].InnerText;
			$verschil = $current - $prev;
			if($verschil -gt $averageLimit) {
				$attr = $rows[$i].OwnerDocument.CreateAttribute("Style");
				$attr.Value = "color: red;"
				$rows[$i].childNodes[1].Attributes.Append($attr) | Out-Null;
			}
			
			# Green
			$verschil = $prev - $current;
			if($verschil -gt $averageLimit) {
				$attr = $rows[$i].OwnerDocument.CreateAttribute("Style");
				$attr.Value = "color: green;"
				$rows[$i].childNodes[1].Attributes.Append($attr) | Out-Null;
			}
		}
	}
			
	$ie.Quit();
	$ie = $null;

	$body += "<br/>"
	$body += "<div style='font-size:20; font-weight: bold'>Statistics <span style='font-size:12; font-weight: bold'>(gemiddelde in milliseconden, KP01=AD, KP02=VA)<span>:</div>"
	$body += "<table>";
	if($colIndex -gt 1) {
		$body += $xmlTemp.InnerXML;
	}
	else {
		$body += "<div style='color: red'>Kan statistics overzicht niet ophalen. Lees instructies in readme.txt</div>";
	}
	$body += "</table>";

	# Footer
	$body += "<br/><hr/>"
	$body += "<font face='Verdana' color='Gray' size='1'>"
	$body += "<div><strong>Loadtest parameters</strong></div>"
	$body += "<table style='font:Verdana; color:gray; font-size:12'>"
	$body += "<tr><td style='width: 130px'>Bravo versie:</td><td>" + $par1 + "</td></tr>"
	$body += "<tr><td style='width: 130px'>WebserverIpAdres:</td><td>" + $par2 + "</td></tr>"
	$body += "<tr><td style='width: 130px'>WebservUrl:</td><td>" + $par3 + "</td></tr>"
	$body += "<tr><td style='width: 130px'>pdcOdinDbName:</td><td>" + $par6 + "</td></tr>"
	$body += "<tr><td style='width: 130px'>pdcDatabaseServer:</td><td>" + $par7 + "</td></tr>"
	$body += "<tr><td style='width: 130px'>pdcRootDirectory:</td><td>'" + $par8 + "'</td></tr>"
	$body += "</table>"
	$body += "</font>"	
	
	return $body;
}

function SendMail($isOk, $body) {
	write-host " - E-mail verzenden..."	
	switch ( $userName )
	{
		"mohamed" { $recipients = @("Mohamed <mohamed.adardour@uwv.nl>") }
		"rachid" { $recipients = @("Rachid <Rachid.elBali@uwv.nl>") }
		"rutger" { $recipients = @("Rutger <Rutger.Koole@uwv.nl>") }
		"frank" { $recipients = @("Frank <Frank.Pennings@uwv.nl>") }
		"dennis" { $recipients = @("Dennis <Dennis.vanHerk@uwv.nl>") }
		"katja" { $recipients = @("Katja <Katja.Heuszner-01@uwv.nl>") }
		default { $recipients = @("Mohamed <mohamed.adardour@uwv.nl>")}
	}			
	
	$subject = "LoadTest result: Success";
	if($isOk -eq $false) {
		$subject = "LoadTest result: Failed";	
	}
	
	if($sendMailToAll) {
		$recipients = @("Mohamed <mohamed.adardour@uwv.nl>", "Rachid <Rachid.elBali@uwv.nl>", "Rutger <Rutger.Koole@uwv.nl>", "Frank <Frank.Pennings@uwv.nl>", "Dennis <Dennis.vanHerk@uwv.nl>", "Katja <Katja.Heuszner-01@uwv.nl>", "Katinka <Katinka.dekoning@uwv.nl>", "Hugo <Hugo.derijk@uwv.nl>")
	}
	
	Send-MailMessage -To $recipients -From "bravo@uwv.nl" -Subject $subject -BodyAsHtml -Body $body -SmtpServer "uwvmailrelay.voorzieningen.uwv.nl"
	#Send-MailMessage -To $recipients -From "mohamed.adardour@uwv.nl" -Subject $subject -BodyAsHtml -Body $body -SmtpServer "10.140.178.102" -Port "25"
}

function CheckLogErrors() {			
	try {		
		if (!(Test-Path $logPath)) {
			$logPath = "C:\Logfiles";
		}
	
		$html += "<div><span style='font-size:20; font-weight: bold'>Log4net Errors:</span>"
		$logFiles = Get-ChildItem -Path $logPath -Filter "*.Bravo*.csv" | Sort -Property {$_.LastWriteTime} -Descending | select -first 3
		$errCount = 0;
	
		foreach ($logFile in $logFiles) {			
			if ($logFile.LastWriteTime.Date -ge [datetime]::Today){
				$errors = Import-Csv $logFile.FullName -Delimiter ";" | ? Level -eq "ERROR";
				$errCount += $errors.Length;																
			}
		}
		if($errCount -ne 0) {
			$html += "<span style=color:red> " + $errCount + " errors gevonden!</span>";
			$html += "<div>Check logfile:$logPath</div>"
		}
		else {
			$html += " Geen";
		}	
	} catch {
		$html += "<span style=color:red>Kan logfiles niet lezen!</span>";
	}
	$html += "</div>";
	return $html;
}

function ChoiceIsValid($type) {
	switch ( $type )
	{
		1 { return $true; }
		2 { return $true; }
		3 { return $true; }
		4 { return $true; }
		5 { return $true; }
		default { return $false; }
	}
}

function CompleteProcess() {
	$file = Get-ChildItem -Path $userFolder -Filter "loadtest_*.csv" | Sort -Property {$_.FullName} -Descending | select -first 1
	
	if($file -ne $null) {
		$isOk = IsSucceded($file.FullName);
		$performanceIsOk = CheckPerformance($file.FullName);
		$body = "<div style='font-size:22; font-weight: bold'>BRAVO PERFORMANCE TEST</div></br>"
		$body += CheckLogErrors;		
		$body += CreateReport;		
		SendMail $isOk $body;
		
		if(!$isOk) {
			# throw error
			throw "Er zijn errors gevonden in de logfile."
		}
		
		if(!$performanceIsOk) {
			# throw error
			throw "Performance lijkt slecht te worden! Er zijn minder documenten gemaakt dan verwacht."
		}
	}
}

function OnlyReport() {
	$sendMailToAll = $false;
	
	#EnsureFolders
	#RestartPdcServices	
	#StartWarmingUp;
	#CompleteProcess;	
	#CleanTestData;
	
	exit;
}

try {		
		
	$now = [datetime]::Now;							
						
	write-host "`nStarted on $now";
	write-host ""
	write-host "Run loadtest:" -ForeGroundColor Yellow;
	
	#OnlyReport
	
	CheckRunningStatus;	
	EnsureFolders;
	WriteArgsToCsv;	
	RestartPdcServices;
	StartWarmingUp;	
	DeleteReportsAndLogs
	CleanTestData;
	StartLoadTest;
	CompleteProcess
	UpdateRunningStatus;
	
	$now = [datetime]::Now;
	write-host "`nFinished on $now";
	write-host ""

	
} catch {
    UpdateRunningStatus
	throw "Er is een fout opgetreden!`n $($Error[0])"
}
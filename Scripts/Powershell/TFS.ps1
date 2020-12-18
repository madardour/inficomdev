.27
C:\Program Files\Microsoft SQL Server\MSSQL11.MSSQLSERVER\MSSQL\DATA\
VMT010140177027
vmt010140177027.test.local
10.140.177.27

.85
C:\Program Files\Microsoft SQL Server\MSSQL11.MSSQLSERVER\MSSQL\DATA\
vmt010140176085

.36
VMD010140178136
E:\Program Files\Microsoft SQL Server\MSSQL11.MSSQLSERVER\MSSQL\DATA

Buildserver:
\\10.140.178.175

and(succeeded(), ne(variables['DeploymentKey'], 'Data'))
--------------------------------------
LDAP
LDAP://10.140.176.40/DC=otodwpol,DC=nl
srvcbravoldap
Welkom01
----------------------------
MqService EAED
MqSerive MisDb
ScoService
CloseCaseService
CleanupService
RekenToolService

Get-Service -DisplayName "BravoMqServiceMisDb" | Remove-Service
Remove-Service "BravoMqServiceMisDb"
sc delete "BravoMqServiceMisDb"
sc delete "BravoMqServiceEAED"
sc delete "BravoScoService"
sc delete "BravoDocumentCleanupService"
sc delete "BravoCloseCaseService"
sc delete "BravoScoWCFWindowsService"
sc delete "BravoCasusAfsluitenService"
sc delete "BravoCleanupService"

sc delete "BravoRekenToolService_Demo"
sc create "BravoRekenToolService_Demo" binPath= "C:\BravoServices\BravoRekenTool_DEMO\BravoRekenToolService.exe" DisplayName= "BravoRekenToolService_Demo" obj= "test\PdcWebUser" password= "sdf*34JK#c" start= "auto"

sc delete "BravoMqServiceEAED"
sc create "BravoMqServiceEAED" binPath= "E:\Users\Mad\Git\Service-Mq\BravoMqService\bin\Debug\BravoMqService.exe" DisplayName= "BravoMqServiceEAED" obj= "test\PdcWebUser" password= "sdf*34JK#c" start= "auto"
sc create "BravoMqServiceMisDb" binPath= "E:\Users\Mad\Git\Service-Mq\BravoMqService\bin\Debug\BravoMqService.exe" DisplayName= "BravoMqServiceEAED" obj= "test\PdcWebUser" password= "sdf*34JK#c" start= "auto"

sc create "BravoCloseCaseService" binPath= "E:\Users\Mad\Git\Service-CloseCase\BravoCloseCaseService\bin\Debug\BravoCloseCaseService.exe" DisplayName= "BravoCloseCaseService" obj= "dev\PdcWebUser" password= "dk&3*d%D" start= "demand"
sc create "BravoScoService" binPath= "E:\Users\Mad\Git\Service-Sco\BravoScoService\BravoScoService\bin\Debug\BravoScoService.exe" DisplayName= "BravoScoService" obj= "dev\PdcWebUser" password= "dk&3*d%D" start= "demand"

---------------------------------
$Username = '$(WebServerUser)'
$Password = '$(WebServerPassword)'
$pass = ConvertTo-SecureString -AsPlainText $Password -Force
$cred = New-Object System.Management.Automation.PSCredential -ArgumentList $Username,$pass

Invoke-Command -ComputerName $(WebServerAddress) -credential $cred -ErrorAction Stop -Script { 
    if(Test-Path $(UpdateBravoDir)) {
        svn export "https://10.140.178.35/svn/BRAVO/trunk/UWV.BRAVO.DbUpdateFiles/Backup" $(UpdateBravoDir) --username $(SvnUser) --password $(SvnPass) --non-interactive --trust-server-cert --trust-server-cert-failures "cn-mismatch,unknown-ca,expired,not-yet-valid,other" --force
    }
}
---------------------------------
$releaseId = "$(Release.DeploymentId)";
$buildNr = "$(Release.Artifacts.BravoBuild.BuildNumber)";
$buildId = $buildNr.Split('B')[1];

$raptorDllLoc = Resolve-Path -Path "$(System.DefaultWorkingDirectory)/BravoBuild/drop/UWV.BRAVO.RAPTOR/bin/UWV.BRAVO.RAPTOR.dll"
$AssemblyVersion = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($raptorDllLoc).FileVersion;

$deployVersion = "$AssemblyVersion.$buildId.$releaseId";
$path = "$(System.DefaultWorkingDirectory)/BravoBuild/drop"
$packages = Get-ChildItem *.dar -Path $path -Recurse
foreach($package in $packages)
{
	$packageNewName = $package.FullName -replace "{{version}}", $deployVersion
    Rename-Item -Path $package.FullName $packageNewName;
    $zipfileName = $packageNewName
    $fileToEdit = "deployit-manifest.xml"

    # Open zip and find the particular file (assumes only one inside the Zip file)
    [Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null;
    $dar =  [System.IO.Compression.ZipFile]::Open($zipfileName,"Update")

    $manifestPath = $dar.Entries.Where({$_.name -like $fileToEdit})
    
    # Read the contents of the file
    $desiredFile = [System.IO.StreamReader]($manifestPath).Open()
    $text = $desiredFile.ReadToEnd()
    $desiredFile.Close()
    $desiredFile.Dispose()
    $text = $text -replace  "{{version}}","$deployVersion"
    #update file with new content
    $desiredFile = [System.IO.StreamWriter]($manifestPath).Open()
    $desiredFile.BaseStream.SetLength(0)

    # Insert the $text to the file and close
    $desiredFile.Write($text)
    $desiredFile.Flush()
    $desiredFile.Close()
    $dar.Dispose()

   # rename sql files in DB dar file
   $pattern = '^\d+-'
   if($package.Name -like '*Bravo-DB*') {
      $dbPath = "$path\Bravo-DB";
      if (Test-Path $dbPath) {
         Remove-Item -Recurse -Force $dbPath
      }
      [System.IO.Compression.ZipFile]::ExtractToDirectory($packageNewName, $dbPath);
      
      $fileId = $deployVersion -replace '\.', '';
      Get-ChildItem -Path "$dbPath\UWV.BRAVO.XLDeploy\Database\SqlScripts" -Filter "*.sql" | foreach {
        
         if($_.Name -notmatch $pattern){
            throw "Sql bestand $_.Name voldoet niet aan XLDeploy naamconventie! Naam moet beginnen met een nummer gevolgd door streepje (bijv. 01-example.sql).";
         }

         if($_.Name -notlike "*$fileId*") { 
            $newName =  $_.Name -replace '\.sql', "-$fileId.sql";
            Write-Host "Hernoem $_.Name naar $newName";
            Rename-Item -Path $_.FullName $newName;
         }
      }
      
      if (Test-Path $packageNewName) {
         Remove-Item -Recurse -Force $packageNewName
      }      
      [System.IO.Compression.ZipFile]::CreateFromDirectory($dbPath, $packageNewName) 
   } 
   
   # Write the changes and close the zip file

  Write-Host "dar file updated"
}

---------------------------------
$path = "C:\temp\mad";
$version = "1.1.68.1";

Write-Host "Identifier toevoegen aan de naam van sql scripts";
$fileId = $version -replace '\.', '';
Get-ChildItem -Path $path -Filter "*.sql" | foreach {
   Write-Host $_.Name;
   if($_.Name -notlike "*$fileId*") { 
      $newName =  $_.Name -replace '\.sql', "-$fileId.sql";
      Rename-Item -Path $_.FullName $newName;
   }
}
-----------------------------
$xldApiUrl = "http://10.140.176.236:4516/deployit";
$Username = 'madardour'
$Password = 'UWV_55!3'
$pass = ConvertTo-SecureString -AsPlainText $Password -Force
$cred = New-Object System.Management.Automation.PSCredential -ArgumentList $Username,$pass

$manifestPath = "$(build.stagingDirectory)\App_XLDeploy\Database\deployit-manifest.xml";
[xml]$manifestFile = Get-Content $manifestPath;
$AssemblyVersion = $manifestFile.SelectSingleNode("//udm.DeploymentPackage/Version");

try {
   $isDeployed = Invoke-RestMethod -Credential $cred -Method GET -Uri "$xldApiUrl/repository/exists/Environments/SMZ/BRAVO/FAT/Bravo_Frontend/Bravo-FE";
   if($isDeployed.boolean -eq 'true') {
      $ci = Invoke-RestMethod -Credential $cred -Method GET -Uri "$xldApiUrl/repository/ci/Environments/SMZ/BRAVO/FAT/Bravo_Frontend/Bravo-FE"; 
      $version = $ci.'udm.DeployedApplication'.version.ref;
      $version = $version.split('/')[4];
      if($AssemblyVersion -eq $version) {
         Throw "Versienummer is niet verhoogd! Verhoog het versienummer en start een nieuwe build.";
      }
      Write-Host "Versienummer: $AssemblyVersion";
   }
}
catch {
    throw "Er is een fout opgetreden!`n $($Error[0])"
}
-------------------------------------

Write-Host "##vso[build.addbuildtag]Created by $(Build.RequestedFor)"
if("$(WithUITest)" -eq "true"){
    Write-Host "##vso[build.addbuildtag]Autostart UI Test"
}

if("$(WithLoadTest)" -eq "true"){
    Write-Host "##vso[build.addbuildtag]Start LoadTest"
}

$path = "UWV.BRAVO.RAPTOR\Properties\AssemblyInfo.cs"
$pattern = '\[assembly: AssemblyVersion\("(.*)"\)\]'
(Get-Content $path) | ForEach-Object{
    if($_ -match $pattern){
        # We have found the matching line
        # Edit the version number and put back.
        $fileVersion = [version]$matches[1]
        $AssemblyVersion = "{0}.{1}.{2}.{3}" -f $fileVersion.Major, $fileVersion.Minor, $fileVersion.Build, $fileVersion.Revision
        $rev = svn info --show-item last-changed-revision | Out-String
        $buildName = "$(Build.SourceBranchName)-$AssemblyVersion-Rev$($rev)-B$($Env:BUILD_BUILDNUMBER)" -replace "`n|`r";
        Write-Host $buildName;

        Write-Host "##vso[task.setvariable variable=AssemblyVersion]$AssemblyVersion ";
        Write-Host "##vso[task.setvariable variable=RevNr]$rev";
        Write-Host "##vso[build.updatebuildnumber]$buildName";

# Update version in manifestfiles for XLDeploy
   $manifestPath = "$(Build.SourcesDirectory)\UWV.BRAVO.RAPTOR\App_XLDeploy\deployit-manifest.xml";
   [xml]$manifestFile = Get-Content $manifestPath;
   $node = $manifestFile.SelectSingleNode("//udm.DeploymentPackage");
   $node.SetAttribute("version", $AssemblyVersion);
   
   $node = $manifestFile.SelectSingleNode("//udm.DeploymentPackage/applicationDependencies/entry[@key='Bravo-DB']");
   if($node -ne $null) {
      $node.InnerText = $AssemblyVersion;      
   }
   $manifestFile.Save($manifestPath);
   
   $manifestPath = "$(Build.SourcesDirectory)\UWV.BRAVO.RAPTOR\App_XLDeploy\Database\deployit-manifest.xml";
   [xml]$manifestFile = Get-Content $manifestPath;
   $node = $manifestFile.SelectSingleNode("//udm.DeploymentPackage");
   $node.SetAttribute("version", $AssemblyVersion);
   $manifestFile.Save($manifestPath);

    } else {
        # Output line as is
        $_
    }
}

svn export $(Build.Repository.Uri)/trunk/UWV.BRAVO.DbUpdateFiles --username $(SvnUser) --password $(SvnPass) --non-interactive --trust-server-cert
svn export $(Build.Repository.Uri)/trunk/UWV.BRAVO.DevFatOnlyScripts --username $(SvnUser) --password $(SvnPass) --non-interactive --trust-server-cert
svn export $(Build.Repository.Uri)/trunk/PDC_DATA/XsdGenerator/DataBRavo.xsd --username $(SvnUser) --password $(SvnPass) --non-interactive --trust-server-cert
svn export $(Build.Repository.Uri)/trunk/BuildScripts/CheckSonarStatusAndSendMail.ps1 --username $(SvnUser) --password $(SvnPass) --non-interactive --trust-server-cert

Move-Item -Path "UWV.BRAVO.DbUpdateFiles" -Destination "$(build.stagingDirectory)" -Force

New-Item -Path $(build.stagingDirectory)\UWV.BRAVO.DbUpdateFiles\UpdateXsd -ItemType Directory -Force
Move-Item -Path "DataBRavo.xsd" -Destination "$(build.stagingDirectory)\UWV.BRAVO.DbUpdateFiles\UpdateXsd\DataBRavo.xsd" -Force

# move xldeploy folder, this must not be included in package
move-item -Path $(build.stagingDirectory)\UWV.BRAVO.RAPTOR\App_XLDeploy -Destination $(build.stagingDirectory)

# copy xsd file
$targetPath = "$(build.stagingDirectory)\App_XLDeploy\Database\Command"
Copy-Item -Path $(build.stagingDirectory)\UWV.BRAVO.DbUpdateFiles\UpdateXsd\* -Destination $targetPath

# copy sqlscripts
$targetPath = "$(build.stagingDirectory)\App_XLDeploy\Database\SqlScripts"
if (!(Test-Path $targetPath)) {
   New-Item -Path $targetPath -ItemType Directory -Force
}
Copy-Item -Path $(build.stagingDirectory)\UWV.BRAVO.DbUpdateFiles\SqlScripts\* -Destination $targetPath

# replace config files
$sourcePath = "$(build.stagingDirectory)\UWV.BRAVO.RAPTOR\EnvironmentSettings\XLDeploy"
if (Test-Path $sourcePath ) {
   Copy-Item -Path $sourcePath\* -Destination "$(build.stagingDirectory)\UWV.BRAVO.RAPTOR\EnvironmentSettings\" -Recurse -Force
   Remove-Item -Recurse -Force $sourcePath
}

$Username = '$(WebServerUser)'
$Password = '$(WebServerPassword)'
$pass = ConvertTo-SecureString -AsPlainText $Password -Force
$cred = New-Object System.Management.Automation.PSCredential -ArgumentList $Username,$pass
$physicalPath = "C:\Bravo_TEST\Bravo_Deploy";
if("$(DeploymentKey)" -ne "-") {
   $physicalPath = "C:\Bravo_TEST_$(DeploymentKey)\Bravo_Deploy";
}

# vervang ckeditor config file
$configFile = "$(System.DefaultWorkingDirectory)/BravoBuild/drop/App_XLDeploy/ckeditor/config.js";
if("$(WebServerAddress)" -notlike "*85*") {
   $configFile = "$(System.DefaultWorkingDirectory)/BravoBuild/drop/App_XLDeploy/ckeditor/config-dev.js";
}
$TargetSession = New-PSSession -ComputerName $(WebServerAddress) -credential $cred;
Copy-Item -ToSession $TargetSession -Path $configFile -Destination "$physicalPath\Scripts\ckeditor\config.js" -Recurse -Force;

# breng site online
Invoke-Command -ComputerName $(WebServerAddress) -credential $cred -ErrorAction Stop -Script { 
   try {
      & $(UpdateBravoDir)\BringOnline.ps1 -WebServerDeployDir $using:physicalPath
   }
   catch {
      Write-Host "Error by setting site online. File missing or website already online."
   }
}

# Define XLDeploy environment based on current user
$currentUser = "$(Release.RequestedFor)";
$currentUser = $currentUser.Split(' ')[0]

write-host "##vso[task.setvariable variable=DeploymentKey]$currentUser"

$Username = '$(WebServerUser)'
$Password = '$(WebServerPassword)'
$pass = ConvertTo-SecureString -AsPlainText $Password -Force
$cred = New-Object System.Management.Automation.PSCredential -ArgumentList $Username,$pass

Invoke-Command -ComputerName $(WebServerAddress) -credential $cred -ErrorAction Stop -Script { 
    & $(LoadtestBravoDir)\Scripts\CreateBackup.ps1 -WebServerBackupRoot "$(BackupRootDir)" -DatabaseServer "$(BravoDatabaseServer)" -DatabaseName "$(BravoDatabaseName)"
}

$Username = '$(WebServerUser)'
$Password = '$(WebServerPassword)'
$pass = ConvertTo-SecureString -AsPlainText $Password -Force
$Cred = New-Object System.Management.Automation.PSCredential -ArgumentList $Username,$pass

Invoke-Command -ComputerName $(WebServerAddress) -credential $cred -ErrorAction Stop -Args $Username,$Password -Script  { 
    param($Username, $Password)
    (New-Object -ComObject WScript.Network).MapNetworkDrive(
      "X:", "\\$(WebServer)\Logfiles", $false, $Username, $Password
    )
    & $(LoadtestBravoDir)\Bravo_Loadtest.ps1 -webServer "$(BravoDatabaseServer)" -siteUrl "$(Url)" -loginUser "$(SvnUser)" -loginPassword "$(SvnPass)" -pdcRootDir "$(PdcRootDir)" -backupRootDir "$(BackupRootDir)" -bravoDatabaseName "$(BravoDatabaseName)" -bravoDatabaseServer "$(BravoDatabaseServer)" -pdcDatabaseName "$(PdcDatabaseName)" -pdcDatabaseServer "$(PdcDatabaseServer)" -userName "$(User)" -pdcServer "$(PdcServer)"
} 
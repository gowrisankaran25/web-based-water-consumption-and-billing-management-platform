# Portable Maven Wrapper PowerShell script
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mvnHome = Join-Path $scriptDir ".mvn\apache-maven-3.9.9"
$mvnCmd = Join-Path $mvnHome "bin\mvn.cmd"

if (-not (Test-Path $mvnCmd)) {
    Write-Host "Setting up portable Maven 3.9.9..." -ForegroundColor Cyan
    $zipPath = Join-Path $scriptDir ".mvn\maven-bin.zip"
    $downloadUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
    
    if (-not (Test-Path $zipPath)) {
        Write-Host "Downloading Apache Maven 3.9.9..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
    }
    
    Write-Host "Extracting Apache Maven..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath (Join-Path $scriptDir ".mvn") -Force
    Remove-Item -Path $zipPath -Force
}

Write-Host "Executing Maven with arguments: $Arguments" -ForegroundColor Green
& $mvnCmd @Arguments

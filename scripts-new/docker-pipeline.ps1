param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("full", "validate")]
    $Mode = "validate"
)

$ImageName = "agency-pipeline-tester"
$WorkflowScript = ""

if ($Mode -eq "validate") {
    Write-Host "--- [SEARCH] Mode: VALIDATION ONLY (WF-2) ---" -ForegroundColor Yellow
    $WorkflowScript = "scripts-new/wf-2-project-validation.ts"
} else {
    Write-Host "--- [WARNING] Mode: FULL BOOTSTRAP (WF-1) ---" -ForegroundColor Red
    $WorkflowScript = "scripts-new/wf-1-template-bootstrap.ts"
}

Write-Host "--- [BUILD] Baue Docker Image ($ImageName)... ---" -ForegroundColor Cyan
docker build -t $ImageName .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build fehlgeschlagen!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "--- [RUN] Starte $Mode Pipeline im Linux-Container... ---" -ForegroundColor Cyan

# Wir mounten: 
# 1. Den aktuellen Ordner nach /app (für Live-Code updates)
# 2. Die lokale .env (damit echte Secrets vorhanden sind)

docker run --rm -it `
    -v "${PWD}:/app" `
    --env-file .env `
    $ImageName npx -y tsx $WorkflowScript

Write-Host "--- [SUCCESS] Docker-Pipeline beendet. ---" -ForegroundColor Green

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "已生成 deploy/one-click/.env，请先填写 SPRING_AI_OPENAI_API_KEY 后重新执行。"
    exit 1
}

docker compose up -d

param(
    [string]$SupabaseUrl = "https://djirwwtijunzrpanfxwa.supabase.co",
    [string]$ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaXJ3d3RpanVuenJwYW5meHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQwODU1NSwiZXhwIjoyMDkzOTg0NTU1fQ.dsCtVODdWUop-qwP2oWttc7JFhRftPUhW-bMu-0c9F0"
)

$headers = @{
    "apikey"        = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type"  = "application/json"
}

function Invoke-SQL {
    param([string]$Label, [string]$Sql)
    Write-Host "`n=== $Label ===" -ForegroundColor Cyan
    $body = @{ query = $Sql } | ConvertTo-Json -Depth 10
    try {
        $response = Invoke-RestMethod `
            -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop
        Write-Host "OK" -ForegroundColor Green
        return $true
    } catch {
        # Try the pg endpoint instead
        try {
            $response = Invoke-RestMethod `
                -Uri "$SupabaseUrl/pg/query" `
                -Method POST `
                -Headers $headers `
                -Body $body `
                -ErrorAction Stop
            Write-Host "OK (pg endpoint)" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Read migration files
$migration001 = Get-Content "supabase\migrations\001_initial_schema.sql" -Raw
$migration002 = Get-Content "supabase\migrations\002_rls_policies.sql" -Raw
$seed         = Get-Content "supabase\seed.sql" -Raw

Write-Host "Running migrations against $SupabaseUrl" -ForegroundColor Yellow

$r1 = Invoke-SQL "Migration 001: Initial Schema" $migration001
$r2 = Invoke-SQL "Migration 002: RLS Policies"  $migration002
$r3 = Invoke-SQL "Seed Data"                     $seed

if ($r1 -and $r2 -and $r3) {
    Write-Host "`nAll migrations completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`nSome migrations failed — check errors above." -ForegroundColor Red
}

Write-Output '=== ADMIN PAGES ==='
 = Get-ChildItem 'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\pages\*.tsx'
 = @()
 = 0
foreach ( in ) {
     = (Get-Content .FullName | Measure-Object -Line).Lines
     += 
     += [PSCustomObject]@{Lines=; File=.Name}
}
 | Sort-Object Lines -Descending | ForEach-Object { Write-Output ('  {0,5}  {1}' -f extglob.Lines, extglob.File) }
Write-Output ('  {0,5}  total' -f )

Write-Output ''
Write-Output '=== DASHBOARD COMPONENTS ==='
 = @(
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\dashboard\DashboardStatsGrid.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\dashboard\SystemHealthCard.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\dashboard\AlertsNotificationsCard.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\dashboard\DashboardQuickActions.tsx'
)
 = 0
foreach ( in ) {
    if (Test-Path ) {
         = (Get-Content  | Measure-Object -Line).Lines
         += 
        Write-Output ('  {0,5}  {1}' -f , (Split-Path  -Leaf))
    } else {
        Write-Output ('  {0,5}  {1} (NOT FOUND)' -f 0, (Split-Path  -Leaf))
    }
}
Write-Output ('  {0,5}  total' -f )

Write-Output ''
Write-Output '=== NOTIFICATION COMPONENTS ==='
 = @(
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\notifications\NotificationHeader.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\notifications\NotificationFilters.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\notifications\NotificationItem.tsx'
)
 = 0
foreach ( in ) {
    if (Test-Path ) {
         = (Get-Content  | Measure-Object -Line).Lines
         += 
        Write-Output ('  {0,5}  {1}' -f , (Split-Path  -Leaf))
    } else {
        Write-Output ('  {0,5}  {1} (NOT FOUND)' -f 0, (Split-Path  -Leaf))
    }
}
Write-Output ('  {0,5}  total' -f )

Write-Output ''
Write-Output '=== INSTITUTION COMPONENTS ==='
 = @(
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\institutions\InstitutionFormModals.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\hooks\useInstitutionActions.ts'
)
 = 0
foreach ( in ) {
    if (Test-Path ) {
         = (Get-Content  | Measure-Object -Line).Lines
         += 
        Write-Output ('  {0,5}  {1}' -f , (Split-Path  -Leaf))
    } else {
        Write-Output ('  {0,5}  {1} (NOT FOUND)' -f 0, (Split-Path  -Leaf))
    }
}
Write-Output ('  {0,5}  total' -f )

Write-Output ''
Write-Output '=== EXERCISE BUILDER COMPONENTS ==='
 = @(
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\exercise-builder\StepBasicInfo.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\exercise-builder\type-configs\index.ts'
)
 = 0
foreach ( in ) {
    if (Test-Path ) {
         = (Get-Content  | Measure-Object -Line).Lines
         += 
        Write-Output ('  {0,5}  {1}' -f , (Split-Path  -Leaf))
    } else {
        Write-Output ('  {0,5}  {1} (NOT FOUND)' -f 0, (Split-Path  -Leaf))
    }
}
Write-Output ('  {0,5}  total' -f )

Write-Output ''
Write-Output '=== SHARED SPRINT 0 COMPONENTS ==='
 = @(
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\shared\AdminPageShell.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\components\shared\AdminTabBar.tsx',
    'C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src\apps\admin\hooks\useAdminPageSetup.ts'
)
 = 0
foreach ( in ) {
    if (Test-Path ) {
         = (Get-Content  | Measure-Object -Line).Lines
         += 
        Write-Output ('  {0,5}  {1}' -f , (Split-Path  -Leaf))
    } else {
        Write-Output ('  {0,5}  {1} (NOT FOUND)' -f 0, (Split-Path  -Leaf))
    }
}
Write-Output ('  {0,5}  total' -f )
@echo OFF

pushd %~dp0
path=%~dp0..;%~dp0..\Scripts;%PATH%

set sleep=n
set /P sleep=sleep computer after scraping? [y/N] 

python ..\Scripts\scrapy.exe crawl tu1182v6
sync64

if "%sleep%" EQU "n" goto :END

:SLEEP
rundll32.exe powrprof.dll,SetSuspendState

:END

REM @echo OFF
pushd %~dp0

set pythonPath=S:\wintools\PortableApps\Python27
path=%pythonPath%;%pythonPath%\Scripts;%PATH%

set sleep=n
set semester=1184
set initDb=False
set /P sleep=sleep computer after scraping? [y/N] 
set /P semester=semester? [%semester%] 
set /P initDb=initDb? [%initDb%] 

rem calling the spider name in the TuPipelineSpider class
touch tuScraper.log
start tail -f tuScraper.log

rem https://doc.scrapy.org/en/latest/topics/spiders.html#spider-arguments
python %pythonPath%\Scripts\scrapy.exe crawl tuSpiderv18 -a semester=%semester% -a initDb=%initDb%
sync64

if "%sleep%" EQU "n" goto :END

:SLEEP
rundll32.exe powrprof.dll,SetSuspendState

:END
pause

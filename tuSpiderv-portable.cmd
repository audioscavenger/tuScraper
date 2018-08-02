REM @echo OFF
pushd %~dp0

set pythonPath=S:\wintools\PortableApps\Python27
path=%pythonPath%;%pythonPath%\Scripts;%PATH%

set sleep=n
set /P sleep=sleep computer after scraping? [y/N] 

rem calling the spider name in the TuPipelineSpider class
touch tuScraper.log
start tail -f tuScraper.log

rem https://doc.scrapy.org/en/latest/topics/spiders.html#spider-arguments
python %pythonPath%\Scripts\scrapy.exe crawl tuSpiderv18 -a semester=1183
sync64

if "%sleep%" EQU "n" goto :END

:SLEEP
rundll32.exe powrprof.dll,SetSuspendState

:END
pause

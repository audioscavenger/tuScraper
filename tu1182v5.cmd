pushd %~dp0
path=%~dp0..;%~dp0..\Scripts;%PATH%
python ..\Scripts\scrapy.exe crawl tu1182v5 -o tu1182v5.json
pause

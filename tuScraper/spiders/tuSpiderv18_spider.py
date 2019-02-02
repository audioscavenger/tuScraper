# -*- coding: utf-8 -*-
# pushd S:\wintools\PortableApps\Python27
# python Scripts\pip.exe install pypiwin32 scrapy arrow
# scrapy shell https://mytumobile.towson.edu/app/catalog/classsection/TOWSN/1182/6764
# scrapy startproject tuScraper
# pushd S:\wintools\PortableApps\tuScraper
# pushd %TEMP%\PortableApps\Python27\tuScraper

# scrapy crawl tuSpiderv18 -o tuSpiderv18.json
# python ..\Scripts\scrapy.exe crawl tuSpiderv18 -o tuSpiderv18.json

# https://doc.scrapy.org/en/latest/intro/tutorial.html#crawling
import os, scrapy, sqlite3, re, datetime, arrow, sys, logging
from shutil import copyfile
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors.sgml import SgmlLinkExtractor

## version 1.8    finally I could parse parameters from the batch command line: created __init__
## version 1.8    initDb and semester are arguments
## version 1.7    blank page detection based on title
## version 1.7    had to quote title in the sql insert query, for some reason (moved to Win10)
## version 1.7    renamed the spider tu1182 to tuSpider
## version 1.7    version database to tuScraper.x-yyyy.sqlite3
## version 1.7    renamed a bunch of variables: total, num, nums, processRange, etc
## version 1.7    added comments and option to reparse classes given a range
## version 1.6    added comments + formating + rewrite some checks + modulo logging
## version 1.5    added multiple checks and formating + db class list retrieval
## version 1.5    added dict_factory method: convert sqlite cursor output to dictionary
## version 1.4    check len(keys) - len(values) becasue some items are missing
## version 1.3    added sqlite3 db + arrow for timestamping
## version 1.3    first round of scrape range 1000-9999 with history table
## version 1.2    saving of html files fetched under parse
## version 1.0    first try for 6764,6765 classe with example found at https://doc.scrapy.org/en/latest/intro/tutorial.html#crawling

# ----------------------------------------------------------------------
# define global variables
# ----------------------------------------------------------------------
version = 1.8
Debug = False
Verbose = True

# initDb = False                      # Process a defined range for class table first initialization
# initDb is passed as argument from the batch https://doc.scrapy.org/en/latest/topics/spiders.html#spider-arguments
# semester = 1183                     # semester to process, will be used in the db name; 1182=Spring 2018, 1183=Summer 2018, etc
# semester is passed as argument from the batch https://doc.scrapy.org/en/latest/topics/spiders.html#spider-arguments
dbVersion = 1                         # template db file = "tuScraper.1.sqlite3"
# dbVersion 1: tuSpiderv18->   new "ClassNotes" field discoverd for 1183, making a total of 18 fields
# dbVersion 0: tuSpiderv1->v6

# database = ''
# db = ''
# cursor = ''

# site base url, that the spider will modify for each loop:
# baseUrl = 'https://mytumobile.towson.edu/app/catalog/classsection/TOWSN/%s/' % (semester)
baseUrl = 'https://mytumobile.towson.edu/app/catalog/classsection/TOWSN'

blankPageTitle = 'Course Catalog'   # generic title when class page do not exist

# Define numeric fields:
numerics = ['ClassNumber', 'SeatsTaken', 'SeatsOpen', 'ClassCapacity', 'WaitListTotal', 'WaitListCapacity']

# Define keys to remove: "Components" is undefined in the values returned because the text contains a table I don’t mind to extract
keys2remove=['Components']

# Define SQL statement to check if a class number exists.
# The question mark will be replaced by a parameter:
sqlClassCheck = "SELECT COUNT(1) FROM classes WHERE ClassNumber = (?)"

# Define SQL statement to fetch all class numbers from the database for the loop:
sqlClassFetch = "SELECT ClassNumber FROM classes"

totalPagesFetched=0                 # Define a global variable total that will be incremented by the threads
moduloPagesFetched=50               # Define a global variable total that will be incremented by the threads
totalClassInserts=0                 # Define a global variable total that will be incremented by the threads
moduloClassInserts=50               # Print status every 50 lines inserts in class table
moduloClassInserts=50               # Print status every 50 lines inserts in class table
totalHistoInserts=0                 # Define a global variable total that will be incremented by the threads
moduloHistoInserts=500              # Print status every 500 lines updates in history table
classRange = range(1000,9999)       # Range of class numbers to scrap via URL; these number values come from a 0-9999 range test
# ----------------------------------------------------------------------
# start_urls is the reserved name list that the spider will parse:
start_urls = []

# PAUSE
# os.system('pause')

# dict_factory method: transforms the output of rows = cursor.execute.fetchall from:# rows = [(2792,)] to rows = [{'ClassNumber': 7179, ..}]
# https://stackoverflow.com/questions/3300464/how-can-i-get-dict-from-sqlite-query#9538363
def dict_factory(cursor, row):
  d = {}
  for idx, col in enumerate(cursor.description):
    d[col[0]] = row[idx]
  return d

# i had to define a boolean convertor because one cannot pass booleans from command line
def str2bool(v):
  return v.lower() in ("yes", "true", "t", "1")
#

# class name is actually arbitrary. TODO: check out why it works
# class TuSpiderv7(CrawlSpider):
class TuSpiderv18(scrapy.Spider):
  # this name is called as parameter in the command line:
  name = 'tuSpiderv18'
  
  # INIT --------------------------------------------
  def __init__(self, semester=1184, initDb=False, *args, **kwargs):
    super(TuSpiderv18, self).__init__(*args, **kwargs)
    # Define path to database and export it (no path = local in tuScrapper/htdocs/)
    # Define path to database and export it (no path = local in tuScrapper/htdocs/)
    self.database='htdocs/tuScraper.%s-%s.sqlite3' % (dbVersion, semester)
    copyfile('htdocs/tuScraper.%s.sqlite3' % (dbVersion, semester), self.database)
    
    semesterUrl = '%s/%s/' % (baseUrl, semester)

    # Create db connection
    self.db = sqlite3.connect(self.database)
    
    # Attach the dict factory method to the post-process of row fetching
    self.db.row_factory = dict_factory
    
    # Create a cursor to communicate with the db
    self.cursor = self.db.cursor()

    # export initDb
    self.initDb = str2bool(initDb)
    
    if str2bool(initDb):
      # This has to be done the very first time to fill the database.
      for classNum in classRange: self.start_urls.append(semesterUrl+str(classNum))
    else:
      # Execute the sqlClassFetch statement to get the list of class numbers from the database:
      # Output: rows = [{'ClassNumber': 7179, ..}]
      rows = self.cursor.execute(sqlClassFetch).fetchall()
      
      # Set moduloHistoInserts to 1 to print every lines updated if there are less than 20 rows to process:
      if len(rows)<20: moduloHistoInserts=1
      # print 'YYY len(rows) %s' % len(rows)
      # self.log('YYY len(rows) %s' % len(rows))
    
      # for each row returned, create an url to parse for the spider:
      for row in rows: self.start_urls.append(semesterUrl+str(row["ClassNumber"]))
    #endif
  # INIT --------------------------------------------

  # This is the spider parse method that will be run in parallel against what's in the start_urls list
  # This method is run for each page.
  # Cache and parallel options are defined in Python27\tuScraper\tuScraper\settings.py
  def parse(self, response):
    # import variables from __init__
    initDb = self.initDb
    database = self.database
    
    if Debug:
      print('YYY %s' % initDb)
      print('YYY %s' % database)
      os.system('pause')
    #
    
    if initDb:
      global totalPagesFetched
      totalPagesFetched+=1
      
      # Test current number of rows processed against moduloPagesFetched to print status every "modulo" updates:
      if (totalPagesFetched>=moduloPagesFetched and totalPagesFetched%moduloPagesFetched == 0):
        # current url processed = response.request.url thanks to https://stackoverflow.com/questions/2069662/how-to-exit-an-if-clause#2069670
        print 'initDb: TOTAL fetches: %d - Current URL: %s' % (totalPagesFetched, response.request.url)
      # we don't print everything but we log everything
      self.logger.info('initDb: TOTAL fetches: %d - Current URL: %s' % (totalPagesFetched, response.request.url))
    #endif initDb
    
    # Get page title = class name + section; blank page = 'Course Catalog'
    title = response.css('title::text').extract_first()
    
    # Skip blank pages: process the rest only if there are attributes in the page
    # 1.7: check page title instead
    # if len(keys) > 0:
    if title != blankPageTitle:
      # Fetch the attributes list from the page:
      keys = response.css('div.section-content div.pull-left div::text').extract()
      
      # double-check that page is not empty, maybe the blankPageTitle has changed after all...
      if len(keys) == 0:
        print 'ERROR: title = %s != %s but len(keys) == 0 for Current URL: %s' % (title, blankPageTitle, response.request.url)
        os.system('pause')
        exit()
      #endif
      
      # Cleanup keys: keep only alpha-num + convert to ascii:
      keys = [re.sub(r'\W+', '', i).encode("utf-8") for i in keys]
      
      # Remove multiple items from the list:
      keys = [e for e in keys if e not in keys2remove]
      
      # Rename "CombinedSectionCapacity" to "ClassCapacity":
      keys = ['ClassCapacity' if x == 'CombinedSectionCapacity' else x for x in keys]
      
      # Fetch values list from the page:
      values = response.css('div.section-content div.pull-right div::text').extract()
      ClassNumber = values[keys.index('ClassNumber')]
      
      # If we have more keys than values:
      if len(keys) > len(values):
        # Re-fetch values but one level above:
        prevalues = response.css('div.section-content div.pull-right div').extract()
        
        # Get indices of items containing "<div></div>" (empty value):
        indices = [i for i, x in enumerate(prevalues) if x == "<div></div>"]
        
        # For each empty value, insert a default value at the right indice:
        for i in indices: values.insert(i, "TBA")
      
      # On the other hand, If we have more values than keys:
      elif len(keys) < len(values):
        # the only reason why there would be more value is because some <br> are present
        # Remove every <br> from the body:
        response = response.replace( body=re.sub(r"<br\s*[\/]?>", "\n", response.body) )
        
        # Re-fetch values again:
        values = response.css('div.section-content div.pull-right div::text').extract()
      #endif
      
      # After these preliminary checks, if there are still more values than keys, error message:
      if len(keys) < len(values):
        # Print error message on screen and log it:
        print 'ERROR for CLASS %s: len(keys)=%d len(values)=%d' % (ClassNumber, len(keys), len(values))
        self.logger.error('ERROR for CLASS %s: len(keys)=%d len(values)=%d' % (ClassNumber, len(keys), len(values)))
      else:
        self.logger.debug("ClassNumber %s: %d values + %d keys = %s" % (ClassNumber, len(keys), len(values), ','.join(keys)))
      
        # Make a dictionary by zipping keys against values:
        classDict = dict(zip(keys,values))
        
        # Create a secondary dictionary classDictValues with numeric values only:
        classDictValues = { key: classDict[key] for key in numerics }
        
        # Check if current class number is already in database:
        db = sqlite3.connect(self.database)
        cursor = db.cursor()
        cursor.execute(sqlClassCheck, (ClassNumber,))
      
      # -------------------------------
      # INSERT NEW CLASS IN class table
      # Only executed if len(keys) == len(values) because cursor wouldn't be initialized otherwise
      # If no row is returned, INSERT a new class definition in the main class table:
      
      if not cursor.fetchone()[0]:
        if Verbose:
          print 'INSERT CLASS: %s' % (ClassNumber)
          self.logger.info('INSERT CLASS: %s' % (ClassNumber))
        
        # Remove numerics from classDict:
        for unwanted_key in numerics: del classDict[unwanted_key]
        
        # Implode classDict keys with comma separator for the SQL query:
        keys2insert = ','.join(classDict.keys())
        
        # Prepare the query string with values not in the dictionary:
        # title contains spaces and must be quoted since I moved from Win7 to Win10, for some reason
        query_string = "INSERT INTO classes(ClassNumber,title,{}) VALUES ("+ClassNumber+",'"+title+"',%s)"
        # Output will be: "INSERT INTO classes(ClassNumber,title,{}) VALUES (1234,Class title,%s)"
        
        # Append all the keys to insert to the query string.
        query_string = query_string.format(keys2insert) % ','.join('?' * len(classDict.keys()))
        # Output will be: "INSERT INTO classes(ClassNumber,title,Status,Meets,..) VALUES (1234,Class title,?,?,..)"
        
        # Execute the INSERT statement:
        try:
          cursor.execute(query_string, classDict.values())
          db.commit()
        except sqlite3.Error, e:
          print "sqlite3.Error %s" % (e)
          print "sqlite3.Error query_string = %s" % (query_string)
          print "sqlite3.Error classDict.keys() = %s" % (classDict.keys())
          self.logger.error("sqlite3.Error %s" % (e))
          # This is how I discovered new fields not presents on every pages:
          # sqlite3.Error: "table classes has no column named Notes"
          # etc...
        #endtry
        
        global totalClassInserts  # set the variable totalClassInserts global to increment it; will be accessed by many threads of this spider; looks like PHP a lot, eh?
        totalClassInserts+=1
        
        # Test current number of rows processed against moduloClassInserts to print status every "modulo" updates:
        if (totalClassInserts>=moduloClassInserts and totalClassInserts%moduloClassInserts == 0):
          print 'INSERTED CLASS ROWS: %d - Current class: %s' % (totalClassInserts, ClassNumber)
        # we don't print everything but we log everything
        self.logger.info('INSERTED total CLASS: %d - Current class: %s' % (totalClassInserts, ClassNumber))
      #endif not cursor.fetchone()[0]
      # -------------------------------
      
      # -------------------------------
      # UPDATE CLASS HISTORY
      # Now we do the same for history table with the numeric values:
      keys2insert = ','.join(classDictValues.keys())
      
      # arrow will timestamp current datetime to a format that JavaScript can reconvert:
      query_string = "INSERT INTO history(timestamp,{}) VALUES ("+str(arrow.get(datetime.datetime.now()).timestamp)+",%s)"
      query_string = query_string.format(keys2insert) % ','.join('?' * len(classDictValues.keys()))
      
      global totalHistoInserts  # set the variable totalHistoInserts global to increment it; will be accessed by many threads of this spider; looks like PHP a lot, eh?
      totalHistoInserts+=1
      
      # Test current number of rows processed against moduloHistoInserts to print status every "modulo" updates:
      if (totalHistoInserts>=moduloHistoInserts and totalHistoInserts%moduloHistoInserts == 0):
        print 'UPDATED HISTO ROWS: %d - Current class: %s' % (totalHistoInserts, ClassNumber)
      # we don't print everything but we log everything
      self.logger.info('UPDATE total HISTO: %d - Current class: %s' % (totalHistoInserts, ClassNumber))

      # Update the history table with numeric values:
      try:
        cursor.execute(query_string, classDictValues.values())
        db.commit()
      except sqlite3.Error, e:
        print "sqlite3.Error %s" % (e)
        self.logger.error("sqlite3.Error %s" % (e))
      
  # Uncomment this to log classDict in json format, path defined in tuScraper\settings.py
  # yield {'initDb':initDb, 'database':database, 'classDict':classDict}
  
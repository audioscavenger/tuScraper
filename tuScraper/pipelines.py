# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

# http://www.pythoncentral.io/introduction-to-sqlite-in-python/
# https://stackoverflow.com/questions/13952731/inserting-data-with-mysql-in-scrapy
import sys
from scrapy.exceptions import DropItem
# from scrapy.http import Request

sqlClassCheck = "SELECT COUNT(1) FROM classes WHERE ClassNumber = (?)"

# https://stackoverflow.com/questions/10845839/writing-items-to-a-mysql-database-in-scrapy
class ValidateDataPipeline(object):
  else:
    raise DropItem("Missing price in %s" % item)


class SQLiteStorePipeline(object):
  def __init__(self):
    self.db = sqlite3.connect('tuScraper/tuScraper.sqlite3')
    self.cursor = self.db.cursor()
    # create classDictValues with numeric values:
    classDictValues = { key: classDict[key] for key in numerics }
    
    # test for class in database here:
    self.cursor.execute(sqlClassCheck, (classDictValues['ClassNumber'],))
    if not self.cursor.fetchone()[0]:
      # remove numerics from classDict:
      for unwanted_key in numerics: del classDict[unwanted_key]
      
      # no need to reformat srt to int, sqlite will do it:
      # classes.update({int(classDict['Class Number']):classDict})
      
      # response.css('title::text').extract_first()
      # u'ITEC 470 - 101'
      
      # classDict.update({'title':response.css('title::text').extract_first()})
      # classes.update({int(classDict['Class Number']):classDict})
      # self.log('classDict %s' % classDict)
      
      #  cursor.execute("INSERT INTO classes(id, ) VALUES(?)", (num,))
      # cursor.execute("ALTER TABLE classes ADD "+re.sub(r'\W+', '', field)+" TEXT")
      
      # must use classDict because key order has certainly changed after zip:
      keys2insert = ','.join(classDict.keys())
      query_string = "INSERT INTO classes(ClassNumber,{}) VALUES ("+classDictValues['ClassNumber']+",%s)"
      query_string = query_string.format(keys2insert) % ','.join('?' * len(classDict.keys()))
      # 'INSERT INTO classes(Status,Meets,Dates,AddConsent,Description,Grading,ClassNumber,ClassCapacity,Instructors,WaitListCapacity,Topic,Career,Session,Location,Units,SeatsTaken,WaitListTotal,SeatsOpen,Campus,EnrollmentRequirements,Room) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
      self.cursor.execute(query_string, classDict.values())
      db.commit()
    #

  def process_item(self, classDict, spider):
    try:
      keys2insert = ','.join(classDictValues.keys())
      query_string = "INSERT INTO history(timestamp,{}) VALUES ("+str(arrow.get(datetime.datetime.now()).timestamp)+",%s)"
      query_string = query_string.format(keys2insert) % ','.join('?' * len(classDictValues.keys()))
      self.cursor.execute(query_string, classDictValues.values())
      self.db.commit()
    except sqlite3.Error, e:
      print "Error %d: %s" % (e.args[0], e.args[1])

    return classDict

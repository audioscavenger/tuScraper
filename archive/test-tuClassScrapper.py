import scrapy

url = ['https://mytumobile.towson.edu/app/catalog/classsection/TOWSN/1182/6764']

def parse(url, response):
  classes={}
  fetch(url)
  # fetch("https://mytumobile.towson.edu/app/catalog/classsection/TOWSN/1182/6764")
  # fetch("https://mytumobile.towson.edu/app/catalog/classsection/TOWSN/1182/6765")


  # response.css('div.section-content div.pull-left div::text').extract()
  # [u'Session', u'Class Number', u'Career', u'Units', u'Grading', u'Topic', u'Description', u'Add Consent', u'Enrollment Requirements', u'Instructor(s)', u'Topic', u'Meets', u'Dates', u'Room', u'Campus', u'Location', u'Components', u'Status', u'Seats Taken', u'Seats Open', u'Class Capacity', u'Wait List Total', u'Wait List Capacity']

  # response.css('div.section-content div.pull-right div::text').extract()
  # [u'Regular Academic Session', u'7608', u'Undergraduate', u'3 units', u'UNDERGRADUATE GRADING', u'Network & Security Practicum', u'Studies in selected areas of information technology. May be repeated for a maximum of 6 units provided a different topic is taken. Prerequisites: 12 units of ITEC, CIS, or COSC courses.', u'Department Consent Required', u'ITEC 470 requires 12 units of ITEC, CIS and /or COSC.', u'Jeffrey Hanson', u'COSC & DIAR/CPS Initiative', u'Mo 6:00PM - 8:40PM', u'08/28/2017 - 12/19/2017', u'Y20111', u'Main Academic Campus', u'On Campus', u'Closed', u'15', u'0', u'15', u'0', u'0']

  key=response.css('div.section-content div.pull-left div::text').extract()
  value=response.css('div.section-content div.pull-right div::text').extract()

  # remove a particular element in a list:
  key.remove('Components')

  classDict = dict(zip(key,value))
  # {u'Status': u'Open', u'Add Consent': u'Department Consent Required', u'Instructor(s)': u'Jeffrey Hanson', u'Seats Open': u'9', u'Description': u'Studies in selected areas of information technology. May be repeated for a maximum of 6 units provided a different topic is taken. Prerequisites: 12 unitsof ITEC, CIS, or COSC courses.', u'Grading': u'UNDERGRADUATE GRADING', u'Career': u'Undergraduate', u'Room': u'Y20111', u'Seats Taken': u'11', u'Dates': u'01/29/2018 - 05/22/2018', u'Wait List Capacity': u'0', u'Topic': u'Network & Security Practicum', u'Meets': u'Mo 6:00PM - 8:40PM', u'Session': u'Regular Academic Session', u'Location': u'On Campus', u'Units': u'3 units', u'Wait List Total': u'0', u'Class Capacity': u'20', u'Enrollment Requirements': u'ITEC 470 requires 12 units of ITEC, CIS and /or COSC.', u'Campus': u'Main Academic Campus', u'Class Number': u'6764'}

  # classes.update({int(classDict['Class Number']):classDict})

  response.css('title::text').extract_first()
  # u'ITEC 470 - 101'

  classDict.update({'title':response.css('title::text').extract_first()})
  classes.update({int(classDict['Class Number']):classDict})

  return classes
# -----------------------------------------------------------------

# https://medium.com/python-pandemonium/develop-your-first-web-crawler-in-python-scrapy-6b2ee4baf954
# https://www.analyticsvidhya.com/blog/2017/07/web-scraping-in-python-using-scrapy/

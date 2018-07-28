# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

# http://www.pythoncentral.io/introduction-to-sqlite-in-python/
# https://stackoverflow.com/questions/13952731/inserting-data-with-mysql-in-scrapy

class TuscraperPipeline(object):
  def process_item(self, item, spider):
    return item

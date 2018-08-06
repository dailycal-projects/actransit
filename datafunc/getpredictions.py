import urllib2
import time
import os
import glob
import csv
import xml.etree.ElementTree as ET

"""
This file polls for data from NextBus's public XML service. It parses XML feeds
retrieved for each stop (specifically by stop ID). Which stop IDs that are polled
depends on the list of stops in LOCALSTOPS.CSV. Record the predictions for those
stops and for the lines we have selected (variable set below).

This file should be run as a cronjob, ideally at every minute so that prediction
updates can be observed carefully.

INPUT: localstops.csv
OUTPUT: preditions/*.csv
"""

lines = ['6', '7', '12', '18', '36', '51B', '52', '65', '67', '79', '88', 'F']
prefix = "~/actransit-delays/datafunc/" #absolute path

def get(stopId):
    # print(stopId)
    url = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=actransit&stopId="
    xmldata = urllib2.urlopen(url+stopId).read()
    tree = ET.fromstring(xmldata)
    for pred in tree:
        if pred.tag != "predictions":
            continue
        r = pred.attrib["routeTag"]
        if r not in lines:
            continue

        for direction in pred:
            if direction.tag == "message":
                continue
            filename = prefix + "predictions/" + stopId + "_" + r + "_" + direction.attrib['title'] + ".csv"
            output = ""
            try:
                f = open(filename, 'r')
                output += f.read()
                f.close()
            except IOError:
                output += "epochTime,seconds,minutes,dirTag,vehicle,tripTag\n"
            for item in direction:
                output += item.attrib['epochTime'] + ","
                output += item.attrib['seconds'] + ","
                output += item.attrib['minutes'] + ","
                output += item.attrib['dirTag'] + ","
                output += item.attrib['vehicle'] + ","
                output += item.attrib['tripTag'] + "\n"
            f = open(filename, 'w+')
            f.write(output)
            f.close()


def main():
    start = time.time()
    print(os.getcwd())
    with open("localstops.csv", 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='\"')
        for row in reader:
            if row[4] == "stopId":
                continue
            get(row[4])
    end = time.time()
    try:
        with open("log.txt", 'a') as f:
            f.write("Start: " + time.strftime("%a, %d %b %Y %H:%M:%S +0000", gmtime()) +" | Time in seconds: " + str(end - start))
    except IOError:
        f = open("log.txt", 'w')
        f.write("Start: " + time.strftime("%a, %d %b %Y %H:%M:%S +0000", gmtime()) +" | Time in seconds: " + str(end - start))
        f.close()
main()

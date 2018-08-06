import urllib2
import os.path

f = open('localstops.csv', 'r')
f.readline()
for line in f:
    entries = line.split(',')
    if len(entries) == 5 and len(entries[4]) > 1:
        stopId = entries[4][:-1]
        output = "<?xml version='1.0'?>\n<gpx version='1.1'>\n"
        output += "<wpt lat='" + entries[2] + "' lon='" + entries[3] + "'>\n"
        output += "  <name>" + stopId + "</name>\n"
        output += "  <desc><![CDATA[" + stopId + "]]></desc>\n"
        output += "  <sym>Dot</sym>\n  <type><![CDATA[Dot]]></type>\n</wpt>\n</gpx>\n"
        g = open('stops/' + stopId + '.gpx', 'w')
        g.write(output)
        g.close()
f.close()

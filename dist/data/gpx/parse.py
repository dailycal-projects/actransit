import urllib2
import os
import glob

gpx = glob.glob('*.gpx')
# gpx = ['6_Downtown Oakland.gpx']
for filename in gpx:
    f = open(filename, 'r')
    output = ""
    copy = True
    for line in f:
        if '<trk>' in line:
            output += line
            output += "  <name>" + filename[:-4] + "</name>\n"
            output += "  <desc>" + filename[:-4] + "</desc>\n"
            copy = False
        if '<trkseg>' in line:
            copy = True
        if copy:
            output += line
    f.close()
    g = open(filename, 'w')
    g.write(output)
    g.close()

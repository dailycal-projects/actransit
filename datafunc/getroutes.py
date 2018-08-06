import urllib2
import os.path
import xml.etree.ElementTree as ET

"""
This file polls for route information (stop names, id, coordinates) at the stops
we are looking at.

INPUT:
OUTPUT:
"""

def read_csv(filename):
    f = open(filename, 'r')
    keys = f.readline()[:-1].split(',')
    entries = {}
    for line in f:
        attr = line[:-1].split(',')
        obj = {}
        i = 1;
        while i < len(keys):
            obj[keys[i]] = attr[i]
            i += 1
        entries[attr[0]] = obj
    f.close()
    return entries

def write_csv(filename, attr, entries):
    output = ""
    i = 0
    # Write fields in first line, in correct order
    while i < len(attr):
        if i + 1 != len(attr):
            output += attr[i] + ","
        else:
            output += attr[i] + "\n"
        i += 1
    # Write entries in remaining lines
    for k in entries.keys():
        output += k + ","
        i = 1
        while i < len(attr):
            cell = entries[k][attr[i]]
            if i + 1 != len(attr):
                output += cell + ","
            else:
                output += cell + "\n"
            i += 1
    f = open(filename, 'w')
    f.write(output)
    f.close()

def getRoutes():
    url = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=actransit"
    xmldata = urllib2.urlopen(url).read()
    tree = ET.fromstring(xmldata)
    output = "tag,title\n"
    for route in tree:
        output += str(route.attrib['tag']) + ","
        output += str(route.attrib['title']) + "\n"
    f = open("routes.csv", "w")
    f.write(output)
    f.close()

def routeConfig(routeTag):
    url = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=actransit&r="
    xmldata = urllib2.urlopen(url+routeTag).read()
    tree = ET.fromstring(xmldata)
    s = {}
    busline = tree[0].attrib['tag']
    allStops = read_csv("stops.csv")
    routes = read_csv("routes.csv")
    for child in tree[0]:
        if child.tag == "stop":
            stopTag = child.attrib['tag']
            s[stopTag] = {}
            s[stopTag]['title'] = child.attrib['title']
            s[stopTag]['lat'] = child.attrib['lat']
            s[stopTag]['lon'] = child.attrib['lon']
            if ('stopId' in child.attrib.keys()):
                s[stopTag]['stopId'] = child.attrib['stopId']
            else:
                s[stopTag]['stopId'] = ""
            if stopTag not in allStops.keys():
                allStops[stopTag] = s[stopTag]
    print(busline)
    write_csv("stops.csv", ['stopTag', 'title', 'lat', 'lon', 'stopId'], allStops)
    for child in tree[0]:
        if child.tag == "direction":
            dirName = child.attrib['name']
            dirTag = child.attrib['tag']
            dirTitle = child.attrib['title']
            d = {}
            d[dirTag] = {}
            d[dirTag]['title'] = dirTitle
            d[dirTag]['name'] = dirName
            routes[dirTag] = d[dirTag]
            output = "stopTag,title,lat,lon,stopId\n"
            for grandchild in child:
                stopTag = grandchild.attrib['tag']
                output += str(stopTag) + ","
                output += str(s[stopTag]['title']) + ","
                output += str(s[stopTag]['lat']) + ","
                output += str(s[stopTag]['lon']) + ","
                output += str(s[stopTag]['stopId']) + "\n"
            f = open("routes/"+busline+"_"+dirTitle+".csv", "w")
            f.write(output)
            f.close()
    write_csv("routes.csv", ['dirTag', 'title', 'name'], routes)

def main():
    if not os.path.exists("routes.csv"):
        getRoutes()
    # use to get all
    lines = ['6', '7', '12', '18', '36', '51B', '52', '65', '67', '79', '88', 'F']
    for l in lines:
        routeConfig(l)

    # localize stops to desired area
    lat_max = 37.877256
    lat_min = 37.860317
    lon_min = -122.271856
    lon_max = -122.247710
    f = open("stops.csv", 'r+')
    filtered = f.readline()
    for line in f:
        cells = line[:-1].split(',')
        lat = float(cells[2])
        lon = float(cells[3])
        if lat < lat_max and lat > lat_min and lon < lon_max and lon > lon_min:
            # print("Stop: " + cells[1])
            filtered += line
    f.close()
    g = open("localstops.csv", "w")
    g.write(filtered)
    g.close()

main()

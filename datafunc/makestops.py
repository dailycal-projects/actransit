import glob
import csv
import json

# localize stops to desired area
lat_max = 37.877256
lat_min = 37.860317
lon_min = -122.271856
lon_max = -122.247710

# Individual tags for waypoint tree
def write_tag(tag, content):
    if tag == "wpt":
        return "<wpt lat='" + content[0] + "' lon='" + content[1] + "'>\n"
    elif tag == "name":
        return "\t<name>" + content + "</name>\n"
    elif tag == "desc":
        return "\t<desc><![CDATA[" + content + "]]></desc>\n"
    elif tag == "sym":
        return "\t<sym>" + content + "</sym>\n"
    elif tag == "type":
        return "\t<type><![CDATA[" + content + "]]></type>\n"
    else:
        return "</wpt>\n"

# Write waypoint 'stops' into new GPX
def get_stops(f):
    # routeToStops = {}
    newlines = ""
    with open(f, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        for row in reader:
            if row[4] == "stopId":
                continue
            lat = float(row[2])
            lon = float(row[3])
            if lat < lat_max and lat > lat_min and lon < lon_max and lon > lon_min:
                # key = f[:-4]
                newlines += write_tag("wpt", [str(lat), str(lon)])
                newlines += write_tag("name", row[4])
                newlines += write_tag("desc", row[4])
                newlines += write_tag("sym", "Dot")
                newlines += write_tag("type", "Dot")
                newlines += write_tag("end", "")
                # if key not in routeToStops.keys():
                #     routeToStops[key] = [[str(lon), str(lat)]]
                # else:
                #     routeToStops[key].append([str(lon), str(lat)])
    return newlines

def main():
    files = glob.glob('*_*.csv')
    for f in files:
        if f.split('_')[0] == '800' or f.split('_')[0] == '851':
            continue
        updated = ""
        g = open('../oldgpx/' + f[:-4] + '.gpx', 'r')
        for line in g:
            if line == "<trk>\n":
                updated += get_stops(f)
            if line[2:8] == "<name>":
                updated += "  <name>" + f[:-4] + "</name>\n"
                continue
            if line[2:8] == "<desc>":
                updated += "  <desc>" + f[:-4] + "</desc>\n"
                continue
            updated += line
        g.close()
        h = open('../gpx/' + f[:-4] + '.gpx', 'w')
        h.write(updated)
        h.close()
main()
# with open('rts.json', 'w') as jsonfile:
#     json.dump(routeToStops, jsonfile)

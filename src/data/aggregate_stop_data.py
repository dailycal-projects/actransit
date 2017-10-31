import os, glob
import json

# class Bubble():
#     def __init__(self, x, y, area):
#         self.x = x
#         self.y = y
#         self.area = area
#
#     @property
#     def __geo_interface__(self):
#         return {'type'}

data = {}
json_data = json.load(open('data.json'))
max_delay = 0

features = []

for filename in glob.glob("stops/*.gpx"):
    stopId = filename[6:11]
    f = open(filename, 'r')
    latlon = f.readlines()[2]
    i0 = latlon.index('\'')
    i1 = latlon.index('\'', i0+1)
    i2 = latlon.index('\'', i1+1)
    i3 = latlon.index('\'', i2+1)
    stopLat = latlon[i0+1:i1]
    stopLon = latlon[i2+1:i3]
    # print(stopLat, stopLon)
    f.close()
    delay = json_data[stopId]['mean']

    features.append({
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [float(stopLon), float(stopLat)]
        },
        'properties': {
            'delay': delay
        }
    })

# g = json.loads(open('stop.json').read())
# print(g.keys())

featurecollection = {
    'type': 'FeatureCollection',
    'features': features
}

with open('stops.json', 'w') as outfile:
    json.dump(featurecollection, outfile)

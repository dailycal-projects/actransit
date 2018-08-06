import csv
import json

d = {}

with open("predictions/localstops.csv", 'r') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='\"')
    for row in reader:
        if row[0] == "stopTag":
            continue
        if row[0] == "300301130":
            d["300301130"] = row[1]
        else:
            d[row[4]] = row[1]

with open('stopnames.json', 'w') as fp:
    json.dump(d, fp)

# Berkeley's Most Unpredictable Buses

## About
We polled the [NextBus API](https://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf) for real-time bus arrival predictions, and we observed that the predicted arrival time tended to change as a bus approached a stop. We estimated when each bus arrived at each stop by requesting data every minute until the prediction disappeared. This estimated arrival was compared to the predicted arrival — the arrival time when the bus is 20 minutes away from a stop, according to the service. Stop locations are from the NextBus API.

A bus was considered “late” if its actual arrival time was more than five minutes later than the predicted time. The NextBus service predicts when a bus will “depart” from a stop. Because bus arrival and departure times are usually very close, we use the terms interchangeably in this article.

The route explorer was built with [OpenLayers](http://openlayers.org/), an open-source library for creating dynamic maps. To draw bus routes, we used Google Maps to search for bus paths, which we converted into GPX data. The base map is from [Carto](https://carto.com/location-data-services/basemaps/).

**Detailed documentation for the data collection can be found in the** `datafunc` **directory.**

## Meta

| Title | actransit-delays |
|-|-|
| Developer    | [Seokhyeon Ryu](http://github.com/ryusock) |
| Link | [http://projects.dailycal.org/2017/bus-delays/](http://projects.dailycal.org/2017/bus-delays/) |

========================

©2017 The Daily Californian

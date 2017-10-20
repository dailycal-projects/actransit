require('../scss/main.scss');
var ol_layer_Tile = require('ol/layer/tile').default;
var ol_layer_Vector = require('ol/layer/vector').default;
var ol_Map = require('ol/map').default;
var ol_View = require('ol/view').default;
var ol_proj = require('ol/proj').default;
var ol_interaction = require('ol/interaction').default;
var ol_style_Style = require('ol/style/style').default;
var ol_style_Stroke = require('ol/style/stroke').default;
var ol_style_Fill = require('ol/style/fill').default;
var ol_style_Circle = require('ol/style/circle').default;
var ol_source_OSM = require('ol/source/osm').default;
var ol_source_Vector = require('ol/source/vector').default;
var ol_format_GPX = require('ol/format/gpx').default;
var d3 = require('d3');

window.$('.icon-facebook').click((e) => {
  e.preventDefault();
  const uri = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${uri}`);
});


window.$('.icon-twitter').click((e) => {
  e.preventDefault();
  const uri = window.location.href;
  const status = encodeURIComponent(`${window.tweetText} ${uri}`);
  window.open(`https://twitter.com/home?status=${status}`);
});

/* EVENT FUNCTIONS */
function toggleRoute(line) {
  for (var i = 0; i < vectorLayers.length; i++) {
    vectorLayers[i].setVisible(false);
  }
  /* Fade other routes */
  var routes = document.getElementsByClassName('badge');
  for (var i = 0; i < routes.length; i++) {
    if (line !== routes[i].id.slice(6)) {
      routes[i].classList.remove("selected");
    } else {
      routes[i].classList.add("selected");
    }
  }
  /* Show direction options */
  var dirs = document.getElementsByClassName('dir');
  for (var i = 0; i < dirs.length; i++) {
    dirs[i].setAttribute("style", "display: none");
  }
  var name = "dir-" + line;
  bus = line;
  document.getElementById(name).style.display = "inline-block";
  document.getElementById("dirs").style.opacity = 1;
  hideInfo();
};

function toggleDir(direction, index, proj) {
  /* Hide the other direction */
  var dirs = document.querySelectorAll('.dir button');
  for (var i = 0; i < routes.length; i++) {
    if (direction !== dirs[i].innerHTML) {
      dirs[i].classList.remove("selected");
    } else {
      dirs[i].classList.add("selected");
    }
  }
  for (var i = 0; i < vectorLayers.length; i++) {
    vectorLayers[i].setVisible(false);
  }
  vectorLayers[index].setVisible(true);
  dir = direction;
  console.log(dir);
  showInfo(bus + "_" + dir, data);
  view.animate({
    center: proj,
    duration: 1200
  });
};

/* UTILITY FUNCTIONS */
function convertHex(hex, opacity) {
  var hex = hex.replace('#','');
  var r = parseInt(hex.substring(0,2), 16);
  var g = parseInt(hex.substring(2,4), 16);
  var b = parseInt(hex.substring(4,6), 16);
  var result = [r, g, b, opacity/100];
  return result;
};

function convertTime(seconds) {
  var m = Math.floor(Math.floor(seconds) / 60);
  var s = Math.floor(seconds) % 60;
  if (m === 0) {
    return s + " sec";
  } else {
    return m + " min " + s + " sec";
  }
};

function getTimeSlot(index) {
  var hour = Math.floor(index / 2) + 5;
  var ampm = "AM";
  if (hour >= 12 || hour <= 24) {
    ampm = "PM";
  }
  var min = ":00";
  if (index % 2 === 1) {
    min = ":30"
  }
  return hour % 12 + min + ampm;
};

function sortByDelay(list) {
  var sorted = list.sort(function(x, y){
    return d3.descending(x.mean, y.mean);
  });
};

function aggregateDelays(list) {
  var times = new Uint8Array(38);
  for (var i = 0; i < list.length; i++) {
    var delays = list[i].hist;
    for (var j = 0; j < delays.length; j++) {
      times[j] += delays[j];
    }
  }
  return times;
}

/* GLOBAL VARIABLES TO KEEP TRACK OF */
var stopNames;
d3.json("../data/stop.json", function(error, result){
  stopNames = result;
});
var data; /* fetch json asynchronously */
var routes = []; /* routes by descending order */
var stopIds = []; /* stops by descending order */
d3.json("../data/data.json", function(error, result){
  data = result;
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    if (!isNaN(keys[i])) {
      var copy = jQuery.extend({}, data[keys[i]]);
      copy.id = keys[i];
      stopIds.push(copy);
      continue;
    }
    var split = keys[i].split("_");
    if (split.length === 2) {
      var copy = jQuery.extend({}, data[keys[i]]);
      copy.id = keys[i];
      routes.push(copy);
      continue;
    }
  }
  // Draw bubble map of delays by stop
  sortByDelay(stopIds);
  drawDelayedStops(stopIds, "stops");
  // Draw arrival graphs for selected routes
  sortByDelay(routes);
  console.log(routes);
  for (var i = 0; i < selectRoutes.length; i++) {
    var selectBus = selectRoutes[i].split("-")[0];
    var selectDir = selectRoutes[i].split("-")[1];
    var r = data[selectBus + "_" + routeObj[selectBus][selectDir]];
    console.log(r);
    drawDelays("#arrivals-"+selectRoutes[i], r.sample);
  }
  // drawDelayedRoutes(routes.slice(0, 21));
  var copy = aggregateDelays(stopIds);
  drawHist(copy, 'busiest-hist');
});
var times = ['5am','6am','7am','8am','9am','10am','11am','12pm',
             '1pm','2pm','3pm','4pm','5pm','6pm','7pm',
             '8pm','9pm','10pm','11pm','12am'];
var routeObj = {'6': {'N': 'Berkeley BART', 'S': 'Downtown Oakland', 'color': '#006DB8', 'proj': ol_proj.fromLonLat([-122.261943, 37.866976])},
                '7': {'N': 'Berkeley BART', 'S': 'E C Del Norte BART', 'color': '#75C695', 'proj': ol_proj.fromLonLat([-122.266520, 37.873903])},
                '12': {'N': 'Oakland Amtrak', 'S': 'Westbrae - Berkeley', 'color': '#85D2DD', 'proj': ol_proj.fromLonLat([-122.268154, 37.862520])},
                '18': {'N': 'Lake Meritt BART', 'S': 'Albany', 'color': '#8D6538', 'proj': ol_proj.fromLonLat([-122.267477, 37.866868])},
                '36': {'N': 'UC Campus', 'S': 'West Oakland BART', 'color': '#C4A2CB', 'proj': ol_proj.fromLonLat([-122.261340, 37.866013])},
                '51B': {'N': 'Berkeley Amtrak', 'S': 'Rockridge BART', 'color': '#008B59', 'proj': ol_proj.fromLonLat([-122.261276, 37.867495])},
                '52': {'N': 'U.c. Campus', 'S': 'U.c. Village', 'color': '#F598AA', 'proj': ol_proj.fromLonLat([-122.261580, 37.871708])},
                '65': {'N': 'To Downtown Berkeley', 'S': 'Euclid', 'color': '#652D91', 'proj': ol_proj.fromLonLat([-122.265167, 37.874832])},
                '67': {'N': 'To Downtown Berkeley', 'S': 'Spruce', 'color': '#FECD08', 'proj': ol_proj.fromLonLat([-122.266344, 37.872394])},
                '79': {'N': 'El Cerrito Plaza BART', 'S': 'Rockridge BART', 'color': '#00B1B0', 'proj': ol_proj.fromLonLat([-122.259189, 37.867030])},
                '88': {'N': 'Berkeley BART', 'S': 'Lake Merritt BART', 'color': '#9A983A', 'proj': ol_proj.fromLonLat([-122.267837, 37.870075])},
                'F': {'N': 'San Francisco', 'S': 'Berkeley', 'color': '#F79447', 'proj': ol_proj.fromLonLat([-122.261580, 37.871708])}
               };
var routeKeys = ['6', '7', '12', '18', '36', '51B', '52', '65', '67', '79', '88', 'F'];
var selectRoutes = ['51B-S', '51B-N', '36-S', '36-N', '18-S', '18-N', 'F-S', 'F-N', '6-S', '6-N','79-S', '79-N'];

for (var i = 0; i < routeKeys.length; i++) {
  var route = routeKeys[i];
  var routeDetail = routeObj[route];
  /* Activate buttons by the routes and directions they trigger.
    To ensure JS closure (make global variables local), return a
    nested function with the desired parameter as a local variable. */
  $('#route-' + route).click(function(r) {
    return function() {
      toggleRoute(r);
    }
  }(route));
  var north = 2*i;
  $('#dir-' + route + ' .dir-n').click(function(d, i, p) {
    return function() {
      toggleDir(d, i, p);
    }
  }(routeDetail['N'], north, routeDetail['proj']));
  var south = 2*i+1
  $('#dir-' + route + ' .dir-s').click(function(d, i, p) {
    return function() {
      toggleDir(d, i, p);
    }
  }(routeDetail['S'], south, routeDetail['proj']));
}
var bus = ""; /* current bus line */
var dir = ""; /* current bus direction */
var color = 0; /* color of current line */
var active = null; /* active feature */
var hover = null; /* hover feature */
var vectorLayers = [];

/**
 * OPENLAYERS MAP SETTINGS. Generate map tiles in RASTER,
 * place bus routes (in MultiLineString) and stops (in Point)
 * on the map based on their bus route (and coinciding color).
 */
var raster = new ol_layer_Tile({
  source: new ol_source_OSM(),
});

var style = {};
for (var i = 0; i < routeKeys.length; i++) {
  var route = routeKeys[i];
  var hex = routeObj[route]['color'];
  style['MultiLineString'+route] = new ol_style_Style({
    stroke: new ol_style_Stroke({
      color: convertHex(hex, 80),
      width: 10
    }),
  });
  style['MultiLineString'+route+'::active'] = new ol_style_Style({
    stroke: new ol_style_Stroke({
      color: convertHex(hex, 100),
      width: 12
    })
  });
  style['Point'+route] = new ol_style_Style({
    image: new ol_style_Circle({
      fill: new ol_style_Fill({
        color: convertHex(hex, 80)
      }),
      radius: 10,
      stroke: new ol_style_Stroke({
        color: [0, 0, 0, 0.5],
        width: 2
      })
    })
  });
  style['Point'+route+'::active'] = new ol_style_Style({
    image: new ol_style_Circle({
      fill: new ol_style_Fill({
        color: convertHex(hex, 100)
      }),
      radius: 10,
      stroke: new ol_style_Stroke({
        color: [0, 0, 0, 0.9],
        width: 3
      })
    })
  });
};

for (var i = 0; i < routeKeys.length; i++) {
  var route = routeKeys[i];
  var routeDetail = routeObj[route];
  createVector(route, routeDetail['N']);
  createVector(route, routeDetail['S']);
}

/* To ensure name closure, pass the route and
   its info as parameters into this function. */
function createVector(r, d) {
  var gpxUrl = '../data/gpx/'+r+'_'+d+'.gpx';
  var vector = new ol_layer_Vector({
    source: new ol_source_Vector({
      url: gpxUrl,
      format: new ol_format_GPX()
    }),
    style: function(feature) {
      var type = feature.getGeometry().getType();
      return style[type+r];
    },
    opacity: 1,
    visible: false
  });
  vectorLayers.push(vector);
}

/**
 * Prevent users from exploring outside the EXTENT, and
 * generate a view based on that extent and coordinates.
 */
function transform(extent) {
  return ol_proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
}

var view = new ol_View({
  center: ol_proj.fromLonLat([-122.2582, 37.8688]),
  maxZoom: 18,
  minZoom: 16,
  zoom: 16,
  extent: transform([-122.271856, 37.860317, -122.247710, 37.877256]),
});

var map = new ol_Map({
  target: 'map',
  interactions: ol_interaction.defaults({mouseWheelZoom:false}),
  // interactions: [],
  layers: Array(raster).concat(vectorLayers),
  view: view
});

/*
 * Listen for click/hover interactions with the map and
 * act accordingly. If click, clear all features that
 * are not activated by a previous click on mouseover.
 * Highlight the top feature that his clicked/hovered.
 * Display info based on feature clicked, hide if feature-less
 * part of map is clicked.
 */
function activateFeature(pixel, onEvent, route=null) {
  var features = [];
  map.forEachFeatureAtPixel(pixel, function(feature) {
    features.push(feature);
  });
  if (onEvent === "click") {
    if (active != null) {
      var activeType = active.getGeometry().getType();
      active.setStyle(style[activeType + color]);
      active = null;
    }
  } else {
    if (hover != null && hover !== active) {
      var hoverType = hover.getGeometry().getType();
      hover.setStyle(style[hoverType + color]);
      hover = null;
    }
  }
  if (features.length > 0) {
    map.getViewport().style.cursor = 'pointer';
    var info = [];
    for (var i = 0; i < features.length; i++) {
      info.push(features[i].get('desc'));
    }
    var type = features[0].getGeometry().getType();
    features[0].setStyle(style[type + color + "::active"]);
    if (onEvent === "click") {
      active = features[0];
      var key = active.get('desc');
      if (!key.includes("_")) {
        key = key + "_" + bus + "_" + dir;
      }
      console.log(key);
      showInfo(key, data, stopNames);
    } else {
      hover = features[0];
    }
  } else {
    map.getViewport().style.cursor = 'move';
    if (onEvent === "click") {
      hideInfo();
    }
  }
};

function showInfo(key, data, stopNames=null) {
  document.getElementById("info").style.display = 'block';
  var marker = key.split("_");
  document.getElementById("route").innerHTML = bus;
  document.getElementById("route").className = "badge-" + bus;
  document.getElementById("direction").innerHTML = dir;
  if (marker.length === 3) {
    document.getElementById("stopId").style.display = "block";
    // document.getElementById("stopId").innerHTML = "Stop ID: " + marker[0];
    document.getElementById("stopName").innerHTML = stopNames[marker[0]];
  } else {
    document.getElementById("stopId").style.display = "none";
    document.getElementById("stopName").innerHTML = "Route Information";
  }
  var innerHTML = "Average Delay: <span>" + convertTime(data[key]["mean"]) + "</span>";
  document.getElementById("mean").innerHTML = innerHTML;
  // innerHTML = "Median Delay: <span>" + convertTime(data[key]["median"]) + "</span>";
  // document.getElementById("median").innerHTML = innerHTML;
  innerHTML = "At least 3 minutes delay: <span>" + Math.floor(data[key]["late"] / data[key]["length"] * 100) + "%</span>";
  document.getElementById("late").innerHTML = innerHTML;
  // innerHTML = "At least 10 minutes delay: <span>" + Math.floor(data[key]["vlate"] / data[key]["length"] * 100) + "%</span>";
  // document.getElementById("vlate").innerHTML = innerHTML;
  var summ = drawHist(data[key]["hist"], "hist");
  innerHTML = "So in this case, the busiest time slot was <b>" + getTimeSlot(summ[0]) + "-" + getTimeSlot(summ[0] + 1) + "</b>, which saw <b>" + summ[1] + "%</b> of delays on this stop or route.";
  document.getElementById("hist-sum").innerHTML = innerHTML;
}

function hideInfo() {
  document.getElementById("info").style.display = "none";
}

map.on('pointermove', function(evt) {
  activateFeature(evt.pixel, 'pointermove');
});

map.on('click', function(evt) {
  activateFeature(evt.pixel, 'click');
});

function drawDelayedStops(stopData) {
  var bubbleLayers = [];
  var bubbleStyle = {};
  // Assumes that the stopIds are ordered by greatest delay
  for (var i = 0; i < stopData.length; i++) {
    if (stopData[i].mean > 0) {
      var scaledRadius = Math.sqrt(stopData[i].mean / stopData[0].mean) * 30;
      bubbleStyle[stopData[i].id] = new ol_style_Style({
        image: new ol_style_Circle({
          fill: new ol_style_Fill({
            color: convertHex("#FFA500", 80)
          }),
          radius: scaledRadius,
          stroke: new ol_style_Stroke({
            color: [0, 0, 0, 0.8],
            width: 0.5
          })
        })
      });
      createBubble(stopData[i].id);
    }
  }

  /* To ensure name closure, pass the route and
     its info as parameters into this function. */
  function createBubble(sid) {
    var gpxUrl = '../data/stops/' + sid + '.gpx';
    var bubble = new ol_layer_Vector({
      source: new ol_source_Vector({
        url: gpxUrl,
        format: new ol_format_GPX()
      }),
      style: bubbleStyle[sid],
      opacity: 1,
      visible: true
    });
    bubbleLayers.push(bubble);
  }

  var bubbleView = new ol_View({
    center: ol_proj.fromLonLat([-122.2582, 37.8688]),
    maxZoom: 15,
    minZoom: 15,
    zoom: 15,
    extent: transform([-122.271856, 37.860317, -122.247710, 37.877256]),
  });

  var bubbleMap = new ol_Map({
    target: 'bubble-map',
    controls: [],
    interactions: [],
    layers: Array(raster).concat(bubbleLayers),
    view: bubbleView
  });
}

/*
 * D3-utilizing function. Draw the histogram of delays per
 * time slot based on the DATASET. OPTION tells us whether
 * we are looking at each feature on the map or the final
 * summary at the bottom of page.
 */
function drawHist(dataset, option) {
  d3.select("#info svg").remove();
  var max = d3.max(dataset);
  var maxi = 0;
  var total = 0;
  for (var i = 0; i < dataset.length; i++) {
    total += dataset[i];
  }

  var margin;
  var width;
  var height;
  if (option === "hist") {
    margin = {
      top: 15,
      right: 25,
      bottom: 20,
      left: 40
    };
    width = 520;
    height = 130;
  } else {
    margin = {
      top: 15,
      right: 25,
      bottom: 30,
      left: 40
    };
    width = 800;
    height = 250;
  }
  var w = width - margin.left - margin.right; //440
  var h = height - margin.top - margin.bottom; // 100
  var barPadding = 1;
  var tickRange = [];
  var svg = d3.select("#" + option)
    .append("svg")
    .attr("width", w + margin.left + margin.right) //w + 50
    .attr("height", h + margin.top + margin.bottom); //h + 30
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
      if (i % 2 === 0) {
        tickRange.push(margin.left + i * (w / dataset.length));
      }
      return margin.left + i * (w / dataset.length);  //Bar width of 20 plus 1 for padding
    })
    .attr("y", function(d) {
      return margin.top + h - Math.floor(d / max * h);  //Height minus data value
    })
    .attr("width", w / dataset.length - barPadding)
    .attr("height", function(d, i) {
      if (d === max) {
        maxi = i;
      }
      return Math.floor(d / max * h);
    })
    .attr("fill", function(d) { // green: 0,118,87 red: 213,45,45
      var r = Math.floor(d / max * 255) + ",";
      var g = 118 - Math.floor(d / max * 73) + ",";
      var b = 87 - Math.floor(d / max * 42);
      return "rgb(" + r + g + b + ")";
    });
  tickRange.push(w + margin.left);
  // console.log('times' + times.length);
  // console.log('tickRange' + tickRange.length);
  var xScale = d3.scaleOrdinal()
    .domain(times)
    .range(tickRange);
  var xAxis = d3.axisBottom(xScale);
  svg.append('g')
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (margin.top + h) + ")")
    .call(xAxis);
  var yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([h, 0]);
  var yAxis = d3.axisLeft()
    .scale(yScale)
    .tickValues([100])
    .tickFormat(Math.floor(max / total * 100) + "%");
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(yAxis);
  return [maxi, Math.floor(max / total * 100)];
}

/*
 * D3-utilizing function. Draw the sorted routes or stops on
 * a horizontal bar graph to compare average delays for each
 * route or stop.
 */
function drawDelayedRoutes(dataset) {
  var tickNames = [];
  var meanDelays = [];
  for (var i = 0; i < dataset.length; i++) {
    var num = dataset[i].id.split("_")[0];
    var desc = dataset[i].id.split("_")[1];
    /* Show only routes with at least half a minute avg delay */
    if (dataset[i].mean > 30) {
      tickNames.push(num + ":" + desc);
      meanDelays.push(dataset[i].mean);
    }
  }

  var width = 800;
  var height = 360;
  var max = Math.ceil(dataset[0].mean / 60);
  var margin = {
    top: 25,
    right: 25,
    bottom: 15,
    left: 200
  };
  var w = width - margin.left - margin.right;
  var h = height - margin.top - margin.bottom;
  var svg = d3.select("#routes-bar").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var xScale = d3.scaleLinear()
    .domain([0, max])
    .range([0, w]);
  var xAxis = d3.axisTop(xScale)
    .ticks(max);
  svg.append('g')
    .attr("class", "x axis")
    .attr("transform", "translate(0,0)")
    .call(xAxis);
  var yScale = d3.scaleBand()
    .domain(tickNames)
    .range([0, h])
    .paddingInner(0.2);
  var yAxis = d3.axisLeft()
    .tickSize(0)
    .scale(yScale);
  svg.append("g")
    .attr("class", "y axis big-y")
    .call(yAxis);
  var bars = svg.selectAll(".bar")
    .data(meanDelays)
    .enter()
    .append("g");
  bars.append("rect")
    .attr("class", "bar")
    .attr("y", function(d, i) { return i * (yScale.step()); })
    .attr("height", yScale.step() - 2)
    .attr("x", function(d) { return xScale(0); })
    .attr("width", function(d) { return xScale(d/60); });
  var xGrid = d3.axisTop(xScale)
    .ticks(max)
    .tickFormat("")
    .tickSize(-h-5); // add additional height for polish
  svg.append('g')
    .attr('class', 'grid')
    .call(xGrid);
}

function drawDelays(elementID, arrivalTimes) {
  var width = 400;
  var height = 160;
  var margin = {
    top: 20,
    right: 12,
    bottom: 20,
    left: 12
  };
  var w = width - margin.left - margin.right;
  var h = height - margin.top - margin.bottom;

  var svg = d3.select(elementID)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (margin.left + w/2) + "," + (margin.top + h) + ")");

  var rScale = d3.scaleLinear()
    .domain([0, 50])
    .range([0, w/2])

  var arc = d3.arc()
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2)
    .innerRadius(function(d) { return rScale(d) - 1; })
    .outerRadius(function(d) { return rScale(d); });

  var arcs = svg.selectAll(".arc")
    .data(arrivalTimes)
    .enter()
    .append("g");
  arcs.append("path")
    .attr("class", "arc")
    .attr("d", function(d) {
      return arc(d);
    })
    .attr("fill", "#5D9FCF")
    .attr("transform", function(d) {
      return "translate("+(rScale(d)-w/2)+",0) scale(1, 0.75)";
    });

  var xScale = d3.scaleLinear()
    .domain([0, 50])
    .range([0, w]);
  var xAxis = d3.axisBottom(xScale)
    .ticks(5);
  svg.append('g')
    .attr("class", "x axis")
    .attr("transform", "translate("+(-w/2)+",0)")
    .call(xAxis);
}

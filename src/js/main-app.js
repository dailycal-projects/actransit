require('./resizer.js')

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

/* NODE.JS require */
require('../scss/main.scss');
const d3 = require('d3');
const graphs = require('./d3-graphics.js');
const util = require('./util.js');
const ol_layer_Tile = require('ol/layer/tile').default;
const ol_layer_Vector = require('ol/layer/vector').default;
const ol_Map = require('ol/map').default;
const ol_View = require('ol/view').default;
const ol_proj = require('ol/proj').default;
const ol_interaction = require('ol/interaction').default;
const ol_style_Style = require('ol/style/style').default;
const ol_style_Stroke = require('ol/style/stroke').default;
const ol_style_Fill = require('ol/style/fill').default;
const ol_style_Circle = require('ol/style/circle').default;
const ol_source_OSM = require('ol/source/osm').default;
const ol_source_Vector = require('ol/source/vector').default;
const ol_format_GPX = require('ol/format/gpx').default;

/* GLOBAL VARIABLES TO KEEP TRACK OF */
var data; /* fetch json asynchronously */
var histData; /* histogram data */
var routeIds = []; /* routes by descending order */
var stopIds = []; /* stopsf by descending order */
var routeKeys = Object.keys(util.routeMeta);
var bus = ""; /* current bus line */
var dir = ""; /* current bus direction */
var color = 0; /* color of current line */
var active = null; /* active feature */
var hover = null; /* hover feature */
var vectorLayers = []; /* layers of OpenLayer Vector objects */
/* Selected routes for demoing */
var selectRoutes = ['6-S','6-N','7-S','7-N','18-S','18-N','36-S','36-N','51B-S','51B-N','52-S','52-N','65-S','67-S','79-S','79-N','88-S','88-N','F-S','F-N'];
/* Load delay data from DATA.JSON, update stopIds and routeIds */

var data = require('../data/data.json');
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
    routeIds.push(copy);
    continue;
  }
}
// Draw bubble map of delays by stop
// console.log('stops by % delayed (by >= 5 min)');
// util.sortByDelay(stopIds, 'otp');
// for (var i = 0; i < stopIds.length; i++) {
//   var intersect = util.stopMeta[stopIds[i].id];
//   console.log(intersect +' ('+stopIds[i].id + '): ' + stopIds[i].late / stopIds[i].length);
// }
// console.log('stops by avg delay');
// util.sortByDelay(stopIds);
// for (var i = 0; i < stopIds.length; i++) {
//   var intersect = util.stopMeta[stopIds[i].id];
//   console.log(intersect +' ('+stopIds[i].id + '): ' + stopIds[i].late / stopIds[i].length);
// }
// drawDelayedStops(stopIds, "stops");
// Draw arrival graphs for selected routes
util.sortByDelay(routeIds);
// graphs.drawDelays("#methodology", [20, 32], true);
for (var i = 0; i < selectRoutes.length; i++) {
  var selectBus = selectRoutes[i].split("-")[0];
  var selectDir = selectRoutes[i].split("-")[1];
  var r = data[selectBus + "_" + util.routeMeta[selectBus][selectDir]];
  console.log(selectBus + "_" + util.routeMeta[selectBus][selectDir]);
  graphs.drawDelays("#arrivals-"+selectRoutes[i], r.sample, 'regular');
  var tmp = 0;
  for (var j = 0; j < r.sample.length; j++) {
    if (r.sample[j] >= 25) {
      tmp += 1;
    }
  }
}

document.getElementById('hide-info').addEventListener('click', function() {
  hideInfo();
});
// drawDelayedRoutes(routes.slice(0, 21));
// var copy = util.aggregateDelays(stopIds);
// graphs.drawHist(copy, 'busiest-hist');

// console.log(Object.keys(util.stopMeta).length);

/* EVENT FUNCTIONS */
function toggleRoute(line) {
  for (var i = 0; i < vectorLayers.length; i++) {
    vectorLayers[i].setVisible(false);
  }
  /* Fade other routes */
  util.selectOption(line);
  util.selectOption('none', true);

  /* Show direction options */
  var dirs = document.querySelectorAll('#dirs .dir');
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
  util.selectOption(direction, true); /* Fade the other direction */

  for (var i = 0; i < vectorLayers.length; i++) {
    vectorLayers[i].setVisible(false);
  }
  vectorLayers[index].setVisible(true);

  dir = direction;
  showInfo(bus + "_" + dir, data);
  view.animate({
    center: proj,
    duration: 1200
  });
};

for (var i = 0; i < routeKeys.length; i++) {
  var route = routeKeys[i];
  var routeDetail = util.routeMeta[route];
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
  }(routeDetail['N'], north, ol_proj.fromLonLat(routeDetail['proj'])));
  var south = 2*i+1
  $('#dir-' + route + ' .dir-s').click(function(d, i, p) {
    return function() {
      toggleDir(d, i, p);
    }
  }(routeDetail['S'], south, ol_proj.fromLonLat(routeDetail['proj'])));
}

/**
 * function applies greyscale to every pixel in canvas
 * source: https://medium.com/@xavierpenya/openlayers-3-osm-map-in-grayscale-5ced3a3ed942
 */
function greyscale(context) {
  var canvas = context.canvas;
  var width = canvas.width;
  var height = canvas.height;
  var imageData = context.getImageData(0, 0, width, height);
  var data = imageData.data;
  for (i=0; i<data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    // CIE luminance for the RGB
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Show white color instead of black color while loading new tiles:
    if (v === 0.0) v=255.0;
    data[i+0] = v; // Red
    data[i+1] = v; // Green
    data[i+2] = v; // Blue
    data[i+3] = 255; // Alpha
  }
  context.putImageData(imageData,0,0);
}

/**
 * OPENLAYERS MAP SETTINGS. Generate map tiles in RASTER,
 * place bus routes (in MultiLineString) and stops (in Point)
 * on the map based on their bus route (and coinciding color).
 */

var raster = new ol_layer_Tile({
  source: new ol_source_OSM(),
});
// apply greyscale on raster tiles
raster.on('postcompose', function(event) {
 greyscale(event.context);
});

var style = {};
for (var i = 0; i < routeKeys.length; i++) {
  var route = routeKeys[i];
  var hex = util.routeMeta[route]['color'];
  style['MultiLineString'+route] = new ol_style_Style({
    stroke: new ol_style_Stroke({
      color: util.convertHex(hex, 80),
      width: 10
    }),
  });
  style['MultiLineString'+route+'::active'] = new ol_style_Style({
    stroke: new ol_style_Stroke({
      color: util.convertHex(hex, 100),
      width: 12
    })
  });
  style['Point'+route] = new ol_style_Style({
    image: new ol_style_Circle({
      fill: new ol_style_Fill({
        color: util.convertHex(hex, 80)
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
        color: util.convertHex(hex, 100)
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
  var routeDetail = util.routeMeta[route];
  createVector(route, routeDetail['N']);
  createVector(route, routeDetail['S']);
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
      showInfo(key, data, util.stopMeta);
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

function showInfo(key, data, sd=null) {
  document.getElementById("info").style.display = 'block';
  var marker = key.split("_");
  document.getElementById("route").innerHTML = bus;
  document.getElementById("route").className = "badge-" + bus;
  document.getElementById("direction").innerHTML = dir;
  if (marker.length === 3) {
    document.getElementById("stopId").style.display = "block";
    // document.getElementById("stopId").innerHTML = "Stop ID: " + marker[0];
    document.getElementById("stopName").innerHTML = sd[marker[0]];
  } else {
    document.getElementById("stopId").style.display = "none";
    document.getElementById("stopName").innerHTML = "Route Information";
  }
  // var innerHTML = "Average delay: <span>" + util.convertTime(data[key]["mean"]) + "</span>";
  // if (data[key]["mean"] <= 0) {
  //   innerHTML = "Average delay: <span>Negligible</span>";
  // }
  // document.getElementById("mean").innerHTML = innerHTML;
  // innerHTML = "Median Delay: <span>" + util.convertTime(data[key]["median"]) + "</span>";
  // document.getElementById("median").innerHTML = innerHTML;
  var innerHTML = "At least 5 minutes delay: <span>" + Math.floor(data[key]["late"] / data[key]["length"] * 100) + "%</span>";
  document.getElementById("late").innerHTML = innerHTML;
  // innerHTML = "At least 10 minutes delay: <span>" + Math.floor(data[key]["vlate"] / data[key]["length"] * 100) + "%</span>";
  // document.getElementById("vlate").innerHTML = innerHTML;

  histData = data[key]["hist"];
  var summ = graphs.drawHist(histData);
  innerHTML = "The busiest time slot was <b>" + util.getTimeSlot(summ[0]) + "-" + util.getTimeSlot(summ[0] + 1) + "</b>, which saw <b>" + summ[1] + "%</b> of delays on this stop or route.";
  document.getElementById("hist-sum").innerHTML = innerHTML;
}

var timer;
function resizedw(){
  graphs.drawHist(histData);
}
window.onresize = function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
        resizedw();
    }, 100);
};

function hideInfo() {
  document.getElementById("info").style.display = "none";
}

map.on('pointermove', function(evt) {
  activateFeature(evt.pixel, 'pointermove');
});

map.on('click', function(evt) {
  activateFeature(evt.pixel, 'click');
});

// function drawDelayedStops(sd) {
//   var bubbleLayers = [];
//   var bubbleStyle = {};
//   // Assumes that the stopIds are ordered by greatest delay
//   for (var i = 0; i < sd.length; i++) {
//     if (sd[i].mean > 0) {
//       var scaledRadius = Math.sqrt(sd[i].mean / sd[0].mean) * 30;
//       bubbleStyle[sd[i].id] = new ol_style_Style({
//         image: new ol_style_Circle({
//           fill: new ol_style_Fill({
//             color: util.convertHex("#FFA500", 80)
//           }),
//           radius: scaledRadius,
//           stroke: new ol_style_Stroke({
//             color: [0, 0, 0, 0.8],
//             width: 0.5
//           })
//         })
//       });
//       createBubble(sd[i].id);
//     }
//   }
//
//   /* To ensure name closure, pass the route and
//      its info as parameters into this function. */
//   function createBubble(sid) {
//     var gpxUrl = '../data/stops/' + sid + '.gpx';
//     var bubble = new ol_layer_Vector({
//       source: new ol_source_Vector({
//         url: gpxUrl,
//         format: new ol_format_GPX()
//       }),
//       style: bubbleStyle[sid],
//       opacity: 1,
//       visible: true
//     });
//     bubbleLayers.push(bubble);
//   }
//
//   var bubbleView = new ol_View({
//     center: ol_proj.fromLonLat([-122.2582, 37.8688]),
//     maxZoom: 15,
//     minZoom: 15,
//     zoom: 15,
//     extent: transform([-122.271856, 37.860317, -122.247710, 37.877256]),
//   });
//
//   var bubbleMap = new ol_Map({
//     target: 'bubble-map',
//     controls: [],
//     interactions: [],
//     layers: Array(raster).concat(bubbleLayers),
//     view: bubbleView
//   });
// }

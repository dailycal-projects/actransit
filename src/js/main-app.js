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

util.sortByDelay(routeIds);
// graphs.drawDelays("#methodology", [20, 32], true);
for (var i = 0; i < selectRoutes.length; i++) {
  var selectBus = selectRoutes[i].split("-")[0];
  var selectDir = selectRoutes[i].split("-")[1];
  var r = data[selectBus + "_" + util.routeMeta[selectBus][selectDir]];
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
 * OPENLAYERS MAP SETTINGS. Generate map tiles in RASTER,
 * place bus routes (in MultiLineString) and stops (in Point)
 * on the map based on their bus route (and coinciding color).
 */

var raster = new ol_layer_Tile({
  source: new ol_source_OSM({
    "url": "http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
  }),
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
  minZoom: 15,
  zoom: 16,
  extent: transform([-122.271856, 37.860317, -122.247710, 37.877256]),
});

var map = new ol_Map({
  target: 'map',
  interactions: ol_interaction.defaults({mouseWheelZoom:false}),
  layers: Array(raster).concat(vectorLayers),
  view: view
});

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/* To ensure name closure, pass the route and
   its info as parameters into this function. */
function createVector(r, d) {
  var gpxUrl = 'data/gpx/'+slugify(r+'_'+d)+'.gpx';
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
  var stopOrRoute;
  if (marker.length === 3) {
    document.getElementById("stopId").style.display = "block";
    document.getElementById("stopName").innerHTML = sd[marker[0]];
    stopOrRoute = "stop";
  } else {
    document.getElementById("stopId").style.display = "none";
    document.getElementById("stopName").innerHTML = "Route Information";
    stopOrRoute = "route";
  }
  // console.log(key, data.hasOwnProperty(key), util.isClosed(bus, marker[0]));
  if (key[0] === "_") {
    document.getElementById("error").innerHTML = "This stop does not report predictions.";
    document.getElementById("error").style = "color: black";
    document.getElementById("late").innerHTML = "";
    document.getElementById("hist-sum").innerHTML = "";
    d3.select("#info svg").remove();
  } else if (!data.hasOwnProperty(key) || util.isClosed(bus, marker[0])) {
    document.getElementById("error").innerHTML = "Due to construction activity, this stop is closed and does not report predictions."
    document.getElementById("error").style = "color: red";
    document.getElementById("late").innerHTML = "";
    document.getElementById("hist-sum").innerHTML = "";
    d3.select("#info svg").remove();
  } else {
    document.getElementById("error").innerHTML = "";
    var innerHTML = "Frequency of delays: <span>" + Math.floor(data[key]["late"] / data[key]["length"] * 100) + "%</span>";
    document.getElementById("late").innerHTML = innerHTML;

    histData = data[key]["hist"];
    var summ = graphs.drawHist(histData);
    innerHTML = "This "+stopOrRoute+" experienced the most delays between <b>" + util.getTimeSlot(summ[0]) + " and " + util.getTimeSlot(summ[0] + 1) + "</b> The chart below shows how delays vary throughout the day.";
    document.getElementById("hist-sum").innerHTML = innerHTML;
  }
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

$('.jump-down').on('click', function() {
  const scrollTop = $('#lines').offset().top;
  console.log(scrollTop);
  $('html,body').animate({ scrollTop: scrollTop }, 500);
});

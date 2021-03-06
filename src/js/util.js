const d3 = require('d3');
exports.routeMeta = {
  '6': {'N': 'Berkeley BART', 'S': 'Downtown Oakland', 'color': '#006DB8', 'proj': [-122.261943, 37.866976]},
  '7': {'N': 'Berkeley BART', 'S': 'E C Del Norte BART', 'color': '#75C695', 'proj': [-122.266520, 37.873903]},
  // '12': {'N': 'Oakland Amtrak', 'S': 'Westbrae - Berkeley', 'color': '#85D2DD', 'proj': [-122.268154, 37.862520]},
  '18': {'N': 'Lake Meritt BART', 'S': 'Albany', 'color': '#8D6538', 'proj': [-122.267477, 37.866868]},
  '36': {'N': 'UC Campus', 'S': 'West Oakland BART', 'color': '#C4A2CB', 'proj': [-122.261340, 37.866013]},
  '51B': {'N': 'Berkeley Amtrak', 'S': 'Rockridge BART', 'color': '#008B59', 'proj': [-122.261276, 37.867495]},
  '52': {'N': 'U.c. Campus', 'S': 'U.c. Village', 'color': '#F598AA', 'proj': [-122.261580, 37.871708]},
  '65': {'N': 'To Downtown Berkeley', 'S': 'Euclid', 'color': '#652D91', 'proj': [-122.265167, 37.874832]},
  '67': {'N': 'To Downtown Berkeley', 'S': 'Spruce', 'color': '#FECD08', 'proj': [-122.266344, 37.872394]},
  '79': {'N': 'El Cerrito Plaza BART', 'S': 'Rockridge BART', 'color': '#00B1B0', 'proj': [-122.259189, 37.867030]},
  '88': {'N': 'Berkeley BART', 'S': 'Lake Merritt BART', 'color': '#9A983A', 'proj': [-122.267837, 37.870075]},
  'F': {'N': 'San Francisco', 'S': 'Berkeley', 'color': '#F79447', 'proj': [-122.261580, 37.871708]}
};

exports.stopMeta = {
  "": "Bancroft Way & Piedmont Ave.",
  "54050": "Bancroft Way & Piedmont Ave.",
  "54455": "Bancroft Way & Telegraph Ave.",
  "54454": "Shattuck Ave. & Dwight Way",
  "59555": "Bancroft Way & College Ave.",
  "51579": "Durant Ave. & Telegraph St.",
  "51173": "Oxford St. & Hearst Ave.",
  "50144": "Piedmont Ave. & Channing Way",
  "57225": "Shattuck Ave. & Virginia St.",
  "56521": "Oxford St. & University Ave.",
  "55593": "Bancroft Way & Dana St.",
  "50966": "Euclid Ave. & Le Conte Ave.",
  "51687": "Allston Way & Shattuck Ave.",
  "52667": "Euclid Ave. & Hearst Ave.",
  "50400": "Oxford St. & University Ave.",
  "51377": "Shattuck Ave. & Derby St.",
  "57725": "Piedmont Circle. & Dwight Way",
  "56888": "Bancroft Way & Telegraph Ave.",
  "55226": "Shattuck Ave. & Durant Ave.",
  "55456": "Hearst Ave. & Arch St.",
  "55452": "Shattuck Ave. & Dwight Way",
  "55999": "Shattuck Ave. & Kittredge St.",
  "55585": "Shattuck Ave. & Kittredge St.",
  "51072": "Hearst Ave. & Shattuck Ave.",
  "51073": "Oxford St. & Hearst Ave.",
  "51606": "Durant Ave. & Dana St.",
  "55559": "Shattuck Sq & Center St.",
  "55935": "Shattuck Ave. & Parker St.",
  "54963": "Bancroft Way & Telegraph Ave.",
  "54230": "Oxford St. & Virginia St.",
  "53700": "Gayley Rd. & Greek Theatre",
  "58889": "Shattuck Ave. & University Ave.",
  "58558": "Hearst Ave. & Arch St.",
  "55138": "Dana St. & Haste St.",
  "50575": "Dwight Way & Martin Luther King Jr. Way",
  "59977": "College Ave. & Derby St.",
  "52155": "Shattuck Ave. & Durant Ave.",
  "51759": "Bancroft Way & Piedmont Ave.",
  "57200": "Shattuck Ave. & Delaware St.",
  "54655": "Bancroft Way & Ellsworth St.",
  "54303": "Oxford St. & Virginia St.",
  "55551": "Shattuck Sq & Center St.",
  "58005": "Haste St. & Shattuck Ave.",
  "50765": "Martin Luther King Jr. Way & Parker St.",
  "51997": "Piedmont Ave. & Dwight Way",
  "51300": "Shattuck Ave. & Haste St.",
  "54588": "Shattuck Ave. & Delaware St.",
  "51180": "Dwight Way & Milvia St.",
  "51582": "College Ave. & Parker St.",
  "55006": "Hearst Ave. & Euclid Ave.",
  "51584": "Durant Ave. & Ellsworth St.",
  "57566": "Addison St. & Oxford St.",
  "300301130": "Bancroft Way & Dana St.",
  "54767": "Warring St. & Derby St.",
  "51538": "Allston Way & Shattuck Ave.",
  "58778": "Warring St. & Derby St.",
  "52244": "College Ave. & Haste St.",
  "50607": "Hearst Ave. & Spruce St.",
  "50600": "College Ave. & Derby St.",
  "57776": "Shattuck Ave. & University Ave.",
  "57774": "College Ave. & Parker St.",
  "52250": "Telegraph Ave. & Parker St.",
  "57555": "Durant Ave. & Dana St.",
  "59114": "Warring St. & Parker St.",
  "50444": "University Ave. & Shattuck Ave.",
  "59593": "Telegraph Ave. & Derby St.",
  "55304": "Euclid Ave. & Ridge Rd.",
  "52995": "Piedmont Ave. & Bancroft Way",
  "52333": "Durant Ave. & College Ave.",
  "57300": "University Ave. & Shattuck Ave.",
  "56654": "Shattuck Ave. & Virginia St.",
  "58835": "Telegraph Ave. & Parker St.",
  "56555": "Durant Ave. & Shattuck Ave.",
  "50229": "Haste St. & Milvia St.",
  "57711": "Telegraph Ave. & Dwight Way",
  "51244": "Telegraph Ave. & Haste St.",
  "51555": "Telegraph Ave. & Dwight Way",
  "51719": "Shattuck Ave. & Center St.",
  "52223": "College Ave. & Haste St.",
  "55664": "Warring St. & Parker St.",
  "52280": "Fulton St. & Kittredge St.",
  "55609": "Telegraph Ave. & Durant Ave.",
  "54466": "University Ave. & Shattuck Ave.",
  "53677": "Piedmont Ave. & Channing Way",
  "57955": "Hearst Ave. & Le Roy Ave.",
  "55967": "Piedmont Ave. & UC Faculty Club",
  "51705": "Oxford St. & Addison St.",
  "51015": "Telegraph Ave. & Derby St.",
  "55678": "Shattuck Ave. & Center St.",
  "51096": "Allston Way & Shattuck Ave.",
  "50151": "Shattuck Ave. & Parker St."
};

var closedStops = {
  "52": ['50400','58558','55006','57955','53700','55967','52995','59555','55593','54655'],
  "F": ['51072','50607','58558','55006','57955','53700','55967','52995','59555','55593','54655'],
  "51B": ['55593','54655'],
  "36": ['55593','54655'],
  "6": ['55593','54655'],
  "79": ['55593','54655'],
}

exports.isClosed = function (bus, stopId) {
  if (closedStops.hasOwnProperty(bus)) {
    if (closedStops[bus].indexOf(stopId) > -1) {
      return true;
    }
  }
  return false;
}

/* UTILITY FUNCTIONS */
exports.convertHex = function (hex, opacity) {
  var hex = hex.replace('#','');
  var r = parseInt(hex.substring(0,2), 16);
  var g = parseInt(hex.substring(2,4), 16);
  var b = parseInt(hex.substring(4,6), 16);
  var result = [r, g, b, opacity/100];
  return result;
};

exports.convertTime = function (seconds) {
  var m = Math.floor(Math.floor(seconds) / 60);
  var s = Math.floor(seconds) % 60;
  if (m === 0) {
    return s + " sec";
  } else {
    return m + " min " + s + " sec";
  }
};

exports.sortByDelay = function (list, option='avg') {
  var sorted = list.sort(function(x, y){
    if (option === 'avg') {
      return d3.descending(x.mean, y.mean);
    } else { // option === 'otp' (at least 5 min delay)
      return d3.descending(x.late / x.length, y.late / y.length);
    }
  });
};

exports.getTimeSlot = function (index) {
  var hour = (Math.floor(index / 2) + 5) % 12;
  if (hour === 0) hour = 12
  var ampm = " a.m.";
  if (hour >= 12 || hour <= 24) {
    ampm = " p.m.";
  }
  var min = ":00";
  if (index % 2 === 1) {
    min = ":30"
  }
  return hour + min + ampm;
};

exports.aggregateDelays = function (list) {
  var times = new Uint8Array(38);
  for (var i = 0; i < list.length; i++) {
    var delays = list[i].hist;
    for (var j = 0; j < delays.length; j++) {
      times[j] += delays[j];
    }
  }
  return times;
}

exports.selectOption = function (selected, isStop=false) {
  var options = document.querySelectorAll('#lines .badge'); // route options
  if (isStop) options = document.querySelectorAll('.dir button'); // dir options

  for (var i = 0; i < options.length; i++) {
    var toCompare;
    if (!isStop) toCompare = options[i].id.slice(6); // get route name
    else toCompare = options[i].innerHTML; // get stop name

    if (selected !== toCompare) {
      options[i].classList.remove('selected');
    } else {
      options[i].classList.add('selected');
    }
  }
}

const d3 = require('d3');

var times = ['5 a.m.','6 a.m.','7 a.m.','8 a.m.','9 a.m.','10 a.m.','11 a.m.','12 p.m.',
             '1 p.m.','2 p.m.','3 p.m.','4 p.m.','5 p.m.','6 p.m.','7 p.m.',
             '8 p.m.','9 p.m.','10 p.m.','11 p.m.','12 a.m.'];
/*
 * D3-utilizing function. Draw the histogram of delays per
 * time slot based on the DATASET. OPTION tells us whether
 * we are looking at each feature on the map or the final
 * summary at the bottom of page.
 */
exports.drawHist = function (dataset) {
  d3.select("#info svg").remove(); // if a previously drawn hist exists, delete it
  var max = d3.max(dataset);
  var maxi = 0;
  var total = 0;
  for (var i = 0; i < dataset.length; i++) {
    total += dataset[i];
  }

  var margin = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 28
  };
  var width = window.innerWidth * 0.35;
  var height = 200;
  if (window.innerWidth <= 768) {
    width = window.innerWidth * 0.85;
    height = 120;
  }

  var w = width - margin.left - margin.right; //440
  var h = height - margin.top - margin.bottom; // 100
  var barPadding = 1;
  var tickRange = [];
  var svg = d3.select("#hist")
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
      return margin.top + h - Math.floor(d / (total * 0.3) * h);  //Height minus data value
    })
    .attr("width", w / dataset.length - barPadding)
    .attr("height", function(d, i) {
      if (d === max) {
        maxi = i;
      }
      return Math.floor(d / (total * 0.3) * h);
    })
    .attr("fill", "#DF5660");
  tickRange.push(w + margin.left);
  var xScale = d3.scaleOrdinal()
    .domain(times)
    .range(tickRange);
  var xAxis = d3.axisBottom(xScale);
  svg.append('g')
    .attr("class", "time-axis")
    .attr("transform", "translate(0," + (margin.top + h) + ")")
    .call(xAxis);
  var yScale = d3.scaleLinear()
    .domain([0, 30])
    .range([h, 0]);
  var yAxis = d3.axisLeft()
    .scale(yScale)
    .tickFormat(d => `${d}%`)
    .tickValues([10,20,30])
    .tickSizeOuter([0])
    .tickSizeInner([0]);
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(yAxis);

  var hours = $('.time-axis text');
  if (window.innerWidth >= 400) {
    hours.each(function() {
      const h = $(this).html();
      if (h.slice(0, h.length - 5) % 2 === 0) {
        $(this).css('fill', 'none');
      }
    });
  } else {
    hours.each(function() {
      const h = $(this).html();
      if (h.slice(0, h.length - 5) % 3 !== 2) {
        $(this).css('fill', 'none');
      }
    });
  }
  return [maxi, Math.floor(max / total * 100)];
}

exports.drawDelays = function (elementID, arrivalTimes, size='regular') {

  var width = 400;
  var height = 180;
  if (size === 'small') {
    width = 280;
    height = 150;
  }
  var margin = {
    top: 28,
    right: 12,
    bottom: 40,
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
    .domain([0, 40])
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
    .attr("fill", function(d) {
      if (d <= 20) return "#D3D3D3";
      if (d <= 25) return "#D3D3D3";
      else return "#d95f0e";
    })
    .attr("transform", function(d) {
      return "translate("+(rScale(d)-w/2)+",0) scale(1, 0.75)";
    });

  var xScale = d3.scaleLinear()
    .domain([-20, 20])
    .range([0, w]);
  var xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickSizeOuter(0)
    .tickSizeInner(0);
  svg.append('g')
    .attr("class", "x axis")
    .attr("transform", "translate("+(-w/2)+",0)")
    .call(xAxis);
  /*svg.append('text')
    .attr('x', 0)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12')
    .attr('font-family', 'Lato, sans-serif')
    .text('Minutes off from prediction');*/

  var badge = "";
  if (elementID === '#arrivals-F-S') {
    badge = '<h2 class="badge badge-F">F</h2><h2 class="db">Berkeley</h2>';
  } else if (elementID === '#arrivals-F-N') {
    badge = '<h2 class="badge badge-F">F</h2><h2 class="db">San Francisco</h2>';
  } else if (elementID === '#arrivals-51B-S') {
    badge = '<h2 class="badge badge-51B">51B</h2><h2 class="db">Rockridge BART</h2>';
  } else if (elementID === '#arrivals-51B-N') {
    badge = '<h2 class="badge badge-51B">51B</h2><h2 class="db">Berkeley Amtrak</h2>';
  } else if (elementID === '#arrivals-18-S') {
    badge = '<h2 class="badge badge-18">18</h2><h2 class="db">Albany</h2>';
  } else if (elementID === '#arrivals-18-N') {
    badge = '<h2 class="badge badge-18">18</h2><h2 class="db">Lake Merritt BART</h2>';
  } else if (elementID === '#arrivals-79-S') {
    badge = '<h2 class="badge badge-79">79</h2><h2 class="db">Rockridge BART</h2>';
  } else if (elementID === '#arrivals-79-N') {
    badge = '<h2 class="badge badge-79">79</h2><h2 class="db">El Cerrito Plaza BART</h2>';
  }
  svg.append('foreignObject')
    .attr('class','svg-fo')
    .attr('width', width)
    .attr('x', -width/2 + margin.left)
    .attr('y', -margin.top - h)
    .html(badge);
}

/*
 * D3-utilizing function. Draw the sorted routes or stops on
 * a horizontal bar graph to compare average delays for each
 * route or stop. NO LONGER USED
 */
exports.drawDelayedRoutes = function (dataset) {
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

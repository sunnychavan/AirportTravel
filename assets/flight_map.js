const svg = d3.select("#usMap");
const width = svg.attr("width");
const height = svg.attr("height");
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const mapWidth = width - margin.left - margin.right;
const mapHeight = height - margin.top - margin.bottom;

const mapAdjScale = 1.2;
const mapAdjLeft = -22;
const mapAdjTop = -40;

const map = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const requestData = async function () {
  const us = await d3.json("./data/us-in-place.topojson");
  var states = topojson.feature(us, us["objects"]["us-in-place"]); // List of state outlines to fill
  var statesMesh = topojson.mesh(us, us["objects"]["us-in-place"]); // 'Mesh' of all outlines put together for a stroke
  var projection = d3.geoAlbers().fitSize([mapWidth, mapHeight], states);

  // scale adjustments
  let currScale = projection.scale();
  projection.scale(mapAdjScale * currScale);

  // translation adjustments
  let currOffset = projection.translate();
  projection.translate([currOffset[0] + mapAdjLeft, currOffset[1] + mapAdjTop]);

  var path = d3.geoPath().projection(projection);
  let graticule = d3.geoGraticule10();

  map.append("path").attr("class", "graticule").attr("d", path(graticule));

  map
    .selectAll("path.state")
    .data(states.features)
    .join("path")
    .attr("class", "state")
    .attr("d", path);

  map.append("path").datum(statesMesh).attr("class", "outline").attr("d", path);

  const cities = await d3.csv("./data/map_data.csv", d3.autoType);

  const numFlightsExtent = d3.extent(cities, (d) => d["num_flights"]);
  const opacityScale = d3.scalePow().domain(numFlightsExtent).range([0, 0.8]);

  map
    .selectAll("line")
    .data(cities)
    .join("line")
    .attr("class", "flightLines")
    .attr("x1", (d) => projection([d.origin_longitude, d.origin_latitude])[0])
    .attr("y1", (d) => projection([d.origin_longitude, d.origin_latitude])[1])
    .attr("x2", (d) => projection([d.dest_longitude, d.dest_latitude])[0])
    .attr("y2", (d) => projection([d.dest_longitude, d.dest_latitude])[1])
    .attr("opacity", (d) => opacityScale(d["num_flights"]));

  map
    .selectAll("circle")
    .data(cities)
    .join("circle")
    .attr("r", 1.5)
    .attr("class", "cities")
    .attr("transform", function (d) {
      return (
        "translate(" + projection([d.origin_longitude, d.origin_latitude]) + ")"
      );
    });
};
requestData();

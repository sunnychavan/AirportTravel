const dataXCol = "population";
const dataYCol = "num_flights";

const margins = { top: 25, right: 75, bottom: 60, left: 90 };
const chartWidth = svg.attr("width") - margins.left - margins.right;
const chartHeight = svg.attr("height") - margins.top - margins.bottom;

d3.csv("./data/scatter_data.csv").then(
  (data) => {
    let svg = d3.select("#cityScatter");

    let chartArea = svg
      .append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);

    xExtent = d3.extent(data, function (d) {
      return +d[dataXCol];
    });
    yExtent = d3.extent(data, function (d) {
      return +d[dataYCol];
    });

    xScale = d3.scaleLog().domain(xExtent).range([0, chartWidth]);
    yScale = d3.scaleLinear().domain(yExtent).range([chartHeight, 0]);

    let leftGridlines = d3
      .axisLeft(yScale)
      .tickSize(-chartWidth - 10)
      .tickFormat("");
    svg
      .append("g")
      .attr("class", "gridlines")
      .attr("transform", `translate(${margins.left - 10}, ${margins.top})`)
      .call(leftGridlines);
    let bottomGridlines = d3
      .axisBottom(xScale)
      .tickSize(-chartHeight - 10)
      .tickFormat("");
    svg
      .append("g")
      .attr("class", "gridlines")
      .attr(
        "transform",
        `translate(${margins.left}, ${chartHeight + margins.top + 10})`
      )
      .call(bottomGridlines);

    let leftAxis = d3.axisLeft(yScale);
    svg
      .append("g")
      .attr("transform", `translate(${margins.left - 10}, ${margins.top})`)
      .call(leftAxis);
    let bottomAxis = d3.axisBottom(xScale);
    svg
      .append("g")
      .attr(
        "transform",
        `translate(${margins.left}, ${chartHeight + margins.top + 10})`
      )
      .call(bottomAxis);

    labels = svg.append("g").attr("class", "axis-labels");
    labels
      .append("text")
      .text("City Population (log)")
      .attr(
        "transform",
        `translate(${(margins.left + chartWidth) / 2}, ${
          chartHeight + margins.bottom + 10
        })`
      );

    labels
      .append("text")
      .text("Outbound Flight Traffic")
      .attr("transform-origin", "middle")
      .attr("transform", function (d) {
        return (
          "rotate(-90)" +
          " " +
          `translate(${-chartHeight + margins.bottom}, 25)`
        );
      });

    data.forEach((d) => {
      let group = chartArea.append("g");
      group
        .append("circle")
        .attr("cx", xScale(d[dataXCol]))
        .attr("cy", yScale(d[dataYCol]))
        .attr("r", 4)
        .attr("class", "points");
      group
        .append("text")
        .text(function () {
          let result = "";
          if (showLabel(d)) {
            result = d["origin_city"];
          }
          return result;
        })
        .attr("x", xScale(d[dataXCol]))
        .attr("y", yScale(d[dataYCol]))
        .attr("class", "pointLabels");
    });

    chartArea.raise();
  },
  (error) => {
    console.log("unable to load the scatter dataset json file");
  }
);

function showLabel(d) {
  let xPos = xScale(d[dataXCol]);
  let yPos = yScale(d[dataYCol]);
  return (
    xScale(d[dataXCol]) <= 0.3 * chartWidth ||
    0.7 * chartWidth <= xPos ||
    0.74 * chartHeight >= yPos
  );
}

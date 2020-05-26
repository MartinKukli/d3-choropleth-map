import * as d3 from "d3";
import * as topojson from "topojson";

const builder = jsonData => {
  const color = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeGreens[9]);

  const svg = d3
    .select("#map")
    .attr("width", "960px")
    .attr("height", "600px");

  const tooltip = d3
    .select("#main")
    .append("div")
    .attr("id", "tooltip");

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(jsonData[1], jsonData[1].objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr(
      "data-education",
      d => jsonData[0].filter(data => data.fips === d.id)[0].bachelorsOrHigher
    )
    .attr("d", d3.geoPath())
    .style("fill", d =>
      color(jsonData[0].filter(data => data.fips === d.id)[0].bachelorsOrHigher)
    )
    .on("mouseover", d => {
      tooltip
        .transition()
        .duration(100)
        .style("opacity", 0.9);

      tooltip
        .html(
          `${jsonData[0].filter(data => data.fips === d.id)[0].area_name}, ${
            jsonData[0].filter(data => data.fips === d.id)[0].state
          }, ${
            jsonData[0].filter(data => data.fips === d.id)[0].bachelorsOrHigher
          }%`
        )
        .attr(
          "data-education",
          jsonData[0].filter(data => data.fips === d.id)[0].bachelorsOrHigher
        )
        .style("left", `${d3.event.pageX - 40}px`)
        .style("top", `${d3.event.pageY - 50}px`)
        .style("transform", "translateX(60px)");
    })
    .on("mouseout", d =>
      tooltip
        .transition()
        .duration(100)
        .style("opacity", 0)
    );

  const legend = d3
    .select("#legend")
    .attr("width", "250px")
    .attr("height", "30px")
    .style("fill", "lightgrey");

  const bachelorsOrHigherList = jsonData[0].map(item => item.bachelorsOrHigher);
  const legendScale = d3
    .scaleLinear()
    .domain([0, 80])
    .range([10, 240]);
  const legendAxis = d3.axisBottom(legendScale);
  legend
    .selectAll("rect")
    .data(bachelorsOrHigherList)
    .enter()
    .append("rect")
    .attr("width", `${240 / 8}px`)
    .attr("height", "30px")
    .attr("x", d => legendScale(d))
    .style("fill", d => color(d));

  legend.append("g").call(legendAxis);
};

Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
  ),
  d3.json(
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"
  )
])
  .then(data => builder(data))
  .catch(() => console.error("Something is wrong..."));

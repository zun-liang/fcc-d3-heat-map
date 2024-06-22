import "./style.css";
import * as d3 from "d3";
import { Margin, TempData, Data } from "./types";

const width: number = 1000;
const height: number = 400;
const margin: Margin = { top: 80, left: 70, right: 70, bottom: 80 };

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((res: Response) => res.json() as Promise<Data>)
  .then((data) => {
    const baseTemp: number = data.baseTemperature;
    const tempData: TempData[] = data.monthlyVariance;

    const xScale = d3
      .scaleBand()
      .domain(tempData.map((d) => d.year.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"])
      .range([margin.top, height - margin.bottom]);

    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlBu)
      .domain([
        d3.max(tempData, (d) => baseTemp + d.variance)!,
        d3.min(tempData, (d) => baseTemp + d.variance)!,
      ]);

    const svg = d3
      .select("div#app")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .classed("svg-content", true);

    svg
      .append("text")
      .attr("id", "title")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "30px")
      .text("Monthly Global Land-Surface Temperature");

    svg
      .append("text")
      .attr("id", "description")
      .attr("x", width / 2)
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("fill", "black")
      .text("1753 - 2015: base temperature 8.66℃");

    const tooltip = d3.select("body").append("div").attr("id", "tooltip");

    const yAxisTicks = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(xScale.domain().filter((year) => Number(year) % 10 === 0))
      )
      .style("font-size", "8px");

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat((d, i) => yAxisTicks[i]))
      .style("font-size", "8px");

    svg
      .selectAll("rect")
      .data(tempData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d.year.toString())!)
      .attr("y", (d) => yScale(d.month.toString())!)
      .attr("data-year", (d) => d.year)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-temp", (d) => d.variance + baseTemp)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("fill", (d) => colorScale(baseTemp + d.variance))
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .style("stroke", "black")
          .style("stroke-width", 1);
        tooltip
          .style("display", "block")
          .html(
            `${d.year} - ${
              d.month === 1
                ? "January"
                : d.month === 2
                ? "February"
                : d.month === 3
                ? "March"
                : d.month === 4
                ? "April"
                : d.month === 5
                ? "May"
                : d.month === 6
                ? "June"
                : d.month === 7
                ? "July"
                : d.month === 8
                ? "August"
                : d.month === 9
                ? "September"
                : d.month === 10
                ? "October"
                : d.month === 11
                ? "November"
                : "December"
            }<br/>${(baseTemp + d.variance).toFixed(
              2
            )}℃<br/>${d.variance.toFixed(2)}℃`
          )
          .attr("data-year", d.year)
          .style("left", `${event.pageX - 50}px`)
          .style("top", `${event.pageY + 30}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).style("stroke", "none");
        tooltip.style("display", "none");
      });

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 40)
      .text("Years")
      .style("font-size", "10px");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 25)
      .text("Months")
      .style("font-size", "10px");

    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - margin.right;
    const legendY = height - margin.bottom / 2;

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    const legendScale = d3
      .scaleLinear()
      .domain(colorScale.domain().reverse())
      .range([0, legendWidth])
      .nice();

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat((d) => d.valueOf().toFixed(1));

    legend
      .selectAll("rect")
      .data(d3.range(legendWidth))
      .enter()
      .append("rect")
      .attr("x", (d) => d)
      .attr("y", 0)
      .attr("width", 1)
      .attr("height", legendHeight)
      .attr("fill", (d) => colorScale(legendScale.invert(d)));

    legend
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  });

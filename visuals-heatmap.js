margin = {top: 20, right: 0, bottom: 20, left: 120}
width = 800 - margin.left - margin.right
height = 700 - margin.top - margin.bottom;

let svg, legendSvg;
let allData = [];
let filteredData = [];
const attributes = [
    "happiness", "prosperity",  "personal_freedom",
    "social_capital", "investment_environment", "natural_environment",
    "enterprise_conditions", "infrastructure_and_market_access",
    "living_conditions", "health", "education",  "governance", "population",
];

function calculateCorrelation(x, y) {
    const n = x.length;
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const covariance = d3.sum(x.map((d, i) => (d - meanX) * (y[i] - meanY))) / n;
    const stdDevX = d3.deviation(x);
    const stdDevY = d3.deviation(y);
    return covariance / (stdDevX * stdDevY);
}

function computeCorrelationMatrix(data, attributes) {
    const matrix = [];
    for (let i = 0; i < attributes.length; i++) {
        for (let j = 0; j < attributes.length; j++) {
            const x = data.map(d => d[attributes[i]]);
            const y = data.map(d => d[attributes[j]]);
            matrix.push({row: attributes[i], col: attributes[j], value: calculateCorrelation(x, y)});
        }
    }
    return matrix;
}

async function getHeatMapData() {
    const data = await d3.csv("data.csv");
    return data.map(d => ({
        happiness: +d.happiness,
        prosperity: +d.prosperity,
        population: +d.population,
        personal_freedom: +d.prosperity_personal_freedom,
        governance: +d.prosperity_governance,
        social_capital: +d.prosperity_social_capital,
        investment_environment: +d.prosperity_investment_environment,
        enterprise_conditions: +d.prosperity_enterprise_conditions,
        infrastructure_and_market_access: +d.prosperity_infrastructure_and_market_access,
        living_conditions: +d.prosperity_living_conditions,
        health: +d.prosperity_health,
        education: +d.prosperity_education,
        natural_environment: +d.prosperity_natural_environment,
        region: +d.region_cat,
        political_regime: +d.political_regime_cat
    }));
}

function createHeatMap() {
    const myColor = d3.scaleSequential().interpolator(d3.interpolateCividis).domain([-1, 1]);
    svg = d3.select("#visual-4")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom - 200)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const legendWidth = 300;
    const legendHeight = 20;

    legendSvg = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - legendWidth) + "," + (75 + height + margin.bottom / 2) + ")");

    const legend = legendSvg.selectAll(".legend-item")
        .data(myColor.ticks(10).reverse());

    legend.enter().append("rect")
        .attr("class", "legend-item")
        .attr("x", (d, i) => legendWidth - (i * legendWidth / 10))
        .attr("y", 0)
        .attr("width", legendWidth / 10)
        .attr("height", legendHeight)
        .style("fill", myColor);

    legend.enter().append("text")
        .attr("x", (d, i) => legendWidth - (i * legendWidth / 10) + (legendWidth / 20))
        .attr("y", legendHeight + 15)
        .style("text-anchor", "middle")
        .text(String);

    legendSvg.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .text("Correlation Coefficient");

    getHeatMapData().then(data => {
        allData = data;
        filteredData = allData;
        updateHeatMap();
    });

    d3.select("#slide-4").selectAll(".dropdown-item").on("click", function () {
        const selectedRegime = +d3.select(this).attr("data-value");
        d3.select("#dropdownMenuButtonHeat").text(d3.select(this).text());
        filteredData = selectedRegime === -1 ? allData : allData.filter(d => d.political_regime === selectedRegime);
        updateHeatMap();
        setActiveHeatDropdownItem(this);
    });

    d3.select("#slide-4").selectAll(".button.region").on("click", function () {
        const selectedRegion = +d3.select(this).attr("data-region");
        filteredData = selectedRegion === -1 ? allData : allData.filter(d => d.region === selectedRegion);
        updateHeatMap();
    });
}

function updateHeatMap() {
    const correlationMatrix = computeCorrelationMatrix(filteredData, attributes);
    const myColor = d3.scaleSequential().interpolator(d3.interpolateCividis).domain([-1, 1]);
    const x = d3.scaleBand().range([0, width]).padding(0.01);
    const y = d3.scaleBand().range([height, 0]).padding(0.01);

    const rows = attributes;
    const cols = attributes;

    x.domain(cols);
    y.domain(rows);

    const xAxis = svg.selectAll(".x-axis")
        .data([null]);
    xAxis.enter().append("g")
        .attr("class", "x-axis")
        .merge(xAxis)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    const yAxis = svg.selectAll(".y-axis")
        .data([null]);
    yAxis.enter().append("g")
        .attr("class", "y-axis")
        .merge(yAxis)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    const squares = svg.selectAll(".square")
        .data(correlationMatrix, d => d.row + ':' + d.col);

    squares.enter().append("rect")
        .attr("class", "square")
        .merge(squares)
        .transition()
        .duration(1000)
        .attr("x", d => x(d.col))
        .attr("y", d => y(d.row))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => myColor(d.value));

    squares.exit().remove();

    svg.selectAll(".square")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Correlation: " + d.value.toFixed(2))
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function setActiveHeatDropdownItem(element) {
    d3.select("#slide-4").selectAll(".dropdown-item").classed("active", false);
    d3.select(element).classed("active", true);
    const selectedValue = d3.select(element).text();
    d3.select("#dropdownMenuButtonScatter").text(selectedValue);
}
let selectedRegime = -1;
let selectedRegion = -1;

async function getScatterData() {
    const data = await d3.csv("data.csv");
    return data.map(d => ({
        happiness: +d.happiness,
        prosperity: +d.prosperity,
        region: +d.region_cat,
        country: d.country,
        political_regime: +d.political_regime_cat
    }));
}

function drawScatterAnnotations() {
    const svg = d3.select("#visual-3");

    const x1 = 600;
    const y1 = 500;
    const annotation1 = svg.append("g")
        .attr("class", "annotation");

    annotation1.append("text")
        .attr("class", "annotation")
        .attr("x", x1)
        .attr("y", y1)
        .text("Afghanistan");

    annotation1.append("line")
        .attr("class", "annotation-line")
        .attr("x1", x1 + 40)
        .attr("y1", y1 + 5)
        .attr("x2", 676)
        .attr("y2", 561)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const x2 = 225;
    const y2 = 150;
    const annotation2 = svg.append("g")
        .attr("class", "annotation");

    annotation2.append("text")
        .attr("class", "annotation")
        .attr("x", x2)
        .attr("y", y2)
        .text("USA");

    annotation2.append("line")
        .attr("class", "annotation-line")
        .attr("x1", x2 + 15)
        .attr("y1", y2 + 3)
        .attr("x2", 200)
        .attr("y2", 170)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const x3 = 150;
    const y3 = 75;
    const annotation3 = svg.append("g")
        .attr("class", "annotation");

    annotation3.append("text")
        .attr("class", "annotation")
        .attr("x", x3)
        .attr("y", y3)
        .text("Finland");

    annotation3.append("line")
        .attr("class", "annotation-line")
        .attr("x1", x3 + 25)
        .attr("y1", y3 + 3)
        .attr("x2", 131)
        .attr("y2", 98)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
}

function removeScatterAnnotation() {
    const svg = d3.select("#visual-3");
    svg.selectAll(".annotation").remove();
}

function updateScatterPlot(svg, data, x, y, tooltip) {
    removeScatterAnnotation();
    const circles = svg.selectAll("circle")
        .data(data, d => d.country);

    circles.exit()
        .transition()
        .duration(500)
        .attr("r", 0)
        .remove();

    const circlesEnter = circles.enter().append("circle")
        .attr("cx", d => x(d.prosperity))
        .attr("cy", d => y(d.happiness))
        .attr("r", 0)
        .attr("fill", d => categoryColors[d.region])
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.country} </br> Happiness: ${d.happiness} </br> Prosperity: ${d.prosperity}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    circles.merge(circlesEnter)
        .transition()
        .duration(500)
        .attr("r", 5)
        .attr("cx", d => x(d.prosperity))
        .attr("cy", d => y(d.happiness))
        .attr("fill", d => categoryColors[d.region])
        .style("opacity", d => {
            if (selectedRegime !== -1 && d.political_regime !== selectedRegime) {
                return 0;
            }
            if (selectedRegion !== -1 && d.region !== selectedRegion) {
                return 0.1;
            }
            return 1;
        });
}

function applyFilters(data) {
    return data.filter(d =>
        (selectedRegime === -1 || d.political_regime === selectedRegime)
    );
}

function onPoliticalRegimeChange(data, svg, x, y, tooltip) {

    return function() {
        selectedRegime = +d3.select(this).attr("data-value");
        const filteredData = applyFilters(data);
        updateScatterPlot(svg, filteredData, x, y, tooltip);
        setActiveScatterDropdownItem(this);
    };
}

function onRegionChange(svg, data, x, y, tooltip) {

    return function() {
        selectedRegion = +d3.select(this).attr("data-region");
        updateScatterPlot(svg, applyFilters(data), x, y, tooltip);
        activateButton(this);
    };
}

async function createScatterPlot() {
    const data = await getScatterData();
    const svg = d3.select("#visual-3");

    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d.prosperity) - 1, d3.max(data, d => d.prosperity) + 1])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.happiness) - 1, d3.max(data, d => d.happiness) + 1])
        .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    svg.append("text")
        .attr("transform", `translate(${width / 2 + 75},${height - margin.bottom + 40})`)
        .style("text-anchor", "middle")
        .text("Prosperity");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 50)
        .attr("x", -(height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Happiness");

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    updateScatterPlot(svg, data, x, y, tooltip);

    d3.select("#slide-3").selectAll(".dropdown-item").on("click", onPoliticalRegimeChange(data, svg, x, y, tooltip));
    d3.select("#slide-3").selectAll(".button.region").on("click", onRegionChange(svg, data, x, y, tooltip));
}

function setActiveScatterDropdownItem(element) {
    d3.select("#slide-3").selectAll(".dropdown-item").classed("active", false);
    d3.select(element).classed("active", true);
    const selectedValue = d3.select(element).text();
    d3.select("#dropdownMenuButtonScatter").text(selectedValue);
}

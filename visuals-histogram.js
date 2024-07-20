
async function getHistogramData(type) {
    const data = await d3.csv("data.csv");
    if (type === 'happiness') {
        return data.map(d => ({x: +d.happiness, category: d.region_cat, country: d.country}));
    } else if (type === 'prosperity') {
        return data.map(d => ({x: +d.prosperity, category: d.region_cat, country: d.country}));
    }
}

function activateButton(button) {
    const buttons = button.parentElement.querySelectorAll('.button');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

async function showHappinessHistogram(button) {
    document.getElementById("filter-happiness").classList.add("active");
    document.getElementById("filter-prosperity").classList.remove("active");
    activateButton(document.getElementById("filter-happiness").firstElementChild)

    if (button) {
        activateButton(button)
    }

    const data = await getHistogramData('happiness');
    showStackedHistogram(data, 12, "#visual-2");
}

async function showProsperityHistogram(button) {
    document.getElementById("filter-prosperity").classList.add("active");
    document.getElementById("filter-happiness").classList.remove("active");
    activateButton(document.getElementById("filter-prosperity").firstElementChild)

    if (button) {
        activateButton(button)
    }

    const data = await getHistogramData('prosperity');
    showStackedHistogram(data, 150, "#visual-2");
}


async function filterHappinessDataByCategory(button, category) {
    if (button) {
        activateButton(button);
    }

    if (category === 'all') {
        await showHappinessHistogram();
    } else {
        const data = await getHistogramData('happiness');
        const filteredData = data.filter(d => d.category === category);
        showStackedHistogram(filteredData, 12, "#visual-2");
    }
}

async function filterProsperityDataByCategory(button, category) {
    if (button) {
        activateButton(button);
    }
    if (category === 'all') {
        await showProsperityHistogram();
    } else {
        const data = await getHistogramData('prosperity');
        const filteredData = data.filter(d => d.category === category);
        showStackedHistogram(filteredData, 150, "#visual-2");
    }
}
function showStackedHistogram(data, domainLimit, svgId) {
    const svg = d3.select(svgId).select("svg");

    if (svg.empty()) {
        const newSvg = d3.select(svgId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        newSvg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`);

        newSvg.append("g")
            .attr("class", "y-axis");

        return updateHistogram(newSvg, data, domainLimit);
    }

    updateHistogram(svg.select("g"), data, domainLimit);
}

function updateHistogram(svg, data, domainLimit) {
    const x = d3.scaleLinear()
        .domain([0, domainLimit])
        .range([0, width]);

    svg.select(".x-axis")
        .transition()
        .duration(750)
        .call(d3.axisBottom(x));

    const histogram = d3.histogram()
        .value(d => d.x)
        .domain(x.domain())
        .thresholds(x.ticks(30));

    const bins = histogram(data);
    const categories = Array.from(new Set(data.map(d => d.category)));

    const stack = d3.stack()
        .keys(categories)
        .value((d, key) => d.values[key] || 0);

    const stackedData = bins.map(bin => {
        const values = {};
        bin.forEach(d => {
            if (values[d.category]) {
                values[d.category]++;
            } else {
                values[d.category] = 1;
            }
        });
        return {x0: bin.x0, x1: bin.x1, values: values, countries: bin.map(d => d.country)};
    });

    const series = stack(stackedData);

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(stackedData, d => d3.sum(categories, key => d.values[key]))]);

    svg.select(".y-axis")
        .transition()
        .duration(750)
        .call(d3.axisLeft(y));

    const groups = svg.selectAll("g.layer")
        .data(series)
        .attr("fill", d => categoryColors[d.key]);

    groups.exit().remove();

    const newGroups = groups.enter().append("g")
        .classed("layer", true)
        .attr("fill", d => categoryColors[d.key]);

    newGroups.merge(groups)
        .selectAll("rect")
        .data(d => d)
        .join(
            enter => enter.append("rect")
                .attr("x", d => x(d.data.x0) + 1)
                .attr("y", y(0))
                .attr("height", 0)
                .attr("width", d => x(d.data.x1) - x(d.data.x0) - 2)
                .call(enter => enter.transition().duration(750)
                    .attr("x", d => x(d.data.x0) + 1)
                    .attr("y", d => y(d[1]))
                    .attr("height", d => y(d[0]) - y(d[1])))
                .attr("fill", d => categoryColors[d.key]),
            update => update.call(update => update.transition().duration(750)
                .attr("x", d => x(d.data.x0) + 1)
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", d => x(d.data.x1) - x(d.data.x0) - 2))
                .attr("fill", d => categoryColors[d.key]),
            exit => exit.call(exit => exit.transition().duration(750)
                .attr("y", y(0))
                .attr("height", 0)
                .remove())
        );

    const tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white");

    svg.selectAll("rect")
        .on("mouseover", function(event, d) {
            const countries = d.data.countries.join(", ");
            tooltip.transition()
                .duration(100)
                .style("opacity", .9);
            tooltip.html(`Countries: ${countries}`)
                .style("left", (event.x+10) + "px")
                .style("top", (event.y) + "px")
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
        })
}

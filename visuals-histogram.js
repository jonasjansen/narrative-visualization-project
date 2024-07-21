async function getHistogramData(type) {
    const data = await d3.csv("data.csv");
    if (type === 'happiness') {
        return data.map(d => ({ x: +d.happiness, category: d.region_cat, country: d.country }));
    } else if (type === 'prosperity') {
        return data.map(d => ({ x: +d.prosperity, category: d.region_cat, country: d.country }));
    }
}

function activateButton(button) {
    const buttons = button.parentElement.querySelectorAll('.button');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

function drawHistogramAnnotations() {
    const svg = d3.select("#visual-2").select("svg");

    const annotation1 = svg.append("g")
        .attr("class", "annotation");

    annotation1.append("text")
        .attr("class", "annotation")
        .attr("x", 170)
        .attr("y", 550)
        .text("Afghanistan");

    annotation1.append("line")
        .attr("class", "annotation-line")
        .attr("x1", 210)
        .attr("y1", 555)
        .attr("x2", 255 - 35)
        .attr("y2", 570 + 45)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const annotation2 = svg.append("g")
        .attr("class", "annotation");

    annotation2.append("text")
        .attr("class", "annotation")
        .attr("x", 570)
        .attr("y", 370)
        .text("USA");

    annotation2.append("line")
        .attr("class", "annotation-line")
        .attr("x1", 570 + 15)
        .attr("y1", 375)
        .attr("x2", 505)
        .attr("y2", 420)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const annotation3 = svg.append("g")
        .attr("class", "annotation");

    annotation3.append("text")
        .attr("class", "annotation")
        .attr("x", 600)
        .attr("y", 550)
        .text("Finland");

    annotation3.append("line")
        .attr("class", "annotation-line")
        .attr("x1", 600 + 25)
        .attr("y1", 555)
        .attr("x2", 560)
        .attr("y2", 550 + 45)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
}

function removeHistogramAnnotation() {
    const svg = d3.select("#visual-2").select("svg");
    svg.selectAll(".annotation").remove();
}

async function showHappinessHistogram(button) {
    removeHistogramAnnotation()
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
    removeHistogramAnnotation()
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
    removeHistogramAnnotation()
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
    removeHistogramAnnotation()
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
            .attr("transform", `translate(0, ${height - 50})`);  // Move x-axis higher

        newSvg.append("g")
            .attr("class", "y-axis");

        // Add x-axis label
        newSvg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 30)  // Adjusted for new x-axis position
            .text("Value");

        // Add y-axis label
        newSvg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 70)  // Move y-axis label closer to the axis
            .text("Frequency");

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
        return { x0: bin.x0, x1: bin.x1, values: values, countries: bin.map(d => d.country) };
    });

    const series = stack(stackedData);

    const y = d3.scaleLinear()
        .range([height - 50, 0])
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
        .on("mouseover", function (event, d) {
            const countries = d.data.countries.join(", ");
            tooltip.transition()
                .duration(100)
                .style("opacity", .9);
            tooltip.html(`Countries: ${countries}`)
                .style("left", (event.x + 10) + "px")
                .style("top", (event.y) + "px")
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
        });
}

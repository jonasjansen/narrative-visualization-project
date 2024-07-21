
async function init() {
    await showHappinessHistogram();
    await createScatterPlot();
    await createHeatMap();

    drawHistogramAnnotations();
    drawScatterAnnotations();
}

init().then(() => console.log("Finished creating visual."));

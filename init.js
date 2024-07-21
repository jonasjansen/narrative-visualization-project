
async function init() {
    await showHappinessHistogram();
    await createScatterPlot();
    await createHeatMap();
}

init().then(() => console.log("Finished creating visual."));

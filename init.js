
async function init() {
    await showHappinessHistogram();
    await createScatterPlot();
}

init().then(() => console.log("Finished creating visual."));

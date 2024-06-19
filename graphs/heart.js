function plotGraph(angleModifier, plotElement, isMuted, a) {
    const e = Math.E;
    const π = Math.PI;

    function calculateY(x, isPositive) {
        const angle = (isPositive ? π : -π) * x + angleModifier;
        const y = Math.pow(Math.abs(x), 2/3) + (e/3) * Math.sqrt(π - Math.pow(x, 2)) * Math.sin(a * angle);
        return x === 0 ? 0 : y;
    }

    const xValues = [];
    const yValuesPositive = [];

    for (let x = -2; x <= 2; x += 0.01) {
        xValues.push(x);
        yValuesPositive.push(calculateY(x, true));
    }

    Plotly.newPlot(plotElement, [
        {
            x: xValues,
            y: yValuesPositive,
            type: 'scatter',
            mode: 'lines',
            line: { color: isMuted ? 'grey' : 'rgba(255, 99, 71, 0.6)', width: isMuted ? 1 : Math.max(1, 5 - (a / 6)) },
            hoverinfo: 'skip' // Disable hover information for the graph, so the plotly is disabled pretty much
        }
    ], {
        xaxis: { range: [-2.3, 2.3], visible: false, scaleanchor: 'y', scaleratio: 1 },
        yaxis: { range: [-1.5, 2.5], visible: false },
        plot_bgcolor: 'transparent',
        paper_bgcolor: 'transparent',
        showlegend: false,
        margin: { l: 0, r: 0, t: 0, b: 0 },
        hovermode: false // Disable hover mode here
    }, { displayModeBar: false }); // Disabled Plotly mode bar
}

document.addEventListener('DOMContentLoaded', function() {
    const plotElement = document.getElementById('plot');
    const audioElement = document.getElementById('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    let isMuted = false;
    let a = 10;

    function calculateY(x, isPositive) {
        const e = Math.E;
        const π = Math.PI;
        const angle = isPositive ? π * x : -π * x;
        const y = Math.pow(Math.abs(x), 2/3) + (e/3) * Math.sqrt(π - Math.pow(x, 2)) * Math.sin(a * angle);
        return x === 0 ? 0 : y; // Ensure the graph goes through the origin
    }

    function generateData() {
        const xValues = [];
        const yValuesPositive = [];

        for (let x = -2; x <= 2; x += 0.01) {
            xValues.push(x);
            yValuesPositive.push(calculateY(x, true));
        }

        return { x: xValues, yPositive: yValuesPositive };
    }

    function plotGraph() {
        const data = generateData();

        Plotly.newPlot(plotElement, [
            {
                x: data.x,
                y: data.yPositive,
                type: 'scatter',
                mode: 'lines',
                line: { color: isMuted ? 'grey' : 'rgba(255, 99, 71, 0.6)', width: isMuted ? 1 : Math.max(1, 5 - (a / 6)) }
            }
        ], {
            xaxis: { range: [-2, 2], visible: false, scaleanchor: 'y', scaleratio: 1 },
            yaxis: { range: [-1.5, 2.5], visible: false },
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
            showlegend: false,
            margin: { l: 0, r: 0, t: 0, b: 0 }
        }, { displayModeBar: false }); // Disable Plotly mode bar
    }

    function toggleMute() {
        isMuted = !isMuted;
        audioElement.muted = isMuted;
        plotGraph();
        if (isMuted) {
            showMuteOverlay();
        } else {
            removeMuteOverlay();
        }
    }

    function showMuteOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mute-overlay';
        overlay.innerHTML = '<div class="mute-line"></div>';
        plotElement.appendChild(overlay);
    }

    function removeMuteOverlay() {
        const overlay = plotElement.querySelector('.mute-overlay');
        if (overlay) {
            plotElement.removeChild(overlay);
        }
    }

    plotElement.addEventListener('click', toggleMute);

    playPauseBtn.addEventListener('click', function() {
        if (audioElement.paused) {
            audioElement.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            audioElement.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    plotElement.addEventListener('mousedown', function(event) {
        const initialA = a;
        const initialMouseX = event.clientX;
        const initialMouseY = event.clientY;

        function onMouseMove(event) {
            const deltaX = event.clientX - initialMouseX;
            const deltaY = event.clientY - initialMouseY;
            a = Math.min(30, Math.max(0, initialA + deltaX / 10 - deltaY / 10));
            audioElement.volume = a / 30;
            plotGraph();
            if (a === 0 && !isMuted) {
                toggleMute();
            } else if (a > 0 && isMuted) {
                toggleMute();
            }
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Ensure the audio is not muted initially and set volume
    audioElement.muted = false;
    audioElement.volume = a / 30;

    plotGraph();
});

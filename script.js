document.addEventListener('DOMContentLoaded', function() {
    const plotElement = document.getElementById('plot');
    const audioElement = document.getElementById('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const loopBtn = document.getElementById('loopBtn');
    const fileInput = document.getElementById('fileInput');
    let selectedGraph = 'heart';
    let isMuted = false;
    let isPlaying = false;
    let isLooping = true; // LOOOOP ENABLED
    let a = 10;
    let musicFiles = [];
    let loopInterval;
    const loopSpeed = 100; //Speed in ms

    const graphs = {
        heart: {
            generateData: function(angleModifier = 0) {
                const xValues = [];
                const yValuesPositive = [];
                for (let x = -2; x <= 2; x += 0.01) {
                    xValues.push(x);
                    yValuesPositive.push(calculateY(x, true, angleModifier));
                }
                return { x: xValues, yPositive: yValuesPositive };
            },
            plotGraph: function(angleModifier = 0) {
                const data = this.generateData(angleModifier);
                Plotly.newPlot(plotElement, [
                    {
                        x: data.x,
                        y: data.yPositive,
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
            },
            sampleMusic: 'audio/heart.mp3' // Default sample music for the heart graph (just do i wanna know by arctic monkeys  )
        }
        /*more to add in future, will make it more modular*/
    };

    function calculateY(x, isPositive, angleModifier = 0) {
        const e = Math.E;
        const π = Math.PI;
        const angle = (isPositive ? π : -π) * x + angleModifier;
        const y = Math.pow(Math.abs(x), 2/3) + (e/3) * Math.sqrt(π - Math.pow(x, 2)) * Math.sin(a * angle);
        return x === 0 ? 0 : y; 
    }

    function plotCurrentGraph(angleModifier = 0) {
        graphs[selectedGraph].plotGraph(angleModifier);
    }

    function selectGraph(graph) {
        selectedGraph = graph;
        plotCurrentGraph();
        playSampleMusic();
        closeMenu(); 
    }

    function playSampleMusic() {
        const graph = graphs[selectedGraph];
        if (graph.sampleMusic) {
            audioElement.src = graph.sampleMusic;
            audioElement.play();
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        audioElement.muted = isMuted;
        plotCurrentGraph();
        if (isMuted) {
            showMuteOverlay();
        } else {
            removeMuteOverlay();
        }
    }

    function showMuteOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mute-overlay';
        plotElement.appendChild(overlay);
    }

    function removeMuteOverlay() {
        const overlay = plotElement.querySelector('.mute-overlay');
        if (overlay) {
            plotElement.removeChild(overlay);
        }
    }

    function uploadMusic(event) {
        musicFiles = Array.from(event.target.files);
        if (musicFiles.length > 0) {
            playMusic(0); 
        }
    }

    function playMusic(index) {
        if (index >= 0 && index < musicFiles.length) {
            const file = musicFiles[index];
            const reader = new FileReader();
            reader.onload = function(e) {
                audioElement.src = e.target.result;
                audioElement.play();
            };
            reader.readAsDataURL(file);
        }
    }

    function connectToSpotify() {
        alert("Connect to Spotify feature coming soon!");
    }

    function startLoop() {
        let angle = 0;
        clearInterval(loopInterval);
        loopInterval = setInterval(() => {
            angle += Math.PI / 100; // Looping adjusts here
            if (angle > Math.PI) angle = -Math.PI;
            plotCurrentGraph(angle);
        }, loopSpeed);
    }

    function stopLoop() {
        clearInterval(loopInterval);
        plotCurrentGraph();
    }

    function toggleLoop() {
        isLooping = !isLooping;
        if (isLooping) {
            loopBtn.classList.add('active');
            startLoop();
        } else {
            loopBtn.classList.remove('active');
            stopLoop();
        }
    }

    plotElement.addEventListener('click', toggleMute);
    loopBtn.addEventListener('click', toggleLoop);

    playPauseBtn.addEventListener('click', function() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            audioElement.play();
            playPauseBtn.textContent = 'Pause';
            if (isLooping) {
                startLoop();
            }
        } else {
            audioElement.pause();
            playPauseBtn.textContent = 'Play';
            stopLoop();
        }
    });

    function handleStart(event) {
        const initialA = a;
        const initialMouseX = event.clientX || event.touches[0].clientX;
        const initialMouseY = event.clientY || event.touches[0].clientY;

        function onMove(event) {
            const clientX = event.clientX || event.touches[0].clientX;
            const clientY = event.clientY || event.touches[0].clientY;
            const deltaX = clientX - initialMouseX;
            const deltaY = clientY - initialMouseY;
            a = Math.min(30, Math.max(0, initialA + deltaX / 10 - deltaY / 10));
            audioElement.volume = a / 30;
            plotCurrentGraph();
            if (a === 0 && !isMuted) {
                toggleMute();
            } else if (a > 0 && isMuted) {
                toggleMute();
            }
        }

        function onEnd() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onEnd);
    }

    plotElement.addEventListener('mousedown', handleStart);
    plotElement.addEventListener('touchstart', handleStart);

    audioElement.muted = false;
    audioElement.volume = a / 30;

    plotCurrentGraph();
    playSampleMusic();
});

function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const mainContent = document.getElementById('mainContent');
    const sideMenuContent = document.querySelector('.side-menu-content');
    if (sideMenu.style.width === '250px') {
        sideMenu.style.width = '0';
        mainContent.style.marginLeft = '0';
        sideMenuContent.style.opacity = '0'; // Use opacity for smooth transition
        setTimeout(() => {
            sideMenuContent.style.visibility = 'hidden';
        }, 500); 
    } else {
        sideMenu.style.width = '250px';
        mainContent.style.marginLeft = '250px';
        sideMenuContent.style.visibility = 'visible';
        sideMenuContent.style.opacity = '1'; 
    }
}

function closeMenu(event) {
    const sideMenu = document.getElementById('sideMenu');
    const sideMenuContent = document.querySelector('.side-menu-content');
    if (sideMenu.style.width === '250px' && !sideMenu.contains(event.target) && event.target.id !== 'menuButton') {
        toggleMenu();
    }
}

function toggleDropdown(id) {
    const dropdownContent = document.getElementById(id);
    dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
}

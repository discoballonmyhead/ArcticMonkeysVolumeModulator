document.addEventListener('DOMContentLoaded', function() {
    const plotElement = document.getElementById('plot');
    const audioElement = document.getElementById('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const loopBtn = document.getElementById('loopBtn');
    const fileInput = document.getElementById('fileInput');
    const descriptionElement = document.getElementById('description');
    const navbar = document.querySelector('.navbar');
    const graphSubmenu = document.getElementById('graphSubmenu');
    const logoLink = document.querySelector('.logo a');
    let selectedGraph = 'heart';
    let isMuted = false;
    let isPlaying = false;
    let isLooping = true;
    let a = 10;
    let musicFiles = [];
    let loopInterval;
    const loopSpeed = 100;

    const graphConfigs = {
        heart: {
            script: 'graphs/heart.js',
            description: 'graphs/description-heart.txt',
            thumbnail: 'assets/thumbnails/heart.png',
            sampleMusic: 'audio/heart.mp3'
        },
        graph2: {
            script: 'graphs/graph2.js',
            description: 'graphs/description-graph2.txt',
            thumbnail: 'assets/thumbnails/graph2.png',
            sampleMusic: 'audio/sample.mp3'
        }
    };

    function loadGraphScript(scriptUrl, callback) {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function loadGraphDescription(descriptionUrl) {
        fetch(descriptionUrl)
            .then(response => response.text())
            .then(text => {
                descriptionElement.innerText = text;
            });
    }

    function plotCurrentGraph(angleModifier = 0) {
        loadGraphScript(graphConfigs[selectedGraph].script, function() {
            plotGraph(angleModifier, plotElement, isMuted, a);
        });
        loadGraphDescription(graphConfigs[selectedGraph].description);
    }

    function selectGraph(graph) {
        selectedGraph = graph;
        plotCurrentGraph();
        setSampleMusic();
        closeSubmenus();
    }

    function setSampleMusic() {
        const graph = graphConfigs[selectedGraph];
        if (graph.sampleMusic) {
            audioElement.src = graph.sampleMusic;
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
            setMusicSource(0);
        }
    }

    function setMusicSource(index) {
        if (index >= 0 && index < musicFiles.length) {
            const file = musicFiles[index];
            const reader = new FileReader();
            reader.onload = function(e) {
                audioElement.src = e.target.result;
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
            angle += Math.PI / 100;
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

    function closeSubmenus() {
        const submenus = document.querySelectorAll('.submenu');
        submenus.forEach(submenu => {
            submenu.style.display = 'none';
        });
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

    for (const [graphName, config] of Object.entries(graphConfigs)) {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'thumbnail';
        thumbnailDiv.onclick = () => selectGraph(graphName);

        const img = document.createElement('img');
        img.src = config.thumbnail;
        img.alt = `${graphName} Graph`;

        const label = document.createElement('div');
        label.className = 'thumbnail-label';
        label.textContent = graphName.charAt(0).toUpperCase() + graphName.slice(1);

        thumbnailDiv.appendChild(img);
        thumbnailDiv.appendChild(label);
        graphSubmenu.appendChild(thumbnailDiv);
    }

    fileInput.addEventListener('change', uploadMusic);

    plotCurrentGraph();
    setSampleMusic();

    // Navbar click functionality
    logoLink.addEventListener('click', function() {
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
            closeSubmenus();
        } else {
            navbar.classList.add('active');
        }
    });

    document.addEventListener('click', function(event) {
        const isClickInside = navbar.contains(event.target) || logoLink.contains(event.target);
        if (!isClickInside) {
            navbar.classList.remove('active');
            closeSubmenus();
        }
    });

    document.querySelectorAll('.nav-link').forEach(item => {
        item.addEventListener('click', function() {
            navbar.classList.add('active');
        });
    });
});

function toggleSubmenu(id) {
    const submenu = document.getElementById(id);
    submenu.style.display = submenu.style.display === 'none' ? 'flex' : 'none';
}

function closeSubmenus() {
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(submenu => {
        submenu.style.display = 'none';
    });
}

function connectToSpotify() {
    alert("Connect to Spotify feature coming soon!");
}

function selectYouTubePlaylist() {
    alert("Select YouTube Playlist feature coming soon!");
}

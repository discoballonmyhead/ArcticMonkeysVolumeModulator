document.addEventListener('DOMContentLoaded', function() {
    const plotElement = document.getElementById('plot');
    const audioElement = document.getElementById('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const loopBtn = document.getElementById('loopBtn');
    const fileInput = document.getElementById('fileInput');
    const graphDescriptionContainer = document.getElementById('graphDescriptionContainer');
    const graphDescriptionElement = document.getElementById('graphDescription');
    const pageDescription = document.getElementById('pageDescription');
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

    /* YouTube shenanigans */
    let player;
    let youtubeLinks = [];
    let currentVideoIndex = 0;

    /* Graph shenanigans */
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
                graphDescriptionElement.innerText = text;
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

    window.addEventListener('resize', function() {
        const plotContainerRect = document.getElementById('plotContainer').getBoundingClientRect();
        const controlOverlay = document.getElementById('controlOverlay');
        controlOverlay.style.top = `${plotContainerRect.bottom}px`;
    });

    window.dispatchEvent(new Event('resize'));

    document.getElementById('youtubeLinkInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addYouTubeLink();
        }
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

// YouTube API code
function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API is ready');
}

function addYouTubeLink() {
    const linkInput = document.getElementById('youtubeLinkInput').value;
    const videoId = parseYouTubeLink(linkInput);
    if (videoId) {
        youtubeLinks.push(videoId);
        if (!player) {
            loadYouTubePlayer(videoId);
        }
    } else {
        alert('Invalid YouTube link');
    }
}

function parseYouTubeLink(link) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = link.match(regex);
    return match ? match[1] : null;
}

function loadYouTubePlayer(videoId) {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.setVolume(a * 3.33);
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        currentVideoIndex = (currentVideoIndex + 1) % youtubeLinks.length;
        player.loadVideoById(youtubeLinks[currentVideoIndex]);
    }
}

function addToPlaylist(videoId) {
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=YOUR_API_KEY`)
        .then(response => response.json())
        .then(data => {
            const videoData = data.items[0];
            const thumbnail = videoData.snippet.thumbnails.default.url;
            const title = videoData.snippet.title;
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.innerHTML = `
                <img src="${thumbnail}" alt="${title}" class="playlist-thumbnail">
                <div class="playlist-info">
                    <div class="playlist-title">${title}</div>
                    <div class="playlist-status" id="status-${videoId}">Paused</div>
                </div>
                <div class="playlist-controls">
                    <button onclick="playVideo('${videoId}')">Play</button>
                    <button onclick="removeFromPlaylist('${videoId}')">Remove</button>
                </div>
            `;
            playlistElement.appendChild(playlistItem);
        });
}

window.playVideo = function(videoId) {
    player.loadVideoById(videoId);
    updatePlaylistStatus(videoId, 'Playing');
};

window.removeFromPlaylist = function(videoId) {
    youtubeLinks = youtubeLinks.filter(id => id !== videoId);
    document.getElementById(`item-${videoId}`).remove();
};

function updatePlaylistStatus(videoId, status) {
    const statusElement = document.getElementById(`status-${videoId}`);
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.style.color = status === 'Playing' ? 'green' : 'yellow';
    }
}

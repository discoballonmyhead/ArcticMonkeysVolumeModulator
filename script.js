document.addEventListener('DOMContentLoaded', () => {
    const plotElement = document.getElementById('plot');
    const audioElement = document.getElementById('audio');
    const effectBtn = document.getElementById('effectBtn');
    const fileInput = document.getElementById('fileInput');
    const graphDescriptionElement = document.getElementById('graphDescription');
    const navbar = document.querySelector('.navbar');
    const graphSubmenu = document.getElementById('graphSubmenu');
    const trackListElement = document.querySelector('.track-list');
    const logoLink = document.querySelector('.logo a');
    const playPauseBtn = document.querySelector('.playpause-track');
    const nextTrackBtn = document.querySelector('.next-track');
    const prevTrackBtn = document.querySelector('.prev-track');
    const shuffleBtn = document.querySelector('.random-track');
    const repeatBtn = document.querySelector('.repeat-track');
    const seekSlider = document.querySelector('.seek-slider');
    const currentTimeElement = document.querySelector('.current-time');
    const volumePercentage = document.querySelector('.volume-percentage');

    let selectedGraph = 'heart';
    let isMuted = false;
    let isPlaying = false;
    let isEffectLooping = false;
    let isTrackLooping = false;
    let isShuffling = false;
    let a = 10;
    let effectLoopInterval;
    const effectLoopSpeed = 100;
    let currentTrackIndex = 0;
    const defaultArtist = "Unknown Artist";
    const defaultTrackArt = "path/to/default-art.png"; // Add your default track art path here

    const musicQueue = [];

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

    function loadScript(scriptUrl, callback) {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function fetchText(url, callback) {
        fetch(url)
            .then(response => response.text())
            .then(text => callback(text));
    }

    function plotCurrentGraph(angleModifier = 0) {
        loadScript(graphConfigs[selectedGraph].script, () => {
            plotGraph(angleModifier, plotElement, isMuted, a);
        });
        fetchText(graphConfigs[selectedGraph].description, text => {
            graphDescriptionElement.innerText = text;
        });
    }

    function selectGraph(graph) {
        selectedGraph = graph;
        plotCurrentGraph();
        addSampleMusicToQueue();
        closeSubmenus();
    }

    function addSampleMusicToQueue() {
        const graph = graphConfigs[selectedGraph];
        if (graph.sampleMusic) {
            addTrackToQueue(graph.sampleMusic, selectedGraph, defaultArtist, defaultTrackArt);
            loadTrack(0); // Load the first track but do not play
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
        const files = Array.from(event.target.files);
        files.forEach(file => {
            const src = URL.createObjectURL(file);
            const name = file.name.split('.').slice(0, -1).join('.');
            addTrackToQueue(src, name, defaultArtist, defaultTrackArt);
        });
        if (files.length > 0 && !isPlaying) {
            loadTrack(0);
        }
    }

    function addTrackToQueue(src, name, artist, art) {
        const track = {
            src,
            name,
            artist,
            art
        };
        musicQueue.push(track);
        displayTrackList();
    }

    function displayTrackList() {
        trackListElement.innerHTML = '';
        musicQueue.forEach((track, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'track';
            if (index === currentTrackIndex) {
                trackDiv.classList.add('active');
            }
            trackDiv.onclick = () => loadTrack(index);

            const trackInfo = document.createElement('div');
            trackInfo.className = 'track-info';
            trackInfo.innerHTML = `
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            `;

            const trackArt = document.createElement('img');
            trackArt.src = track.art;
            trackArt.alt = track.name;
            trackArt.className = 'track-art';

            trackDiv.appendChild(trackArt);
            trackDiv.appendChild(trackInfo);
            trackListElement.appendChild(trackDiv);
        });
    }

    function loadTrack(index) {
        if (index >= 0 && index < musicQueue.length) {
            currentTrackIndex = index;
            const track = musicQueue[index];
            audioElement.src = track.src;
            document.querySelector('.track-name').textContent = track.name;
            document.querySelector('.track-artist').textContent = track.artist;
            document.querySelector('.track-art').style.backgroundImage = `url(${track.art})`;
            isPlaying = false;
            updatePlayPauseButton();
        }
    }

    function startEffectLoop() {
        let angle = 0;
        clearInterval(effectLoopInterval);
        effectLoopInterval = setInterval(() => {
            angle += Math.PI / 100;
            if (angle > Math.PI) angle = -Math.PI;
            plotCurrentGraph(angle);
        }, effectLoopSpeed);
    }

    function stopEffectLoop() {
        clearInterval(effectLoopInterval);
        plotCurrentGraph();
    }

    function toggleEffectLoop() {
        isEffectLooping = !isEffectLooping;
        if (isEffectLooping) {
            effectBtn.classList.add('active');
            startEffectLoop();
        } else {
            effectBtn.classList.remove('active');
            stopEffectLoop();
        }
    }

    function playpauseTrack() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            audioElement.play();
            if (!isEffectLooping) {
                startEffectLoop();
                isEffectLooping = true;
            }
        } else {
            audioElement.pause();
            stopEffectLoop();
            isEffectLooping = false;
        }
        updatePlayPauseButton();
    }

    function updatePlayPauseButton() {
        const playPauseIcon = document.querySelector('.playpause-track i');
        if (isPlaying) {
            playPauseIcon.classList.replace('fa-play-circle', 'fa-pause-circle');
        } else {
            playPauseIcon.classList.replace('fa-pause-circle', 'fa-play-circle');
        }
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex > 0) ? currentTrackIndex - 1 : musicQueue.length - 1;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            audioElement.play();
        }
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex < musicQueue.length - 1) ? currentTrackIndex + 1 : 0;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            audioElement.play();
        }
    }

    function toggleShuffle() {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active', isShuffling);
    }

    function toggleTrackLoop() {
        isTrackLooping = !isTrackLooping;
        repeatBtn.classList.toggle('active', isTrackLooping);
    }

    function seekTo() {
        const seekTo = audioElement.duration * (seekSlider.value / 100);
        audioElement.currentTime = seekTo;
    }

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

    audioElement.volume = a / 30;

    audioElement.addEventListener('ended', () => {
        if (isTrackLooping) {
            audioElement.currentTime = 0;
            audioElement.play();
        } else {
            nextTrack();
        }
    });

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
    addSampleMusicToQueue();

    logoLink.addEventListener('click', () => {
        if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
            closeSubmenus();
        } else {
            navbar.classList.add('active');
        }
    });

    document.addEventListener('click', (event) => {
        const isClickInside = navbar.contains(event.target) || logoLink.contains(event.target);
        if (!isClickInside) {
            navbar.classList.remove('active');
            closeSubmenus();
        }
    });

    document.querySelectorAll('.nav-link').forEach(item => {
        item.addEventListener('click', () => {
            navbar.classList.add('active');
        });
    });

    window.addEventListener('resize', () => {
        const plotContainerRect = document.getElementById('plotContainer').getBoundingClientRect();
        const controlOverlay = document.getElementById('controlOverlay');
        controlOverlay.style.top = `${plotContainerRect.bottom}px`;
    });

    window.dispatchEvent(new Event('resize'));

    document.getElementById('youtubeLinkInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addYouTubeLink();
        }
    });

    playPauseBtn.addEventListener('click', playpauseTrack);
    nextTrackBtn.addEventListener('click', nextTrack);
    prevTrackBtn.addEventListener('click', prevTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleTrackLoop);
    seekSlider.addEventListener('input', seekTo);
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

window.playVideo = function (videoId) {
    player.loadVideoById(videoId);
    updatePlaylistStatus(videoId, 'Playing');
};

window.removeFromPlaylist = function (videoId) {
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

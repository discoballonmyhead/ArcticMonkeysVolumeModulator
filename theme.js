const themeMap = {
    dark: "light",
    light: "solar",
    solar: "dark"
};

const theme = localStorage.getItem('theme') || (tmp = Object.keys(themeMap)[0], localStorage.setItem('theme', tmp), tmp);
const bodyClass = document.body.classList;
bodyClass.add(theme);

function toggleTheme() {
    const current = localStorage.getItem('theme');
    const next = themeMap[current];

    bodyClass.replace(current, next);
    localStorage.setItem('theme', next);
    updatePlayerColors(next);
}

document.getElementById('themeButton').onclick = toggleTheme;

// Add this to update player colors
function updatePlayerColors(theme) {
    const playerElements = document.querySelectorAll('.player-container, .track, .remove-track, .seek-slider');
    playerElements.forEach(el => {
        el.classList.remove('dark', 'light', 'solar');
        el.classList.add(theme);
    });

    // Update text colors
    const textElements = document.querySelectorAll('.track-name, .track-artist, .nav-link, .link-text, .description');
    textElements.forEach(el => {
        el.classList.remove('dark', 'light', 'solar');
        el.classList.add(theme);
    });
}

// Call updatePlayerColors when theme is changed
document.getElementById('themeButton').onclick = () => {
    toggleTheme();
    updatePlayerColors(localStorage.getItem('theme'));
};

# Volume Modulator

This project is a web-based volume modulator that visualizes mathematical graphs with dynamic audio playback. Users can interact with the graph to adjust the volume and mute/unmute the audio. The project features a side menu for selecting different graphs, uploading music, and connecting to Spotify (placeholder).

## Features

- **Graph Visualization**: Displays mathematical graphs that dynamically change with audio playback.
- **Volume Control**: Adjusts the audio volume based on user interaction with the graph.
- **Mute/Unmute**: Toggles the audio mute state by clicking on the graph.
- **Looping Functionality**: Loops the graph animation when audio is playing. The loop speed can be adjusted in the code.
- **Responsive Design**: Ensures the application is mobile-friendly and responsive.
- **Side Menu**: Provides options to select different graphs, upload music, and connect to Spotify.


## Setup and Usage

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/volume-modulator.git
    cd volume-modulator
    ```

2. Open `index.html` in a web browser to view the application.

## Implementation Details

### index.html

- Added buttons for Play/Pause and Loop functionality.
- Included a side menu for selecting graphs, uploading music, and connecting to Spotify.

### style.css

- Ensured consistent styling and responsiveness.
- Styled buttons and dropdowns for better aesthetics.
- Added transitions for smooth UI interactions.
- Ensured the cursor remains default when hovering over the graph.

### script.js

- Implemented graph visualization using Plotly.
- Added volume control based on user interaction with the graph.
- Enabled loop functionality for the graph animation.
- Added functionality to upload and play music files.
- Implemented a side menu with dropdowns for selecting graphs and uploading music.
- Dynamically loads graph scripts and descriptions.
- Ensured the graph dynamically updates with audio playback and user interactions.

### Graph Scripts

- `heart.js`: Contains the implementation for the heart-shaped graph.
- `graph2.js`: Contains the implementation for the second graph.
- Each graph script should define a `plotGraph` function to plot the graph on the `plotElement`.

## Future Improvements

- Implement the Connect to Spotify functionality.
- Add more graph configurations and sample music files.
- Enhance the UI with additional visual effects and animations.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.



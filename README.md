# COOU Campus Navigator 🗺️

## Project Overview

Experience seamless navigation across the Chukwuemeka Odumegwu Ojukwu University campus with this intuitive mobile application. Built with React Native and Expo, it leverages interactive maps, location services, and powerful search to guide students and visitors to their destinations efficiently.

## Features

*   **Interactive Campus Map**: Explore the COOU Uli campus with detailed building markers and points of interest.
*   **Location Search**: Quickly find specific faculties, hostels, clinics, and libraries using a dynamic search bar.
*   **Turn-by-Turn Navigation**: Get precise directions from your current location to any point on campus, complete with step-by-step instructions.
*   **Real-time User Location**: Tracks your position on the map, providing live updates and adjusting your route as you move.
*   **Background Location Tracking**: Continues to update your location for navigation even when the app is in the background (requires user permission).
*   **Dynamic Markers**: Easily identify different types of campus buildings with custom-coded icons.
*   **Campus Bounds**: The map intelligently centers and limits panning to the university's geographical area.

## Getting Started

Follow these steps to set up and run the COOU Campus Navigator locally on your development machine.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Victormarshall911/MyApp.git
    cd MyApp
    ```

2.  **Install Dependencies**:
    Install the necessary Node.js packages.
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**:
    This project uses an OpenRouteService API key for fetching routes. For security and best practices, it's recommended to store this in an `.env` file rather than directly in the code.
    *   Create a file named `.env` in the root of your project.
    *   Add your OpenRouteService API key to this file:
        ```
        OPEN_ROUTE_SERVICE_API_KEY="YOUR_OPEN_ROUTE_SERVICE_API_KEY"
        ```
    *   You will need to replace the hardcoded API key in `App.tsx` with `process.env.OPEN_ROUTE_SERVICE_API_KEY` or similar.

4.  **Run the Application**:
    Start the Expo development server. This will open a new tab in your browser with the Expo Developer Tools.
    ```bash
    expo start
    ```
    You can then:
    *   Scan the QR code with the Expo Go app on your phone (iOS or Android).
    *   Run on an Android emulator (`npm run android` or `yarn android`).
    *   Run on an iOS simulator (`npm run ios` or `yarn ios`).
    *   Run in a web browser (`npm run web` or `yarn web` - note: map features might be limited on web).

### Permissions

The application requires foreground and background location permissions to function correctly. You will be prompted to grant these permissions upon first use. For iOS, ensure `NSLocationWhenInUseUsageDescription` and `NSLocationAlwaysAndWhenInUseUsageDescription` are properly configured in `app.json` for background location tracking.

## Usage

Once the application is running:

1.  **Home Screen**: You'll first see a welcoming home screen with information about COOU. Tap "Open Campus Map" to proceed to the map view.

2.  **Explore the Map**:
    *   Your current location will be marked on the map (if permissions are granted).
    *   Browse various campus buildings marked with specific icons (e.g., faculty, clinic, hostel, library).
    *   Pinch to zoom and drag to pan across the campus. The map is designed to keep you within the university's bounds.

3.  **Search for Locations**:
    *   Use the search bar at the top of the screen to find specific buildings by name.
    *   As you type, filtered results will appear. Tap on a result to instantly navigate the map to that location and set it as your destination.

4.  **Set a Destination**:
    *   **Via Search**: Select a location from the search results.
    *   **Via Marker**: Tap on any building marker on the map.
    *   **Via Map Tap**: Tap anywhere on the map to set a custom destination point.

5.  **Get Directions**:
    *   Once a destination is set, a blue polyline will appear, showing the optimal route.
    *   A "Distance to [Destination]" box will display the distance in kilometers.
    *   A scrollable "Directions" box at the bottom will provide step-by-step navigation instructions.

6.  **Real-time Navigation**: As you move, your location marker will update, and the map will automatically re-center to keep you in view, ensuring you stay on track.

## Technologies Used

| Technology                                                              | Description                                                                  |
| :---------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| [**React Native**](https://reactnative.dev/)                            | Cross-platform framework for building native mobile apps using JavaScript.   |
| [**Expo**](https://expo.dev/)                                           | A framework and platform for universal React applications.                   |
| [**TypeScript**](https://www.typescriptlang.org/)                       | Strongly typed JavaScript that compiles to plain JavaScript.                 |
| [**React Native Maps**](https://github.com/react-native-maps/react-native-maps) | Customizable MapView component for React Native.                             |
| [**Expo Location**](https://docs.expo.dev/versions/latest/sdk/location/) | Provides access to the device's location services.                           |
| [**Expo TaskManager**](https://docs.expo.dev/versions/latest/sdk/task-manager/) | Allows the app to run background tasks, including location updates.          |
| [**React Native Paper**](https://callstack.github.io/react-native-paper/) | Material Design for React Native, providing pre-built UI components.         |
| [**Geolib**](https://www.npmjs.com/package/geolib)                      | Library for geospatial calculations like distance between coordinates.       |
| [**OpenRouteService API**](https://openrouteservice.org/)               | External service used for fetching accurate routing information and instructions. |

## Contributing

We welcome contributions to enhance the COOU Campus Navigator! To contribute:

1.  ✨ **Fork the repository** to your GitHub account.
2.  🌿 **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name`.
3.  💻 **Make your changes** and test them thoroughly.
4.  📝 **Commit your changes** with clear and descriptive commit messages.
5.  ⬆️ **Push your branch** to your forked repository.
6.  🤝 **Open a Pull Request** to the `main` branch of this repository, describing your changes in detail.

## Author Info

*   **Victor Marshall**: [LinkedIn](https://linkedin.com/in/Victormarshall911), [Twitter](https://twitter.com/Victormarshall911), [Portfolio](https://Victormarshall911.com)

---

[![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-1B1B1B?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![OpenRouteService](https://img.shields.io/badge/OpenRouteService-000000?style=for-the-badge&logo=mapbox&logoColor=white)](https://openrouteservice.org/)
[![Linting: ESLint](https://img.shields.io/badge/Linting-ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
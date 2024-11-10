Earthquake Visualizer 🌍
A React-based web application that visualizes global earthquake activity in real-time, providing insights into earthquake locations, magnitudes, and historical trends on an interactive map.

![image](https://github.com/user-attachments/assets/18d8f9b3-543f-4f0d-b552-122b49c4483d)


Features
Live Earthquake Data: Fetches up-to-date earthquake data from USGS every 5 minutes.
Magnitude Filtering: Adjustable slider to filter earthquakes by magnitude.
Interactive Map: Displays earthquakes on a map with markers sized by magnitude and color-coded for severity.
Detailed Stats: Shows total earthquakes in the last 24 hours and average magnitude.
Historical Data: Option to view significant earthquakes from the past month.
Responsive Charts: Visual representations of earthquake frequency by magnitude.
Tech Stack
Frontend: React, Tailwind CSS
Data Visualization: Recharts, React-Leaflet for map integration
Data Source: USGS Earthquake API
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/earthquake-visualizer.git
cd earthquake-visualizer
Install dependencies:

bash
Copy code
npm install
Start the development server:

bash
Copy code
npm start
The application will be available at http://localhost:3000.

Usage
Adjust the Magnitude Filter slider to control the range of earthquakes displayed.
Click on an earthquake marker on the map for more details about that event.
Access historical earthquake data to compare recent trends.
API
This application uses the USGS Earthquake API, which provides earthquake data in GeoJSON format.

Future Enhancements
Notification System: Real-time notifications for significant seismic events.
Additional Data Layers: Integration with weather and other natural phenomena data sources.
License
This project is licensed under the MIT License. See the LICENSE file for details.

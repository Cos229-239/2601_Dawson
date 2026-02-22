//import './style.css';
import mapboxgl from 'mapbox-gl';




document.addEventListener('DOMContentLoaded', () => {

    const landing = document.getElementById("landing");
    const mapScreen = document.getElementById("mapScreen");
    const devButton = document.getElementById("dev");

    devButton.addEventListener("click", () => {
        landing.style.display = "none";
        mapScreen.style.display = "block";

        initMap();
    });

    function initMap() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiZHBtdXJyYXkiLCJhIjoiY21sdTB0dXNoMDZkMDNmcHlkYWQ2aWdubSJ9.n-MqCNRGNt-KkvNMgO0NrA';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v11',
            center: [-81.30256, 28.593765],
            zoom: 16
        });

        async function loadGeoJSON(url) {
            const response = await fetch(url)
            return await response.json();
        }

        map.on('load', async () => {
            const linesData = await loadGeoJSON('/osm_data/lines.json');
            const pointsData = await loadGeoJSON('/osm_data/points.json');
            const polygonsData = await loadGeoJSON('/osm_data/polygons.json');

            map.addSource('polygons', {
                type: 'geojson',
                data: polygonsData
            });

            map.addSource('lines', {
                type: 'geojson',
                data: linesData
            });

            map.addSource('points', {
                type: 'geojson',
                data: pointsData
            });

            map.addLayer({
                id: 'polygons-layer',
                type: 'fill',
                source: 'polygons',
                paint: {
                    'fill-color': '#888888',
                    'fill-opacity': 0.6
                }
            });

            map.addLayer({
                id: 'lines-layer',
                type: 'line',
                source: 'lines',
                paint: {
                    'line-color': '#FF0000',
                    'line-width': 2
                }
            });

            map.addLayer({
                id: 'points-layer',
                type: 'circle',
                source: 'points',
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#0000FF'  
                }
            });

        });
    }
});

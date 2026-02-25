//import './style.css';
import mapboxgl from 'mapbox-gl';


let map;

document.addEventListener('DOMContentLoaded', () => {   // waits until HTML is fully loaded

    const landing = document.getElementById("landing");         // container for the landing screen
    const mapScreen = document.getElementById("mapScreen");     // container that holds the map
    const devButton = document.getElementById("dev");           // button that initializes the map
    const sidebar = document.getElementById('sidebar');         // container for the glossary
    const toggle = document.getElementById('glossaryToggle');   // button that toggles glossary

    devButton.addEventListener("click", () => { // when the "dev" button is clicked
        landing.style.display = "none";         // hides the landing screen
        mapScreen.style.display = "block";      // shows map screen

        initMap();  // finally, initializes the map
    });

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open')) {
            toggle.textContent = '▶'
        } else {
            toggle.textContent = '◀'
        }
    });

    // function for creating and configuring map
    function initMap() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiZHBtdXJyYXkiLCJhIjoiY21sdTB0dXNoMDZkMDNmcHlkYWQ2aWdubSJ9.n-MqCNRGNt-KkvNMgO0NrA'; // sets Mapbox access token
        if (map) {
            map.remove(); // if a map already exists, removes it
        }
        // create a new Mapbox GL map
        map = new mapboxgl.Map({ 
            container: 'map',   // ID of the HTML element where map will render
            style: {            // defines a custom style instead of using a Mapbox preset
                version: 8,
                glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
                sources: {},    // no default data sources
                layers: [
                    {
                        // creates special background layer
                        id: 'background',
                        type: 'background',
                        paint:{
                            'background-color': '#f2f2f2'
                        }
                    }
                ]
            }
        });

        // helper function for fetching and parsing a GeoJson file
        async function loadGeoJSON(url) {
            const response = await fetch(url)
            return await response.json();
        }

        // wait until map style has loaded
        map.on('load', async () => {

            console.log(map.getStyle());    // logs active style to console (for debugging)

            // load GeoJson files
            const linesData = await loadGeoJSON('/osm_data/lines.json');
            const polygonsData = await loadGeoJSON('/osm_data/polygons.json');

            // add a GeoJson source for buildings
            map.addSource('polygons', {
                type: 'geojson',
                data: polygonsData
            });

            // add a GeoJson source for roads and paths
            map.addSource('lines', {
                type: 'geojson',
                data: linesData
            });

            // add GeoJson layers for buildings & paths

            // layer for campus background
            map.addLayer({
                id: 'campus-background',
                type: 'fill',
                source: 'polygons',
                filter: ['==', ['get', 'name'], 'Full Sail University'],
                paint: {
                'fill-color': '#d9d9d9',
                'fill-opacity': 1
                }
            });

            // layer for campus buildings
            map.addLayer({
                id: 'campus-buildings',
                type: 'fill',
                source: 'polygons',
                filter: ['==', ['get', 'building'], 'university'],
                paint: {
                'fill-color': '#f47c20', // example orange
                'fill-opacity': .75
                }
            });

            // layer for other buildings
            map.addLayer({
                id: 'other-buildings',
                type: 'fill',
                source: 'polygons',
                filter: ['==', ['get', 'building'], 'yes'],
                paint: {
                    'fill-color': '#444444',
                    'fill-opacity': 0.1
                }
            });

            map.addLayer({
                id: 'building-labels',
                type: 'symbol',
                source: 'polygons',
                filter: ['has', 'name'],
                layout: {
                    'text-field': ['get', 'name'],
                    'text-size': 12,
                    'text-font': ['Open Sans Regular'],
                    'text-offset': [0, 0],
                    'text-anchor': 'center'
                },
                paint: {
                    'text-color': '#333333'
                }
            });

            

            // add a GeoJson layer for roads and paths           
            map.addLayer({
                id: 'road-casing',
                type: 'line',
                source: 'lines',
                filter: ['has', 'highway'],
                paint: {
                    'line-color': '#666666',
                    'line-width': [
                    'match',
                    ['get', 'highway'],
                    'primary', 10,
                    'primary_link', 8,
                    'tertiary', 6,
                    'tertiary_link', 5,
                    'unclassified', 4,
                    'residential', 3,
                    'service', 2,
                    'footway', 1,
                    1
                    ]
                }
            });

            map.addLayer({
                id: 'roads',
                type: 'line',
                source: 'lines',
                filter: ['has', 'highway'],
                paint: {
                    'line-color': '#888888',
                    'line-width': [
                    'match',
                    ['get', 'highway'],
                    'primary', 6,
                    'primary_link', 5,
                    'tertiary', 4,
                    'tertiary_link', 3,
                    'unclassified', 2,
                    'residential', 2,
                    'service', 1.5,
                    'footway', 0.8,
                    1
                    ]
                }
            });


            // defines bounds of the campus
            const mapBounds = [
                [-81.30754, 28.58991],
                [-81.29758, 28.59762]
            ];
            //adjusts view to fit within bounds
            map.fitBounds(mapBounds, { 
                padding: 0,
                duration: 0
            });

            map.setMaxBounds(mapBounds);    // prevents user from moving outside bounds
            map.setMinZoom(15.5);           // prevents user from zoomin too far out
            map.setMaxZoom(19);             // prevents user from zoomin too far in

        });
    }
});

//import './style.css';
import mapboxgl from 'mapbox-gl';


let map;

document.addEventListener('DOMContentLoaded', () => {   // waits until HTML is fully loaded

    let polygonsData;

    const landing = document.getElementById("landing");         // container for the landing screen
    const mapScreen = document.getElementById("mapScreen");     // container that holds the map
    const devButton = document.getElementById("dev");           // button that initializes the map
    const sidebar = document.getElementById('sidebar');         // container for the glossary
    const toggle = document.getElementById('glossaryToggle');   // button that toggles glossary

    devButton.addEventListener("click", () => { // when the "dev" button is clicked
        landing.style.display = "none";         // hides the landing screen
        mapScreen.style.display = "flex";      // shows map screen

        initMap();  // finally, initializes the map
        setTimeout(() => map.resize(), 100);
    });

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open')) {
            toggle.textContent = '▶'
        } else {
            toggle.textContent = '◀'
        }
    });

    const menuPanel = document.getElementById("glossaryMenu");
    const panels = document.querySelectorAll(".panel");
    const sectionButtons = document.querySelectorAll(".section-btn");
    const backButton = document.querySelectorAll(".back-btn");

    sectionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const section = button.dataset.section;
            panels.forEach(p => p.classList.remove("active"));
            document.getElementById(section).classList.add("active");
        });
    });

    backButton.forEach(button => {
        button.addEventListener("click", () => {
            panels.forEach(p => p.classList.remove("active"));
            menuPanel.classList.add("active");
        });
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
            polygonsData = await loadGeoJSON('/osm_data/polygons.json');

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

            // widgets
            const widgets = {
                "Building 1": { coords: [-81.3014, 28.5964]},
                "Building 2": { coords: [-81.3024, 28.5965]},
                "Building 3": { coords: [-81.3041, 28.5952]},
                "Building 4": { coords: [-81.3048, 28.5915]},

                "Building 110": { coords: [-81.30519, 28.59605]},
                "Building 120": { coords: [-81.30582, 28.59614]},
                "Building 130": { coords: [-81.306535, 28.59599]},

                "Full Sail Labs": { coords: [-81.30656, 28.59502]},
                "Full Sail Live 1": { coords: [-81.29809, 28.59658]},
                "Full Sail Live 2": { coords: [-81.29960, 28.59506]},
                "Full Sail Live 3": { coords: [-81.30560, 28.59669]},
            }

            Object.keys(widgets).forEach(name => {

                const el = document.createElement("div");
                el.className = "building-widget";
                el.innerText = name;

                el.addEventListener("click", () => {
                    map.flyTo({
                        center: widgets[name].coords,
                        zoom: 18,
                        essential: true
                    });
                });

                const marker = new mapboxgl.Marker({
                    element: el,
                    anchor: "center"
                })

                .setLngLat(widgets[name].coords)
                .addTo(map);

                widgets[name].marker = marker;
            });

            function scaleWidgets() {
                const zoom = map.getZoom();

                const normalized = (zoom - 15.5) / (19 - 15.5);

                const clamped = Math.max(0, Math.min(1, normalized));

                const minScale = 0.6;
                const maxScale = 1.4;

                const scale = minScale + (clamped * (maxScale - minScale));

                document.querySelectorAll(".building-widget").forEach(el => {
                    el.style.transform = `scale(${scale})`;
                });
            }

map.on("zoom", scaleWidgets);
scaleWidgets(); // initial

            const buildingButtons = document.querySelectorAll(".building-btn");
            buildingButtons.forEach(button => {
                button.addEventListener("click", () => {

                    if (!map) return;

                    const buildingName = button.textContent.trim();
                    const widget = widgets[buildingName];

                    if (!widget || !widget.coords) {
                        console.warn("Widget not found or coords missing:", buildingName);
                        return;
                    }

                    map.flyTo({
                        center: widget.coords,  
                        zoom: 17.8,
                        essential: true
                    });
                });
            });
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
    }
});

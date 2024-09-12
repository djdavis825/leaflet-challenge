// tile layers for map background
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// grayscale layer
var grayscale = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

// terrain
var terrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

// make basemaps object
let basemaps = {
    GrayScale: grayscale,
    Terrain: terrain,
    Default: defaultMap
};

// make map object
var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 5,
    layers: [defaultMap, grayscale, terrain]
});

// add default map to map
defaultMap.addTo(myMap);

// get data for tectonic plates and draw on map
// variable for tectonic plate later
let tectonicplates = new L.layerGroup();

// call api
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    
    // load data w geojson
    L.geoJson(plateData,{
        // styling
        color: "red",
        weight: 1
    }).addTo(tectonicplates);
});

// add tectonic plates to map
tectonicplates.addTo(myMap);

// variable earthquake layer
let earthquakes = new L.layerGroup();

// get data for earthquakes
// USGS API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
        // plot circles, radius dependent on magnitude, color dependant on depth
        function dataColor(depth){
            if (depth > 90)
                return "red";
            else if(depth > 70)
                return "#fc4903";
            else if(depth > 50)
                return "#fc8403";
            else if(depth > 30)
                return "#fcad03";
            else if(depth > 10)
                return "#cafc03";
            else
                return "green";
        }

        // function determine size of raduis
        function raduisSize(mag){
            if (mag == 0)
                return 1; // so a 0 mag quake shows up
            else
                return mag * 5;
        }

        // style for each data point
        function dataStyle(feature)
        {
            return {
                opacity: 0.5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: raduisSize(feature.properties.mag),
                weight: 0.5,
                stroke: true
            }
        }

        // add GeoJson data
        L.geoJson(earthquakeData, {
            // make each feature a marker
            pointToLayer: function(feature, latLng) {
                return L.circleMarker(latLng);
            },
            // set style for marker
            style: dataStyle,
            // add pop ups
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(earthquakes);
    }
);

//add earthquake layer
earthquakes.addTo(myMap);

// add overlay for tectonic plates and earthquakes
let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquake Data": earthquakes
};

// layer control
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

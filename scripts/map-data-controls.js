// ============================================================================
// Script used for index.html to set up map controls and control map data layers
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

mapboxgl.accessToken =
  'pk.eyJ1IjoiamlhaGFvMjkiLCJhIjoiY2xzdG02b3BxMDloMTJqcW1vbzU4YmRkNyJ9.M-CHOkWhRvbNRVqIg-W04g';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jiahao29/clstm27z5002r01pcaess7gk8',
  center: [-79.370729, 43.719518],
  zoom: 10,
  preserveDrawingBuffer: true,
});

// Define a new draw control object
const drawControl = new MapboxDraw({
  // do not allow displaying all default controls
  displayControlsDefault: false,
  // only allow drawing of lines and the ability to delete
  controls: {
    line_string: true,
    trash: true,
  },
});

// Define a new geocoder object
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  countries: 'ca', //Try searching for places inside and outside of canada to test the geocoder
});

// Add the geocoder to the sidebar
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

map.on('load', function () {
  // Add a scale control to the map
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

  // Add map export control to the map
  addExportControl(map);

  // Add the draw control to the map
  map.addControl(drawControl, 'bottom-right');

  // add all required vector maptile sources and layers (static data)
  // by default, only schools are visible
  addSchoolsSourceAndLayer((visible = true));
  addPedestrianNetworkSourceAndLayer((visible = false));
  addCyclingNetworkSourceAndLayer((visible = false));
  addSubwayStationsSourceAndLayer((visible = false));
  addTrafficCalmingSourceAndLayer((visible = false));
  addSpeedEnforcementSourceAndLayer((visible = false));
  addWatchYourSpeedProgramSourceAndLayer((visible = false));
  addParksSourceAndLayer((visible = false));

  // add dynamic data for bike share stations
  fetchCurrentBikeShareData().then((bikeShareData) => {
    addBikeShareStationsSourceAndLayer(bikeShareData, (visible = false));
  });
});

// ============================================================================
// Group of helper functions to add static vector tile sources and layers to the map
// Common parameters:
// visible: true or false (used to determine if the layer should be visible by default)
// ============================================================================

// Add sources and layers for schools
function addSchoolsSourceAndLayer(visible) {
  map.addSource('schools-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.64momvw0',
  });
  map.addLayer({
    id: 'schools',
    type: 'symbol',
    source: 'schools-data',
    'source-layer': 'Toronto_District_School_Board-2h6tqy',
    layout: {
      'icon-image': 'school',
      'icon-size': 1,
      visibility: visible ? 'visible' : 'none',
    },
    minzoom: 9,
    maxzoom: 22,
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('schools', visible);
}

// Add sources and layers for pedestrian network
function addPedestrianNetworkSourceAndLayer(visible) {
  map.addSource('pedestrian-network-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.7k33a9d3',
  });
  map.addLayer({
    id: 'pedestrian-network',
    type: 'line',
    source: 'pedestrian-network-data',
    'source-layer': 'Pedestrian_Network_Data_-_432-1c8l6m',
    paint: {
      'line-color': 'black',
      'line-width': 0.5,
      'line-opacity': 0.5,
    },
    minzoom: 9,
    maxzoom: 22,
    layout: {
      visibility: visible ? 'visible' : 'none',
    },
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('pedestrian-network', visible);
}

// Add sources and layers for cycling network
function addCyclingNetworkSourceAndLayer(visible) {
  map.addSource('cycling-network-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.27vlzyi9',
  });
  map.addLayer({
    id: 'cycling-network',
    type: 'line',
    source: 'cycling-network-data',
    'source-layer': 'cycling-network_-_4326-51bjie',
    paint: {
      'line-color': 'blue',
      'line-width': 1,
      'line-opacity': 0.5,
    },
    minzoom: 9,
    maxzoom: 22,
    layout: {
      visibility: visible ? 'visible' : 'none',
    },
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('cycling-network', visible);
}

// Add sources and layers for subway stations
function addSubwayStationsSourceAndLayer(visible) {
  map.addSource('subway-stations-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.88ilju10',
  });
  map.addLayer({
    id: 'subway-stations',
    type: 'symbol',
    source: 'subway-stations-data',
    'source-layer': 'SubwayStops-2um6iw',
    layout: {
      'icon-image': 'rail',
      'icon-size': 1,
      visibility: visible ? 'visible' : 'none',
    },
    minzoom: 9,
    maxzoom: 22,
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('subway-stations', visible);
}

// Add sources and layers for traffic calming measures locations
function addTrafficCalmingSourceAndLayer(visible) {
  map.addSource('traffic-calming-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.7yuzvjzz',
  });
  map.addLayer({
    id: 'traffic-calming',
    type: 'symbol',
    source: 'traffic-calming-data',
    'source-layer': 'Traffic_Calming_Database-2trxy2',
    minzoom: 9,
    maxzoom: 22,
    layout: {
      'icon-image': 'border-dot-13',
      'icon-size': 1,
      visibility: visible ? 'visible' : 'none',
    },
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('traffic-calming', visible);
}

// Add sources and layers for automated speed enforcement locations
function addSpeedEnforcementSourceAndLayer(visible) {
  map.addSource('speed-enforcement-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.alzntmwb',
  });
  map.addLayer({
    id: 'speed-enforcement',
    type: 'symbol',
    source: 'speed-enforcement-data',
    'source-layer': 'Automated_Speed_Enforcement_L-67qstq',
    minzoom: 9,
    maxzoom: 22,
    layout: {
      'icon-image': 'police',
      'icon-size': 1,
      visibility: visible ? 'visible' : 'none',
    },
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('speed-enforcement', visible);
}

// Add sources and layers for Watch Your Speed program locations
function addWatchYourSpeedProgramSourceAndLayer(visible) {
  map.addSource('watch-your-speed-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.9yvzrd8v',
  });
  map.addLayer({
    id: 'watch-your-speed-program',
    type: 'symbol',
    source: 'watch-your-speed-data',
    'source-layer': 'Watch_Your_Speed_Program_Sign-2bje7e',
    minzoom: 9,
    maxzoom: 22,
    layout: {
      'icon-image': 'viewpoint',
      'icon-size': 1,
      visibility: visible ? 'visible' : 'none',
    },
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('watch-your-speed-program', visible);
}

// Add sources and layers for parks
function addParksSourceAndLayer(visible) {
  map.addSource('parks-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.7qolisqv',
  });
  map.addLayer({
    id: 'parks',
    type: 'symbol',
    source: 'parks-data',
    'source-layer': 'Parks_and_Recreation_Faciliti-6txiw4',
    minzoom: 9,
    maxzoom: 22,
    layout: {
      'icon-image': 'park',
      'icon-size': 1,
      visibility: visible ? 'visible' : 'none',
    },
  });
  // show or hide layer in legend based on visible argument
  toggleLayerLegend('parks', visible);
}

// ============================================================================
// Functions to add dynamic sources and layers to the map that require
// fetching data from an API
// ============================================================================

// Function to fetch the up-to-date current bike share station data and status
// returns a promise that resolves to an array of bike share station data
function fetchCurrentBikeShareData() {
  var bikeShareData = []; // array to store bike share station data

  // get the bike share station data first
  return fetch(
    'https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information',
  )
    .then((response) => response.json())
    .then((data) => {
      bikeShareData = data.data.stations;
    })
    .then(() => {
      // get the up-to-date availability and status data
      fetch('https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status')
        .then((response) => response.json())
        .then((data) => {
          // for each station, find the corresponding bike share location
          // in the bikeShareData array and add up-to-date availability data
          data.data.stations.forEach((location) => {
            bikeShareLocation = bikeShareData.find(
              (loc) => loc.station_id === location.station_id,
            );
            // if the bike share location is found in the bikeShareData array,
            // add the number of available bikes and docks, as well as
            // the charging station status to it
            if (bikeShareLocation) {
              bikeShareLocation.num_bikes_available =
                location.num_bikes_available;
              bikeShareLocation.num_docks_available =
                location.num_docks_available;
              bikeShareLocation.is_charging_station =
                location.is_charging_station;
            }
          });
        });
    })
    .then(() => {
      return bikeShareData;
    });
}

// Function to add the bike share stations source and layer to the map
// bikeShareData: an array of bike share station data
// visible: true or false (used to determine if the layer should be visible by default)
function addBikeShareStationsSourceAndLayer(bikeShareData, visible) {
  // convert the bike share data to a GeoJSON feature collection
  const geojson = bikeShareData.map((station) => {
    // map this function to each station in the bike share data array
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [station.lon, station.lat],
      },
      properties: {
        name: station.name,
        num_bikes_available: station.num_bikes_available,
        num_docks_available: station.num_docks_available,
        is_charging_station: station.is_charging_station,
      },
    };
  });


  // then add the GeoJSON feature collection as a source and layer to the map
  map.addSource('bike-share-data', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: geojson,
    },
  });
  map.addLayer({
    id: 'bike-share-stations',
    type: 'symbol',
    source: 'bike-share-data',
    layout: {
      'icon-image': 'bicycle-share',
      'icon-size': 1,
      visibility: visible ? 'visible' : 'none',
    },
  });

  // show or hide layer in legend based on visible argument
  toggleLayerLegend('bike-share-stations', visible);
}

// ============================================================================
// Functions to toggle the visibility of static and dynamic layers
// ============================================================================

// Function to toggle the visibility of a static layer
// layer: the layer id
// visible: true or false
function toggleStaticLayerVisibility(layer, visible) {
  if (visible) {
    map.setLayoutProperty(layer, 'visibility', 'visible');
  } else {
    map.setLayoutProperty(layer, 'visibility', 'none');
  }
  // show or hide the layer in the legend
  toggleLayerLegend(layer, visible);
}

// Function to toggle the visibility of the dynamic bike share stations layer
// visible: true or false
function toggleDynamicBikeShareLayerVisibility(visible) {
  if (visible) {
    // need to fetch the current bike share data first then add the layer
    fetchCurrentBikeShareData().then((bikeShareData) => {
      addBikeShareStationsSourceAndLayer(bikeShareData, (visible = true));
    });
  } else {
    // simply remove the layer if it exists
    if (map.getSource('bike-share-data')) {
      map.removeSource('bike-share-data')
    }
    if (map.getLayer('bike-share-stations')) {
      map.removeLayer('bike-share-stations');
    }
  }
  // show or hide the layer in the legend
  toggleLayerLegend('bike-share-stations', visible);
}

// ============================================================================
// Functions to add a custom map export control
// ============================================================================

// Function to add custom map export control to the map
// map: the Mapbox map object
function addExportControl(map) {
  // define a custom ExportControl class per
  // documentation in https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol
  class ExportControl {
    onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      this._container.innerHTML = `<button>
                                     <i class="fa-solid fa-print"></i>
                                   </button>`;
      this._container.addEventListener('click', () => exportMapImage());
      return this._container;
    }

    onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
    }
  }
  // add the custom export control to the map
  map.addControl(new ExportControl(), 'bottom-right');
}

// Function for the map export functionality
function exportMapImage() {
  // get the map canvas
  const canvas = map.getCanvas();

  // create a new image element and set its source to the map canvas
  const img = new Image();
  img.src = canvas.toDataURL('image/png');

  // download the image by creating a new <a> element
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'map-export.png';
  link.click();

  // remove the image and link elements after the download
  img.remove();
  link.remove();
}

// ============================================================================
// Functions to add interactivity and analysis features.
// These functions are defined in map-interactivity-analysis.js to avoid
// cluttering this script.
// ============================================================================

// add event listener to close sidebar
addSidebarCloseEvent(map);
// add event listener to open sidebar
addSidebarOpenEvent(map);
// add event listener to close school focus mode
closeSchoolFocusModeEvent(map);
// add hover event listener to change cursor when hovering over features
changeCursorToPointerOnHover(map);
// add zoom to school event on double click
addZoomInToSchoolEventOnDblClick(map);
// add event listener to drawn routes to add pop up
addPopUpToDrawnRoutesEvent(map, drawControl);
// add event listener geocoder when it returns a result
addGeocoderResultEvent(map, geocoder);
// add event listener to sidebar item to toggle on and off layer
addSidebarToggleLayerEvent()
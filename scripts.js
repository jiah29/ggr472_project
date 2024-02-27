// ============================================================================
// Script used for both index.html and suggestions.html
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
});

map.on('load', function () {
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
    addBikeShareStationsSourceAndLayer(bikeShareData, (visible = true));
  });
});

// ============================================================================
// Group of helper functions to add vector tile sources and layers to the map
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
}

// Add sources and layers for Watch Your Speed program locations
function addWatchYourSpeedProgramSourceAndLayer(visible) {
  map.addSource('watch-your-speed-data', {
    type: 'vector',
    url: 'mapbox://jiahao29.9yvzrd8v',
  });
  map.addLayer({
    id: 'watch-your-speed',
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
}

// ============================================================================
// Miscellaneous helper functions
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
    if (map.getLayer('bike-share-stations')) {
      map.removeLayer('bike-share-stations');
    }
  }
}

// Function to fetch the current bike share station data and status
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
}

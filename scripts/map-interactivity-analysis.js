// ============================================================================
// Script used for index.html to set up map interactivty and analysis features
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

// ============================================================================
// Global Constants & Variables
// ============================================================================
CYCLING_SPEED = 250; // meter/minute
WALKING_SPEED = 80; // meter/minute
// list of data layers on map
LAYERS = {
  Schools: 'schools',
  Parks: 'parks',
  SpeedEnforcement: 'speed-enforcement',
  SubwayStations: 'subway-stations',
  TrafficCalming: 'traffic-calming',
  WatchYourSpeedProgram: 'watch-your-speed-program',
  BikeShareStations: 'bike-share-stations',
  CyclingNetwork: 'cycling-network',
  PedestrianNetwork: 'pedestrian-network',
};

// variable to store the school in focus (used in determining whether a school is in focus)
var schoolInFocus = null;
// flag to track if user draw mode has changed
var drawModeChanges = false;
// NOTE: We are allowing only 1 route pop up at a time to simplify the code
// variable to store the current user-drawn route pop up showing
var currentRoutePopup = null;
// Data source for school buffers - added dynamically via user events
var bufferDataSource = {
  type: 'FeatureCollection',
  features: [],
};
// variable to differentiate between single and double click (used for school layers
// which supports double click and single click events)
var isDblClick = false;

// ============================================================================
// HTML Elements Events Interactivity
// ============================================================================

// Function to add click event listener to close sidebar
// map: map object to resize after window size changes when sidebar is closed
function addSidebarCloseEvent(map) {
  document
    .getElementById('close-sidebar-button')
    .addEventListener('click', function () {
      // hide the sidebar
      document.getElementById('sidebar').style.display = 'none';
      // set map to take up full width using Bootstrap class
      document.getElementById('map-content').className = 'col-12';

      // trigger map resize to fit new width
      map.resize();
      // display the open sidebar toggle button
      document.getElementById('open-sidebar-button').style.display = 'block';
    });
}

// Function to add click event listener to open sidebar
// map: map object to resize after window size changes when sidebar is opened
function addSidebarOpenEvent(map) {
  document
    .getElementById('open-sidebar-button')
    .addEventListener('click', function () {
      // display the sidebar
      document.getElementById('sidebar').style.display = 'block';
      // reset map to original sizing based on original Bootstrap classes
      document.getElementById('map-content').className = 'col-7 col-md-9';
      // trigger map resize to fit new width
      map.resize();
      // hide the open sidebar toggle button
      document.getElementById('open-sidebar-button').style.display = 'none';
    });
}

// Function to add click event listener to close school focus mode through
// the close button in the school focus indicator on map
// map: map object to reset view after closing school focus mode
function closeSchoolFocusModeEvent(map) {
  document
    .getElementById('focus-close-button')
    .addEventListener('click', function () {
      // reset the school in focus to null
      schoolInFocus = null;
      toggleSchoolFocusModeIndicator(map);
      // fly back to the original view
      map.flyTo({
        center: [-79.370729, 43.719518],
        zoom: 10,
      });
      // remove all school buffers from the map if any exists
      if (bufferDataSource.features.length > 0) {
        removeAllSchoolBuffers(map);
      }
    });
}

// Helper function to add click event listener to sidebar item (eye icons)
// that toggles on and off map layers
function addSidebarItemToggleLayerEvent(map) {
  Object.values(LAYERS).forEach((layer) => {
    // find the sidebar item corresponding to the layer
    const sidebarItem = document.getElementById(layer + '-toggle');
    // get the open and close eye icons from the sidebar item
    const divItems = Array.from(sidebarItem.children);
    const openIcon = divItems[1];
    const closeIcon = divItems[2];

    // add event listeners to the open eye icon
    openIcon.addEventListener('click', (e) => {
      // when open eye icon is clicked, hide it and show the close eye icon
      openIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      // toggle on the visibility of the layer on the map
      if (layer === LAYERS.BikeShareStations) {
        toggleDynamicBikeShareLayerVisibility(map, false);
      } else {
        toggleStaticLayerVisibility(map, layer, false);
      }
    });

    // add event listeners to the close eye icon
    closeIcon.addEventListener('click', (e) => {
      // when close eye icon is clicked, hide it and show the open eye icon
      closeIcon.classList.add('hidden');
      openIcon.classList.remove('hidden');
      // toggle off the visibility of the layer on the map
      if (layer === LAYERS.BikeShareStations) {
        toggleDynamicBikeShareLayerVisibility(map, true);
      } else {
        toggleStaticLayerVisibility(map, layer, true);
      }
    });
  });
}

// ============================================================================
// User Drawn Routes Feature Interactivity & Analysis
// ============================================================================

// Function to add event listener to add pop up to drawn routes when they
// are selected
// map: mapbox map object to add event listeners to
// drawControl: Mapbox Draw control object to get the current mode from
function addPopUpToDrawnRoutesEvent(map, drawControl) {
  map.on('draw.selectionchange', function (e) {
    if (drawModeChanges) {
      // do not trigger the pop up if the draw mode has just changed
      // users likely do not click on purpose, so make sure everything is closed
      drawModeChanges = false;
      closeRoutePopUp();
    } else {
      // if it is really a selection change not caused by draw mode changes,
      // and the selection is not empty, show the pop up
      // also check for direct_select, which is used for editing
      // the drawn routes, so do not show pop up then
      if (e.features.length > 0 && drawControl.getMode() !== 'direct_select') {
        if (currentRoutePopup) {
          // remove the current route pop up if it exists
          currentRoutePopup.remove();
        }
        addRoutePopUp(e.features[0], map);
      }
    }
  });

  map.on('draw.modechange', function (e) {
    // when draw mode changes, set the flag to true
    drawModeChanges = true;
  });
}

// ============================================================================
// Map Layer & Features Events Interactivity & Analysis
// ============================================================================

// Change the cursor to a pointer when the mouse is over all layer
// map: mapbox map object to add event listener to
function changeCursorToPointerOnHoverEvent(map) {
  // change the cursor to pointer for all layers
  Object.values(LAYERS).forEach((layer) => {
    map.on('mouseenter', layer, function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layer, function () {
      map.getCanvas().style.cursor = '';
    });
  });
}

// Function when geocoder is done searching for a school
// map: mapbox map object where the geocoder is used
// geocoder: Geocoder object to add event listener to
function addGeocoderResultEvent(map, geocoder) {
  geocoder.on('result', function (e) {
    // check if the school layer in view has school name = the search text
    schoolGeocoded = e.result.text;
    result = map.queryRenderedFeatures({
      filter: ['==', ['get', 'SCH_NAM3'], schoolGeocoded],
    });

    if (result.length > 0) {
      // result found, set the school in focus to the geocoded school and toggle school focus mode
      schoolInFocus = schoolGeocoded;
      toggleSchoolFocusModeIndicator(map);
      // add the school buffer feature to the map
      addSchoolBufferFeature(map, result[0]);
      // fly to the school using coordinates in data source instead of the geocoder result
      map.flyTo({
        center: result[0].geometry.coordinates,
        zoom: 14,
      });
    } else {
      // if the school is not found, show the school focus mode indicator with failure message
      toggleSchoolFocusModeIndicator(map, (geocodeResultFailure = true));
      // make sure to stay in the same view
      map.flyTo({
        center: map.getCenter(),
        zoom: map.getZoom(),
      });
    }

    // hide the geocoder marker icon
    document.getElementsByClassName('mapboxgl-marker')[0].style.display =
      'none';
  });
}

// Function to add event listener to show zoom in to school
// when it is double clicked
// map: mapbox map object to add event listener to
function addZoomInToSchoolEventOnDblClick(map) {
  map.on('dblclick', LAYERS.Schools, function (e) {
    // set isDblClick to true to prevent triggering single click event
    isDblClick = true;
    // get the coordinates of the school
    var coordinates = e.features[0].geometry.coordinates;
    // zoom in to the school
    // putting this in a settimeout as a work around without disabling
    // the default map double click zoom in behaviour
    setTimeout(() => {
      map.flyTo({
        center: coordinates,
        zoom: 14,
      });
    }, 10);
    schoolInFocus = e.features[0].properties.SCH_NAM3;
    toggleSchoolFocusModeIndicator(map);
    addSchoolBufferFeature(map, e.features[0]);
  });
}

// Function to add popup window with info when single click on a school
function addSchoolPopupEvent(map) {
  map.on('click', 'schools', (e) => {
    isDblClick = false; // reset the double click flag

    // store feature and click location to access it in the setTimeout
    // since the event object will be lost after 500ms
    const feature = e.features[0];
    const location = e.lngLat;

    // set a timeout to check if it is a double click
    setTimeout(() => {
      if (!isDblClick) {
        // if it is not a double click, show the popup
        new mapboxgl.Popup()
          .setLngLat(location)
          .setHTML(
            '<b>School:</b> ' +
              feature.properties.SCH_NAM3 +
              '<br><b>Address:</b> ' +
              feature.properties.ADDRESS4 +
              '<br><b>District:</b> ' +
              feature.properties.MUNICIP12,
          )
          .addTo(map);
      }
    }, 500);
  });
}

// Function to add popup window with info when single click on a park
function addParkPopupEvent(map) {
  map.on('click', 'parks', (e) => {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        '<b>Park:</b> ' +
          e.features[0].properties.ASSET_N4 +
          '<br><b>Address:</b> ' +
          e.features[0].properties.ADDRESS7,
      )
      .addTo(map);
  });
}

// Function to add popup window with info when single click on a subway station
function addSubwayPopupEvent(map) {
  map.on('click', 'subway-stations', (e) => {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML('<b>Subway Station:</b> ' + e.features[0].properties.Station_Na)
      .addTo(map);
  });
}

// Function to add popup window with info when single click on a bike share station
function addBikeSharePopupEvent(map) {
  map.on('click', 'bike-share-stations', (e) => {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML('<b>Bike Share Station:</b> ' + e.features[0].properties.name)
      .addTo(map);
  });
}

// Function to add event listener to buffer toggle switches
// map: mapbox map object to add event listener to
function addSchoolBufferToggleEvent(map) {
  document
    .getElementById('walking-buffer-toggle')
    .addEventListener('change', () => {
      updateSchoolBufferVisibility(map);
    });
  document
    .getElementById('cycling-buffer-toggle')
    .addEventListener('change', () => {
      updateSchoolBufferVisibility(map);
    });
}

// ============================================================================
// Helper Functions to support interactivity and analysis
// ============================================================================

// Helper function to add pop up to drawn routes
// routeFeature: GeoJSON Feature object representing the drawn route
// map: mapbox map object to add the pop up to
function addRoutePopUp(routeFeature, map) {
  // calculate length of drawn route in meters using turf
  length = turf.length(routeFeature, { units: 'meters' });

  // calculate estimated walking and cycling time in meter/minute
  estWalkingTime = length / WALKING_SPEED;
  estCyclingTime = length / CYCLING_SPEED;

  // create a new popup object and add it to the map
  currentRoutePopup = new mapboxgl.Popup({
    closeOnClick: false,
  })
    // put the pop up in the middle-most point of the route
    .setLngLat(
      routeFeature.geometry.coordinates[
        Math.floor(routeFeature.geometry.coordinates.length / 2)
      ],
    )
    // set the pop up content to show the length and estimated travel time
    .setHTML(
      '<p>Route Distance: ' +
        length.toFixed(2) +
        'm</p> \
      <p>Estimated Walking Time: ' +
        estWalkingTime.toFixed(2) +
        'mins</p> \
      <p>Estimated Cycling Time: ' +
        estCyclingTime.toFixed(2) +
        'mins</p>',
    )
    .addTo(map);

  // add event listener to toggle pop up shown states when pop up is closed
  currentRoutePopup.on('close', function () {
    currentRoutePopup = null;
  });
}

// Helper function to close the current route pop up
function closeRoutePopUp() {
  // remove the current route pop up if it exists
  if (currentRoutePopup) {
    currentRoutePopup.remove();
  }
}

// Helper function to toggle the visibility of a static layer on map
// layer: the layer id
// visible: true or false
function toggleStaticLayerVisibility(map, layer, visible) {
  if (visible) {
    map.setLayoutProperty(layer, 'visibility', 'visible');
  } else {
    map.setLayoutProperty(layer, 'visibility', 'none');
  }

  // show or hide the layer in the legend using
  // helper function implemented  in legend-control.js
  toggleLayerLegend(layer, visible);
}

// Helper function to toggle the visibility of the dynamic bike share stations layer on map
// visible: true or false
function toggleDynamicBikeShareLayerVisibility(map, visible) {
  if (visible) {
    // need to fetch the current bike share data first and create
    // new GeoJSON features based on new data
    fetchCurrentBikeShareData().then((bikeShareData) => {
      geojsonFeaturesList = bikeShareData.map((station) => {
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
      // create a new GeoJSON feature collection
      geojsonFeaturesCollection = {
        type: 'FeatureCollection',
        features: geojsonFeaturesList,
      };
      // set the new data to the source
      map.getSource('bike-share-data').setData(geojsonFeaturesCollection);

      map.setLayoutProperty('bike-share-stations', 'visibility', 'visible');
    });
  } else {
    map.setLayoutProperty('bike-share-stations', 'visibility', 'none');
  }

  // show or hide the layer in the legend using
  // helper function implemented  in legend-control.js
  toggleLayerLegend('bike-share-stations', visible);
}

// Helper function to toggle the school focus mode indicator and view.
// map: mapbox map object
// geocodeResultFailure: whether to show the geocoder failure message (default is false)
function toggleSchoolFocusModeIndicator(map, geocodeResultFailure = false) {
  // show geocoder failure message in indicator
  if (geocodeResultFailure) {
    document.getElementById('school-focus-indicator-container').style.display =
      'block';
    document.getElementById('school-in-focus').innerHTML =
      'No result found. Search text may not exist in the TDSB schools data source. \
      <br> \
      Please manually search for the school on the map.';

    // hide the close indicator button - this will be closed automatically
    document.getElementById('focus-close-button').style.display = 'none';

    // close indicator after 5 seconds
    setTimeout(() => {
      document.getElementById(
        'school-focus-indicator-container',
      ).style.display = 'none';
      // also turn the close indicator button back on since that is the default state
      document.getElementById('focus-close-button').style.display = 'inline';
    }, 10000);
  } else {
    // not showing failure message, so check if there is a school in focus
    if (schoolInFocus) {
      // there is a school in focus, display the school focus indicator with the school name
      document.getElementById(
        'school-focus-indicator-container',
      ).style.display = 'block';
      document.getElementById('school-in-focus').innerHTML =
        'School in Focus: ' + schoolInFocus;

      // show the school buffers controls
      document.getElementById('school-buffer-controls').style.display = 'block';

      // hide all other schools through filter
      map.setFilter(LAYERS.Schools, ['==', 'SCH_NAM3', schoolInFocus]);
    } else {
      // otherwise, hide the school focus indicator
      document.getElementById(
        'school-focus-indicator-container',
      ).style.display = 'none';

      // also hide the school buffers controls
      document.getElementById('school-buffer-controls').style.display = 'none';

      // show all schools again by removing the filter
      map.setFilter(LAYERS.Schools, null);
    }
  }
}

// Function to add feature to the school buffers source
// when a school is focused on
// map: mapbox map object
// schoolFeature: feature object representing the school
function addSchoolBufferFeature(map, schoolFeature) {
  // create a new buffer feature for walking and cycling
  cycleBufferSize = CYCLING_SPEED * 5; // 5 minutes cycling buffer
  cycleBuffer = turf.buffer(schoolFeature.geometry, cycleBufferSize, {
    units: 'meters',
  });
  cycleBuffer.properties.TYPE = 'CYCLING-BUFFER';
  walkBufferSize = WALKING_SPEED * 5; // 5 minutes walking buffer
  walkBuffer = turf.buffer(schoolFeature.geometry, walkBufferSize, {
    units: 'meters',
  });
  walkBuffer.properties.TYPE = 'WALKING-BUFFER';

  // add the buffers to the school buffers features data source
  bufferDataSource.features.push(walkBuffer);
  bufferDataSource.features.push(cycleBuffer);

  // set the new source data to be the updated buffer data source
  map.getSource('school-buffers').setData(bufferDataSource);
}

// Function to remove all school buffers from the map
// map: mapbox map object
function removeAllSchoolBuffers(map) {
  // empty the buffer data source
  bufferDataSource.features = [];
  // update the source
  map.getSource('school-buffers').setData(bufferDataSource);
}

// Function to ypdate school buffers visibility on map
// map: mapbox map object
// bufferType: 'WALKING-BUFFER' or 'CYCLING-BUFFER'
// visible: true or false
function updateSchoolBufferVisibility(map) {
  // check and see which buffer will be on
  var visible = [];
  if (document.getElementById('walking-buffer-toggle').checked) {
    visible.push('WALKING-BUFFER');
  }
  if (document.getElementById('cycling-buffer-toggle').checked) {
    visible.push('CYCLING-BUFFER');
  }
  // set the filter to show the buffers that are checked
  map.setFilter('school-buffers-layer', ['in', 'TYPE', ...visible]);
}

// ============================================================================
// Script used for index.html to set up map interactivty and analysis features
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

// ============================================================================
// Global Constants
// ============================================================================
CYCLING_SPEED = 250; // meter/minute
WALKING_SPEED = 80; // meter/minute
// list of data layers on map
const LAYERS = {
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

// ============================================================================
// HTML Elements Interactivity
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
      toggleSchoolFocusMode();
      // fly back to the original view
      map.flyTo({
        center: [-79.370729, 43.719518],
        zoom: 10,
      });
    });
}

// ============================================================================
// User Drawn Routes Feature Interactivity & Analysis
// ============================================================================

var drawModeChanges = false; // flag to track if draw mode has changed
// We are allowing only 1 route pop up at a time to simplify the code
var currentRoutePopup = null; // variable to store the current route pop up

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

// ============================================================================
// Map Layer & Features Interactivity & Analysis
// ============================================================================

// Change the cursor to a pointer when the mouse is over all layer
// map: mapbox map object to add event listener to
function changeCursorToPointerOnHover(map) {
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

var schoolInFocus = null; // variable to store the school in focus

// Function to add event listener to show zoom in to school
// when it is double clicked
// map: mapbox map object to add event listener to
function addZoomInToSchoolEventOnDblClick(map) {
  map.on('dblclick', LAYERS.Schools, function (e) {
    // get the coordinates of the school
    var coordinates = e.features[0].geometry.coordinates;
    // zoom in to the school
    // putting this in a settimeout as a work around without disabling
    // the default map double click zoom in behaviour
    setTimeout(() => {
      map.flyTo({
        center: coordinates,
        zoom: 15,
      });
    }, 10);
    schoolInFocus = e.features[0].properties.SCH_NAM3;
    toggleSchoolFocusMode();
  });
}

// Helper function to toggle the school focus mode indicator
// based on the schoolInFocus variable
function toggleSchoolFocusMode() {
  if (schoolInFocus) {
    // if there is a school in focus, display the school focus indicator
    // with the school name
    document.getElementById('school-focus-indicator-container').style.display =
      'block';
    document.getElementById('school-in-focus').innerHTML =
      'School in Focus: ' + schoolInFocus;
  } else {
    // otherwise, hide the school focus indicator
    document.getElementById('school-focus-indicator-container').style.display =
      'none';
  }
}

// ============================================================================
// Script used for index.html to set up map interactivty and analysis features
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

// ============================================================================
// Global Variables
// ============================================================================
CYCLING_SPEED = 250; // meter/minute
WALKING_SPEED = 80; // meter/minute

// ============================================================================
// HTML Elements Interactivity
// ============================================================================

// Function to add click event listener to close sidebar
// map: mapboxgl.Map object to resize
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
// map: mapboxgl.Map object to resize
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

// ============================================================================
// Drawn Routes Interactivity & Analysis
// ============================================================================

var drawModeChanges = false; // flag to track if draw mode has changed
// We are allowing only 1 route pop up at a time to simplify the code
var popUpShown = false; // flag to track if pop up is shown
var currentRoutePopup = null; // variable to store the current route pop up

// Function to add event listener to add pop up to drawn routes when they
// are selected
// map: mapbox map object to add event listeners to
// drawControl: Mapbox Draw control object to get the current mode from
function addPopUpToDrawnRoutes(map, drawControl) {
  map.on('draw.selectionchange', function (e) {
    if (drawModeChanges) {
      // do not trigger the pop up if the draw mode has just changed
      // users likely do not click on purpose, so make sure everything is closed
      drawModeChanges = false;
      popUpShown = false;
      closeRoutePopUp();
    } else {
      // if it is really a selection change not caused by draw mode changes,
      // and the selection is not empty, show the pop up
      // also check for direct_select, which is used for editing
      // the drawn routes, so do not show pop up then
      if (e.features.length > 0 && drawControl.getMode() !== 'direct_select') {
        addRoutePopUp(e.features[0], map);
        popUpShown = true;
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
    popUpShown = false;
  });
}

// Helper function to close the current route pop up
function closeRoutePopUp() {
  // remove the current route pop up if it exists
  if (currentRoutePopup) {
    currentRoutePopup.remove();
  }
}

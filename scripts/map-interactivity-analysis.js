// ============================================================================
// Script used for index.html to set up map interactivty and analysis features
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

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

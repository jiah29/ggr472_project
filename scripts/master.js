// ============================================================================
// Master script used to set up web page functionalities as well as setting up
// the map with the required map controls. It is also responsible for calling
// relevant functions in other scripts to add map data sources/layers and set up
// all interactivity and analysis features.
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

// ============================================================================
// Set up the main map object and add required controls.
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

// Define a new draw control object globally to allow access to it in other functions
const drawControl = new MapboxDraw({
  // do not allow displaying all default controls
  displayControlsDefault: false,
  // only allow drawing of lines and the ability to delete
  controls: {
    line_string: true,
    trash: true,
  },
});

// Define a new geocoder object globally to allow access to it in other functions
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  countries: 'ca',
});

// Add the geocoder to the sidebar HTML element
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// When the map loads, add the required controls and data sources and layers
map.on('load', function () {
  // Add a scale control to the map
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

  // Add map export control to the map
  addExportControl(map);

  // Add the draw control to the map
  map.addControl(drawControl, 'bottom-right');

  // disable double click zoom
  map.doubleClickZoom.disable();

  // ============================================================================
  // Functions to add relevant map data sources and layers to the map. These
  // functions are defined in map-data.js.
  // ============================================================================

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

  // add schools buffer source and layer
  // set to true by default - buffer always showing if there is one
  addBuffersSourceAndLayer((visible = true));
});

// ============================================================================
// Helper functions to define and implement custom map controls.
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
// These functions are defined in map-interactivity-analysis.js.
// ============================================================================

// add event listener to close sidebar
addSidebarCloseEvent(map);
// add event listener to open sidebar
addSidebarOpenEvent(map);
// add event listener to close school focus mode
closeSchoolFocusModeEvent(map);
// add hover event listener to change cursor when hovering over features
changeCursorToPointerOnHoverEvent(map);
// add zoom to school event on double click
addZoomInToSchoolEventOnDblClick(map);
// add event listener to drawn routes to add pop up
addPopUpToDrawnRoutesEvent(map, drawControl);
// add event listener geocoder when it returns a result
addGeocoderResultEvent(map, geocoder);
// add popup on click for school
addSchoolPopupEvent(map);
// add popup on click for parks
addParkPopupEvent(map);
// add popup on click for subway stations
addSubwayPopupEvent(map);
// add popup on click bike share stations
addBikeSharePopupEvent(map);
// add event listener to sidebar item to toggle on and off layer
addSidebarItemToggleLayerEvent(map);
// add event listener to toggle school buffer layer
addSchoolBufferToggleEvent(map);
// add event listener to highlight feature on double click
addHighlightFeatureOnDblClickEvent(map);
// add hover event listener to non-school layers when a school is in focus
addHoverPopUpEvents(map);
// add event listener to buffer distance sliders
addBufferDistanceSlidersEvent(map);
// add event listener to open welcome modal on page load
openWelcomeModalOnPageLoad();

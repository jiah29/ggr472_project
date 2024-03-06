var mode_changes = false;
var popUpShown = false;

map.on('draw.selectionchange', function (e) {
  if (mode_changes) {
    // do not trigger the pop up if the mode has just changed
    mode_changes = false;
    popUpShown = false;
    console.log(popUpShown);
    console.log('Pop up closes!');
  } else {
    if (e.features.length > 0 && drawControl.getMode() !== 'direct_select') {
      popUpShown = true;
      console.log(popUpShown);
      console.log('Pop up opens!');
    }
  }
});

map.on('draw.modechange', function (e) {
  mode_changes = true;
});

dataSource = {
  type: 'FeatureCollection',
  features: [],
};

// empty data for school buffers
map.addSource('school-buffers', {
  type: 'geojson',
  data: dataSource,
});

map.addLayer({
  id: 'school-buffers',
  type: 'fill',
  source: 'school-buffers',
  paint: {
    'fill-color': '#088',
    'fill-opacity': 0.5,
  },
});

map.on('click', 'schools', (e) => {
  clickedSchool = e.features[0];
  buffer = turf.buffer(clickedSchool.geometry, 0.5, { units: 'kilometers' });
  dataSource.features.push(buffer);
  map.getSource('school-buffers').setData(dataSource);
});

// no need to convert to geojson to work with turf.js
// since all features are always shown on map and turf functions are always triggered by user interaction,
// so can get required geojson information (feature type and coordinates) easily from the event object

// if some featurs are hidden, then will need to convert to geojson and use turf.js,
// but currently no use case for that

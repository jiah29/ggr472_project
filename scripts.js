// ============================================================================
// Script used for both index.html and suggestions.html
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

mapboxgl.accessToken =
  'pk.eyJ1IjoiamlhaGFvMjkiLCJhIjoiY2xzdG02b3BxMDloMTJqcW1vbzU4YmRkNyJ9.M-CHOkWhRvbNRVqIg-W04g';

const map = new mapboxgl.Map({
  container: 'map', // map container ID
  style: 'mapbox://styles/jiahao29/clstm27z5002r01pcaess7gk8', // basemap style url
  center: [-79.370729, 43.719518], // starting position [lng, lat]
  zoom: 10, // starting zoom level
});

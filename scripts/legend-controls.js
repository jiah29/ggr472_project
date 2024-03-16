// ============================================================================
// Script used for index.html to control legend items on the map
// Created by Jia Hao Choo, Runyi Li & Saning Zhang
// for GGR472 TDSB Active Travel Sandbox Project (Winter 2024)
// ============================================================================

// Master function to toggle legend items
// It calls the appropriate function based on the layer type
// layer: id of the mapbox layer
// visible: boolean indicating if the layer is visible
function toggleLayerLegend(layer, visible) {
  if (layer != 'cycling-network' && layer != 'pedestrian-network') {
    // the layer is not a line layer, use the toggleIconLegend function
    toggleIconLegend(layer, visible);
  } else {
    // otherwise use the toggleLineLegend function
    toggleLineLegend(layer, visible);
  }
  legend = document.getElementById('legend');
  if (legend.children.length === 0) {
    // if the legend is empty, hide the legend
    legend.style.display = 'none';
  } else {
    // otherwise make the legend visible
    legend.style.display = 'block';
  }
}

// Function to control a symbol layer in the legend
// layer: id of the mapbox layer
// visible: boolean indicating if the layer is visible in the legend
function toggleIconLegend(layer, visible) {
  // variable to store the legend item id for use in HTML element id
  const legendId = layer + '-legend';

  if (!visible) {
    // remove the legend item from the legend container if it exists
    if (document.getElementById(legendId)) {
      document
        .getElementById('legend')
        .removeChild(document.getElementById(legendId));
    }
  } else {
    // create the legend itm
    const legendItem = document.createElement('div');
    // give the legend item an id
    legendItem.id = legendId;

    // create a legend icon for the legend item
    const legendIcon = document.createElement('div');
    // make it inline with the text
    legendIcon.style.display = 'inline-block';
    // set the width of the legend icon
    legendIcon.style.width = '35px';
    // create an image element for the legend icon
    const img = document.createElement('img');
    img.src = './images/' + layer + '.png';
    // make the image take up the entire space of the legend icon
    img.style.width = '100%';
    img.style.height = '100%';
    // append the image to the legend icon
    legendIcon.appendChild(img);
    // append the legend icon to the legend item
    legendItem.appendChild(legendIcon);

    // create a label for the legend item
    const legendLabel = document.createElement('p');
    // make the text inline with the legend icon
    legendLabel.style.display = 'inline';
    // format the text to become label in the legend
    legendLabel.textContent = formatLabel(layer);
    // append the label to the legend item
    legendItem.appendChild(legendLabel);

    // add legend item to legend container based on specified sorting method
    sortAndInsertLegendItem(legendItem);
  }
}

// Function to control a line layer in the legend
// layer: id of the mapbox layer
// visible: boolean indicating if the layer is visible in the legend
function toggleLineLegend(layer, visible) {
  // variable to store the legend item id for use in HTML element id
  const legendId = layer + '-legend';

  if (!visible) {
    // remove the legend item from the legend container if it exists
    if (document.getElementById(legendId)) {
      document
        .getElementById('legend')
        .removeChild(document.getElementById(legendId));
    }
  } else {
    // create a legend item with id based on the mapbox layer id
    const legendItem = document.createElement('div');
    legendItem.id = legendId;

    // create a color box for the line element
    const lineColorBox = document.createElement('div');
    // set the size of the color box to make it looks like a line
    lineColorBox.style.width = '50px';
    lineColorBox.style.height = '2px';
    // make it inline with the text
    lineColorBox.style.display = 'inline-block';
    // set margin-right to separate the color box and the text
    lineColorBox.style.marginRight = '5px';
    // adjust position to move line up to make it aligned center with the text vertically
    lineColorBox.style.position = 'relative';
    lineColorBox.style.top = '-5px';
    // set the color of the color box based on the layer
    lineColorBox.style.backgroundColor =
      layer === 'cycling-network' ? 'blue' : 'black';
    // append the color box to the legend item
    legendItem.appendChild(lineColorBox);

    // create a label for the legend item
    const legendLabel = document.createElement('p');
    // make the text inline with the legend icon
    legendLabel.style.display = 'inline';
    // format the text to become label in the legend
    legendLabel.textContent = formatLabel(layer);
    // append the label to the legend item
    legendItem.appendChild(legendLabel);

    // add legend item to legend container based on specified sorting method
    sortAndInsertLegendItem(legendItem);
  }
}

// Helper function to format a string by removing hyphens and capitalizing each word
// string: string to capitalize
function formatLabel(string) {
  return string
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to insert a legend item into the legend container
// Legend items are sorted according to the following rules:
// 1. Icon layers are shown first, and are sorted alphabetically
// 2. Line layers are shown after icon layers, and are sorted alphabetically
// legendItem: the legend item to insert
function sortAndInsertLegendItem(legendItem) {
  // get all the legend items
  const legend = document.getElementById('legend');
  const legendItems = Array.from(legend.children);

  // make legend visible if it is not already when there are legend items
  if (legendItems.length === 0 && legendItem.style.display !== 'block') {
    legend.style.display = 'block';
  }

  if (!legendItem.id.includes('network')) {
    // it is an icon layer
    // first find the index of the next alphabetically sorted icon layer
    const index = legendItems.findIndex(
      (item) => !item.id.includes('network') && item.id > legendItem.id,
    );

    if (index === -1) {
      // no icon layer found, so find the first line layer
      const lineLayer = legendItems.find((item) => item.id.includes('network'));
      if (!lineLayer) {
        // if there are no line layers, insert the legend item at the end
        legend.appendChild(legendItem);
      } else {
        // otherwise insert the legend item before the first line layer
        legend.insertBefore(legendItem, lineLayer);
      }
    } else {
      // there is an icon layer that is alphabetically larger, so insert the legend item before it
      legend.insertBefore(legendItem, legendItems[index]);
    }
  } else {
    // it is a line layer
    // first find the index of the next alphabetically larger line layer
    const index = legendItems.findIndex(
      (item) => item.id.includes('network') && item.id > legendItem.id,
    );

    if (index === -1) {
      // no alphabetally larger line layer so insert the legend item at the end
      legend.appendChild(legendItem);
    } else {
      // there is an alphabetically larger line layer so insert the legend item before it
      legend.insertBefore(legendItem, legendItems[index]);
    }
  }
}

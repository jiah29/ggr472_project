# GGR472 Project - TDSB Active Travel Sandbox Initiative (Winter 2024)

### By Jia Hao Choo, Runyi Li & Saning Zhang

Link to Published Website: https://jiah29.github.io/ggr472_project/

## Overview
Welcome to the GGR472 Sandbox Project repository! This web map aims to facilitate active commute travel route planning for parents and guardians of TDSB schools by integrating visualizations of relevant features and direct in-map route planning capabilities.

## Repository Contents

- `index.html`: HTML file for the map (main) page, containing code for instruction modal, navbar and sidebar
- `resources.html`: HTML file for the resources page
- `styles.css`: CSS file for styling the map and resources page
- `scripts` folder:
    - `master.js`: JavaScript file containing code to set up web page functionalities as well as setting up the map with the required map controls. It is also responsible for calling relevant functions in other scripts to add map data and set up all interactivity and analysis features.
    - `map-interactivity-analysis.js`: JavaScript file containing code implementing interactivity & analysis features on both HTML elements and map elements
    - `map-data.js`: JavaScript file containing code to add map data sources and layers to the map
    - `legend-controls.js`: JavaScript file containing code to control the visibility of map layers
- `README.md`: Markdown file provides an overview of the project, instructions on how to use the web map, and feature introductions for users.

## How to Use

### Visualize

- **Showing and Hiding Layers**  
    Toggle layers on or off through the sidebar using the eye or crossed-out eye icons to display features of interest.  
- **Want to Know More?**  
    Click on any feature to open a pop-up that provides detailed information about that feature.  
- **Interested in a Specific School?**  
    Use the search box in the navigation bar to find a target school, or double-click on the school point feature to zoom in and focus on that school.  
- **When Focusing on a School**  
    All other schools will be hidden from view.  
    Two buffers will appear around the school, indicating 10 minutes walking and cycling distances, respectively.  
    Walking bus stop suggestions (e.g., parks and bike share stations) within the buffer distance will be highlighted.  
    Hover over non-school features to see their distance and estimated traveling times to the focused school.  

### Plan

- **Recording Features of Interest**  
    Double-click on non-school features that you want to include in your plan to highlight them for reference. Click on the marker again to remove it.  
- **Drawing an Active Travel Route**  
    Utilize the drawing tools (represented by a line drawing icon) at the bottom right of the map to draw your route. Click on the drawn route to see its total length and estimated traveling time.  
- **Happy with Your Route?**  
    Export your route map by clicking the print icon at the bottom right of the map to save it as a PNG file.  

## Features

### Design
The application consists of two main pages:
- **Map Page (Default Landing Page)**
  - **Navbar:** Contains the title, a link to the "Resources" page, an info with clicking it showing the icon instruction modal, and a search bar specific to school searches. 
  - **Main Body:** 
    - **Collapsible Sidebar:** Contains layer information with toggle buttons to show/hide layers.
    - **Map Container:** Displays the interactive map.
    - **Map Controls:** Located at the bottom right for zooming in/out.
    - **Legends:** Displayed at the bottom left, if applicable.
- **Resources Page**
  - **Navbar:** Identical to the Map page for consistency.
  - **Main Body:** Detailing the benefits of active travel and the drawbacks of using private vehicles. Links to official Active School Travel websites and related resources are also included.

### Interactivity
- **Layer Interactivity:** Users can toggle map layers on and off through the sidebar.
- **Feature Interaction:** Clicking on features such as schools or parks opens a pop-up with relevant information, e.g. the name and address of that feature.
- **Search and Focus:** Users can search for schools by name in search bar, or look for it mannually on map. They can also double click on a school to focus it in a zoom-in view. Focusing on a school will hide other schools and show specific routes and stops.
- **Dynamic Information Display:** When focusing on a school in zoom-in view, hovering over non-school features displays distances and estimated travel times to the focused school.
- **Route Drawing:** Users can manually draw routes on the map, which could be useful for planning paths. 
- **Highlight and Right-Click Functionality:** Double-clicking on a non-school feature allows users to mark features, aiding in route planning.
- **Export Options:** When done routes planning, maps can be exported as PNG files.

### Analysis Tools
- **Buffer Zones:** Automatically draw walking and cycling buffer zones around selected schools based on given traveling time.
- **Route Distance Calculations:** Calculate distances and estimated travel times for the drawn route, provide these infomations in a clicking-open pop-up.
- **Feature Distance Calculations:** Calculate distances and estimated travel times from a non-school feature to the focused school, provide these infomations in a hovering-open pop-up. This only shows in zoom-in view, when a school is in focus.
- **Dynamic Buffer Adjustment:** Users can manually adjust buffer sizes based on adjusting maximum walking/cycling times.

## Contributions

This website was created by Jia Hao Choo, Saning Zhang, and Runyi Li for the GGR472 Course Project in Winter 2024. The project was completed in collaboration with Toronto District School Board (TDSB) as part of the Sandbox Initiative in the Faculty of Arts and Sciences at the University of Toronto.

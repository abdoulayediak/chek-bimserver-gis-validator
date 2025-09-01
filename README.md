# CHEK GIS Validator – BIMserver Connector

This web interface connects a user's **BIMserver.center** account to the **CHEK model validator** to check CityJSON files for completeness and geometric validity.

---

## What it does

1. **Authenticate with BIMserver.center**  
   - Opens a login popup.  
   - Retrieves a valid **session token**.  

2. **List user resources**  
   - Fetches and displays available **projects**, **contributions**, and their **documents**.  
   - Filters supported files (CityJSON `.json` and `.gml`).  

3. **Send files to CHEK validator**  
   - Selected CityJSON files are sent to the **OGC-hosted CHEK validator**:  
     [CHEK Data Completeness](https://github.com/ogcincubator/chek-data-completeness/tree/master)  

4. **Display results**  
   - **3D Model Viewer**: shows the selected CityJSON using a modified version of [cityjson-threejs-loader](https://github.com/cityjson/cityjson-threejs-loader).  
   - **val3dity Report Viewer**: shows geometric validation results using a modified version of [val3dity report browser](https://github.com/tudelft3d/val3dity).  

---

## Requirements
- A **BIMserver.center** account with projects and contributions.  
- CityJSON or GML files uploaded as contribution documents.  
- Pop-ups enabled in your browser (for login).  

---

## Usage
1. Serve the project locally (e.g., with `python -m http.server 8080`).  
2. Open `http://localhost:8080` in your browser.  
3. **Login** with your BIMserver.center Client ID/Secret.  
4. Select a project → contribution → document(s).  
5. Click **Validate**:  
   - The 3D model appears in the viewer.  
   - SHACL + val3dity results are shown in the report panels.  

---

## Credits
- [CHEK Data Completeness Validator](https://github.com/ogcincubator/chek-data-completeness/tree/master)  
- [cityjson-threejs-loader](https://github.com/cityjson/cityjson-threejs-loader) (modified)  
- [val3dity report browser](https://github.com/tudelft3d/val3dity) (modified)  

---

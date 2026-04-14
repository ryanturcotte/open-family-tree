<br />
<div align="center">
  <h1 align="center">Open Family Tree</h1>
  <p align="center">
    A login-free, local-first genealogy and family tree platform built with React & Tailwind CSS.
  </p>
</div>
## DISCLAIMER: This webapp was created through prompting in Google Antigravity. If this bothers you, don't use this app.

## Quickstart
Open the Github Pages app at: https://ryanturcotte.github.io/open-family-tree/

## Overview
Open Family Tree is a privacy-oriented, client-side React Web App allowing you to map, document, and aesthetically customize massive internal family matrices using edge-routing frameworks. The platform securely stores data offline in your browser and allows export into multiple formats. No login required, just start adding your family and building your family tree.

---

## Features
- **Data Privacy & Security:** **No database.** All parsing, saving, scaling, and compression runs completely within your Local Browser Storage. You generate and hold the 100% offline `.json` dumps.
- **Dynamic Display Engine:** Instantly toggle the visibility of birth/death dates and location data directly on the tree nodes via the global Settings portal.
- **Format-Agnostic Date System:** Input dates in any string format; the engine uses heuristic parsing to render them in your preferred regional style (MDY, DMY, YMD, or Raw).
- **Flexible Details Interface:** Transition seamlessly between a classic **Docked** sidebar or a **Floating** tracking panel that dynamically repositions itself based on available screen real estate.
- **Intelligent Viewport & Layout:**
  - **Smart Zoom Lock:** Secure your current scale while allowing fluid panning across massive lineage networks.
  - **Algorithmic Re-arrangement:** One-click Dagre layout reset to automatically organize overlapping branches and chaotic node placements.
  - **Responsive Auto-Fit:** The canvas intelligently triggers `fitView` logic on window resizes to maintain perfect visibility.
- **Adaptive Node Sizing:** Features a dynamic width engine that scales card dimensions to fit long surnames and maiden names, including manual `+/-` overrides and a "Fixed Sizing" mode for minimalist layouts.
- **Universal Import / Export:** Features a proprietary built-in engine engineered to accurately parse, ingest, and deploy `.ged` code (GEDCOM 5.5.1 structure), meaning it effortlessly interfaces directly with platform archives like Ancestry.com and MyHeritage. 
- **Automated Spreadsheets:** Natively hooks into complex node structures extracting custom dynamics logic into `.csv` tabular exports formatted identically for Excel/Sheets. 
- **Infinite Schema Customization:** The "Additional Fields" generator lets you inject infinite metadata labels (*Careers, Heights, Titles, Aliases*) on the fly globally.
- **Mobile Accessible** A responsive hamburger menu and relocated status indicators ensure a clean, distraction-free environment for documenting families on any device.

## Build From Scratch
Open Family Tree operates as an ultra-lightweight frontend-only instance bundled through Vite.

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/ryanturcotte/open-family-tree.git
cd open-family-tree

# 2. Install dependencies
npm install

# 3. Spin up the Vite Dev Server
npm run dev
\`\`\`
Visit `http://localhost:5173` in your browser.

## Technology Used
- **Vite 8**
- **React 18**
- **Tailwind CSS v4**
- **Lucide React** (Iconography)
- **@xyflow/react** (Graph Network UI Layout Engine)
- **Dagre** (Graph Directed Layout Algorithms)

## Changelog/Known Issues 

- 2026-04-13
-- First release to GitHub, not everything is well tested. Unsure if the GEDCOM import/export is fully functional.

## Open Source License
Distributed under the **MIT License**.

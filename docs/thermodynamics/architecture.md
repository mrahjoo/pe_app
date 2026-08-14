# Thermodynamics Dashboard Architecture

This document describes the architectural implementation of the Thermodynamics Dashboard within the `pe_app` Next.js application, interfacing with the ProExergy REFPROP API.

## Overview

The dashboard provides a suite of advanced thermodynamic calculators for pure fluids and mixtures using REFPROP integration. It caters to refrigeration engineers, chemical process designers, and researchers.

### Routing Structure

The section is isolated under the `/dashboard/thermodynamics` route group:

- `src/app/dashboard/thermodynamics/layout.tsx`: Provides the sidebar navigation shared across all thermodynamics calculators.
- `src/app/dashboard/thermodynamics/page.tsx`: The landing page with entry points (cards) for each tool.

### Calculators Implemented

1. **Fluid Information** (`/fluid-info`)
   - **Purpose:** Retrieve underlying REFPROP data (critical points, molar mass, safety data, GWP/ODP) for pure fluids or mixtures.
   - **API Usage:** `/api/refprop/api/v1/substance` and `/api/refprop/api/v1/substance/{id}/info`
   - **Output:** Detailed property tables of overall and component-specific properties.

2. **Thermodynamic State Calculator** (`/state-calculator`)
   - **Purpose:** Calculate the full thermodynamic state (Enthalpy, Entropy, Density, specific heats, etc.) from two known properties.
   - **API Usage:** `/api/refprop/api/v1/calc` with `hOut = null` (requesting all properties).
   - **Output:** Comprehensive table of thermodynamic properties.

3. **Temperature Glide Calculator** (`/glide`)
   - **Purpose:** Evaluate the temperature glide of zeotropic refrigerant mixtures at a given pressure.
   - **API Usage:** Calls `/calc` for bubble point and dew point at the target pressure and computes the difference.
   - **Output:** The temperature glide in K or °R.

4. **Superheat & Subcooling Calculator** (`/superheat-subcooling`)
   - **Purpose:** Calculate useful HVAC/R cycle metrics like degree of superheat or subcooling based on measured temperature and pressure.
   - **API Usage:** `/api/refprop/api/v1/calc` to find saturation temperatures.
   - **Output:** Calculated degree of superheat (vapor) or subcooling (liquid).

## API Integration (`src/lib/api/refprop.ts`)

The integration uses a dedicated client-side fetching utility tailored for the REFPROP REST API.

- **Types:** Interfaces like `SubstanceInfo`, `ComponentInfo`, and `CalcRequest` enforce strict typings.
- **Client Methods:** `refpropApi` object exposes `listSubstances`, `getSubstanceInfo`, and `calc`. It cleanly handles REFPROP's custom error formats and numeric/unit tuples.

## UI/UX Considerations

- **Component Library:** Built entirely with `shadcn/ui` components for consistency.
- **Fluid Selection:** Advanced dropdowns for selecting from hundreds of REFPROP pure fluids and predefined mixtures.
- **Unit Conversions:** Robust unit selection mapping to the backend REFPROP `unit_system` preferences (SI, IP, mass-based, mole-based).
- **Error Handling:** Exposes REFPROP's underlying error codes (`ierr`) and messages (`herr`) to the user when calculations fail (e.g., states outside the valid fluid domain).

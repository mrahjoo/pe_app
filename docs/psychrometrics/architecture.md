# Psychrometrics Dashboard Architecture

This document describes the architectural implementation of the Psychrometrics Dashboard within the `pe_app` Next.js application, interfacing with the ProExergy `PsychroLib v3` API.

## Overview

The dashboard provides a suite of B2B-focused calculators for HVAC engineers, agriculture, and energy analysis. It uses a clean, responsive layout built with Next.js App Router and Shadcn/UI components.

### Routing Structure

The section is isolated under the `/psychrometrics` route group:

- `src/app/psychrometrics/layout.tsx`: Provides the sidebar navigation shared across all calculators.
- `src/app/psychrometrics/page.tsx`: The landing page with entry points (cards) for each tool.

### Calculators Implemented

1. **Single-Point State Calculator** (`/state-calculator`)
   - **Purpose:** Calculate the full psychrometric state from dry bulb and one secondary property.
   - **API Usage:** Calls one of `/calc/from-*` (e.g., `from-rel-hum`, `from-wet-bulb`) based on user selection.
   - **Output:** Detailed table of all thermodynamic properties (Enthalpy, Volume, Density, etc.).

2. **Vapor Pressure Deficit (VPD)** (`/vpd`)
   - **Purpose:** Target agricultural and horticultural use cases.
   - **API Usage:** `/calc/from-rel-hum` to extract `vapor_pressure_deficit` and evaluate the state.
   - **Output:** A high-visibility metric displaying the VPD and a contextual category (e.g., "Late Veg / Early Flower").

3. **Psychrometric Process Classifier** (`/process`)
   - **Purpose:** Analyze thermodynamic changes between Point A (entering) and Point B (leaving).
   - **API Usage:** `/process/classify`
   - **Output:** Process type (e.g., "cooling and dehumidification"), direction, Sensible Heat Ratio (SHR), and deltas.

4. **Cooling Coil Load Calculator** (`/cooling-coil`)
   - **Purpose:** Crucial for MEP engineers sizing cooling coils.
   - **API Usage:** 
     1. `/calc/from-rel-hum` for Entering state (to get specific volume/density).
     2. `/calc/from-rel-hum` for Leaving state.
     3. `/process/classify` to extract `delta_enthalpy`, `delta_hum_ratio`, and `sensible_heat_ratio`.
   - **Output:** Total load (kW or Btu/hr), Sensible Load, Latent Load, and Moisture Removal Rate.

5. **Economizer Decision Tool** (`/economizer`)
   - **Purpose:** Determine if 100% outdoor air (free-cooling) is viable by comparing OA and RA enthalpy.
   - **API Usage:**
     1. `/calc/from-rel-hum` (OA)
     2. `/calc/from-rel-hum` (RA)
     3. `/calc/mix` (baseline at minimum OA percentage)
   - **Output:** Go/No-Go decision for free cooling, with comparative enthalpy tracking.

## API Integration (`src/lib/api/psychrolib.ts`)

The integration is purely client-side using `fetch`. The central file provides robust type safety mapped directly from the `psychrolib_proexergy.json` OpenAPI specification.

- **Types:** Interfaces like `PsychroState`, `MixResponse`, `ProcessClassifyResponse` enforce strict typings on the API returns.
- **Client Methods:** `psychroCalc` acts as the SDK object, exposing promises for each calculation endpoint. It standardizes error handling (parsing backend 422s or 500s into JS Error messages).

## UI/UX Considerations

- **Component Library:** `shadcn/ui` provides unstyled, accessible React components (`Card`, `Input`, `Select`, `Table`).
- **State Management:** Simple `useState` is used for form control given the relatively flat input structures of psychrometric properties.
- **Error Handling:** Client-side validation prevents API calls with `NaN` inputs. API errors are caught and surfaced via standard red alert text below the calculate buttons.
- **Unit Conversions:** Every calculator natively supports toggling between `SI` and `IP`, dynamically updating labels and propagating the `unit_system` flag to the API.

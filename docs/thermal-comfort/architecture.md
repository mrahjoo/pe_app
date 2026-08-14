# Thermal Comfort Dashboard Architecture

This document describes the architectural implementation of the Thermal Comfort Dashboard within the `pe_app` Next.js application, interfacing with the ProExergy Thermal Comfort API.

## Overview

The dashboard provides a suite of B2B-focused calculators for HVAC engineers, industrial hygienists, and thermal analysts. It uses a clean, responsive layout built with Next.js App Router and Shadcn/UI components.

### Routing Structure

The section is isolated under the `/dashboard/thermal-comfort` route group:

- `src/app/dashboard/thermal-comfort/layout.tsx`: Provides the sidebar navigation shared across all thermal comfort calculators.
- `src/app/dashboard/thermal-comfort/page.tsx`: The landing page with entry points (cards) for each tool.

### Calculators Implemented

1. **PMV / PPD Calculator** (`/pmv-ppd`)
   - **Purpose:** Calculate Predicted Mean Vote (PMV) and Predicted Percentage of Dissatisfied (PPD) based on environmental and personal parameters.
   - **API Usage:** `/api/comfort/api/v1/comfort/pmv-ppd`
   - **Output:** PMV index and PPD percentage.

2. **UTCI (Universal Thermal Climate Index)** (`/utci`)
   - **Purpose:** Evaluate the heat stress level of outdoor or unconditioned environments.
   - **API Usage:** `/api/comfort/api/v1/comfort/utci`
   - **Output:** UTCI temperature and associated heat stress category.

3. **Standard Effective Temperature (SET)** (`/set`)
   - **Purpose:** Provide a comprehensive index for thermal comfort combining temperature, humidity, air speed, and clothing.
   - **API Usage:** `/api/comfort/api/v1/comfort/set`
   - **Output:** Standard Effective Temperature (SET) in degrees.

4. **NIOSH Work Capacity** (`/niosh`)
   - **Purpose:** Determine recommended work/rest limits and hydration requirements under heat stress for occupational safety.
   - **API Usage:** `/api/comfort/api/v1/comfort/work-capacity/niosh`
   - **Output:** Heat stress warnings and recommended limits.

## API Integration (`src/lib/api/thermalcomfort.ts`)

The integration uses client-side `fetch` via a dedicated utility file.

- **Types:** Interfaces like `PmvPpdRequest`, `UtciResponse`, etc., enforce strict typings on the API payloads and returns.
- **Client Methods:** `comfortApi` acts as the SDK object, exposing methods for each calculation endpoint. Error handling is standardized.

## UI/UX Considerations

- **Component Library:** `shadcn/ui` provides unstyled, accessible React components (`Card`, `Input`, `Select`, `Table`).
- **State Management:** `useState` controls form inputs and calculates results.
- **Error Handling:** Client-side validation prevents invalid requests, while API errors are surfaced contextually below inputs.
- **Unit Conversions:** Supports toggling between SI and IP unit systems via user selections where applicable.

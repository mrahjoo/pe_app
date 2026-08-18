# Agent capabilities and help

Welcome to the ProExergy engineering assistant. It acts as a technical copilot for fast analysis, calculations, and design support across the platform.

## 🔗 Source attribution
After every calculation the agent will end its reply with a link to the corresponding interactive dashboard calculator:

> 🔢 Calculated using **Psychrometric State Calculator** — [Verify on dashboard](/dashboard/psychrometrics/state-calculator)

Click the link to open the full calculator, pre-fill your own values, and independently verify the result.

---

## 🌡️ Psychrometrics
The agent supports the full suite of psychrometric calculations powered by **PsychroLib v3**.

| Calculator | What it does |
|---|---|
| State Calculator | Dry-bulb + one property → full moist-air state |
| Atmosphere / Altitude | Elevation → standard barometric pressure & temperature |
| Air Mixing Box | Combine ≥2 air streams → mixed state and mass fractions |
| Process Classifier | Two states → HVAC process type, SHR, direction |
| Coil ADP & Bypass Factor | ADP, bypass factor, contact factor for cooling coils |
| General HVAC Process | Entering state + load → leaving state |

**Example:** "What is the enthalpy of air at 34 °C, 101325 Pa, and 55% relative humidity?"

## ☀️ Solar
Solar position and irradiance calculations powered by **pvlib-python (NREL SPA)**.

| Calculator | What it does |
|---|---|
| Solar Position | Zenith, azimuth, elevation for any location & datetime |
| Solar Noon | Transit time and offset from clock noon |
| Sunrise & Sunset | Sunrise, sunset, and day length (handles polar conditions) |
| Sun Path | Batch time-series of solar positions over a date range |
| Declination & EoT | Solar declination and equation of time |
| Surface Irradiance | DNI, DHI, GHI + plane-of-array (POA) irradiance on any surface |
| Clear-Sky Model | Explicit model choice: Ineichen, Haurwitz, Simplified Solis |
| Incidence Angle | Angle between sun beam and a tilted/oriented surface |
| Shading Angle | Overhang/fin shading mask, profile angle, shading factor |
| Window Heat Gain | End-to-end SHGC × irradiance × area → W and BTU/h |

**Example:** "What is the solar azimuth for Dubai (25.2°N, 55.3°E) on June 21 at noon local time?"

## ❄️ Thermodynamics
The agent can evaluate thermodynamic states for refrigerants and fluids such as water, methane, or R134a using the backend property engine.

**Example:** "Calculate the state of water at 300 K and 101325 Pa."

## 🧑‍🤝‍🧑 Thermal comfort
You can calculate comfort metrics such as **PMV/PPD**, **UTCI**, and **SET** with a single request.

**Example:** "Find the PMV for tdb=25, tr=25, v=0.1, rh=50, met=1.0, clo=0.5."

## 📐 Unit conversions
The agent can convert measurements between standard engineering units across common systems.

**Example:** "Convert 10 meters to feet."

## 👁️ Vision and image uploads
Click the paperclip icon in the chat box to upload an image. The assistant can interpret diagrams, equations, charts, and technical sketches directly from the image.

## 💡 Best practices
- Include units for all values when possible.
- State the property you want to calculate, not just the raw numbers.
- For fluid work, specify the fluid name and the conditions clearly.
- For comfort calculations, include temperature, humidity, air speed, and clothing/metabolic assumptions when relevant.
- For solar calculations, always provide a timezone-aware datetime (e.g. `2024-06-21T12:00:00+02:00`).

---

*Note to editors: This page is rendered directly from `src/content/agent-help.md`. You can add new capabilities here as they are integrated.*

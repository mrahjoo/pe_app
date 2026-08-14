# Agent capabilities and help

Welcome to the ProExergy engineering assistant. It acts as a technical copilot for fast analysis, calculations, and design support across the platform.

## 🌡️ Psychrometrics
The agent can calculate psychrometric properties of air when you provide a dry-bulb temperature, atmospheric pressure, and one additional known property such as relative humidity or humidity ratio.

**Example:** "What is the enthalpy of air at 34 C, 101325 Pa, and 55% relative humidity in SI units?"

## ❄️ Thermodynamics
The agent can evaluate thermodynamic states for refrigerants and fluids such as water, methane, or R134a using the backend property engine.

**Example:** "Calculate the state of water at 300 K and 101325 Pa."

## 🧑‍🤝‍🧑 Thermal comfort
You can calculate comfort metrics such as **PMV/PPD**, **UTCI**, and **SET** with a single request. The assistant handles the required calculations in the background.

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

---

*Note to editors: This page is rendered directly from `src/content/agent-help.md`. You can add new capabilities here as they are integrated.*

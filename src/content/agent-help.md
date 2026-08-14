# Agent Capabilities and Help

Welcome to the ProExergy AI Agent! 
This Agent acts as your engineering copilot, leveraging the Vercel AI SDK and Google's Gemini Flash models. It has direct access to the thermodynamic and psychrometric calculators found in your dashboard.

## 🌡️ Psychrometrics
The agent can query psychrometric properties of air. Provide the dry bulb temperature, atmospheric pressure, and one other known property (like relative humidity).
**Example:** "What is the enthalpy of air at 34 C, 101325 Pa, and 55% relative humidity in SI units?"

## ❄️ Thermodynamics
The agent can evaluate thermodynamic states for refrigerants and fluids (like Water, Methane, or R134a) using the backend REFPROP integration.
**Example:** "Calculate the state of Water at 300 K and 101325 Pa."

## 🧑‍🤝‍🧑 Thermal Comfort
You can calculate comfort indices such as **PMV/PPD**, **UTCI**, and **SET**. The agent handles the necessary API calls automatically.
**Example:** "Find the PMV for tdb=25, tr=25, v=0.1, rh=50, met=1.0, clo=0.5."

## 📐 Unit Conversions
The agent natively converts units across standard systems.
**Example:** "Convert 10 meters to feet."

## 👁️ Vision and Image Uploads
You can click the paperclip icon in the chat box to upload an image. The agent will "see" the image and can read equations, schematics, and thermodynamic charts!

---

*Note to Editors: This page is rendered directly from `src/content/agent-help.md`. You can add new capabilities here as they are integrated!*

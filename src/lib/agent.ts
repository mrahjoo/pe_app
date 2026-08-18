import { ToolLoopAgent, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { calculatePsychroStateTool, atmosphereFromAltitudeTool, mixingBoxTool, classifyProcessTool, coilAdpBfTool, applyProcessTool } from './agent-tools/psychrometrics';
import { calculateFluidStateTool } from './agent-tools/thermodynamics';
import { calculatePMVTool, calculateUTCITool, calculateSETTool } from './agent-tools/thermal-comfort';
import { convertUnitTool } from './agent-tools/unit-converter';
import {
  solarPositionTool,
  solarNoonTool,
  sunriseSunsetTool,
  sunPathTool,
  declinationEotTool,
  irradianceTool,
  clearSkyModelTool,
  incidenceAngleTool,
  shadingAngleTool,
  heatGainWindowTool,
} from './agent-tools/solar';

// Helper to map Open-Meteo weather codes to conditions
function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2 || code === 3) return 'Mainly clear, partly cloudy, and overcast';
  if (code === 45 || code === 48) return 'Fog and depositing rime fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 75) return 'Snow fall';
  if (code === 77) return 'Snow grains';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
  return 'Unknown';
}

export const myAgent = new ToolLoopAgent({
  model: google('gemini-3.7-flash'),
  instructions: `You are an advanced engineering assistant with access to precise calculators for building science and HVAC/solar engineering.

**Psychrometrics (PsychroLib v3):**
- Single-point state calculator: given dry-bulb + one humidity property → full moist-air state
- Atmosphere/altitude calculator: elevation → standard barometric pressure & temperature
- Air mixing box: combine multiple air streams → mixed state and mass fractions
- Process classifier: compare two states → HVAC process type, SHR, and direction
- Coil ADP/BF tool: cooling coil apparatus dew point, bypass factor, and contact factor
- General HVAC process (apply process): entering state + load → leaving state

**Solar (pvlib / NREL SPA):**
- Solar position: zenith, azimuth, elevation for any location & datetime
- Solar noon: transit time and offset from clock noon
- Sunrise/sunset: with day length (handles polar conditions)
- Sun path: batch time-series of solar positions over a range
- Declination & equation of time: fundamental astronomical parameters
- Irradiance on a surface: DNI, DHI, GHI + plane-of-array (POA) components
- Clear-sky model: explicit model selection (Ineichen, Haurwitz, Simplified Solis)
- Incidence angle: angle between sun beam and tilted/oriented surface normal
- Shading angle: overhang/fin shading mask, profile angle, shading factor
- Window solar heat gain: end-to-end SHGC × irradiance × area calculation (W and BTU/h)

**Other:**
- Thermodynamic fluid states (RefProp-compatible)
- Thermal comfort indices: PMV/PPD, UTCI, SET
- Unit conversion across engineering domains
- Current weather for any city

**IMPORTANT — Calculator attribution rule:**
Every tool response includes a \`calculator_used\` field (the name of the calculator) and a \`verify_at\` field (a relative URL path). After every calculation you MUST end your reply with a source line in this exact format:
> 🔢 Calculated using **[calculator_used]** — [Verify on dashboard](verify_at)

Replace \`calculator_used\` and \`verify_at\` with the actual values from the tool response. Always use a markdown link. This lets the user open the interactive calculator to verify or explore the result further. Never omit this line for any calculation result.

Always ask for missing inputs if necessary. When asked for weather, use the weather tool. You are also capable of processing images; if the user uploads an image, analyze it and answer their questions about it.`,
  tools: {
    // ─── Psychrometrics ───────────────────────────────────────────────────────
    calculate_psychro_state: calculatePsychroStateTool,
    atmosphere_from_altitude: atmosphereFromAltitudeTool,
    mixing_box: mixingBoxTool,
    classify_psychro_process: classifyProcessTool,
    coil_adp_bypass_factor: coilAdpBfTool,
    apply_hvac_process: applyProcessTool,

    // ─── Solar ────────────────────────────────────────────────────────────────
    solar_position: solarPositionTool,
    solar_noon: solarNoonTool,
    sunrise_sunset: sunriseSunsetTool,
    sun_path: sunPathTool,
    declination_equation_of_time: declinationEotTool,
    surface_irradiance: irradianceTool,
    clear_sky_model: clearSkyModelTool,
    incidence_angle: incidenceAngleTool,
    shading_angle: shadingAngleTool,
    window_heat_gain: heatGainWindowTool,

    // ─── Thermodynamics & Comfort ─────────────────────────────────────────────
    calculate_fluid_state: calculateFluidStateTool,
    calculate_pmv: calculatePMVTool,
    calculate_utci: calculateUTCITool,
    calculate_set: calculateSETTool,
    convert_unit: convertUnitTool,

    // ─── Weather ──────────────────────────────────────────────────────────────
    weather: tool({
      description: 'Get the current weather for a specific location',
      inputSchema: z.object({
        location: z.string().describe('The name of the city or location (e.g., "Berlin", "San Francisco")'),
      }),
      execute: async ({ location }) => {
        try {
          // 1. Geocode the location to get lat/lon
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
          const geoData = await geoRes.json();

          if (!geoData.results || geoData.results.length === 0) {
            return { error: 'Location not found' };
          }

          const { latitude, longitude, name, country } = geoData.results[0];

          // 2. Fetch the weather
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
          const weatherData = await weatherRes.json();

          const temp = weatherData.current.temperature_2m;
          const code = weatherData.current.weather_code;
          const condition = getWeatherCondition(code);

          return {
            location: `${name}, ${country}`,
            temperature: temp,
            condition: condition,
            unit: 'Celsius'
          };
        } catch (error) {
          console.error('Weather tool error:', error);
          return { error: 'Failed to fetch weather data' };
        }
      },
    }),
  },
});


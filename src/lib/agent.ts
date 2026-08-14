import { ToolLoopAgent, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { calculatePsychroStateTool } from './agent-tools/psychrometrics';
import { calculateFluidStateTool } from './agent-tools/thermodynamics';
import { calculatePMVTool, calculateUTCITool, calculateSETTool } from './agent-tools/thermal-comfort';
import { convertUnitTool } from './agent-tools/unit-converter';

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
  instructions: 'You are an advanced engineering assistant with access to precise calculators. You can calculate psychrometric properties, thermodynamic states, thermal comfort indices, and convert units. Always ask for missing inputs if necessary. When asked for weather, use the weather tool. You are also capable of processing images; if the user uploads an image, analyze it and answer their questions about it.',
  tools: {
    calculate_psychro_state: calculatePsychroStateTool,
    calculate_fluid_state: calculateFluidStateTool,
    calculate_pmv: calculatePMVTool,
    calculate_utci: calculateUTCITool,
    calculate_set: calculateSETTool,
    convert_unit: convertUnitTool,
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

import { tool } from "ai";
import { z } from "zod";
import { solarCalc } from "../api/solar";

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const locationSchema = {
  latitude: z.number().min(-90).max(90).describe("Latitude in decimal degrees (north positive)"),
  longitude: z.number().min(-180).max(180).describe("Longitude in decimal degrees (east positive)"),
};

const altitudeSchema = z.number().min(0).optional().default(0).describe("Altitude above sea level in metres (default 0)");

const datetimeSchema = z.string().describe(
  "ISO 8601 timezone-aware datetime, e.g. '2024-06-21T12:00:00+02:00'. Must include timezone offset."
);

const obstructionTypeSchema = z.enum(["overhang", "fin", "custom"]).describe(
  "Type of shading obstruction: 'overhang' (horizontal projection above window), 'fin' (vertical side projection), or 'custom'"
);

const obstructionGeometrySchema = z.object({
  depth: z.number().positive().describe("Depth/projection of the obstruction in metres"),
  offset: z.number().min(0).optional().describe("Vertical offset (overhang) or horizontal offset (fin) from window edge in metres"),
  window_height: z.number().positive().optional().describe("Window height in metres (used for overhang calculations, default 1.5)"),
});

// ─── 1. Solar Position ────────────────────────────────────────────────────────

export const solarPositionTool = tool({
  description:
    "Calculate the solar position (zenith, azimuth, elevation, and apparent angles) for a given geographic location and timezone-aware datetime. Uses the highly accurate NREL SPA algorithm (±0.0003°). Essential starting point for all solar engineering calculations.",
  inputSchema: z.object({
    ...locationSchema,
    datetime: datetimeSchema,
    altitude: altitudeSchema,
    pressure: z.number().positive().optional().nullable().describe("Atmospheric pressure in Pa for refraction correction (omit to derive from altitude)"),
    temperature: z.number().optional().nullable().describe("Air temperature in °C for refraction correction (default 12°C)"),
  }),
  execute: async ({ latitude, longitude, datetime, altitude, pressure, temperature }) => {
    try {
      const res = await solarCalc.calculatePosition({ latitude, longitude, datetime, altitude, pressure, temperature });
      return { success: true, result: res, calculator_used: "Solar Position Calculator", verify_at: "/dashboard/solar/position" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 2. Solar Noon ────────────────────────────────────────────────────────────

export const solarNoonTool = tool({
  description:
    "Calculate solar noon (transit time) and the offset from clock noon for a given location and date. Solar noon is when the sun reaches its highest point in the sky and is important for HVAC shading and solar panel orientation.",
  inputSchema: z.object({
    ...locationSchema,
    date: z.string().describe("Date in YYYY-MM-DD format"),
    timezone: z.string().describe("IANA timezone string, e.g. 'America/New_York', 'Europe/Berlin', 'Asia/Dubai'"),
  }),
  execute: async ({ latitude, longitude, date, timezone }) => {
    try {
      const res = await solarCalc.calculateNoon({ latitude, longitude, date, timezone });
      return { success: true, result: res, calculator_used: "Solar Noon Calculator", verify_at: "/dashboard/solar/noon" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 3. Sunrise / Sunset ─────────────────────────────────────────────────────

export const sunriseSunsetTool = tool({
  description:
    "Calculate sunrise, sunset, and day length for a given location and date. Handles polar day and polar night conditions. Used for daylight availability analysis, occupancy schedules, and solar energy assessment.",
  inputSchema: z.object({
    ...locationSchema,
    date: z.string().describe("Date in YYYY-MM-DD format"),
    timezone: z.string().describe("IANA timezone string, e.g. 'America/New_York', 'Europe/Berlin', 'Asia/Dubai'"),
  }),
  execute: async ({ latitude, longitude, date, timezone }) => {
    try {
      const res = await solarCalc.calculateSunriseSunset({ latitude, longitude, date, timezone });
      return { success: true, result: res, calculator_used: "Sunrise & Sunset Calculator", verify_at: "/dashboard/solar/sunrise-sunset" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 4. Sun Path (Batch) ──────────────────────────────────────────────────────

export const sunPathTool = tool({
  description:
    "Calculate the sun path (solar position time series) over a time range for a given location. Returns an array of zenith, azimuth, and elevation values at the specified interval. Maximum 8760 data points. Use this to generate sun path diagrams, annual shading analyses, or solar availability studies.",
  inputSchema: z.object({
    ...locationSchema,
    start_datetime: z.string().describe("Start of the time range (ISO 8601 timezone-aware datetime)"),
    end_datetime: z.string().describe("End of the time range (ISO 8601 timezone-aware datetime)"),
    interval_minutes: z.number().int().positive().max(1440).optional().default(60).describe("Interval between data points in minutes (default 60)"),
    altitude: altitudeSchema,
  }),
  execute: async ({ latitude, longitude, start_datetime, end_datetime, interval_minutes, altitude }) => {
    try {
      const res = await solarCalc.calculatePath({ latitude, longitude, start_datetime, end_datetime, interval_minutes, altitude });
      return { success: true, result: res, calculator_used: "Sun Path Calculator", verify_at: "/dashboard/solar/path" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 5. Declination & Equation of Time ───────────────────────────────────────

export const declinationEotTool = tool({
  description:
    "Get the solar declination angle and equation of time for a given date or day-of-year. These are fundamental astronomical parameters used in solar calculations: declination drives seasonal variation, equation of time corrects clock time to solar time.",
  inputSchema: z.object({
    date: z.string().optional().nullable().describe("Date in YYYY-MM-DD format. Mutually exclusive with day_of_year."),
    day_of_year: z.number().int().min(1).max(366).optional().nullable().describe("Day of year (1–366). Mutually exclusive with date."),
  }),
  execute: async ({ date, day_of_year }) => {
    try {
      const res = await solarCalc.getDeclinationEot({ date: date ?? undefined, day_of_year: day_of_year ?? undefined });
      return { success: true, result: res, calculator_used: "Declination & Equation of Time", verify_at: "/dashboard/solar/declination-eot" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 6. Irradiance on a Surface ───────────────────────────────────────────────

export const irradianceTool = tool({
  description:
    "Calculate clear-sky direct (DNI), diffuse (DHI), and global (GHI) horizontal irradiance, plus plane-of-array (POA) irradiance components on a tilted/oriented surface. Uses Ineichen/Perez clear-sky model. Essential for sizing solar panels, calculating window heat gain, or assessing roof solar potential.",
  inputSchema: z.object({
    ...locationSchema,
    datetime: datetimeSchema,
    surface_tilt_deg: z.number().min(0).max(180).describe("Surface tilt from horizontal in degrees (0 = horizontal, 90 = vertical wall)"),
    surface_azimuth_deg: z.number().min(0).max(360).describe("Surface azimuth in degrees from north (180 = south-facing in northern hemisphere)"),
    linke_turbidity: z.number().positive().optional().nullable().describe("Linke turbidity factor (atmospheric clarity). If omitted, uses pvlib climatological lookup."),
    albedo: z.number().min(0).max(1).optional().default(0.2).describe("Ground reflectivity/albedo (default 0.2)"),
    altitude: altitudeSchema,
  }),
  execute: async ({ latitude, longitude, datetime, surface_tilt_deg, surface_azimuth_deg, linke_turbidity, albedo, altitude }) => {
    try {
      const res = await solarCalc.calculateIrradiance({ latitude, longitude, datetime, surface_tilt_deg, surface_azimuth_deg, linke_turbidity, albedo, altitude });
      return { success: true, result: res, calculator_used: "Surface Irradiance Calculator", verify_at: "/dashboard/solar/irradiance" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 7. Clear-Sky Model ───────────────────────────────────────────────────────

export const clearSkyModelTool = tool({
  description:
    "Calculate clear-sky global horizontal irradiance (GHI), direct normal irradiance (DNI), and diffuse horizontal irradiance (DHI) using an explicit choice of model: 'ineichen' (Ineichen/Perez, default, high accuracy), 'haurwitz' (simple, no turbidity required), or 'simplified_solis' (uses AOD and precipitable water).",
  inputSchema: z.object({
    ...locationSchema,
    datetime: datetimeSchema,
    model: z.enum(["ineichen", "haurwitz", "simplified_solis"]).optional().default("ineichen").describe("Clear-sky model to use"),
    linke_turbidity: z.number().positive().optional().nullable().describe("Linke turbidity (for ineichen model). If omitted, climatological lookup."),
    altitude: altitudeSchema,
  }),
  execute: async ({ latitude, longitude, datetime, model, linke_turbidity, altitude }) => {
    try {
      const res = await solarCalc.calculateClearSkyModel({ latitude, longitude, datetime, model, linke_turbidity, altitude });
      return { success: true, result: res, calculator_used: "Clear-Sky Model Calculator", verify_at: "/dashboard/solar/clear-sky-model" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 8. Incidence Angle on a Tilted Surface ───────────────────────────────────

export const incidenceAngleTool = tool({
  description:
    "Calculate the angle of incidence (AOI) between the sun's direct beam and the normal to a tilted/oriented surface (wall, window, roof). A smaller AOI means more direct solar radiation hits the surface. Essential for computing direct irradiance on non-horizontal surfaces and for HVAC glazing calculations.",
  inputSchema: z.object({
    ...locationSchema,
    datetime: datetimeSchema,
    surface_tilt_deg: z.number().min(0).max(180).describe("Surface tilt from horizontal in degrees (0 = horizontal, 90 = vertical)"),
    surface_azimuth_deg: z.number().min(0).max(360).describe("Surface azimuth in degrees from north"),
    altitude: altitudeSchema,
  }),
  execute: async ({ latitude, longitude, datetime, surface_tilt_deg, surface_azimuth_deg, altitude }) => {
    try {
      const res = await solarCalc.calculateIncidenceAngle({ latitude, longitude, datetime, surface_tilt_deg, surface_azimuth_deg, altitude });
      return { success: true, result: res, calculator_used: "Incidence Angle Calculator", verify_at: "/dashboard/solar/incidence-angle" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 9. Shading Angle ─────────────────────────────────────────────────────────

export const shadingAngleTool = tool({
  description:
    "Calculate shading from an overhang, fin, or custom obstruction for a window or surface. Returns the profile angle, horizontal shadow angle, shading factor (0 = unshaded, 1 = fully shaded), and whether the surface is currently shaded. Used for ASHRAE shading mask calculations and architectural sun-shading design.",
  inputSchema: z.object({
    ...locationSchema,
    datetime: datetimeSchema,
    obstruction_type: obstructionTypeSchema,
    obstruction_geometry: obstructionGeometrySchema.describe("Geometry of the shading obstruction"),
    surface_azimuth_deg: z.number().min(0).max(360).describe("Surface azimuth in degrees from north"),
    altitude: altitudeSchema,
  }),
  execute: async ({ latitude, longitude, datetime, obstruction_type, obstruction_geometry, surface_azimuth_deg, altitude }) => {
    try {
      const res = await solarCalc.calculateShadingAngle({ latitude, longitude, datetime, obstruction_type, obstruction_geometry, surface_azimuth_deg, altitude });
      return { success: true, result: res, calculator_used: "Shading Angle Calculator", verify_at: "/dashboard/solar/shading-angle" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 10. Window Solar Heat Gain ───────────────────────────────────────────────

export const heatGainWindowTool = tool({
  description:
    "Calculate the total solar heat gain (W and BTU/h) through a window at a specific moment. Combines irradiance calculation, optional shading from overhangs/fins, window area, and SHGC (Solar Heat Gain Coefficient) into one practical HVAC deliverable. Formula: heat_gain = POA_irradiance × area × SHGC × (1 − shading_factor).",
  inputSchema: z.object({
    ...locationSchema,
    datetime: datetimeSchema,
    surface_tilt_deg: z.number().min(0).max(180).describe("Window tilt from horizontal in degrees (typically 90 for a vertical window)"),
    surface_azimuth_deg: z.number().min(0).max(360).describe("Window azimuth in degrees from north"),
    area_m2: z.number().positive().describe("Window area in square metres"),
    shgc: z.number().min(0).max(1).describe("Solar Heat Gain Coefficient (0–1). Typical values: 0.25 (low-e triple), 0.4 (double), 0.6 (single clear)"),
    obstruction_type: obstructionTypeSchema.optional().nullable().describe("Optional: type of shading obstruction"),
    obstruction_geometry: obstructionGeometrySchema.optional().nullable().describe("Optional: geometry of the shading obstruction"),
    linke_turbidity: z.number().positive().optional().nullable().describe("Linke turbidity. If omitted, climatological lookup."),
    albedo: z.number().min(0).max(1).optional().default(0.2).describe("Ground reflectivity/albedo (default 0.2)"),
    altitude: altitudeSchema,
  }),
  execute: async ({ latitude, longitude, datetime, surface_tilt_deg, surface_azimuth_deg, area_m2, shgc, obstruction_type, obstruction_geometry, linke_turbidity, albedo, altitude }) => {
    try {
      const res = await solarCalc.calculateHeatGainWindow({
        latitude, longitude, datetime,
        surface_tilt_deg, surface_azimuth_deg,
        area_m2, shgc,
        obstruction_type: obstruction_type ?? undefined,
        obstruction_geometry: obstruction_geometry ?? undefined,
        linke_turbidity, albedo, altitude,
      });
      return { success: true, result: res, calculator_used: "Window Solar Heat Gain Calculator", verify_at: "/dashboard/solar/heat-gain-window" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

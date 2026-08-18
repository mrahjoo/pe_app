import { tool } from "ai";
import { z } from "zod";
import { psychroCalc } from "../api/psychrolib";
import type { UnitSystem } from "../api/psychrolib";

const unitSystemSchema = z.enum(["SI", "IP"]).describe("Unit system: 'SI' (°C, Pa, kg/kg) or 'IP' (°F, psi, lb/lb)");

// ─── 1. Single-Point State Calculator ────────────────────────────────────────

const psychroSchema = z.object({
  dryBulb: z.number().describe("Dry bulb temperature (°C for SI, °F for IP)"),
  pressure: z.number().describe("Atmospheric pressure (Pa for SI, psi for IP)"),
  unit: unitSystemSchema,
  knownPropertyType: z.enum(["relHum", "wetBulb", "dewPoint", "humRatio", "vapPres"])
    .describe("The type of the second known property: relHum (0-1 fraction), wetBulb, dewPoint, humRatio, or vapPres"),
  knownPropertyValue: z.number().describe("The value of the second known property"),
});

export const calculatePsychroStateTool = tool({
  description:
    "Calculate the full psychrometric state of moist air (enthalpy, humidity ratio, dew point, wet bulb, vapour pressure, specific volume, density, VPD, etc.) given dry-bulb temperature, atmospheric pressure, and one other known property.",
  inputSchema: psychroSchema,
  execute: async ({ dryBulb, pressure, unit, knownPropertyType, knownPropertyValue }) => {
    try {
      let res;
      switch (knownPropertyType) {
        case "relHum":
          res = await psychroCalc.fromRelHum(dryBulb, knownPropertyValue, pressure, unit);
          break;
        case "wetBulb":
          res = await psychroCalc.fromWetBulb(dryBulb, knownPropertyValue, pressure, unit);
          break;
        case "dewPoint":
          res = await psychroCalc.fromDewPoint(dryBulb, knownPropertyValue, pressure, unit);
          break;
        case "humRatio":
          res = await psychroCalc.fromHumRatio(dryBulb, knownPropertyValue, pressure, unit);
          break;
        case "vapPres":
          res = await psychroCalc.fromVapPres(dryBulb, knownPropertyValue, pressure, unit);
          break;
      }
      return { success: true, result: res, calculator_used: "Psychrometric State Calculator", verify_at: "/dashboard/psychrometrics/state-calculator" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 2. Atmosphere / Altitude Calculator ─────────────────────────────────────

export const atmosphereFromAltitudeTool = tool({
  description:
    "Convert site elevation (altitude) into standard barometric pressure and dry-bulb temperature using the International Standard Atmosphere model. Useful for establishing the correct pressure for psychrometric calculations at elevated sites.",
  inputSchema: z.object({
    altitude: z.union([z.number(), z.array(z.number())]).describe(
      "Altitude above sea level (m for SI, ft for IP). Can be a single value or an array for batch calculations."
    ),
    unit: unitSystemSchema.optional().default("SI"),
  }),
  execute: async ({ altitude, unit }) => {
    try {
      const res = await psychroCalc.atmosphereFromAltitude({ altitude, unit_system: unit });
      return { success: true, result: res, calculator_used: "Atmosphere / Altitude Calculator", verify_at: "/dashboard/psychrometrics/atmosphere" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 3. Air Mixing Box Calculator ────────────────────────────────────────────

const mixStreamSchema = z.object({
  t_dry_bulb: z.number().optional().nullable().describe("Dry-bulb temperature of this stream"),
  rel_hum: z.number().min(0).max(1).optional().nullable().describe("Relative humidity (0–1)"),
  t_wet_bulb: z.number().optional().nullable().describe("Wet-bulb temperature"),
  t_dew_point: z.number().optional().nullable().describe("Dew-point temperature"),
  hum_ratio: z.number().min(0).optional().nullable().describe("Humidity ratio (kg/kg or lb/lb)"),
  vap_pres: z.number().min(0).optional().nullable().describe("Vapour pressure (Pa or psi)"),
  volumetric_flow: z.number().positive().optional().nullable().describe("Volumetric flow rate"),
  flow_unit: z.string().optional().nullable().describe("Flow unit: 'm3_per_s', 'm3/h', 'l/s', 'cfm', etc."),
  mass_flow_dry_air: z.number().positive().optional().nullable().describe("Mass flow of dry air (kg/s or lb/s)"),
});

export const mixingBoxTool = tool({
  description:
    "Combine two or more moist-air streams in a mixing box and compute the resultant mixed-air state. Each stream is described by its temperature, one humidity property, and a flow rate (volumetric or mass). Returns the mixed state plus per-stream mass fractions.",
  inputSchema: z.object({
    unit: unitSystemSchema.optional().default("SI"),
    pressure: z.number().positive().describe("Atmospheric pressure (Pa for SI, psi for IP)"),
    streams: z.array(mixStreamSchema).min(2).describe("At least two air streams to mix"),
  }),
  execute: async ({ unit, pressure, streams }) => {
    try {
      const res = await psychroCalc.mix({ unit_system: unit, pressure, streams });
      return { success: true, result: res, calculator_used: "Air Mixing Box Calculator", verify_at: "/dashboard/psychrometrics/mixing-box" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 4. Psychrometric Process Classifier ─────────────────────────────────────

const statePointInputSchema = z.object({
  t_dry_bulb: z.number().describe("Dry-bulb temperature"),
  rel_hum: z.number().min(0).max(1).optional().nullable().describe("Relative humidity (0–1)"),
  t_wet_bulb: z.number().optional().nullable().describe("Wet-bulb temperature"),
  t_dew_point: z.number().optional().nullable().describe("Dew-point temperature"),
  hum_ratio: z.number().min(0).optional().nullable().describe("Humidity ratio (kg/kg or lb/lb)"),
  vap_pres: z.number().min(0).optional().nullable().describe("Vapour pressure (Pa or psi)"),
  enthalpy: z.number().optional().nullable().describe("Specific enthalpy (J/kg_dry_air or Btu/lb)"),
});

// PsychroState uses `number | undefined` (not null) — strip nulls before passing to the API
type StripNulls<T> = { [K in keyof T]: NonNullable<T[K]> | undefined };
function stripNulls<T extends object>(obj: T): StripNulls<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v])
  ) as StripNulls<T>;
}

export const classifyProcessTool = tool({
  description:
    "Compare two psychrometric state points (entering and leaving an HVAC component) to classify the process type (heating, cooling, humidification, dehumidification, or combined), calculate sensible heat ratio (SHR), enthalpy change, and the 16-direction process label.",
  inputSchema: z.object({
    unit: unitSystemSchema.optional().default("SI"),
    pressure: z.number().positive().describe("Atmospheric pressure (Pa for SI, psi for IP)"),
    point_a: statePointInputSchema.describe("Entering air state (dry-bulb + one humidity property required)"),
    point_b: statePointInputSchema.describe("Leaving air state (dry-bulb + one humidity property required)"),
  }),
  execute: async ({ unit, pressure, point_a, point_b }) => {
    try {
      const res = await psychroCalc.classifyProcess({ unit_system: unit, pressure, point_a: stripNulls(point_a), point_b: stripNulls(point_b) });
      return { success: true, result: res, calculator_used: "Psychrometric Process Classifier", verify_at: "/dashboard/psychrometrics/process" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 5. Coil ADP / Bypass Factor Tool ────────────────────────────────────────

export const coilAdpBfTool = tool({
  description:
    "Calculate the Apparatus Dew Point (ADP), Bypass Factor (BF), and Contact Factor for a cooling coil given entering and leaving air states, or given entering state and a target SHR. Also computes the coil condition line slope. Essential for HVAC coil selection and performance analysis.",
  inputSchema: z.object({
    unit: unitSystemSchema.optional().default("SI"),
    pressure: z.number().positive().describe("Atmospheric pressure (Pa for SI, psi for IP)"),
    entering_state: statePointInputSchema.describe("Entering air state (dry-bulb + one humidity property required)"),
    leaving_state: statePointInputSchema.optional().nullable().describe("Leaving air state — provide this OR target_shr"),
    target_shr: z.number().min(0).max(1).optional().nullable().describe("Target Sensible Heat Ratio — provide this OR leaving_state"),
    leaving_dry_bulb: z.number().optional().nullable().describe("Target leaving dry-bulb temperature (used with target_shr)"),
    bypass_factor: z.number().min(0).max(1).optional().nullable().describe("Coil bypass factor (used with target_shr to calculate leaving state)"),
  }),
  execute: async ({ unit, pressure, entering_state, leaving_state, target_shr, leaving_dry_bulb, bypass_factor }) => {
    try {
      const res = await psychroCalc.coilAdpBf({
        unit_system: unit,
        pressure,
        entering_state: stripNulls(entering_state),
        leaving_state: leaving_state ? stripNulls(leaving_state) : leaving_state,
        target_shr,
        leaving_dry_bulb,
        bypass_factor,
      });
      return { success: true, result: res, calculator_used: "Coil Selection Tool (ADP & Bypass Factor)", verify_at: "/dashboard/psychrometrics/coil-selection" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// ─── 6. General HVAC Process (Apply Process) ─────────────────────────────────

export const applyProcessTool = tool({
  description:
    "Calculate the leaving air state after applying a sensible/latent HVAC load to an entering air stream. Provide the entering state, atmospheric pressure, airflow (mass or volumetric), and the load (sensible, latent, total, or SHR). Returns the leaving state plus full process classification. Use for heating coils, cooling coils, humidifiers, dehumidifiers, or any general HVAC process.",
  inputSchema: z.object({
    unit: unitSystemSchema.optional().default("SI"),
    pressure: z.number().positive().describe("Atmospheric pressure (Pa for SI, psi for IP)"),
    entering_state: statePointInputSchema.describe("Entering air state (dry-bulb + one humidity property required)"),
    mass_flow_dry_air: z.number().positive().optional().nullable().describe("Mass flow rate of dry air (kg/s for SI, lb/s for IP)"),
    volumetric_flow: z.number().positive().optional().nullable().describe("Volumetric flow rate"),
    flow_unit: z.string().optional().nullable().describe("Volumetric flow unit: 'm3_per_s', 'm3/h', 'l/s', 'cfm', etc."),
    sensible_load: z.number().optional().nullable().describe("Sensible load (W or Btu/h). Positive = heating, negative = cooling"),
    latent_load: z.number().optional().nullable().describe("Latent load (W or Btu/h). Positive = humidification, negative = dehumidification"),
    total_load: z.number().optional().nullable().describe("Total load (W or Btu/h)"),
    sensible_heat_ratio: z.number().optional().nullable().describe("Sensible heat ratio SHR = Q_sen / Q_tot (use with total_load)"),
    load_unit: z.string().optional().nullable().describe("Load unit override: 'W', 'kW', 'btu/h', 'TR', 'ton'. Defaults to W (SI) or btu/h (IP)"),
  }),
  execute: async ({ unit, pressure, entering_state, mass_flow_dry_air, volumetric_flow, flow_unit, sensible_load, latent_load, total_load, sensible_heat_ratio, load_unit }) => {
    try {
      const res = await psychroCalc.applyProcess({
        unit_system: unit,
        pressure,
        entering_state: stripNulls(entering_state),
        mass_flow_dry_air,
        volumetric_flow,
        flow_unit,
        sensible_load,
        latent_load,
        total_load,
        sensible_heat_ratio,
        load_unit,
      });
      return { success: true, result: res, calculator_used: "General HVAC Process Calculator", verify_at: "/dashboard/psychrometrics/general-process" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

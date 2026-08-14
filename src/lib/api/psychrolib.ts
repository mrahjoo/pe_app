export const PSYCHROLIB_API_BASE_URL = "/api/psychrolib/api/v1";

export type UnitSystem = "SI" | "IP";

export interface PsychroState {
  t_dry_bulb: number;
  t_wet_bulb: number;
  t_dew_point: number;
  rel_hum: number;
  hum_ratio: number;
  vap_pres: number;
  enthalpy: number;
  volume: number;
  degree_of_saturation: number;
  unit_system: UnitSystem;
  density?: number | null;
  vapor_pressure_deficit?: number | null;
}

export interface PsychroStateBatch {
  results: PsychroState[];
  count: number;
}

export interface ProcessMagnitude {
  delta_t_dry_bulb_abs: number;
  delta_hum_ratio_abs: number;
}

export interface ProcessClassifyResponse {
  point_a: PsychroState;
  point_b: PsychroState;
  delta_t_dry_bulb: number;
  delta_hum_ratio: number;
  delta_enthalpy: number;
  angle_deg: number;
  direction_16: string;
  process_type: string;
  process_label: string;
  sensible_component: string;
  latent_component: string;
  dominant_component: string;
  sensible_heat_ratio: number;
  magnitude: ProcessMagnitude;
}

export interface MixStreamDetail {
  state: PsychroState;
  dry_air_mass_flow: number;
  mass_fraction: number;
}

export interface MixResponse {
  mixed_state: PsychroState;
  total_dry_air_mass_flow: number;
  stream_details: MixStreamDetail[];
}

export interface MixStreamInput {
  volumetric_flow?: number | null;
  flow_unit?: string | null;
  mass_flow_dry_air?: number | null;
  t_dry_bulb?: number | null;
  rel_hum?: number | null;
  t_wet_bulb?: number | null;
  t_dew_point?: number | null;
  hum_ratio?: number | null;
  vap_pres?: number | null;
  state?: PsychroState | null;
}

export interface MixRequest {
  unit_system: UnitSystem;
  pressure: number;
  streams: MixStreamInput[];
}

export interface ProcessClassifyRequest {
  unit_system: UnitSystem;
  pressure: number;
  point_a: Partial<PsychroState>; // Using Partial for flexibility
  point_b: Partial<PsychroState>;
}

// Reusable fetch function with error handling
async function fetchPsychrolib<T>(endpoint: string, body: any): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer ? (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") : "";
  const url = `${baseUrl}${PSYCHROLIB_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorDetail = "API Error";
    try {
      const errorData = await response.json();
      errorDetail = JSON.stringify(errorData);
    } catch (e) {}
    throw new Error(`Error ${response.status}: ${errorDetail}`);
  }

  return response.json();
}

// --- API Client Methods ---

export const psychroCalc = {
  fromRelHum: (t_dry_bulb: number, rel_hum: number, pressure: number, unit_system: UnitSystem = "SI") => 
    fetchPsychrolib<PsychroState | PsychroStateBatch>("/calc/from-rel-hum", { t_dry_bulb, rel_hum, pressure, unit_system }),
    
  fromWetBulb: (t_dry_bulb: number, t_wet_bulb: number, pressure: number, unit_system: UnitSystem = "SI") => 
    fetchPsychrolib<PsychroState | PsychroStateBatch>("/calc/from-wet-bulb", { t_dry_bulb, t_wet_bulb, pressure, unit_system }),
    
  fromDewPoint: (t_dry_bulb: number, t_dew_point: number, pressure: number, unit_system: UnitSystem = "SI") => 
    fetchPsychrolib<PsychroState | PsychroStateBatch>("/calc/from-dew-point", { t_dry_bulb, t_dew_point, pressure, unit_system }),
    
  fromHumRatio: (t_dry_bulb: number, hum_ratio: number, pressure: number, unit_system: UnitSystem = "SI") => 
    fetchPsychrolib<PsychroState | PsychroStateBatch>("/calc/from-hum-ratio", { t_dry_bulb, hum_ratio, pressure, unit_system }),
    
  fromVapPres: (t_dry_bulb: number, vap_pres: number, pressure: number, unit_system: UnitSystem = "SI") => 
    fetchPsychrolib<PsychroState | PsychroStateBatch>("/calc/from-vap-pres", { t_dry_bulb, vap_pres, pressure, unit_system }),
    
  mix: (request: MixRequest) => 
    fetchPsychrolib<MixResponse>("/calc/mix", request),
    
  classifyProcess: (request: ProcessClassifyRequest) => 
    fetchPsychrolib<ProcessClassifyResponse>("/process/classify", request),
};

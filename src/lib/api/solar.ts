export const SOLAR_API_BASE_URL = "/api/solar";

// Models & Results from OpenAPI Spec
export interface AlgorithmInfo {
  name: string;
  description: string;
  is_default?: boolean;
}

export interface ClearSkyModelInfo {
  name: string;
  description: string;
  is_default?: boolean;
}

export type ClearSkyModel = "ineichen" | "haurwitz" | "simplified_solis";

export interface SolarPositionRequest {
  latitude: number;
  longitude: number;
  datetime: string;
  altitude?: number;
  pressure?: number | null;
  temperature?: number | null;
}

export interface SolarPositionResult {
  zenith: number;
  azimuth: number;
  elevation: number;
  apparent_zenith: number;
  apparent_elevation: number;
  equation_of_time: number;
  timestamp_utc: string;
}

export interface SunTimesRequest {
  latitude: number;
  longitude: number;
  date: string;
  timezone: string;
}

export interface SolarNoonResult {
  solar_noon: string;
  solar_time_offset_minutes: number;
  date: string;
  timezone: string;
}

export interface SunTimesResult {
  sunrise: string;
  sunset: string;
  day_length_minutes: number;
  date: string;
  timezone: string;
}

export interface SunPathRequest {
  latitude: number;
  longitude: number;
  start_datetime: string;
  end_datetime: string;
  interval_minutes?: number;
  altitude?: number;
}

export interface SunPathPoint {
  timestamp: string;
  zenith: number;
  azimuth: number;
  elevation: number;
}

export interface SunPathResult {
  points: SunPathPoint[];
  count: number;
  start: string;
  end: string;
  interval_minutes: number;
}

export interface DeclinationEotResult {
  declination_deg: number;
  equation_of_time_minutes: number;
  day_of_year: number;
}

export interface IrradianceRequest {
  latitude: number;
  longitude: number;
  datetime: string;
  surface_tilt_deg: number;
  surface_azimuth_deg: number;
  linke_turbidity?: number | null;
  albedo?: number;
  altitude?: number;
}

export interface IrradianceResult {
  dni: number;
  dhi: number;
  ghi: number;
  poa_direct: number;
  poa_diffuse: number;
  poa_global: number;
  timestamp_utc: string;
}

export interface ClearSkyRequest {
  latitude: number;
  longitude: number;
  datetime: string;
  model?: ClearSkyModel;
  linke_turbidity?: number | null;
  altitude?: number;
}

export interface ClearSkyResult {
  dni: number;
  dhi: number;
  ghi: number;
  model_used: string;
  timestamp_utc: string;
}

export interface IncidenceAngleRequest {
  latitude: number;
  longitude: number;
  datetime: string;
  surface_tilt_deg: number;
  surface_azimuth_deg: number;
  altitude?: number;
}

export interface IncidenceAngleResult {
  aoi_deg: number;
  solar_position: SolarPositionResult;
}

export type ObstructionType = "overhang" | "fin" | "custom";

export interface ObstructionGeometry {
  depth: number;
  offset?: number;
  window_height?: number;
}

export interface ShadingAngleRequest {
  latitude: number;
  longitude: number;
  datetime: string;
  obstruction_type: ObstructionType;
  obstruction_geometry: ObstructionGeometry;
  surface_azimuth_deg: number;
  altitude?: number;
}

export interface ShadingResult {
  profile_angle_deg: number;
  horizontal_shadow_angle_deg: number;
  is_shaded: boolean;
  shading_factor: number;
  solar_elevation_deg: number;
}

export interface HeatGainWindowRequest {
  latitude: number;
  longitude: number;
  datetime: string;
  surface_tilt_deg: number;
  surface_azimuth_deg: number;
  area_m2: number;
  shgc: number;
  obstruction_type?: ObstructionType | null;
  obstruction_geometry?: ObstructionGeometry | null;
  linke_turbidity?: number | null;
  albedo?: number;
  altitude?: number;
}

export interface HeatGainResult {
  heat_gain_w: number;
  heat_gain_btu_h: number;
  poa_irradiance_w_m2: number;
  shading_factor_applied: number;
  timestamp_utc: string;
}

// Fetch wrapper
async function fetchSolar<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer ? (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") : "";
  const url = `${baseUrl}${SOLAR_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
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

// API Methods
export const solarCalc = {
  // GET
  getAlgorithms: () => fetchSolar<AlgorithmInfo[]>("/api/v1/algorithms/"),
  getClearSkyModels: () => fetchSolar<ClearSkyModelInfo[]>("/api/v1/clear-sky-models/"),
  getDeclinationEot: (params: { date?: string; day_of_year?: number }) => {
    const query = new URLSearchParams();
    if (params.date) query.append("date", params.date);
    if (params.day_of_year) query.append("day_of_year", params.day_of_year.toString());
    return fetchSolar<DeclinationEotResult>(`/api/v1/declination-eot?${query.toString()}`);
  },

  // POST
  calculatePosition: (request: SolarPositionRequest) => fetchSolar<SolarPositionResult>("/api/v1/position", { method: "POST", body: JSON.stringify(request) }),
  calculateNoon: (request: SunTimesRequest) => fetchSolar<SolarNoonResult>("/api/v1/noon", { method: "POST", body: JSON.stringify(request) }),
  calculateSunriseSunset: (request: SunTimesRequest) => fetchSolar<SunTimesResult>("/api/v1/sunrise-sunset", { method: "POST", body: JSON.stringify(request) }),
  calculatePath: (request: SunPathRequest) => fetchSolar<SunPathResult>("/api/v1/path", { method: "POST", body: JSON.stringify(request) }),
  calculateIrradiance: (request: IrradianceRequest) => fetchSolar<IrradianceResult>("/api/v1/irradiance", { method: "POST", body: JSON.stringify(request) }),
  calculateClearSkyModel: (request: ClearSkyRequest) => fetchSolar<ClearSkyResult>("/api/v1/clear-sky-model", { method: "POST", body: JSON.stringify(request) }),
  calculateIncidenceAngle: (request: IncidenceAngleRequest) => fetchSolar<IncidenceAngleResult>("/api/v1/incidence-angle", { method: "POST", body: JSON.stringify(request) }),
  calculateShadingAngle: (request: ShadingAngleRequest) => fetchSolar<ShadingResult>("/api/v1/shading-angle", { method: "POST", body: JSON.stringify(request) }),
  calculateHeatGainWindow: (request: HeatGainWindowRequest) => fetchSolar<HeatGainResult>("/api/v1/heat-gain-window", { method: "POST", body: JSON.stringify(request) }),
};

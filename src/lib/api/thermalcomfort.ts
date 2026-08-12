export const THERMALCOMFORT_API_BASE_URL = "/api/comfort/api/v1/comfort";

export interface PmvPpdRequest {
  tdb: number | number[];
  tr: number | number[];
  vr: number | number[];
  rh: number | number[];
  met: number | number[];
  clo: number | number[];
  model?: "7730-2005" | "ashrae";
  units?: "SI" | "IP";
}

export interface PmvPpdResponse {
  pmv: number | number[];
  ppd: number | number[];
}

export interface UtciRequest {
  tdb: number | number[];
  tr: number | number[];
  v: number | number[];
  rh: number | number[];
}

export interface UtciResponse {
  utci: number | number[];
  stress_category: string | string[];
}

export interface SetTmpRequest {
  tdb: number | number[];
  tr: number | number[];
  v: number | number[];
  rh: number | number[];
  met: number | number[];
  clo: number | number[];
}

export interface SetTmpResponse {
  set: number | number[];
}

export interface WorkCapacityRequest {
  tdb: number | number[];
  tr: number | number[];
  v: number | number[];
  rh: number | number[];
  met: number | number[];
  clo: number | number[];
}

export interface GenericResponse {
  result: any;
}

async function fetchComfort<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${THERMALCOMFORT_API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
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

export const comfortApi = {
  pmvPpd: (request: PmvPpdRequest) => 
    fetchComfort<PmvPpdResponse>("/pmv-ppd", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  utci: (request: UtciRequest) => 
    fetchComfort<UtciResponse>("/utci", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  set: (request: SetTmpRequest) => 
    fetchComfort<SetTmpResponse>("/set", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  niosh: (request: WorkCapacityRequest) => 
    fetchComfort<GenericResponse>("/work-capacity/niosh", {
      method: "POST",
      body: JSON.stringify(request),
    }),
};

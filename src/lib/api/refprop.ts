export const REFPROP_API_BASE_URL = "/api/refprop/api/v1";

export interface PropertyValue {
  value: number | null;
  unit: string;
}

export interface SubstanceList {
  fluids: string[];
  mixtures: string[];
}

export interface ComponentInfo {
  name: string;
  cas_number: string;
  molar_mass: PropertyValue;
  triple_point_temp: PropertyValue;
  normal_boiling_point_temp: PropertyValue;
  critical_temp: PropertyValue;
  critical_pressure: PropertyValue;
  critical_density: PropertyValue;
  critical_compressibility: PropertyValue;
  acentric_factor: PropertyValue;
  dipole_moment: PropertyValue;
  gas_constant: PropertyValue;
  chem_form?: string | null;
  synonym?: string | null;
  family?: string | null;
  safety_ashrae?: string | null;
  gwp?: PropertyValue | null;
  odp?: PropertyValue | null;
}

export interface OverallInfo {
  molar_mass: PropertyValue;
  critical_temp: PropertyValue;
  critical_pressure: PropertyValue;
  critical_density: PropertyValue;
  acentric_factor: PropertyValue;
  triple_point_temp: PropertyValue;
}

export interface SubstanceInfo {
  overall: OverallInfo;
  components: ComponentInfo[];
}

export interface CalcRequest {
  fluids: string[];
  composition: number[];
  basis?: "mole" | "mass";
  hIn: string;
  a: number;
  b: number;
  hOut?: string | null;
  unit_system?: string;
}

export interface CalcResponse {
  state?: Record<string, PropertyValue> | null;
  values?: number[] | null;
  units?: string | null;
  quality?: number | null;
  ierr: number;
  herr?: string | null;
}

async function fetchRefprop<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${REFPROP_API_BASE_URL}${endpoint}`;
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

export const refpropApi = {
  listSubstances: () => 
    fetchRefprop<SubstanceList>("/substance"),

  getSubstanceInfo: (id: string) => 
    fetchRefprop<SubstanceInfo>(`/substance/${encodeURIComponent(id)}/info`),

  calc: (request: CalcRequest) => 
    fetchRefprop<CalcResponse>("/calc", {
      method: "POST",
      body: JSON.stringify(request),
    }),
};

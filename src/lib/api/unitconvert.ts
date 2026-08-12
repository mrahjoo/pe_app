export const UNITCONVERT_API_BASE_URL = "/api/unitconvert/api/v1";

export interface CategoryResponse {
  id: string;
  name: string;
  baseUnit: string;
}

export interface UnitResponse {
  id: string;
  name: string;
  symbol: string;
  aliases: string[];
}

export interface ConvertRequest {
  value: number;
  from_unit: string;
  to_unit: string;
  category?: string | null;
}

export interface ConvertResponse {
  category: string;
  from_unit: string;
  to_unit: string;
  input_value: number;
  output_value: number;
  formula_applied: string;
}

async function fetchUnitConvert<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${UNITCONVERT_API_BASE_URL}${endpoint}`;
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

export const unitConvertApi = {
  getCategories: () => 
    fetchUnitConvert<CategoryResponse[]>("/categories/"),

  getUnitsByCategory: (categoryId: string) => 
    fetchUnitConvert<UnitResponse[]>(`/categories/${categoryId}/units/`),

  convert: (request: ConvertRequest) => 
    fetchUnitConvert<ConvertResponse>("/convert/", {
      method: "POST",
      body: JSON.stringify(request),
    }),
};

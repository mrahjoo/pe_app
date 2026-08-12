# Unit Converter Module

The Unit Converter is a generic tool located in the Dashboard (`/dashboard/unit-converter`) designed to facilitate quick unit conversions across various measurement categories. 

## Features
- **Dynamic Categories**: Fetches available categories (e.g., Temperature, Length, Area) directly from the `pe_unitconvert` microservice API.
- **Contextual Units**: Loads valid "from" and "to" units based on the selected category to prevent invalid cross-category conversions.
- **Formula Transparency**: Displays the underlying algebraic formula applied for the conversion (e.g. `(x - 32) * 5/9`).

## Technical Architecture

The module interacts with the FastAPI backend defined in `unitconvert_proexergy.json`. 

### Proxy Setup
Next.js handles CORS and routing by proxying the frontend requests via `next.config.ts`:
```ts
{
  source: '/api/unitconvert/:path*',
  destination: 'https://api.proexergy.com/unitconvert/:path*',
}
```

### API Client
The client logic resides in `src/lib/api/unitconvert.ts`. It provides typed methods for:
- `getCategories()`: Returns a list of supported categories and base units.
- `getUnitsByCategory(categoryId)`: Returns aliases and symbols for a category.
- `convert(request)`: Executes the conversion engine and returns the calculated output and formula.

## Example Usage (Frontend)

```typescript
import { unitConvertApi } from "@/lib/api/unitconvert";

// Convert 25 Celsius to Fahrenheit
const response = await unitConvertApi.convert({
  value: 25,
  from_unit: "celsius",
  to_unit: "fahrenheit",
  category: "temperature"
});

console.log(response.output_value); // 77.0
```

## Troubleshooting
- **422 Validation Error**: Occurs when units don't match the same category (e.g., converting Celsius to Meters).
- **404 Error**: Attempting to load an invalid category ID.

import { tool } from "ai";
import { z } from "zod";
import { unitConvertApi } from "../api/unitconvert";

const convertSchema = z.object({
  value: z.number().describe("The numerical value to convert"),
  from_unit: z.string().describe("The unit to convert from (e.g. 'm', 'kg', 'J')"),
  to_unit: z.string().describe("The unit to convert to (e.g. 'ft', 'lb', 'Btu')"),
  category: z.string().optional().describe("Optional category of the conversion (e.g. 'Length', 'Mass', 'Energy')"),
});

export const convertUnitTool = tool({
  description: "Convert a value from one unit to another.",
  inputSchema: convertSchema,
  execute: async (args) => {
    try {
      const res = await unitConvertApi.convert(args as any);
      return { success: true, result: res };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

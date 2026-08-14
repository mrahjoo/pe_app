import { tool } from "ai";
import { z } from "zod";
import { psychroCalc } from "../api/psychrolib";
import type { UnitSystem } from "../api/psychrolib";

const psychroSchema = z.object({
  dryBulb: z.number().describe("Dry bulb temperature"),
  pressure: z.number().describe("Atmospheric pressure (e.g. 101325 Pa in SI)"),
  unit: z.enum(["SI", "IP"]).describe("Unit system (SI or IP)"),
  knownPropertyType: z.enum(["relHum", "wetBulb", "dewPoint", "humRatio", "vapPres"])
    .describe("The type of the other known property. relHum (0-1), wetBulb, dewPoint, humRatio, or vapPres"),
  knownPropertyValue: z.number().describe("The value of the other known property"),
});

export const calculatePsychroStateTool = tool({
  description: "Calculate the psychrometric properties of air (enthalpy, humidity ratio, dew point, wet bulb, etc.) given dry bulb temperature, pressure, and one other known property.",
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
      return { success: true, result: res };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

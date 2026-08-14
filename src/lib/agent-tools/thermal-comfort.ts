import { tool } from "ai";
import { z } from "zod";
import { comfortApi } from "../api/thermalcomfort";

const pmvSchema = z.object({
  tdb: z.number().describe("Dry bulb air temperature"),
  tr: z.number().describe("Mean radiant temperature"),
  vr: z.number().describe("Relative air velocity"),
  rh: z.number().describe("Relative humidity (0-100)"),
  met: z.number().describe("Metabolic rate (e.g. 1.0)"),
  clo: z.number().describe("Clothing insulation (e.g. 0.5)"),
  model: z.enum(["7730-2005", "ashrae"]).optional().describe("Standard model to use"),
  units: z.enum(["SI", "IP"]).optional(),
});

export const calculatePMVTool = tool({
  description: "Calculate Predicted Mean Vote (PMV) and Predicted Percentage of Dissatisfied (PPD) thermal comfort indices.",
  inputSchema: pmvSchema,
  execute: async (args) => {
    try {
      const res = await comfortApi.pmvPpd(args as any);
      return { success: true, result: res };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

const utciSchema = z.object({
  tdb: z.number().describe("Dry bulb air temperature"),
  tr: z.number().describe("Mean radiant temperature"),
  v: z.number().describe("Air velocity"),
  rh: z.number().describe("Relative humidity (0-100)"),
});

export const calculateUTCITool = tool({
  description: "Calculate Universal Thermal Climate Index (UTCI).",
  inputSchema: utciSchema,
  execute: async (args) => {
    try {
      const res = await comfortApi.utci(args as any);
      return { success: true, result: res };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

const setSchema = z.object({
  tdb: z.number().describe("Dry bulb air temperature"),
  tr: z.number().describe("Mean radiant temperature"),
  v: z.number().describe("Air velocity"),
  rh: z.number().describe("Relative humidity (0-100)"),
  met: z.number().describe("Metabolic rate"),
  clo: z.number().describe("Clothing insulation"),
});

export const calculateSETTool = tool({
  description: "Calculate Standard Effective Temperature (SET).",
  inputSchema: setSchema,
  execute: async (args) => {
    try {
      const res = await comfortApi.set(args as any);
      return { success: true, result: res };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

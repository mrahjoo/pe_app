import { tool } from "ai";
import { z } from "zod";
import { refpropApi } from "../api/refprop";

const thermoSchema = z.object({
  fluids: z.array(z.string()).describe("List of fluids (e.g. ['Water'] or ['Methane', 'Ethane'])"),
  composition: z.array(z.number()).describe("Mass or mole fractions of the fluids. Must match fluids array length."),
  basis: z.enum(["mole", "mass"]).optional().describe("Basis of composition (mole or mass)"),
  hIn: z.string().describe("Input state variables string (e.g. 'PT' for Pressure-Temperature, 'PH' for Pressure-Enthalpy)"),
  a: z.number().describe("First input state variable value"),
  b: z.number().describe("Second input state variable value"),
  hOut: z.string().optional().describe("Output state variables string (e.g. 'D' for density, 'H' for enthalpy, 'S' for entropy, or comma separated like 'D,H,S'). If null, returns all."),
  unit_system: z.string().optional().describe("Unit system, e.g. 'SI'"),
});

export const calculateFluidStateTool = tool({
  description: "Calculate thermodynamic properties of a fluid state using REFPROP API. Provide fluids, composition, and input state parameters.",
  inputSchema: thermoSchema,
  execute: async (args) => {
    try {
      const res = await refpropApi.calc(args as any);
      return { success: true, result: res };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

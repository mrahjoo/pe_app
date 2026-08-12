"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { psychroCalc, PsychroState, UnitSystem } from "@/lib/api/psychrolib";

export default function CoolingCoilPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  
  const [volFlow, setVolFlow] = useState<string>("1.5"); // m3/s or cfm
  
  // Entering
  const [dbEnt, setDbEnt] = useState<string>("28");
  const [rhEnt, setRhEnt] = useState<string>("60");
  
  // Leaving
  const [dbLvg, setDbLvg] = useState<string>("12");
  const [rhLvg, setRhLvg] = useState<string>("90");
  
  const [result, setResult] = useState<{
    entering: PsychroState;
    leaving: PsychroState;
    massFlow: number;
    totalLoad: number; // kW or Btu/hr
    sensibleLoad: number;
    latentLoad: number;
    shr: number;
    moistureRemoval: number; // kg/s or lb/hr
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const p = parseFloat(pressure);
      const flow = parseFloat(volFlow);
      const dbe = parseFloat(dbEnt);
      const rhe = parseFloat(rhEnt) / 100;
      const dbl = parseFloat(dbLvg);
      const rhl = parseFloat(rhLvg) / 100;

      if ([p, flow, dbe, rhe, dbl, rhl].some(isNaN)) {
        throw new Error("Please enter valid numbers for all fields.");
      }

      // Step 1: Get entering state to find density
      const entRes = await psychroCalc.fromRelHum(dbe, rhe, p, unit);
      const entering = "results" in entRes ? entRes.results[0] : (entRes as PsychroState);
      
      // Step 2: Get leaving state
      const lvgRes = await psychroCalc.fromRelHum(dbl, rhl, p, unit);
      const leaving = "results" in lvgRes ? lvgRes.results[0] : (lvgRes as PsychroState);

      // Step 3: Get process classification for SHR
      const process = await psychroCalc.classifyProcess({
          pressure: p,
          unit_system: unit,
          point_a: { t_dry_bulb: dbe, rel_hum: rhe },
          point_b: { t_dry_bulb: dbl, rel_hum: rhl }
      });

      // Check if it's actually cooling
      if (process.delta_enthalpy > 0) {
          throw new Error("This process represents heating, not cooling. Leaving enthalpy is higher than entering.");
      }

      // Calculations
      // mass_flow (kg/s or lb/min) = volume_flow / specific_volume (m3/kg or ft3/lb)
      const massFlow = flow / entering.volume; // SI: kg/s, IP: lb/min
      
      let totalLoad, sensibleLoad, latentLoad, moistureRemoval;

      if (unit === "SI") {
          // Delta H is J/kg. massFlow is kg/s. Load = kg/s * J/kg = J/s = W. 
          // Divide by 1000 for kW.
          // Note: delta_enthalpy from process might be signed (negative for cooling).
          totalLoad = (Math.abs(process.delta_enthalpy) * massFlow) / 1000; // kW
          moistureRemoval = Math.abs(process.delta_hum_ratio) * massFlow * 3600; // kg/h
      } else {
          // Delta H is Btu/lb. massFlow is lb/min. Load = lb/min * Btu/lb = Btu/min.
          // Multiply by 60 for Btu/hr.
          totalLoad = Math.abs(process.delta_enthalpy) * massFlow * 60; // Btu/hr
          moistureRemoval = Math.abs(process.delta_hum_ratio) * massFlow * 60; // lb/hr
      }

      sensibleLoad = totalLoad * process.sensible_heat_ratio;
      latentLoad = totalLoad - sensibleLoad;

      setResult({
          entering,
          leaving,
          massFlow,
          totalLoad,
          sensibleLoad,
          latentLoad,
          shr: process.sensible_heat_ratio,
          moistureRemoval
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cooling Coil Load Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the total, sensible, and latent cooling loads required to treat a specific volume of air.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Inputs</CardTitle>
            <CardDescription>Enter airflows and coil conditions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit System</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as UnitSystem)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SI">SI (°C, Pa, m³/s, kW)</SelectItem>
                    <SelectItem value="IP">IP (°F, psi, cfm, Btu/hr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pressure ({unit === "SI" ? "Pa" : "psi"})</Label>
                <Input value={pressure} onChange={(e) => setPressure(e.target.value)} type="number" />
              </div>
            </div>

            <div className="space-y-2">
                <Label>Volumetric Airflow ({unit === "SI" ? "m³/s" : "cfm"})</Label>
                <Input value={volFlow} onChange={(e) => setVolFlow(e.target.value)} type="number" />
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold text-sm">Entering Air</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                        <Input value={dbEnt} onChange={(e) => setDbEnt(e.target.value)} type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Rel. Humidity (%)</Label>
                        <Input value={rhEnt} onChange={(e) => setRhEnt(e.target.value)} type="number" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold text-sm">Leaving Air (Target)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                        <Input value={dbLvg} onChange={(e) => setDbLvg(e.target.value)} type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Rel. Humidity (%)</Label>
                        <Input value={rhLvg} onChange={(e) => setRhLvg(e.target.value)} type="number" />
                    </div>
                </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              {loading ? "Calculating Load..." : "Calculate Coil Load"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coil Load Results</CardTitle>
            <CardDescription>Required cooling capacity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-lg p-6 bg-primary/5 border-primary/20 text-center space-y-1">
                        <div className="text-sm font-semibold text-primary uppercase tracking-wider">Total Cooling Load</div>
                        <div className="text-5xl font-bold tracking-tighter">
                            {result.totalLoad.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </div>
                        <div className="text-muted-foreground font-medium">
                            {unit === "SI" ? "kW" : "Btu/hr"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase">Sensible Load</div>
                        <div className="font-semibold text-xl">
                             {result.sensibleLoad.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </div>
                        <div className="text-xs text-muted-foreground">{unit === "SI" ? "kW" : "Btu/hr"}</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase">Latent Load</div>
                        <div className="font-semibold text-xl">
                            {result.latentLoad.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </div>
                        <div className="text-xs text-muted-foreground">{unit === "SI" ? "kW" : "Btu/hr"}</div>
                    </div>
                </div>

                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Sensible Heat Ratio (SHR)</TableCell>
                            <TableCell className="text-right font-semibold">{result.shr.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Moisture Removal Rate</TableCell>
                            <TableCell className="text-right">
                                {result.moistureRemoval.toFixed(2)} {unit === "SI" ? "kg/hr" : "lb/hr"}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Mass Flow (Dry Air)</TableCell>
                            <TableCell className="text-right">
                                {result.massFlow.toFixed(3)} {unit === "SI" ? "kg/s" : "lb/min"}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Apparatus Dew Point (approx)</TableCell>
                            <TableCell className="text-right">
                                {result.leaving.t_dew_point.toFixed(1)} {unit === "SI" ? "°C" : "°F"}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
              </>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Enter conditions and click Calculate.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

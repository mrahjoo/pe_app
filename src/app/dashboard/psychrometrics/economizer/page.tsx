"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { psychroCalc, PsychroState, UnitSystem, MixResponse } from "@/lib/api/psychrolib";
import { AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";

export default function EconomizerPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  
  // Outdoor Air
  const [dbOa, setDbOa] = useState<string>("15");
  const [rhOa, setRhOa] = useState<string>("60");
  
  // Return Air
  const [dbRa, setDbRa] = useState<string>("24");
  const [rhRa, setRhRa] = useState<string>("50");

  const [minOaPct, setMinOaPct] = useState<string>("20"); // 20%
  
  const [result, setResult] = useState<{
    oa: PsychroState;
    ra: PsychroState;
    ma: PsychroState;
    isEconomizerViable: boolean;
    controlStrategy: string;
    reasoning: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const p = parseFloat(pressure);
      const valDbOa = parseFloat(dbOa);
      const valRhOa = parseFloat(rhOa) / 100;
      const valDbRa = parseFloat(dbRa);
      const valRhRa = parseFloat(rhRa) / 100;
      const minOa = parseFloat(minOaPct) / 100;

      if ([p, valDbOa, valRhOa, valDbRa, valRhRa, minOa].some(isNaN)) {
        throw new Error("Please enter valid numbers for all fields.");
      }

      // Step 1: Get states
      const oaRes = await psychroCalc.fromRelHum(valDbOa, valRhOa, p, unit);
      const oa = "results" in oaRes ? oaRes.results[0] : (oaRes as PsychroState);
      
      const raRes = await psychroCalc.fromRelHum(valDbRa, valRhRa, p, unit);
      const ra = "results" in raRes ? raRes.results[0] : (raRes as PsychroState);

      // Step 2: Mix at minimum OA (baseline)
      const mixRes = await psychroCalc.mix({
          unit_system: unit,
          pressure: p,
          streams: [
              { mass_flow_dry_air: minOa, state: oa },
              { mass_flow_dry_air: 1 - minOa, state: ra }
          ]
      });

      const ma = mixRes.mixed_state;

      // Step 3: Evaluate Economizer Logic (Differential Enthalpy)
      let isEconomizerViable = false;
      let controlStrategy = "";
      let reasoning = "";

      if (oa.enthalpy < ra.enthalpy) {
          isEconomizerViable = true;
          controlStrategy = "100% Outdoor Air (Free Cooling)";
          reasoning = `The outdoor air enthalpy (${oa.enthalpy.toFixed(1)}) is lower than the return air enthalpy (${ra.enthalpy.toFixed(1)}). Modulate the OA damper up to 100% to reduce mechanical cooling load.`;
      } else {
          isEconomizerViable = false;
          controlStrategy = `Minimum Outdoor Air (${minOaPct}%)`;
          reasoning = `The outdoor air enthalpy (${oa.enthalpy.toFixed(1)}) is higher than the return air enthalpy (${ra.enthalpy.toFixed(1)}). Stay at minimum ventilation to avoid adding unnecessary cooling load.`;
      }

      setResult({
          oa,
          ra,
          ma,
          isEconomizerViable,
          controlStrategy,
          reasoning
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
        <h1 className="text-3xl font-bold tracking-tight">Economizer Decision Tool</h1>
        <p className="text-muted-foreground mt-2">
          Evaluate outdoor air against return air to assess free-cooling potential using differential enthalpy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Air Conditions</CardTitle>
            <CardDescription>Enter outdoor and return air properties.</CardDescription>
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
                    <SelectItem value="SI">SI (°C, Pa, J/kg)</SelectItem>
                    <SelectItem value="IP">IP (°F, psi, Btu/lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pressure ({unit === "SI" ? "Pa" : "psi"})</Label>
                <Input value={pressure} onChange={(e) => setPressure(e.target.value)} type="number" />
              </div>
            </div>

            <div className="space-y-2">
                <Label>Minimum Outdoor Air (%)</Label>
                <Input value={minOaPct} onChange={(e) => setMinOaPct(e.target.value)} type="number" />
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold text-sm">Outdoor Air (OA)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                        <Input value={dbOa} onChange={(e) => setDbOa(e.target.value)} type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Rel. Humidity (%)</Label>
                        <Input value={rhOa} onChange={(e) => setRhOa(e.target.value)} type="number" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold text-sm">Return Air (RA)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                        <Input value={dbRa} onChange={(e) => setDbRa(e.target.value)} type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Rel. Humidity (%)</Label>
                        <Input value={rhRa} onChange={(e) => setRhRa(e.target.value)} type="number" />
                    </div>
                </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              {loading ? "Evaluating..." : "Evaluate Free-Cooling"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision Result</CardTitle>
            <CardDescription>Recommended economizer action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result ? (
              <>
                <div className={`border p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-4 ${result.isEconomizerViable ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    {result.isEconomizerViable ? (
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    ) : (
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    )}
                    <div>
                        <div className="text-xl font-bold">{result.controlStrategy}</div>
                        <div className="text-sm text-muted-foreground mt-2">{result.reasoning}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-muted/20">
                        <div className="text-xs text-muted-foreground uppercase mb-1">OA Enthalpy</div>
                        <div className="text-2xl font-semibold">
                            {result.oa.enthalpy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{unit === "SI" ? "J/kg" : "Btu/lb"}</span>
                        </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/20">
                        <div className="text-xs text-muted-foreground uppercase mb-1">RA Enthalpy</div>
                        <div className="text-2xl font-semibold">
                            {result.ra.enthalpy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{unit === "SI" ? "J/kg" : "Btu/lb"}</span>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-3">Baseline Mixed Air (at {minOaPct}% OA)</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                            <div className="text-muted-foreground mb-1">Temp</div>
                            <div className="font-medium">{result.ma.t_dry_bulb.toFixed(1)} {unit === "SI" ? "°C" : "°F"}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground mb-1">RH</div>
                            <div className="font-medium">{(result.ma.rel_hum * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground mb-1">Enthalpy</div>
                            <div className="font-medium">{result.ma.enthalpy.toFixed(1)}</div>
                        </div>
                    </div>
                </div>
              </>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Enter conditions and click Evaluate.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

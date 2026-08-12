"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { psychroCalc, ProcessClassifyResponse, UnitSystem } from "@/lib/api/psychrolib";
import { ArrowRight, Compass } from "lucide-react";

export default function ProcessClassifierPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  
  const [dbA, setDbA] = useState<string>("25");
  const [rhA, setRhA] = useState<string>("50");
  
  const [dbB, setDbB] = useState<string>("12");
  const [rhB, setRhB] = useState<string>("90");
  
  const [result, setResult] = useState<ProcessClassifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const p = parseFloat(pressure);
      const valDbA = parseFloat(dbA);
      const valRhA = parseFloat(rhA) / 100;
      const valDbB = parseFloat(dbB);
      const valRhB = parseFloat(rhB) / 100;

      if (isNaN(p) || isNaN(valDbA) || isNaN(valRhA) || isNaN(valDbB) || isNaN(valRhB)) {
        throw new Error("Please enter valid numbers for all fields.");
      }

      const res = await psychroCalc.classifyProcess({
        pressure: p,
        unit_system: unit,
        point_a: {
            t_dry_bulb: valDbA,
            rel_hum: valRhA
        },
        point_b: {
            t_dry_bulb: valDbB,
            rel_hum: valRhB
        }
      });

      setResult(res);
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Psychrometric Process Classifier</h1>
        <p className="text-muted-foreground mt-2">
          Compare Point A and Point B to determine the HVAC process type, magnitude, and sensible heat ratio.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Process Points</CardTitle>
            <CardDescription>Enter entering and leaving conditions.</CardDescription>
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
                    <SelectItem value="SI">SI (°C, Pa)</SelectItem>
                    <SelectItem value="IP">IP (°F, psi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pressure ({unit === "SI" ? "Pa" : "psi"})</Label>
                <Input value={pressure} onChange={(e) => setPressure(e.target.value)} type="number" />
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold text-sm">Point A (Entering)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                        <Input value={dbA} onChange={(e) => setDbA(e.target.value)} type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Rel. Humidity (%)</Label>
                        <Input value={rhA} onChange={(e) => setRhA(e.target.value)} type="number" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold text-sm">Point B (Leaving)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                        <Input value={dbB} onChange={(e) => setDbB(e.target.value)} type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Rel. Humidity (%)</Label>
                        <Input value={rhB} onChange={(e) => setRhB(e.target.value)} type="number" />
                    </div>
                </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              {loading ? "Classifying..." : "Classify Process"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Process Analysis</CardTitle>
            <CardDescription>Thermodynamic changes from A to B.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result ? (
              <>
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <div className="text-center">
                        <div className="text-xl font-bold">{dbA}°</div>
                        <div className="text-xs text-muted-foreground">{rhA}% RH</div>
                    </div>
                    <div className="flex flex-col items-center px-4">
                        <div className="text-sm font-semibold mb-1 text-primary">{result.process_label}</div>
                        <ArrowRight className="text-primary w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold">{dbB}°</div>
                        <div className="text-xs text-muted-foreground">{rhB}% RH</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Process Type</div>
                        <div className="font-semibold capitalize">{result.process_type.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Direction</div>
                        <div className="font-semibold flex items-center gap-2">
                            <Compass className="w-4 h-4 text-muted-foreground" />
                            {result.direction_16} ({result.angle_deg.toFixed(1)}°)
                        </div>
                    </div>
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Dominant Component</div>
                        <div className="font-semibold capitalize">{result.dominant_component}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Sensible Heat Ratio (SHR)</div>
                        <div className="font-semibold">{result.sensible_heat_ratio.toFixed(3)}</div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Delta</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead>Unit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Δ Temperature (Dry Bulb)</TableCell>
                            <TableCell className="text-right">{result.delta_t_dry_bulb.toFixed(2)}</TableCell>
                            <TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Δ Humidity Ratio</TableCell>
                            <TableCell className="text-right">{result.delta_hum_ratio.toFixed(5)}</TableCell>
                            <TableCell>{unit === "SI" ? "kg/kg" : "lb/lb"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Δ Enthalpy</TableCell>
                            <TableCell className="text-right">{result.delta_enthalpy.toFixed(2)}</TableCell>
                            <TableCell>{unit === "SI" ? "J/kg" : "Btu/lb"}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
              </>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Enter Points A & B and click Classify.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

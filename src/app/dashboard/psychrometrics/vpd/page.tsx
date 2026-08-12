"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { psychroCalc, PsychroState, UnitSystem } from "@/lib/api/psychrolib";

export default function VPDCalculatorPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  const [dryBulb, setDryBulb] = useState<string>("25");
  const [relHum, setRelHum] = useState<string>("50"); // Percentage for user friendliness
  
  const [result, setResult] = useState<PsychroState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const p = parseFloat(pressure);
      const db = parseFloat(dryBulb);
      const rhPercent = parseFloat(relHum);

      if (isNaN(p) || isNaN(db) || isNaN(rhPercent)) {
        throw new Error("Please enter valid numbers for all fields.");
      }

      const rhFraction = rhPercent / 100;

      const res = await psychroCalc.fromRelHum(db, rhFraction, p, unit);

      if ("results" in res) {
        setResult(res.results[0]);
      } else {
        setResult(res as PsychroState);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine VPD category (example logic for typical indoor grow)
  const getVPDCategory = (vpdPa: number, unitSys: string) => {
    // Convert to kPa for standard horticultural references if SI
    const vpd_kPa = unitSys === "SI" ? vpdPa / 1000 : vpdPa * 6.89476; // rough psi to kPa just for category logic if needed, but let's assume SI for simple logic
    
    // Simplistic categorisation (assuming kPa)
    const val = unitSys === "SI" ? vpdPa / 1000 : vpdPa * 6.89476;
    
    if (val < 0.4) return { label: "Danger (Low)", color: "text-red-500" };
    if (val < 0.8) return { label: "Propagation / Early Veg", color: "text-blue-500" };
    if (val <= 1.2) return { label: "Late Veg / Early Flower", color: "text-green-500" };
    if (val <= 1.6) return { label: "Mid/Late Flower", color: "text-orange-500" };
    return { label: "Danger (High)", color: "text-red-500" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vapor Pressure Deficit (VPD) Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the VPD for agricultural, horticultural, or specialized HVAC applications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Room Conditions</CardTitle>
            <CardDescription>Enter the temperature and relative humidity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label>Air Temperature ({unit === "SI" ? "°C" : "°F"})</Label>
              <Input value={dryBulb} onChange={(e) => setDryBulb(e.target.value)} type="number" />
            </div>

            <div className="space-y-2">
              <Label>Relative Humidity (%)</Label>
              <Input value={relHum} onChange={(e) => setRelHum(e.target.value)} type="number" />
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              {loading ? "Calculating..." : "Calculate VPD"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VPD Result</CardTitle>
            <CardDescription>Vapor Pressure Deficit</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[250px] space-y-6 text-center">
            {result ? (
              <>
                <div className="space-y-2">
                  <div className="text-6xl font-bold tracking-tighter">
                    {result.vapor_pressure_deficit?.toFixed(2)}
                  </div>
                  <div className="text-xl text-muted-foreground font-medium">
                    {unit === "SI" ? "Pa" : "psi"}
                  </div>
                </div>

                {unit === "SI" && result.vapor_pressure_deficit !== undefined && result.vapor_pressure_deficit !== null && (
                  <div className="space-y-1 bg-muted/50 w-full rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground">Category (Horticulture)</div>
                    <div className={`text-xl font-semibold ${getVPDCategory(result.vapor_pressure_deficit, unit).color}`}>
                      {getVPDCategory(result.vapor_pressure_deficit, unit).label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      ({(result.vapor_pressure_deficit / 1000).toFixed(2)} kPa)
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 w-full text-sm text-muted-foreground pt-4 border-t">
                    <div className="text-left">
                        <span className="font-medium">Dew Point:</span> {result.t_dew_point.toFixed(1)} {unit === "SI" ? "°C" : "°F"}
                    </div>
                    <div className="text-right">
                        <span className="font-medium">Wet Bulb:</span> {result.t_wet_bulb.toFixed(1)} {unit === "SI" ? "°C" : "°F"}
                    </div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">
                Enter conditions and click Calculate.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

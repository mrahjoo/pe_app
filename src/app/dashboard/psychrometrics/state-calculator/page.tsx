"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { psychroCalc, PsychroState, UnitSystem } from "@/lib/api/psychrolib";
import { trackEvent } from "@/lib/analytics";

type InputType = "relHum" | "wetBulb" | "dewPoint" | "humRatio" | "vapPres";

export default function StateCalculatorPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  const [dryBulb, setDryBulb] = useState<string>("20");
  const [inputType, setInputType] = useState<InputType>("relHum");
  const [inputValue, setInputValue] = useState<string>("0.5");
  
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
      const val = parseFloat(inputValue);

      if (isNaN(p) || isNaN(db) || isNaN(val)) {
        throw new Error("Please enter valid numbers for all fields.");
      }

      let res: PsychroState | { results: PsychroState[] };
      switch (inputType) {
        case "relHum":
          res = await psychroCalc.fromRelHum(db, val, p, unit);
          break;
        case "wetBulb":
          res = await psychroCalc.fromWetBulb(db, val, p, unit);
          break;
        case "dewPoint":
          res = await psychroCalc.fromDewPoint(db, val, p, unit);
          break;
        case "humRatio":
          res = await psychroCalc.fromHumRatio(db, val, p, unit);
          break;
        case "vapPres":
          res = await psychroCalc.fromVapPres(db, val, p, unit);
          break;
      }

      if ("results" in res) {
        setResult(res.results[0]);
      } else {
        setResult(res as PsychroState);
      }

      // Track the calculation event asynchronously
      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/psychrometrics/state-calculator",
        data: {
          unitSystem: unit,
          pressure: p,
          dryBulb: db,
          inputType,
          inputValue: val
        }
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  const getInputLabel = () => {
    switch (inputType) {
      case "relHum": return "Relative Humidity (0-1)";
      case "wetBulb": return `Wet Bulb Temp (${unit === "SI" ? "°C" : "°F"})`;
      case "dewPoint": return `Dew Point Temp (${unit === "SI" ? "°C" : "°F"})`;
      case "humRatio": return `Humidity Ratio (${unit === "SI" ? "kg/kg" : "lb/lb"})`;
      case "vapPres": return `Vapor Pressure (${unit === "SI" ? "Pa" : "psi"})`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Single-Point State Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the full psychrometric state from dry bulb temperature and one other known property.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter the known state conditions.</CardDescription>
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
              <Label>Dry Bulb Temp ({unit === "SI" ? "°C" : "°F"})</Label>
              <Input value={dryBulb} onChange={(e) => setDryBulb(e.target.value)} type="number" />
            </div>

            <div className="space-y-2">
              <Label>Secondary Property</Label>
              <Select value={inputType} onValueChange={(v) => setInputType(v as InputType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relHum">Relative Humidity</SelectItem>
                  <SelectItem value="wetBulb">Wet Bulb Temp</SelectItem>
                  <SelectItem value="dewPoint">Dew Point Temp</SelectItem>
                  <SelectItem value="humRatio">Humidity Ratio</SelectItem>
                  <SelectItem value="vapPres">Vapor Pressure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{getInputLabel()}</Label>
              <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} type="number" step="0.01" />
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              {loading ? "Calculating..." : "Calculate State"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Full psychrometric state properties.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Dry Bulb Temp</TableCell>
                    <TableCell className="text-right">{result.t_dry_bulb.toFixed(2)}</TableCell>
                    <TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Wet Bulb Temp</TableCell>
                    <TableCell className="text-right">{result.t_wet_bulb.toFixed(2)}</TableCell>
                    <TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Dew Point Temp</TableCell>
                    <TableCell className="text-right">{result.t_dew_point.toFixed(2)}</TableCell>
                    <TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Relative Humidity</TableCell>
                    <TableCell className="text-right">{(result.rel_hum * 100).toFixed(1)}</TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Humidity Ratio</TableCell>
                    <TableCell className="text-right">{result.hum_ratio.toFixed(5)}</TableCell>
                    <TableCell>{unit === "SI" ? "kg/kg" : "lb/lb"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vapor Pressure</TableCell>
                    <TableCell className="text-right">{result.vap_pres.toFixed(1)}</TableCell>
                    <TableCell>{unit === "SI" ? "Pa" : "psi"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Enthalpy</TableCell>
                    <TableCell className="text-right">{result.enthalpy.toFixed(1)}</TableCell>
                    <TableCell>{unit === "SI" ? "J/kg" : "Btu/lb"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Volume</TableCell>
                    <TableCell className="text-right">{result.volume.toFixed(4)}</TableCell>
                    <TableCell>{unit === "SI" ? "m³/kg" : "ft³/lb"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Degree of Saturation</TableCell>
                    <TableCell className="text-right">{result.degree_of_saturation.toFixed(4)}</TableCell>
                    <TableCell>μ</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Enter parameters and click Calculate to see results.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

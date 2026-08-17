"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { psychroCalc, UnitSystem, StdAtmState } from "@/lib/api/psychrolib";
import { trackEvent } from "@/lib/analytics";

export default function AtmosphereCalculatorPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [altitude, setAltitude] = useState<string>("200");
  
  const [result, setResult] = useState<StdAtmState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const alt = parseFloat(altitude);

      if (isNaN(alt)) {
        throw new Error("Please enter a valid number for altitude.");
      }

      const res = await psychroCalc.atmosphereFromAltitude({ altitude: alt, unit_system: unit });

      if ("results" in res) {
        setResult(res.results[0]);
      } else {
        setResult(res as StdAtmState);
      }

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/psychrometrics/atmosphere",
        data: {
          unitSystem: unit,
          altitude: alt,
        }
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
        <h1 className="text-3xl font-bold tracking-tight">Altitude & Atmosphere Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Convert site elevation into standard barometric pressure and temperature.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter the site altitude.</CardDescription>
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
                    <SelectItem value="SI">SI (°C, m)</SelectItem>
                    <SelectItem value="IP">IP (°F, ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Altitude ({unit === "SI" ? "m" : "ft"})</Label>
                <Input value={altitude} onChange={(e) => setAltitude(e.target.value)} type="number" />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              {loading ? "Calculating..." : "Calculate"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Standard atmospheric conditions.</CardDescription>
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
                    <TableCell>Pressure</TableCell>
                    <TableCell className="text-right">{result.pressure.toFixed(1)}</TableCell>
                    <TableCell>{unit === "SI" ? "Pa" : "psi"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Temperature (Dry Bulb)</TableCell>
                    <TableCell className="text-right">{result.t_dry_bulb.toFixed(2)}</TableCell>
                    <TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Enter altitude and click Calculate to see results.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

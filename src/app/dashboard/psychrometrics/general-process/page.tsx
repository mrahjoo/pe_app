"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { psychroCalc, UnitSystem, ApplyProcessResponse } from "@/lib/api/psychrolib";
import { trackEvent } from "@/lib/analytics";

export default function GeneralProcessPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  
  // Entering state
  const [entDb, setEntDb] = useState<string>("24");
  const [entRh, setEntRh] = useState<string>("0.5");
  
  // Air flow
  const [massFlow, setMassFlow] = useState<string>("1.5");
  
  // Loads
  const [sensibleLoad, setSensibleLoad] = useState<string>("-15000"); // negative for cooling
  const [latentLoad, setLatentLoad] = useState<string>("-5000"); // negative for dehumidification

  const [result, setResult] = useState<ApplyProcessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const p = parseFloat(pressure);
      const edb = parseFloat(entDb);
      const erh = parseFloat(entRh);
      const mf = parseFloat(massFlow);
      const sl = parseFloat(sensibleLoad);
      const ll = parseFloat(latentLoad);

      if (isNaN(p) || isNaN(edb) || isNaN(erh) || isNaN(mf)) {
        throw new Error("Please enter valid numbers for required parameters.");
      }

      const res = await psychroCalc.applyProcess({
        unit_system: unit,
        pressure: p,
        entering_state: { t_dry_bulb: edb, rel_hum: erh },
        mass_flow_dry_air: mf,
        sensible_load: isNaN(sl) ? null : sl,
        latent_load: isNaN(ll) ? null : ll,
        load_unit: unit === "SI" ? "W" : "btu/h"
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/psychrometrics/general-process",
        data: { unitSystem: unit }
      });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General HVAC Process Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Compute the leaving state and process classification given entering conditions, air flow, and loads.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Unit System</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as UnitSystem)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SI">SI (°C, Pa, W, kg/s)</SelectItem>
                    <SelectItem value="IP">IP (°F, psi, btu/h, lb/s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pressure ({unit === "SI" ? "Pa" : "psi"})</Label>
                <Input value={pressure} onChange={(e) => setPressure(e.target.value)} type="number" />
              </div>
            </div>

            <h4 className="text-sm font-semibold">Entering Air State & Flow</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                <Input value={entDb} onChange={(e) => setEntDb(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">RH (0-1)</Label>
                <Input value={entRh} onChange={(e) => setEntRh(e.target.value)} type="number" step="0.05" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Mass Flow ({unit === "SI" ? "kg/s" : "lb/s"})</Label>
                <Input value={massFlow} onChange={(e) => setMassFlow(e.target.value)} type="number" step="0.1" />
              </div>
            </div>

            <h4 className="text-sm font-semibold mt-4">Loads ({unit === "SI" ? "W" : "btu/h"})</h4>
            <p className="text-xs text-muted-foreground mb-2">Positive = heating/humidification. Negative = cooling/dehumidification.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sensible Load</Label>
                <Input value={sensibleLoad} onChange={(e) => setSensibleLoad(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Latent Load</Label>
                <Input value={latentLoad} onChange={(e) => setLatentLoad(e.target.value)} type="number" />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              {loading ? "Calculating..." : "Apply Process"}
            </Button>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Leaving state and process details.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Entering</TableHead>
                      <TableHead className="text-right">Leaving</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Dry Bulb Temp ({unit === "SI" ? "°C" : "°F"})</TableCell>
                      <TableCell className="text-right">{result.entering_state.t_dry_bulb.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{result.leaving_state.t_dry_bulb.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Relative Humidity (%)</TableCell>
                      <TableCell className="text-right">{(result.entering_state.rel_hum * 100).toFixed(1)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{(result.leaving_state.rel_hum * 100).toFixed(1)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Humidity Ratio</TableCell>
                      <TableCell className="text-right">{result.entering_state.hum_ratio.toFixed(5)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{result.leaving_state.hum_ratio.toFixed(5)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Process Label:</span>
                    <span>{result.process_label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Sensible Heat Ratio (SHR):</span>
                    <span>{result.sensible_heat_ratio.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Load:</span>
                    <span>{result.total_load.toFixed(0)} {unit === "SI" ? "W" : "btu/h"}</span>
                  </div>
                  {result.condensation_rate ? (
                    <div className="flex justify-between">
                      <span className="font-semibold">Condensation Rate:</span>
                      <span>{result.condensation_rate.toExponential(2)} {unit === "SI" ? "kg/s" : "lb/h"}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-center p-4">
                Enter conditions and loads, then calculate to see the resulting state.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { psychroCalc, UnitSystem, CoilAdpBfResponse } from "@/lib/api/psychrolib";
import { trackEvent } from "@/lib/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoilSelectionPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  
  // Entering state
  const [entDb, setEntDb] = useState<string>("28");
  const [entRh, setEntRh] = useState<string>("0.5");
  
  // Method
  const [method, setMethod] = useState<"leaving" | "target_shr">("leaving");
  
  // Leaving state (if method == leaving)
  const [lvgDb, setLvgDb] = useState<string>("14");
  const [lvgRh, setLvgRh] = useState<string>("0.95");
  
  // Target SHR / BF (if method == target_shr)
  const [targetShr, setTargetShr] = useState<string>("0.75");
  const [targetBf, setTargetBf] = useState<string>("0.15");

  const [result, setResult] = useState<CoilAdpBfResponse | null>(null);
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

      if (isNaN(p) || isNaN(edb) || isNaN(erh)) {
        throw new Error("Please enter valid numbers for entering conditions.");
      }

      let payload: any = {
        unit_system: unit,
        pressure: p,
        entering_state: { t_dry_bulb: edb, rel_hum: erh }
      };

      if (method === "leaving") {
        const ldb = parseFloat(lvgDb);
        const lrh = parseFloat(lvgRh);
        if (isNaN(ldb) || isNaN(lrh)) throw new Error("Invalid leaving conditions.");
        payload.leaving_state = { t_dry_bulb: ldb, rel_hum: lrh };
      } else {
        const shr = parseFloat(targetShr);
        const bf = parseFloat(targetBf);
        if (isNaN(shr) || isNaN(bf)) throw new Error("Invalid target SHR or Bypass Factor.");
        payload.target_shr = shr;
        payload.bypass_factor = bf;
      }

      const res = await psychroCalc.coilAdpBf(payload);
      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/psychrometrics/coil-selection",
        data: { unitSystem: unit, method }
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
        <h1 className="text-3xl font-bold tracking-tight">Coil Selection Tool</h1>
        <p className="text-muted-foreground mt-2">
          Calculate Apparatus Dew Point (ADP) and Bypass Factor (BF).
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

            <h4 className="text-sm font-semibold">Entering Air State</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                <Input value={entDb} onChange={(e) => setEntDb(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>RH (0-1)</Label>
                <Input value={entRh} onChange={(e) => setEntRh(e.target.value)} type="number" step="0.05" />
              </div>
            </div>

            <Tabs value={method} onValueChange={(v: any) => setMethod(v)} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="leaving">Known Leaving State</TabsTrigger>
                <TabsTrigger value="target_shr">Target SHR & BF</TabsTrigger>
              </TabsList>
              
              <TabsContent value="leaving" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Leaving DB ({unit === "SI" ? "°C" : "°F"})</Label>
                    <Input value={lvgDb} onChange={(e) => setLvgDb(e.target.value)} type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Leaving RH (0-1)</Label>
                    <Input value={lvgRh} onChange={(e) => setLvgRh(e.target.value)} type="number" step="0.05" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="target_shr" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target SHR (0-1)</Label>
                    <Input value={targetShr} onChange={(e) => setTargetShr(e.target.value)} type="number" step="0.05" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bypass Factor (0-1)</Label>
                    <Input value={targetBf} onChange={(e) => setTargetBf(e.target.value)} type="number" step="0.05" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              {loading ? "Calculating..." : "Calculate Coil Performance"}
            </Button>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Coil and leaving air characteristics.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Apparatus Dew Point (ADP)</TableCell>
                    <TableCell className="text-right font-mono">
                      {result.adp_temperature.toFixed(2)} {unit === "SI" ? "°C" : "°F"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sensible Heat Ratio (SHR)</TableCell>
                    <TableCell className="text-right font-mono">
                      {result.sensible_heat_ratio.toFixed(3)}
                    </TableCell>
                  </TableRow>
                  {result.bypass_factor !== null && result.bypass_factor !== undefined && (
                    <TableRow>
                      <TableCell>Bypass Factor (BF)</TableCell>
                      <TableCell className="text-right font-mono">
                        {result.bypass_factor.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  )}
                  {result.contact_factor !== null && result.contact_factor !== undefined && (
                    <TableRow>
                      <TableCell>Contact Factor (1 - BF)</TableCell>
                      <TableCell className="text-right font-mono">
                        {result.contact_factor.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>Coil Condition Line Slope</TableCell>
                    <TableCell className="text-right font-mono">
                      {result.coil_condition_slope.toExponential(3)}
                    </TableCell>
                  </TableRow>
                  {result.leaving_state && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold pt-4">Leaving State</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Dry Bulb Temp</TableCell>
                        <TableCell className="text-right font-mono">
                          {result.leaving_state.t_dry_bulb.toFixed(2)} {unit === "SI" ? "°C" : "°F"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Relative Humidity</TableCell>
                        <TableCell className="text-right font-mono">
                          {(result.leaving_state.rel_hum * 100).toFixed(1)} %
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-center p-4">
                Select your method, enter parameters, and calculate to see ADP and BF.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

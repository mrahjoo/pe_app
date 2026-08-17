"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { psychroCalc, PsychroState, UnitSystem } from "@/lib/api/psychrolib";
import { trackEvent } from "@/lib/analytics";

type InputType = "relHum" | "wetBulb" | "dewPoint" | "humRatio" | "vapPres";

export default function StateCalculatorPage() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [unit, setUnit] = useState<UnitSystem>("SI");
  
  // Single inputs
  const [pressure, setPressure] = useState<string>("101325");
  const [dryBulb, setDryBulb] = useState<string>("20");
  const [inputType, setInputType] = useState<InputType>("relHum");
  const [inputValue, setInputValue] = useState<string>("0.5");
  
  // Batch inputs
  const [batchPressure, setBatchPressure] = useState<string>("101325");
  const [batchDryBulb, setBatchDryBulb] = useState<string>("20, 25, 30, 35");
  const [batchInputType, setBatchInputType] = useState<InputType>("relHum");
  const [batchInputValue, setBatchInputValue] = useState<string>("0.5");

  const [result, setResult] = useState<PsychroState | null>(null);
  const [batchResults, setBatchResults] = useState<PsychroState[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setBatchResults(null);

    try {
      if (mode === "single") {
        const p = parseFloat(pressure);
        const db = parseFloat(dryBulb);
        const val = parseFloat(inputValue);

        if (isNaN(p) || isNaN(db) || isNaN(val)) {
          throw new Error("Please enter valid numbers for all fields.");
        }

        let res: any;
        switch (inputType) {
          case "relHum": res = await psychroCalc.fromRelHum(db, val, p, unit); break;
          case "wetBulb": res = await psychroCalc.fromWetBulb(db, val, p, unit); break;
          case "dewPoint": res = await psychroCalc.fromDewPoint(db, val, p, unit); break;
          case "humRatio": res = await psychroCalc.fromHumRatio(db, val, p, unit); break;
          case "vapPres": res = await psychroCalc.fromVapPres(db, val, p, unit); break;
        }

        if (res && res.results) setResult(res.results[0]);
        else setResult(res as PsychroState);
        
      } else {
        const parseArray = (str: string) => str.split(',').map(s => parseFloat(s.trim()));
        
        let pArray = parseArray(batchPressure);
        let dbArray = parseArray(batchDryBulb);
        let valArray = parseArray(batchInputValue);
        
        if (pArray.some(isNaN) || dbArray.some(isNaN) || valArray.some(isNaN)) {
          throw new Error("Please enter valid comma-separated numbers.");
        }

        let res: any;
        switch (batchInputType) {
          case "relHum": res = await psychroCalc.fromRelHum(dbArray as any, valArray as any, pArray as any, unit); break;
          case "wetBulb": res = await psychroCalc.fromWetBulb(dbArray as any, valArray as any, pArray as any, unit); break;
          case "dewPoint": res = await psychroCalc.fromDewPoint(dbArray as any, valArray as any, pArray as any, unit); break;
          case "humRatio": res = await psychroCalc.fromHumRatio(dbArray as any, valArray as any, pArray as any, unit); break;
          case "vapPres": res = await psychroCalc.fromVapPres(dbArray as any, valArray as any, pArray as any, unit); break;
        }

        if (res && res.results) {
          setBatchResults(res.results);
        } else if (res) {
          setBatchResults([res as PsychroState]);
        }
      }

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/psychrometrics/state-calculator",
        data: { unitSystem: unit, mode }
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  const getInputLabel = (type: InputType) => {
    switch (type) {
      case "relHum": return "Relative Humidity (0-1)";
      case "wetBulb": return `Wet Bulb Temp (${unit === "SI" ? "°C" : "°F"})`;
      case "dewPoint": return `Dew Point Temp (${unit === "SI" ? "°C" : "°F"})`;
      case "humRatio": return `Humidity Ratio (${unit === "SI" ? "kg/kg" : "lb/lb"})`;
      case "vapPres": return `Vapor Pressure (${unit === "SI" ? "Pa" : "psi"})`;
    }
  };

  const handleExportCsv = () => {
    if (!batchResults) return;
    const headers = ["Dry Bulb", "Wet Bulb", "Dew Point", "RH", "Humidity Ratio", "Enthalpy", "Volume"];
    const rows = batchResults.map(r => [
      r.t_dry_bulb.toFixed(2),
      r.t_wet_bulb.toFixed(2),
      r.t_dew_point.toFixed(2),
      r.rel_hum.toFixed(3),
      r.hum_ratio.toFixed(5),
      r.enthalpy.toFixed(1),
      r.volume.toFixed(4)
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "psychro_batch_results.csv";
    a.click();
    URL.revokeObjectURL(url);
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
            <div className="space-y-2 mb-4">
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

            <Tabs value={mode} onValueChange={(v: any) => setMode(v)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single State</TabsTrigger>
                <TabsTrigger value="batch">Batch / Sweep</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Pressure ({unit === "SI" ? "Pa" : "psi"})</Label>
                  <Input value={pressure} onChange={(e) => setPressure(e.target.value)} type="number" />
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
                  <Label>{getInputLabel(inputType)}</Label>
                  <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} type="number" step="0.01" />
                </div>
              </TabsContent>

              <TabsContent value="batch" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Pressure(s) ({unit === "SI" ? "Pa" : "psi"})</Label>
                  <Input value={batchPressure} onChange={(e) => setBatchPressure(e.target.value)} placeholder="e.g. 101325" />
                  <p className="text-xs text-muted-foreground">Comma-separated for multiple values or single value.</p>
                </div>
                <div className="space-y-2">
                  <Label>Dry Bulb Temp(s) ({unit === "SI" ? "°C" : "°F"})</Label>
                  <Input value={batchDryBulb} onChange={(e) => setBatchDryBulb(e.target.value)} placeholder="e.g. 20, 25, 30" />
                  <p className="text-xs text-muted-foreground">Comma-separated values.</p>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Property</Label>
                  <Select value={batchInputType} onValueChange={(v) => setBatchInputType(v as InputType)}>
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
                  <Label>{getInputLabel(batchInputType)}(s)</Label>
                  <Input value={batchInputValue} onChange={(e) => setBatchInputValue(e.target.value)} placeholder="e.g. 0.5" />
                  <p className="text-xs text-muted-foreground">Comma-separated values or a constant.</p>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              {loading ? "Calculating..." : "Calculate State"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>Psychrometric state properties.</CardDescription>
            </div>
            {mode === "batch" && batchResults && (
              <Button onClick={handleExportCsv} variant="outline" size="sm">
                Export CSV
              </Button>
            )}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {mode === "single" && result ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Dry Bulb Temp</TableCell><TableCell className="text-right">{result.t_dry_bulb.toFixed(2)}</TableCell><TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell></TableRow>
                  <TableRow><TableCell>Wet Bulb Temp</TableCell><TableCell className="text-right">{result.t_wet_bulb.toFixed(2)}</TableCell><TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell></TableRow>
                  <TableRow><TableCell>Dew Point Temp</TableCell><TableCell className="text-right">{result.t_dew_point.toFixed(2)}</TableCell><TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell></TableRow>
                  <TableRow><TableCell>Relative Humidity</TableCell><TableCell className="text-right">{(result.rel_hum * 100).toFixed(1)}</TableCell><TableCell>%</TableCell></TableRow>
                  <TableRow><TableCell>Humidity Ratio</TableCell><TableCell className="text-right">{result.hum_ratio.toFixed(5)}</TableCell><TableCell>{unit === "SI" ? "kg/kg" : "lb/lb"}</TableCell></TableRow>
                  <TableRow><TableCell>Vapor Pressure</TableCell><TableCell className="text-right">{result.vap_pres.toFixed(1)}</TableCell><TableCell>{unit === "SI" ? "Pa" : "psi"}</TableCell></TableRow>
                  <TableRow><TableCell>Enthalpy</TableCell><TableCell className="text-right">{result.enthalpy.toFixed(1)}</TableCell><TableCell>{unit === "SI" ? "J/kg" : "Btu/lb"}</TableCell></TableRow>
                  <TableRow><TableCell>Volume</TableCell><TableCell className="text-right">{result.volume.toFixed(4)}</TableCell><TableCell>{unit === "SI" ? "m³/kg" : "ft³/lb"}</TableCell></TableRow>
                </TableBody>
              </Table>
            ) : mode === "batch" && batchResults ? (
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DB</TableHead>
                      <TableHead>WB</TableHead>
                      <TableHead>DP</TableHead>
                      <TableHead>RH</TableHead>
                      <TableHead>W</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchResults.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.t_dry_bulb.toFixed(2)}</TableCell>
                        <TableCell>{r.t_wet_bulb.toFixed(2)}</TableCell>
                        <TableCell>{r.t_dew_point.toFixed(2)}</TableCell>
                        <TableCell>{(r.rel_hum * 100).toFixed(1)}%</TableCell>
                        <TableCell>{r.hum_ratio.toFixed(5)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-center p-4">
                Enter parameters and click Calculate to see results.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

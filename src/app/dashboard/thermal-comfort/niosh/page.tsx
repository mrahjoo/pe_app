"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { comfortApi, GenericResponse } from "@/lib/api/thermalcomfort";
import { Calculator } from "lucide-react";

export default function NioshCalculatorPage() {
  const [tdb, setTdb] = useState<string>("35");
  const [tr, setTr] = useState<string>("35");
  const [v, setV] = useState<string>("0.5");
  const [rh, setRh] = useState<string>("50");
  const [met, setMet] = useState<string>("2.0");
  const [clo, setClo] = useState<string>("0.6");
  
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = {
        tdb: parseFloat(tdb),
        tr: parseFloat(tr),
        v: parseFloat(v),
        rh: parseFloat(rh),
        met: parseFloat(met),
        clo: parseFloat(clo),
      };
      
      if (Object.values(parsed).some(isNaN)) {
        throw new Error("Please enter valid numeric values for all fields.");
      }
      
      const res = await comfortApi.niosh(parsed);
      setResult(res.result);
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NIOSH Work Capacity</h1>
        <p className="text-muted-foreground mt-2">
          Calculate US occupational safety heat-stress limits and recommended work capacity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workplace & Worker Parameters</CardTitle>
            <CardDescription>Enter the physical parameters (SI Units).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Air Temp (°C)</Label>
                <Input value={tdb} onChange={e => setTdb(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Radiant Temp (°C)</Label>
                <Input value={tr} onChange={e => setTr(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Air Velocity (m/s)</Label>
                <Input value={v} onChange={e => setV(e.target.value)} type="number" step="0.05" />
              </div>
              <div className="space-y-2">
                <Label>Relative Humidity (%)</Label>
                <Input value={rh} onChange={e => setRh(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Metabolic Rate (met)</Label>
                <Input value={met} onChange={e => setMet(e.target.value)} type="number" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Clothing Ins. (clo)</Label>
                <Input value={clo} onChange={e => setClo(e.target.value)} type="number" step="0.1" />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Calculating..." : "Evaluate Work Capacity"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NIOSH Recommendations</CardTitle>
            <CardDescription>Work capacity fraction and limits</CardDescription>
          </CardHeader>
          <CardContent>
            {result !== null && result !== undefined ? (
              <div className="flex flex-col items-center justify-center space-y-6 p-6 border rounded-lg bg-muted/20 h-full">
                <div className="text-center">
                  <div className="text-sm font-semibold text-muted-foreground uppercase mb-1">Recommended Work Capacity</div>
                  <div className={`text-5xl font-bold ${Number(result) < 1 ? 'text-orange-500' : 'text-green-500'}`}>
                    {(Number(result) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 max-w-[250px] mx-auto">
                    {Number(result) < 1 
                      ? "Rest cycle required to prevent heat stress under NIOSH standards." 
                      : "Continuous work is permitted under these conditions."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Enter conditions and click Evaluate.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

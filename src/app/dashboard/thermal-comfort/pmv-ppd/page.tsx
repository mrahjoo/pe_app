"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { comfortApi, PmvPpdResponse } from "@/lib/api/thermalcomfort";
import { Calculator } from "lucide-react";

export default function PmvPpdCalculatorPage() {
  const [tdb, setTdb] = useState<string>("24");
  const [tr, setTr] = useState<string>("24");
  const [vr, setVr] = useState<string>("0.1");
  const [rh, setRh] = useState<string>("50");
  const [met, setMet] = useState<string>("1.1");
  const [clo, setClo] = useState<string>("0.5");
  const [model, setModel] = useState<string>("ashrae");
  
  const [result, setResult] = useState<PmvPpdResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = {
        tdb: parseFloat(tdb),
        tr: parseFloat(tr),
        vr: parseFloat(vr),
        rh: parseFloat(rh),
        met: parseFloat(met),
        clo: parseFloat(clo),
      };
      
      if (Object.values(parsed).some(isNaN)) {
        throw new Error("Please enter valid numeric values for all fields.");
      }
      
      const res = await comfortApi.pmvPpd({
        ...parsed,
        model: model as "7730-2005" | "ashrae",
        units: "SI"
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
        <h1 className="text-3xl font-bold tracking-tight">ASHRAE 55 PMV/PPD Checker</h1>
        <p className="text-muted-foreground mt-2">
          Evaluate indoor occupant comfort using Predicted Mean Vote (PMV) and Predicted Percentage of Dissatisfied (PPD).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Room Conditions & Occupant Details</CardTitle>
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
                <Input value={vr} onChange={e => setVr(e.target.value)} type="number" step="0.05" />
              </div>
              <div className="space-y-2">
                <Label>Relative Humidity (%)</Label>
                <Input value={rh} onChange={e => setRh(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Metabolic Rate (met)</Label>
                <Input value={met} onChange={e => setMet(e.target.value)} type="number" step="0.1" />
                <p className="text-xs text-muted-foreground">e.g. 1.1 for typing</p>
              </div>
              <div className="space-y-2">
                <Label>Clothing Ins. (clo)</Label>
                <Input value={clo} onChange={e => setClo(e.target.value)} type="number" step="0.1" />
                <p className="text-xs text-muted-foreground">e.g. 0.5 for summer</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Model Standard</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ashrae">ASHRAE 55</SelectItem>
                  <SelectItem value="7730-2005">ISO 7730-2005</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Calculating..." : "Evaluate Comfort"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comfort Results</CardTitle>
            <CardDescription>PMV and PPD Indices</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="flex flex-col items-center justify-center space-y-6 p-6 border rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="text-sm font-semibold text-muted-foreground uppercase mb-1">PMV (Predicted Mean Vote)</div>
                  <div className={`text-5xl font-bold ${Math.abs(Number(result.pmv)) <= 0.5 ? 'text-green-600' : 'text-orange-500'}`}>
                    {Number(result.pmv).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {Math.abs(Number(result.pmv)) <= 0.5 ? "✓ Within ASHRAE 55 Comfort Zone (-0.5 to +0.5)" : "✗ Outside Comfort Zone"}
                  </div>
                </div>
                
                <div className="w-full h-px bg-border my-2"></div>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-muted-foreground uppercase mb-1">PPD (Percentage Dissatisfied)</div>
                  <div className="text-4xl font-bold text-primary">
                    {Number(result.ppd).toFixed(1)}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Enter conditions and click Calculate.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

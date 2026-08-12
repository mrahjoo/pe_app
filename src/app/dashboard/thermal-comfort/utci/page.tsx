"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { comfortApi, UtciResponse } from "@/lib/api/thermalcomfort";
import { Calculator, ThermometerSun } from "lucide-react";

export default function UtciCalculatorPage() {
  const [tdb, setTdb] = useState<string>("30");
  const [tr, setTr] = useState<string>("35");
  const [v, setV] = useState<string>("1.5");
  const [rh, setRh] = useState<string>("60");
  
  const [result, setResult] = useState<UtciResponse | null>(null);
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
      };
      
      if (Object.values(parsed).some(isNaN)) {
        throw new Error("Please enter valid numeric values for all fields.");
      }
      
      const res = await comfortApi.utci(parsed);
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
        <h1 className="text-3xl font-bold tracking-tight">UTCI Outdoor Comfort Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the Universal Thermal Climate Index (UTCI) to assess outdoor heat stress risk.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weather Conditions</CardTitle>
            <CardDescription>Enter the physical outdoor parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Air Temp (°C)</Label>
                <Input value={tdb} onChange={e => setTdb(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Mean Radiant Temp (°C)</Label>
                <Input value={tr} onChange={e => setTr(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Wind Speed (m/s) at 10m</Label>
                <Input value={v} onChange={e => setV(e.target.value)} type="number" step="0.5" />
              </div>
              <div className="space-y-2">
                <Label>Relative Humidity (%)</Label>
                <Input value={rh} onChange={e => setRh(e.target.value)} type="number" />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Calculating..." : "Evaluate UTCI"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stress Index Results</CardTitle>
            <CardDescription>Equivalent Temperature and Risk Category</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="flex flex-col items-center justify-center space-y-6 p-6 border rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="text-sm font-semibold text-muted-foreground uppercase mb-1 flex items-center justify-center gap-1">
                    <ThermometerSun className="w-4 h-4" />
                    UTCI (Equivalent Temp)
                  </div>
                  <div className="text-5xl font-bold text-primary">
                    {Number(result.utci).toFixed(1)} <span className="text-3xl text-muted-foreground">°C</span>
                  </div>
                </div>
                
                <div className="w-full h-px bg-border my-2"></div>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-muted-foreground uppercase mb-1">Stress Category</div>
                  <div className={`text-2xl font-bold uppercase ${
                    String(result.stress_category).includes("strong") || String(result.stress_category).includes("extreme") 
                      ? 'text-red-500' 
                      : String(result.stress_category).includes("moderate") 
                        ? 'text-orange-400' 
                        : 'text-green-500'
                  }`}>
                    {result.stress_category}
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

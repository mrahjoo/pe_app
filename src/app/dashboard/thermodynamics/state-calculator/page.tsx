"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { refpropApi, SubstanceList, CalcResponse } from "@/lib/api/refprop";
import { Calculator } from "lucide-react";

export default function StateCalculatorPage() {
  const [substanceList, setSubstanceList] = useState<SubstanceList | null>(null);
  const [selectedFluid, setSelectedFluid] = useState<string>("WATER");
  const [hIn, setHIn] = useState<string>("PQ");
  const [valA, setValA] = useState<string>("101325");
  const [valB, setValB] = useState<string>("0");
  
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refpropApi.listSubstances()
      .then(data => {
        setSubstanceList(data);
      })
      .catch(err => setError("Failed to load substance list."));
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const a = parseFloat(valA);
      const b = parseFloat(valB);
      if (isNaN(a) || isNaN(b)) throw new Error("Please enter valid numeric values.");
      
      const res = await refpropApi.calc({
        fluids: [selectedFluid],
        composition: [1.0],
        basis: "mass",
        hIn: hIn,
        a: a,
        b: b,
        unit_system: "MASS BASE SI"
      });
      
      if (res.ierr !== 0) {
        throw new Error(`REFPROP Error (${res.ierr}): ${res.herr || "Unknown error"}`);
      }
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
        <h1 className="text-3xl font-bold tracking-tight">Refrigerant State-Point Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the full thermodynamic state (Density, Enthalpy, Entropy, etc.) from any two independent properties.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Select the fluid and boundary conditions (SI units).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Fluid</Label>
              <Select value={selectedFluid} onValueChange={setSelectedFluid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a fluid" />
                </SelectTrigger>
                <SelectContent>
                  {substanceList?.fluids.map((fluid) => (
                    <SelectItem key={fluid} value={fluid}>
                      {fluid}
                    </SelectItem>
                  ))}
                  {substanceList?.mixtures.map((mix) => (
                    <SelectItem key={mix} value={mix}>
                      {mix}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Input Pair (hIn)</Label>
              <Select value={hIn} onValueChange={setHIn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inputs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PQ">Pressure & Quality (PQ)</SelectItem>
                  <SelectItem value="TP">Temperature & Pressure (TP)</SelectItem>
                  <SelectItem value="TQ">Temperature & Quality (TQ)</SelectItem>
                  <SelectItem value="PH">Pressure & Enthalpy (PH)</SelectItem>
                  <SelectItem value="PS">Pressure & Entropy (PS)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Note: Pressure in Pa, Temperature in K, Enthalpy in J/kg, Entropy in J/kg-K.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value 1 ({hIn[0]})</Label>
                <Input value={valA} onChange={e => setValA(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Value 2 ({hIn[1]})</Label>
                <Input value={valB} onChange={e => setValB(e.target.value)} type="number" />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Calculating..." : "Calculate State"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>State Output</CardTitle>
            <CardDescription>Full property vector evaluated by REFPROP</CardDescription>
          </CardHeader>
          <CardContent>
            {result?.state ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(result.state).map(([key, prop]) => (
                    <div key={key} className="col-span-2 sm:col-span-1 border rounded p-3 bg-muted/20">
                      <div className="font-semibold text-muted-foreground uppercase">{key}</div>
                      <div className="text-lg">
                        {prop.value?.toPrecision(6)} 
                        <span className="text-sm text-muted-foreground ml-1">{prop.unit}</span>
                      </div>
                    </div>
                  ))}
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

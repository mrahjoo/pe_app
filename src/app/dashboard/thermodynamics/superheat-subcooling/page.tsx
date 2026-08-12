"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { refpropApi, SubstanceList } from "@/lib/api/refprop";
import { Calculator } from "lucide-react";

export default function SuperheatSubcoolingPage() {
  const [substanceList, setSubstanceList] = useState<SubstanceList | null>(null);
  const [selectedFluid, setSelectedFluid] = useState<string>("R32");
  const [pressurePa, setPressurePa] = useState<string>("101325");
  const [temperatureK, setTemperatureK] = useState<string>("298.15");
  
  const [result, setResult] = useState<{
    stateType: string;
    valueK: number;
    tBubbleK: number;
    tDewK: number;
  } | null>(null);
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
      const p = parseFloat(pressurePa);
      const t = parseFloat(temperatureK);
      if (isNaN(p) || isNaN(t)) throw new Error("Please enter valid numeric values.");
      
      // Get Bubble Point (Q=0)
      const resBubble = await refpropApi.calc({
        fluids: [selectedFluid],
        composition: [1.0],
        basis: "mass",
        hIn: "PQ",
        a: p,
        b: 0, // Quality = 0 (liquid)
        hOut: "T",
        unit_system: "MASS BASE SI"
      });
      
      // Get Dew Point (Q=1)
      const resDew = await refpropApi.calc({
        fluids: [selectedFluid],
        composition: [1.0],
        basis: "mass",
        hIn: "PQ",
        a: p,
        b: 1, // Quality = 1 (vapor)
        hOut: "T",
        unit_system: "MASS BASE SI"
      });
      
      if (resBubble.ierr !== 0) throw new Error(`REFPROP Bubble Error: ${resBubble.herr}`);
      if (resDew.ierr !== 0) throw new Error(`REFPROP Dew Error: ${resDew.herr}`);
      
      const tBubble = resBubble.state?.T?.value;
      const tDew = resDew.state?.T?.value;
      
      if (tBubble === undefined || tBubble === null || tDew === undefined || tDew === null) {
        throw new Error("Failed to retrieve saturation temperatures.");
      }

      let stateType = "";
      let valueK = 0;
      
      // For Superheat, compare against Dew Point. For Subcooling, compare against Bubble Point.
      if (t > tDew) {
        stateType = "Superheated";
        valueK = t - tDew;
      } else if (t < tBubble) {
        stateType = "Subcooled";
        valueK = tBubble - t;
      } else {
        stateType = "Two-Phase (Saturation)";
        valueK = 0;
      }

      setResult({
        stateType,
        valueK,
        tBubbleK: tBubble,
        tDewK: tDew
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
        <h1 className="text-3xl font-bold tracking-tight">Superheat / Subcooling Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Determine the degrees of superheat or subcooling based on actual line temperature and pressure.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Measured Conditions</CardTitle>
            <CardDescription>Enter the fluid and actual line measurements (SI Units).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Refrigerant / Fluid</Label>
              <Select value={selectedFluid} onValueChange={(val) => setSelectedFluid(val || "")}>
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Actual Pressure (Pa)</Label>
                <Input value={pressurePa} onChange={e => setPressurePa(e.target.value)} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Actual Temperature (K)</Label>
                <Input value={temperatureK} onChange={e => setTemperatureK(e.target.value)} type="number" step="0.1" />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" disabled={loading}>
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Evaluating..." : "Evaluate State"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Saturation points and evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6 p-6 border rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="text-sm font-semibold text-muted-foreground uppercase mb-1">State Evaluation</div>
                  <div className={`text-4xl font-bold ${
                    result.stateType === "Superheated" ? "text-orange-500" :
                    result.stateType === "Subcooled" ? "text-blue-500" :
                    "text-gray-500"
                  }`}>
                    {result.stateType}
                  </div>
                  {result.valueK > 0 && (
                    <div className="text-2xl mt-2 font-mono">
                      {result.valueK.toFixed(2)} K
                    </div>
                  )}
                </div>
                
                <div className="w-full h-px bg-border my-2"></div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Bubble Point (Sat. Liq)</div>
                    <div className="font-semibold text-lg">{result.tBubbleK.toFixed(2)} K</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Dew Point (Sat. Vap)</div>
                    <div className="font-semibold text-lg">{result.tDewK.toFixed(2)} K</div>
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

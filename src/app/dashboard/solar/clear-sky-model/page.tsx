"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, ClearSkyResult, ClearSkyModelInfo, ClearSkyModel } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function ClearSkyModelPage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [datetime, setDatetime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [altitude, setAltitude] = useState<string>("0");
  const [linkeTurbidity, setLinkeTurbidity] = useState<string>("");
  const [model, setModel] = useState<ClearSkyModel>("ineichen");
  
  const [availableModels, setAvailableModels] = useState<ClearSkyModelInfo[]>([]);

  const [result, setResult] = useState<ClearSkyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    solarCalc.getClearSkyModels()
      .then(data => setAvailableModels(data))
      .catch(console.error);
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const alt = parseFloat(altitude);
      const lt = linkeTurbidity ? parseFloat(linkeTurbidity) : null;

      if (isNaN(lat) || isNaN(lon) || isNaN(alt) || !datetime) {
        throw new Error("Please enter valid parameters.");
      }

      const dt = new Date(datetime).toISOString();

      const res = await solarCalc.calculateClearSkyModel({
        latitude: lat,
        longitude: lon,
        datetime: dt,
        model: model,
        altitude: alt,
        linke_turbidity: lt,
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/clear-sky-model",
        data: { model }
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
        <h1 className="text-3xl font-bold tracking-tight">Clear-Sky Model</h1>
        <p className="text-muted-foreground mt-2">
          Calculate clear-sky horizontal irradiance explicitly choosing the underlying physical or empirical model.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter location and choose your clear-sky model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Latitude (deg)</Label>
              <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} type="number" step="0.0001" />
            </div>
            <div className="space-y-2">
              <Label>Longitude (deg)</Label>
              <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} type="number" step="0.0001" />
            </div>
            <div className="space-y-2">
              <Label>Datetime (Local)</Label>
              <Input value={datetime} onChange={(e) => setDatetime(e.target.value)} type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label>Clear-Sky Model</Label>
              <Select value={model} onValueChange={(v) => setModel(v as ClearSkyModel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(m => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name} {m.is_default && "(Default)"}
                    </SelectItem>
                  ))}
                  {availableModels.length === 0 && (
                    <>
                      <SelectItem value="ineichen">ineichen (Default)</SelectItem>
                      <SelectItem value="haurwitz">haurwitz</SelectItem>
                      <SelectItem value="simplified_solis">simplified_solis</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Altitude (m)</Label>
              <Input value={altitude} onChange={(e) => setAltitude(e.target.value)} type="number" />
            </div>
            {model === "ineichen" && (
              <div className="space-y-2">
                <Label>Linke Turbidity (Optional)</Label>
                <Input value={linkeTurbidity} onChange={(e) => setLinkeTurbidity(e.target.value)} type="number" step="0.1" placeholder="Leave empty for climatological lookup" />
              </div>
            )}

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              {loading ? "Calculating..." : "Calculate"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Calculated irradiance values in W/m².</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {result ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Direct Normal (DNI)</TableCell><TableCell className="text-right">{result.dni.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell>Diffuse Horizontal (DHI)</TableCell><TableCell className="text-right">{result.dhi.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell>Global Horizontal (GHI)</TableCell><TableCell className="text-right">{result.ghi.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell>Model Used</TableCell><TableCell className="text-right font-medium" colSpan={2}>{result.model_used}</TableCell></TableRow>
                  <TableRow><TableCell>Timestamp (UTC)</TableCell><TableCell className="text-right" colSpan={2}>{result.timestamp_utc}</TableCell></TableRow>
                </TableBody>
              </Table>
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

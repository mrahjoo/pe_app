"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, HeatGainResult, ObstructionType } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function HeatGainWindowPage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [datetime, setDatetime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [surfaceTilt, setSurfaceTilt] = useState<string>("90"); // Default vertical window
  const [surfaceAzimuth, setSurfaceAzimuth] = useState<string>("180");
  const [area, setArea] = useState<string>("2.0");
  const [shgc, setShgc] = useState<string>("0.6");
  const [albedo, setAlbedo] = useState<string>("0.2");
  const [altitude, setAltitude] = useState<string>("0");
  
  const [hasObstruction, setHasObstruction] = useState<boolean>(false);
  const [obstructionType, setObstructionType] = useState<ObstructionType>("overhang");
  const [depth, setDepth] = useState<string>("1.0");
  const [offset, setOffset] = useState<string>("0.2");
  const [windowHeight, setWindowHeight] = useState<string>("2.0");
  
  const [linkeTurbidity, setLinkeTurbidity] = useState<string>("");

  const [result, setResult] = useState<HeatGainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const tilt = parseFloat(surfaceTilt);
      const azimuth = parseFloat(surfaceAzimuth);
      const a = parseFloat(area);
      const s = parseFloat(shgc);
      const alb = parseFloat(albedo);
      const alt = parseFloat(altitude);
      const lt = linkeTurbidity ? parseFloat(linkeTurbidity) : null;

      if (isNaN(lat) || isNaN(lon) || isNaN(tilt) || isNaN(azimuth) || isNaN(a) || isNaN(s) || isNaN(alb) || isNaN(alt) || !datetime) {
        throw new Error("Please enter valid parameters.");
      }

      const dt = new Date(datetime).toISOString();

      let reqPayload: any = {
        latitude: lat,
        longitude: lon,
        datetime: dt,
        surface_tilt_deg: tilt,
        surface_azimuth_deg: azimuth,
        area_m2: a,
        shgc: s,
        albedo: alb,
        altitude: alt,
        linke_turbidity: lt,
      };

      if (hasObstruction) {
        reqPayload.obstruction_type = obstructionType;
        reqPayload.obstruction_geometry = {
          depth: parseFloat(depth),
          offset: parseFloat(offset),
          window_height: parseFloat(windowHeight),
        };
      }

      const res = await solarCalc.calculateHeatGainWindow(reqPayload);

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/heat-gain-window",
        data: { hasObstruction }
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
        <h1 className="text-3xl font-bold tracking-tight">Window Heat Gain</h1>
        <p className="text-muted-foreground mt-2">
          End-to-end solar heat gain through a window: composes irradiance + shading + SHGC into one HVAC deliverable.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter window properties and location details.</CardDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Surface Tilt (deg)</Label>
                <Input value={surfaceTilt} onChange={(e) => setSurfaceTilt(e.target.value)} type="number" min="0" max="180" />
              </div>
              <div className="space-y-2">
                <Label>Surface Azimuth (deg)</Label>
                <Input value={surfaceAzimuth} onChange={(e) => setSurfaceAzimuth(e.target.value)} type="number" min="0" max="360" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Window Area (m²)</Label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} type="number" min="0.1" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>SHGC (0-1)</Label>
                <Input value={shgc} onChange={(e) => setShgc(e.target.value)} type="number" min="0" max="1" step="0.05" />
              </div>
            </div>

            <div className="pt-4 border-t border-muted mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <input 
                  type="checkbox" 
                  id="hasOb" 
                  checked={hasObstruction} 
                  onChange={(e) => setHasObstruction(e.target.checked)} 
                  className="rounded border-gray-300"
                />
                <Label htmlFor="hasOb" className="font-semibold cursor-pointer">Include Shading Obstruction</Label>
              </div>

              {hasObstruction && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label>Obstruction Type</Label>
                    <Select value={obstructionType} onValueChange={(v) => setObstructionType(v as ObstructionType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overhang">Overhang</SelectItem>
                        <SelectItem value="fin">Fin</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Depth (m)</Label>
                      <Input value={depth} onChange={(e) => setDepth(e.target.value)} type="number" min="0" step="0.1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Offset (m)</Label>
                      <Input value={offset} onChange={(e) => setOffset(e.target.value)} type="number" min="0" step="0.1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Window Height (m)</Label>
                    <Input value={windowHeight} onChange={(e) => setWindowHeight(e.target.value)} type="number" min="0" step="0.1" />
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              {loading ? "Calculating..." : "Calculate"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Final heat gain values.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                  <TableRow><TableCell className="font-bold">Total Heat Gain</TableCell><TableCell className="text-right font-bold text-primary">{result.heat_gain_w.toFixed(1)}</TableCell><TableCell className="font-bold text-primary">W</TableCell></TableRow>
                  <TableRow><TableCell className="font-bold">Total Heat Gain</TableCell><TableCell className="text-right font-bold text-primary">{result.heat_gain_btu_h.toFixed(1)}</TableCell><TableCell className="font-bold text-primary">BTU/h</TableCell></TableRow>
                  <TableRow className="bg-muted/30"><TableCell colSpan={3} className="text-sm font-semibold">Intermediate Values</TableCell></TableRow>
                  <TableRow><TableCell>POA Irradiance Used</TableCell><TableCell className="text-right">{result.poa_irradiance_w_m2.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell>Shading Factor Applied</TableCell><TableCell className="text-right">{(result.shading_factor_applied * 100).toFixed(1)}</TableCell><TableCell>%</TableCell></TableRow>
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

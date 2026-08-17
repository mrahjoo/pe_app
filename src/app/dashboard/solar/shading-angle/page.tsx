"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, ShadingResult, ObstructionType } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function ShadingAnglePage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [datetime, setDatetime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [surfaceAzimuth, setSurfaceAzimuth] = useState<string>("180");
  const [altitude, setAltitude] = useState<string>("0");
  
  const [obstructionType, setObstructionType] = useState<ObstructionType>("overhang");
  const [depth, setDepth] = useState<string>("1.0");
  const [offset, setOffset] = useState<string>("0.2");
  const [windowHeight, setWindowHeight] = useState<string>("2.0");

  const [result, setResult] = useState<ShadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const azimuth = parseFloat(surfaceAzimuth);
      const alt = parseFloat(altitude);
      const d = parseFloat(depth);
      const o = parseFloat(offset);
      const wh = parseFloat(windowHeight);

      if (isNaN(lat) || isNaN(lon) || isNaN(azimuth) || isNaN(alt) || isNaN(d) || isNaN(o) || isNaN(wh) || !datetime) {
        throw new Error("Please enter valid parameters.");
      }

      const dt = new Date(datetime).toISOString();

      const res = await solarCalc.calculateShadingAngle({
        latitude: lat,
        longitude: lon,
        datetime: dt,
        surface_azimuth_deg: azimuth,
        altitude: alt,
        obstruction_type: obstructionType,
        obstruction_geometry: {
          depth: d,
          offset: o,
          window_height: wh,
        }
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/shading-angle",
        data: { obstructionType }
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
        <h1 className="text-3xl font-bold tracking-tight">Shading Angle</h1>
        <p className="text-muted-foreground mt-2">
          Calculate shading mask, cutoff angles, and shading factor from overhangs or fins.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter surface, location, and obstruction details.</CardDescription>
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
              <Label>Surface Azimuth (deg)</Label>
              <Input value={surfaceAzimuth} onChange={(e) => setSurfaceAzimuth(e.target.value)} type="number" min="0" max="360" />
              <p className="text-xs text-muted-foreground">180 = south-facing (NH)</p>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Window Height (m)</Label>
                <Input value={windowHeight} onChange={(e) => setWindowHeight(e.target.value)} type="number" min="0" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Altitude (m) - Optional</Label>
                <Input value={altitude} onChange={(e) => setAltitude(e.target.value)} type="number" />
              </div>
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
            <CardDescription>Shading angles and coverage.</CardDescription>
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
                  <TableRow><TableCell>Profile Angle</TableCell><TableCell className="text-right">{result.profile_angle_deg.toFixed(2)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Horizontal Shadow Angle</TableCell><TableCell className="text-right">{result.horizontal_shadow_angle_deg.toFixed(2)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Solar Elevation Used</TableCell><TableCell className="text-right">{result.solar_elevation_deg.toFixed(2)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell className="font-bold">Is Shaded</TableCell><TableCell className="text-right font-bold text-primary">{result.is_shaded ? "Yes" : "No"}</TableCell><TableCell></TableCell></TableRow>
                  <TableRow><TableCell className="font-bold">Shading Factor</TableCell><TableCell className="text-right font-bold">{(result.shading_factor * 100).toFixed(1)}</TableCell><TableCell className="font-bold">%</TableCell></TableRow>
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

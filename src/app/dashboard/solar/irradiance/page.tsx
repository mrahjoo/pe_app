"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, IrradianceResult } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function IrradiancePage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [datetime, setDatetime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [surfaceTilt, setSurfaceTilt] = useState<string>("30");
  const [surfaceAzimuth, setSurfaceAzimuth] = useState<string>("180");
  const [albedo, setAlbedo] = useState<string>("0.2");
  const [altitude, setAltitude] = useState<string>("0");
  const [linkeTurbidity, setLinkeTurbidity] = useState<string>("");

  const [result, setResult] = useState<IrradianceResult | null>(null);
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
      const alb = parseFloat(albedo);
      const alt = parseFloat(altitude);
      const lt = linkeTurbidity ? parseFloat(linkeTurbidity) : null;

      if (isNaN(lat) || isNaN(lon) || isNaN(tilt) || isNaN(azimuth) || isNaN(alb) || isNaN(alt) || !datetime) {
        throw new Error("Please enter valid parameters.");
      }

      const dt = new Date(datetime).toISOString();

      const res = await solarCalc.calculateIrradiance({
        latitude: lat,
        longitude: lon,
        datetime: dt,
        surface_tilt_deg: tilt,
        surface_azimuth_deg: azimuth,
        albedo: alb,
        altitude: alt,
        linke_turbidity: lt,
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/irradiance",
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
        <h1 className="text-3xl font-bold tracking-tight">Surface Irradiance</h1>
        <p className="text-muted-foreground mt-2">
          Calculate clear-sky direct, diffuse, and global irradiance on a horizontal or tilted surface.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter surface and location details.</CardDescription>
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
                <p className="text-xs text-muted-foreground">0 = horizontal, 90 = vertical</p>
              </div>
              <div className="space-y-2">
                <Label>Surface Azimuth (deg)</Label>
                <Input value={surfaceAzimuth} onChange={(e) => setSurfaceAzimuth(e.target.value)} type="number" min="0" max="360" />
                <p className="text-xs text-muted-foreground">180 = south-facing (NH)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Albedo</Label>
                <Input value={albedo} onChange={(e) => setAlbedo(e.target.value)} type="number" min="0" max="1" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Altitude (m)</Label>
                <Input value={altitude} onChange={(e) => setAltitude(e.target.value)} type="number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Linke Turbidity (Optional)</Label>
              <Input value={linkeTurbidity} onChange={(e) => setLinkeTurbidity(e.target.value)} type="number" step="0.1" placeholder="Leave empty for climatological lookup" />
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
            <CardDescription>Irradiance components in W/m².</CardDescription>
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
                  <TableRow className="bg-muted/30"><TableCell colSpan={3} className="font-semibold">Horizontal Irradiance</TableCell></TableRow>
                  <TableRow><TableCell>Direct Normal (DNI)</TableCell><TableCell className="text-right">{result.dni.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell>Diffuse Horizontal (DHI)</TableCell><TableCell className="text-right">{result.dhi.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell>Global Horizontal (GHI)</TableCell><TableCell className="text-right">{result.ghi.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  
                  <TableRow className="bg-muted/30"><TableCell colSpan={3} className="font-semibold">Plane-of-Array (POA) Irradiance</TableCell></TableRow>
                  <TableRow><TableCell>POA Direct</TableCell><TableCell className="text-right">{result.poa_direct.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell>POA Diffuse</TableCell><TableCell className="text-right">{result.poa_diffuse.toFixed(1)}</TableCell><TableCell>W/m²</TableCell></TableRow>
                  <TableRow><TableCell className="font-bold">POA Global (Total)</TableCell><TableCell className="text-right font-bold">{result.poa_global.toFixed(1)}</TableCell><TableCell className="font-bold">W/m²</TableCell></TableRow>
                  
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

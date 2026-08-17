"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, IncidenceAngleResult } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function IncidenceAnglePage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [datetime, setDatetime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [surfaceTilt, setSurfaceTilt] = useState<string>("90"); // Default vertical window
  const [surfaceAzimuth, setSurfaceAzimuth] = useState<string>("180"); // Default south facing
  const [altitude, setAltitude] = useState<string>("0");

  const [result, setResult] = useState<IncidenceAngleResult | null>(null);
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
      const alt = parseFloat(altitude);

      if (isNaN(lat) || isNaN(lon) || isNaN(tilt) || isNaN(azimuth) || isNaN(alt) || !datetime) {
        throw new Error("Please enter valid parameters.");
      }

      const dt = new Date(datetime).toISOString();

      const res = await solarCalc.calculateIncidenceAngle({
        latitude: lat,
        longitude: lon,
        datetime: dt,
        surface_tilt_deg: tilt,
        surface_azimuth_deg: azimuth,
        altitude: alt,
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/incidence-angle",
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
        <h1 className="text-3xl font-bold tracking-tight">Incidence Angle</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the angle of incidence between the sun's direct beam and the normal to a tilted/oriented surface.
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
            <div className="space-y-2">
              <Label>Altitude (m) - Optional</Label>
              <Input value={altitude} onChange={(e) => setAltitude(e.target.value)} type="number" />
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
            <CardDescription>Calculated angle and solar context.</CardDescription>
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
                  <TableRow><TableCell className="font-bold">Angle of Incidence (AOI)</TableCell><TableCell className="text-right font-bold">{result.aoi_deg.toFixed(2)}</TableCell><TableCell className="font-bold">°</TableCell></TableRow>
                  <TableRow className="bg-muted/30"><TableCell colSpan={3} className="text-sm font-semibold">Solar Position Context</TableCell></TableRow>
                  <TableRow><TableCell>True Zenith</TableCell><TableCell className="text-right">{result.solar_position.zenith.toFixed(2)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Azimuth</TableCell><TableCell className="text-right">{result.solar_position.azimuth.toFixed(2)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>True Elevation</TableCell><TableCell className="text-right">{result.solar_position.elevation.toFixed(2)}</TableCell><TableCell>°</TableCell></TableRow>
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

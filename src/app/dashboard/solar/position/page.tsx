"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, SolarPositionResult } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function SolarPositionPage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [datetime, setDatetime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [altitude, setAltitude] = useState<string>("0");

  const [result, setResult] = useState<SolarPositionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const alt = parseFloat(altitude);

      if (isNaN(lat) || isNaN(lon) || isNaN(alt) || !datetime) {
        throw new Error("Please enter valid parameters.");
      }

      // API expects ISO 8601 timezone-aware datetime
      // The datetime-local input gives YYYY-MM-DDThh:mm. We append Z or construct a proper Date object.
      const dt = new Date(datetime).toISOString();

      const res = await solarCalc.calculatePosition({
        latitude: lat,
        longitude: lon,
        datetime: dt,
        altitude: alt,
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/position",
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
        <h1 className="text-3xl font-bold tracking-tight">Solar Position</h1>
        <p className="text-muted-foreground mt-2">
          Calculate solar zenith, azimuth, elevation, and apparent angles using the NREL SPA algorithm.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter location and time details.</CardDescription>
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
            <CardDescription>Solar angles at the specified instant.</CardDescription>
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
                  <TableRow><TableCell>True Zenith</TableCell><TableCell className="text-right">{result.zenith.toFixed(4)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Azimuth</TableCell><TableCell className="text-right">{result.azimuth.toFixed(4)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>True Elevation</TableCell><TableCell className="text-right">{result.elevation.toFixed(4)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Apparent Zenith</TableCell><TableCell className="text-right">{result.apparent_zenith.toFixed(4)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Apparent Elevation</TableCell><TableCell className="text-right">{result.apparent_elevation.toFixed(4)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Equation of Time</TableCell><TableCell className="text-right">{result.equation_of_time.toFixed(2)}</TableCell><TableCell>min</TableCell></TableRow>
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

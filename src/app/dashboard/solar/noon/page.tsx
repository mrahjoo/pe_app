"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, SolarNoonResult } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function SolarNoonPage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const [result, setResult] = useState<SolarNoonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lon) || !date || !timezone) {
        throw new Error("Please enter valid parameters.");
      }

      const res = await solarCalc.calculateNoon({
        latitude: lat,
        longitude: lon,
        date: date,
        timezone: timezone,
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/noon",
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
        <h1 className="text-3xl font-bold tracking-tight">Solar Noon</h1>
        <p className="text-muted-foreground mt-2">
          Calculate solar noon (transit) time and the offset from clock noon for a given location and date.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter location and date details.</CardDescription>
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
              <Label>Date (YYYY-MM-DD)</Label>
              <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </div>
            <div className="space-y-2">
              <Label>Timezone (IANA String)</Label>
              <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} type="text" placeholder="e.g. America/New_York" />
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
            <CardDescription>Solar noon details.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {result ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Date</TableCell><TableCell className="text-right">{result.date}</TableCell></TableRow>
                  <TableRow><TableCell>Timezone</TableCell><TableCell className="text-right">{result.timezone}</TableCell></TableRow>
                  <TableRow><TableCell>Solar Noon (Local Time)</TableCell><TableCell className="text-right">{new Date(result.solar_noon).toLocaleTimeString([], {timeZone: result.timezone, hour: '2-digit', minute:'2-digit'})}</TableCell></TableRow>
                  <TableRow><TableCell>Solar Time Offset</TableCell><TableCell className="text-right">{result.solar_time_offset_minutes.toFixed(2)} minutes</TableCell></TableRow>
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

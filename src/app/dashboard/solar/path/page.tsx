"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solarCalc, SunPathResult } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function SunPathPage() {
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [startDatetime, setStartDatetime] = useState<string>(today.toISOString().slice(0, 16));
  const [endDatetime, setEndDatetime] = useState<string>(tomorrow.toISOString().slice(0, 16));
  const [interval, setInterval] = useState<string>("60");
  const [altitude, setAltitude] = useState<string>("0");

  const [result, setResult] = useState<SunPathResult | null>(null);
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
      const int = parseInt(interval, 10);

      if (isNaN(lat) || isNaN(lon) || isNaN(alt) || isNaN(int) || !startDatetime || !endDatetime) {
        throw new Error("Please enter valid parameters.");
      }

      const startDt = new Date(startDatetime).toISOString();
      const endDt = new Date(endDatetime).toISOString();

      const res = await solarCalc.calculatePath({
        latitude: lat,
        longitude: lon,
        start_datetime: startDt,
        end_datetime: endDt,
        interval_minutes: int,
        altitude: alt,
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/path",
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation. Ensure the range does not exceed 8760 points.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!result) return;
    const headers = ["Timestamp", "Zenith (deg)", "Azimuth (deg)", "Elevation (deg)"];
    const rows = result.points.map(p => [
      p.timestamp,
      p.zenith.toFixed(4),
      p.azimuth.toFixed(4),
      p.elevation.toFixed(4)
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sun_path.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sun Path</h1>
        <p className="text-muted-foreground mt-2">
          Calculate sun path over a time range (batch version of solar position). Maximum 8760 data points.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter location and time range details.</CardDescription>
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
              <Label>Start Datetime (Local)</Label>
              <Input value={startDatetime} onChange={(e) => setStartDatetime(e.target.value)} type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label>End Datetime (Local)</Label>
              <Input value={endDatetime} onChange={(e) => setEndDatetime(e.target.value)} type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label>Interval (minutes)</Label>
              <Input value={interval} onChange={(e) => setInterval(e.target.value)} type="number" min="1" max="1440" />
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>Generated {result?.count || 0} data points.</CardDescription>
            </div>
            {result && (
              <Button onClick={handleExportCsv} variant="outline" size="sm">
                Export CSV
              </Button>
            )}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {result ? (
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Zenith</TableHead>
                      <TableHead>Azimuth</TableHead>
                      <TableHead>Elevation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.points.slice(0, 100).map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(p.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{p.zenith.toFixed(2)}°</TableCell>
                        <TableCell>{p.azimuth.toFixed(2)}°</TableCell>
                        <TableCell>{p.elevation.toFixed(2)}°</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {result.count > 100 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Showing first 100 of {result.count} rows. Please export to CSV to view all data.
                  </p>
                )}
              </div>
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

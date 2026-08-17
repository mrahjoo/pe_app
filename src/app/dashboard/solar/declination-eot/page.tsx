"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { solarCalc, DeclinationEotResult } from "@/lib/api/solar";
import { trackEvent } from "@/lib/analytics";

export default function DeclinationEotPage() {
  const [mode, setMode] = useState<"date" | "doy">("date");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dayOfYear, setDayOfYear] = useState<string>("172");

  const [result, setResult] = useState<DeclinationEotResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      if (mode === "date") {
        if (!date) throw new Error("Please enter a valid date.");
        res = await solarCalc.getDeclinationEot({ date });
      } else {
        const doy = parseInt(dayOfYear, 10);
        if (isNaN(doy) || doy < 1 || doy > 366) throw new Error("Please enter a valid day of year (1-366).");
        res = await solarCalc.getDeclinationEot({ day_of_year: doy });
      }

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/solar/declination-eot",
        data: { mode }
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
        <h1 className="text-3xl font-bold tracking-tight">Declination & Equation of Time</h1>
        <p className="text-muted-foreground mt-2">
          Get solar declination and equation of time for a given date or day-of-year using Spencer (1971) formulas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Select input mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={mode} onValueChange={(v: any) => setMode(v)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="date">By Date</TabsTrigger>
                <TabsTrigger value="doy">By Day of Year</TabsTrigger>
              </TabsList>
              
              <TabsContent value="date" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Date (YYYY-MM-DD)</Label>
                  <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
                </div>
              </TabsContent>

              <TabsContent value="doy" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Day of Year (1 - 366)</Label>
                  <Input value={dayOfYear} onChange={(e) => setDayOfYear(e.target.value)} type="number" min="1" max="366" />
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleCalculate} className="w-full mt-4" disabled={loading}>
              {loading ? "Calculating..." : "Calculate"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Astronomical constants for the requested day.</CardDescription>
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
                  <TableRow><TableCell>Day of Year</TableCell><TableCell className="text-right">{result.day_of_year}</TableCell><TableCell>-</TableCell></TableRow>
                  <TableRow><TableCell>Solar Declination</TableCell><TableCell className="text-right">{result.declination_deg.toFixed(4)}</TableCell><TableCell>°</TableCell></TableRow>
                  <TableRow><TableCell>Equation of Time</TableCell><TableCell className="text-right">{result.equation_of_time_minutes.toFixed(2)}</TableCell><TableCell>min</TableCell></TableRow>
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

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { psychroCalc, UnitSystem, MixResponse } from "@/lib/api/psychrolib";
import { trackEvent } from "@/lib/analytics";
import { Plus, Trash2 } from "lucide-react";

interface StreamInput {
  id: string;
  t_dry_bulb: string;
  rel_hum: string;
  volumetric_flow: string;
}

export default function MixingBoxPage() {
  const [unit, setUnit] = useState<UnitSystem>("SI");
  const [pressure, setPressure] = useState<string>("101325");
  const [streams, setStreams] = useState<StreamInput[]>([
    { id: "1", t_dry_bulb: "35", rel_hum: "0.5", volumetric_flow: "1000" },
    { id: "2", t_dry_bulb: "24", rel_hum: "0.5", volumetric_flow: "4000" },
  ]);

  const [result, setResult] = useState<MixResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStream = () => {
    setStreams([...streams, { id: Date.now().toString(), t_dry_bulb: "", rel_hum: "", volumetric_flow: "" }]);
  };

  const removeStream = (id: string) => {
    if (streams.length <= 2) return;
    setStreams(streams.filter(s => s.id !== id));
  };

  const updateStream = (id: string, field: keyof StreamInput, value: string) => {
    setStreams(streams.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const p = parseFloat(pressure);
      if (isNaN(p)) throw new Error("Invalid pressure");

      const parsedStreams = streams.map(s => {
        const db = parseFloat(s.t_dry_bulb);
        const rh = parseFloat(s.rel_hum);
        const flow = parseFloat(s.volumetric_flow);

        if (isNaN(db) || isNaN(rh) || isNaN(flow)) {
          throw new Error("Please ensure all stream inputs are valid numbers.");
        }
        return {
          t_dry_bulb: db,
          rel_hum: rh,
          volumetric_flow: flow,
          flow_unit: unit === "SI" ? "m3/h" : "cfm"
        };
      });

      const res = await psychroCalc.mix({
        unit_system: unit,
        pressure: p,
        streams: parsedStreams,
      });

      setResult(res);

      trackEvent({
        eventType: "CALCULATOR_SUBMIT",
        resource: "/dashboard/psychrometrics/mixing-box",
        data: { unitSystem: unit, streams: parsedStreams.length }
      });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Air Mixing Box Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Combine multiple air streams to determine the resultant mixed air state.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit System</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as UnitSystem)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SI">SI (°C, m³/h, Pa)</SelectItem>
                      <SelectItem value="IP">IP (°F, cfm, psi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pressure ({unit === "SI" ? "Pa" : "psi"})</Label>
                  <Input value={pressure} onChange={(e) => setPressure(e.target.value)} type="number" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Air Streams</CardTitle>
                <CardDescription>Define 2 or more streams.</CardDescription>
              </div>
              <Button onClick={addStream} variant="outline" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-2" /> Add Stream
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {streams.map((stream, idx) => (
                <div key={stream.id} className="p-4 border rounded-md relative group">
                  {streams.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeStream(stream.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  <h4 className="text-sm font-medium mb-3">Stream {idx + 1}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Dry Bulb ({unit === "SI" ? "°C" : "°F"})</Label>
                      <Input value={stream.t_dry_bulb} onChange={(e) => updateStream(stream.id, "t_dry_bulb", e.target.value)} type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">RH (0-1)</Label>
                      <Input value={stream.rel_hum} onChange={(e) => updateStream(stream.id, "rel_hum", e.target.value)} type="number" step="0.05" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Flow ({unit === "SI" ? "m³/h" : "cfm"})</Label>
                      <Input value={stream.volumetric_flow} onChange={(e) => updateStream(stream.id, "volumetric_flow", e.target.value)} type="number" />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button onClick={handleCalculate} className="w-full" disabled={loading}>
                {loading ? "Calculating..." : "Calculate Mixed State"}
              </Button>
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Mixed State Results</CardTitle>
            <CardDescription>Properties of the combined air stream.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Dry Bulb Temp</TableCell>
                      <TableCell className="text-right">{result.mixed_state.t_dry_bulb.toFixed(2)}</TableCell>
                      <TableCell>{unit === "SI" ? "°C" : "°F"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Relative Humidity</TableCell>
                      <TableCell className="text-right">{(result.mixed_state.rel_hum * 100).toFixed(1)}</TableCell>
                      <TableCell>%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Humidity Ratio</TableCell>
                      <TableCell className="text-right">{result.mixed_state.hum_ratio.toFixed(5)}</TableCell>
                      <TableCell>{unit === "SI" ? "kg/kg" : "lb/lb"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Enthalpy</TableCell>
                      <TableCell className="text-right">{result.mixed_state.enthalpy.toFixed(1)}</TableCell>
                      <TableCell>{unit === "SI" ? "J/kg" : "Btu/lb"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Mass Flow</TableCell>
                      <TableCell className="text-right">{result.total_dry_air_mass_flow.toFixed(2)}</TableCell>
                      <TableCell>{unit === "SI" ? "kg/s" : "lb/s"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Stream Fractions</h4>
                  <div className="space-y-2">
                    {result.stream_details.map((s, i) => (
                      <div key={i} className="flex justify-between text-sm border-b pb-2 last:border-0">
                        <span>Stream {i + 1} Mass Fraction</span>
                        <span className="font-mono">{(s.mass_fraction * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-center p-4">
                Enter stream parameters and click Calculate to see the resultant mixed state.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

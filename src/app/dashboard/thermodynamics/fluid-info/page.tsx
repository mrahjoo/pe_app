"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { refpropApi, SubstanceList, SubstanceInfo } from "@/lib/api/refprop";
import { Info } from "lucide-react";

export default function FluidInfoPage() {
  const [substanceList, setSubstanceList] = useState<SubstanceList | null>(null);
  const [selectedFluid, setSelectedFluid] = useState<string>("WATER");
  const [info, setInfo] = useState<SubstanceInfo | null>(null);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refpropApi.listSubstances()
      .then(data => {
        setSubstanceList(data);
      })
      .catch(err => setError("Failed to load substance list."))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!selectedFluid) return;
    setLoadingInfo(true);
    refpropApi.getSubstanceInfo(selectedFluid)
      .then(data => setInfo(data))
      .catch(err => setError("Failed to load substance info."))
      .finally(() => setLoadingInfo(false));
  }, [selectedFluid]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fluid Database & Info</h1>
        <p className="text-muted-foreground mt-2">
          Select a pure fluid or mixture to view its properties and compliance details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluid Selection</CardTitle>
            <CardDescription>Choose a substance from the REFPROP database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Select value={selectedFluid} onValueChange={(val) => setSelectedFluid(val || "")} disabled={loadingList}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a fluid" />
                </SelectTrigger>
                <SelectContent>
                  {substanceList?.fluids.map((fluid) => (
                    <SelectItem key={fluid} value={fluid}>
                      {fluid}
                    </SelectItem>
                  ))}
                  {substanceList?.mixtures.map((mix) => (
                    <SelectItem key={mix} value={mix}>
                      {mix}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Property Fact Sheet
            </CardTitle>
            <CardDescription>Detailed information for {selectedFluid}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInfo ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : info ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="font-semibold text-muted-foreground">Molar Mass</div>
                  <div>{info.overall.molar_mass.value?.toPrecision(5)} {info.overall.molar_mass.unit}</div>
                  
                  <div className="font-semibold text-muted-foreground">Critical Temp</div>
                  <div>{info.overall.critical_temp.value?.toPrecision(5)} {info.overall.critical_temp.unit}</div>
                  
                  <div className="font-semibold text-muted-foreground">Critical Pressure</div>
                  <div>{info.overall.critical_pressure.value?.toPrecision(5)} {info.overall.critical_pressure.unit}</div>
                  
                  <div className="font-semibold text-muted-foreground">Critical Density</div>
                  <div>{info.overall.critical_density.value?.toPrecision(5)} {info.overall.critical_density.unit}</div>
                  
                  <div className="font-semibold text-muted-foreground">Triple Point Temp</div>
                  <div>{info.overall.triple_point_temp.value?.toPrecision(5)} {info.overall.triple_point_temp.unit}</div>
                  
                  <div className="font-semibold text-muted-foreground">Acentric Factor</div>
                  <div>{info.overall.acentric_factor.value?.toPrecision(5)}</div>
                </div>
                
                {info.components.length === 1 && info.components[0].cas_number && (
                  <div className="pt-4 mt-4 border-t border-dashed">
                    <h4 className="font-semibold mb-2 text-primary">Compliance & Safety</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="font-semibold text-muted-foreground">CAS Number</div>
                      <div>{info.components[0].cas_number}</div>
                      
                      <div className="font-semibold text-muted-foreground">ASHRAE Safety Class</div>
                      <div>{info.components[0].safety_ashrae || "N/A"}</div>
                      
                      <div className="font-semibold text-muted-foreground">GWP (100 yr)</div>
                      <div>{info.components[0].gwp?.value ?? "N/A"}</div>
                      
                      <div className="font-semibold text-muted-foreground">ODP</div>
                      <div>{info.components[0].odp?.value ?? "N/A"}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Select a fluid to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

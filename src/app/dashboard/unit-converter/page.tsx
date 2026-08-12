"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { unitConvertApi, CategoryResponse, UnitResponse, ConvertResponse } from "@/lib/api/unitconvert";
import { ArrowRightLeft, Calculator } from "lucide-react";

export default function UnitConverterPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("1");
  
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load categories on mount
    unitConvertApi.getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      })
      .catch((err) => setError("Failed to load categories."));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    
    // Load units for selected category
    unitConvertApi.getUnitsByCategory(selectedCategory)
      .then((data) => {
        setUnits(data);
        if (data.length >= 2) {
          setFromUnit(data[0].id);
          setToUnit(data[1].id);
        } else if (data.length === 1) {
          setFromUnit(data[0].id);
          setToUnit(data[0].id);
        }
        setResult(null);
      })
      .catch((err) => setError("Failed to load units for category."));
  }, [selectedCategory]);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const val = parseFloat(inputValue);
      if (isNaN(val)) throw new Error("Please enter a valid numeric value.");
      
      const res = await unitConvertApi.convert({
        value: val,
        from_unit: fromUnit,
        to_unit: toUnit,
        category: selectedCategory,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "An error occurred during conversion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unit Converter</h1>
        <p className="text-muted-foreground mt-2">
          Easily convert values across various measurement categories.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Settings</CardTitle>
            <CardDescription>Select units and enter your value.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex items-center gap-2">
                  <Select value={fromUnit} onValueChange={(val) => setFromUnit(val || "")}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="ghost" size="icon" onClick={handleSwap} title="Swap Units">
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toUnit} onValueChange={(val) => setToUnit(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Value</Label>
              <Input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                type="number" 
                placeholder="Enter value" 
              />
            </div>

            <Button onClick={handleConvert} className="w-full" disabled={loading || !fromUnit || !toUnit}>
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Converting..." : "Convert"}
            </Button>
            
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>The output of your conversion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result ? (
              <div className="flex flex-col items-center justify-center space-y-4 p-6 border rounded-lg bg-muted/20">
                <div className="text-muted-foreground text-sm text-center">
                  {result.input_value} {units.find(u => u.id === result.from_unit)?.symbol}
                  <br />=
                </div>
                <div className="text-4xl font-bold text-primary text-center break-all">
                  {result.output_value.toPrecision(6)} 
                  <span className="text-2xl font-normal ml-2 text-muted-foreground">
                    {units.find(u => u.id === result.to_unit)?.symbol}
                  </span>
                </div>
                
                <div className="w-full pt-4 mt-4 border-t border-dashed">
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded overflow-x-auto text-center">
                    Formula: {result.formula_applied}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Enter a value and click Convert.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

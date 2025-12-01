import React, { useState, useEffect, useMemo } from 'react';
import { Calculator as CalcIcon, Percent, DollarSign, Package, Clock, Layers } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProducts, getMaterials, getLaborRates } from '@/lib/store';
import { calculateHPP, formatCurrency, formatNumber } from '@/lib/hpp-calculator';
import type { Product, HPPResult } from '@/types';

const Calculator: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [marginPercent, setMarginPercent] = useState(30);
  const [laborMinutes, setLaborMinutes] = useState(30);
  const [monthlyProduction, setMonthlyProduction] = useState(500);
  const [result, setResult] = useState<HPPResult | null>(null);

  useEffect(() => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
    if (loadedProducts.length > 0) {
      setSelectedProductId(loadedProducts[0].id);
      setLaborMinutes(loadedProducts[0].laborMinutes);
    }
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  useEffect(() => {
    if (selectedProduct) {
      setLaborMinutes(selectedProduct.laborMinutes);
    }
  }, [selectedProduct]);

  const handleCalculate = () => {
    if (!selectedProduct) return;

    const hppResult = calculateHPP(selectedProduct, {
      marginPercent,
      laborMinutes,
      monthlyProduction,
    });

    setResult(hppResult);
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setLaborMinutes(product.laborMinutes);
    }
    setResult(null);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Kalkulator HPP"
        description="Hitung Harga Pokok Produksi dengan mudah"
      />

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Belum ada produk. Tambahkan produk terlebih dahulu untuk menghitung HPP.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalcIcon className="w-5 h-5 text-accent" />
                  Parameter Kalkulasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Selection */}
                <div>
                  <Label>Pilih Produk</Label>
                  <Select value={selectedProductId} onValueChange={handleProductChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Margin Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Target Margin
                    </Label>
                    <span className="font-mono text-sm font-medium">{marginPercent}%</span>
                  </div>
                  <Slider
                    value={[marginPercent]}
                    onValueChange={(value) => setMarginPercent(value[0])}
                    min={10}
                    max={70}
                    step={5}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10%</span>
                    <span>70%</span>
                  </div>
                </div>

                {/* Labor Minutes */}
                <div>
                  <Label htmlFor="labor" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Waktu Kerja per Unit (menit)
                  </Label>
                  <Input
                    id="labor"
                    type="number"
                    min="1"
                    value={laborMinutes}
                    onChange={(e) => setLaborMinutes(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                {/* Monthly Production */}
                <div>
                  <Label htmlFor="production" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Estimasi Produksi/Bulan
                  </Label>
                  <Input
                    id="production"
                    type="number"
                    min="1"
                    value={monthlyProduction}
                    onChange={(e) => setMonthlyProduction(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Untuk alokasi biaya overhead
                  </p>
                </div>

                <Button onClick={handleCalculate} className="w-full" size="lg">
                  <CalcIcon className="w-4 h-4 mr-2" />
                  Hitung HPP
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6 animate-scale-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-6">
                      <p className="text-sm opacity-80 mb-1">HPP per Unit</p>
                      <p className="text-3xl font-bold font-mono">
                        {formatCurrency(result.breakdown.hppPerUnit)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-accent text-accent-foreground">
                    <CardContent className="p-6">
                      <p className="text-sm opacity-80 mb-1">Harga Jual Rekomendasi</p>
                      <p className="text-3xl font-bold font-mono">
                        {formatCurrency(result.suggestedPrice)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-success text-success-foreground">
                    <CardContent className="p-6">
                      <p className="text-sm opacity-80 mb-1">Margin</p>
                      <p className="text-3xl font-bold font-mono">
                        {result.marginPercent}%
                      </p>
                      <p className="text-sm opacity-80 mt-1">
                        {formatCurrency(result.suggestedPrice - result.breakdown.hppPerUnit)}/unit
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rincian Biaya</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Material Costs */}
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <Package className="w-4 h-4 text-accent" />
                          Biaya Bahan Baku
                        </h4>
                        <div className="bg-muted/50 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Bahan</th>
                                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Jumlah</th>
                                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Harga</th>
                                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.breakdown.materialDetails.map((m, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                  <td className="p-3 font-medium">{m.name}</td>
                                  <td className="p-3 text-right font-mono text-muted-foreground">
                                    {formatNumber(m.quantity)} {m.unit}
                                  </td>
                                  <td className="p-3 text-right font-mono text-muted-foreground">
                                    {formatCurrency(m.pricePerUnit)}
                                  </td>
                                  <td className="p-3 text-right font-mono font-medium">
                                    {formatCurrency(m.total)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-muted">
                                <td colSpan={3} className="p-3 font-semibold">Subtotal Bahan</td>
                                <td className="p-3 text-right font-mono font-bold">
                                  {formatCurrency(result.breakdown.materialsTotal)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Other Costs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-accent" />
                            <span className="font-medium">Biaya Tenaga Kerja</span>
                          </div>
                          <p className="text-2xl font-bold font-mono">
                            {formatCurrency(result.breakdown.laborCost)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {laborMinutes} menit @ Rp{formatNumber(getLaborRates()[0]?.wagePerHour || 20000)}/jam
                          </p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-4 h-4 text-accent" />
                            <span className="font-medium">Biaya Overhead</span>
                          </div>
                          <p className="text-2xl font-bold font-mono">
                            {formatCurrency(result.breakdown.overheadCost)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Dialokasikan per {formatNumber(monthlyProduction, 0)} unit/bulan
                          </p>
                        </div>
                      </div>

                      {/* Total Summary */}
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total HPP per Unit</span>
                          <span className="text-2xl font-bold font-mono text-primary">
                            {formatCurrency(result.breakdown.hppPerUnit)}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary/20 flex justify-between items-center">
                          <span className="font-medium">Dengan margin {result.marginPercent}%</span>
                          <span className="text-xl font-bold font-mono text-accent">
                            {formatCurrency(result.suggestedPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <CalcIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Pilih produk dan parameter</p>
                  <p className="text-muted-foreground">
                    Klik "Hitung HPP" untuk melihat hasil kalkulasi
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;

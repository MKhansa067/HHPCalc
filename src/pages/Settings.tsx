import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getOverheads, addOverhead, updateOverhead, deleteOverhead, getLaborRates, saveLaborRates } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/hpp-calculator';
import type { Overhead, LaborRate } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const Settings: React.FC = () => {
  const [overheads, setOverheads] = useState<Overhead[]>([]);
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [loadedOverheads, loadedLaborRates] = await Promise.all([
        getOverheads(),
        getLaborRates()
      ]);
      setOverheads(loadedOverheads);
      setLaborRates(loadedLaborRates);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddOverhead = () => {
    setOverheads([
      ...overheads,
      { id: uuidv4(), name: '', amount: 0, allocationType: 'fixed' },
    ]);
    setHasChanges(true);
  };

  const handleRemoveOverhead = (id: string) => {
    setOverheads(overheads.filter(o => o.id !== id));
    setHasChanges(true);
  };

  const handleOverheadChange = (id: string, field: keyof Overhead, value: string | number) => {
    setOverheads(overheads.map(o => 
      o.id === id ? { ...o, [field]: value } : o
    ));
    setHasChanges(true);
  };

  const handleAddLaborRate = () => {
    setLaborRates([
      ...laborRates,
      { id: uuidv4(), name: '', wagePerHour: 0 },
    ]);
    setHasChanges(true);
  };

  const handleRemoveLaborRate = (id: string) => {
    if (laborRates.length <= 1) {
      toast({ title: 'Error', description: 'Minimal harus ada satu tarif tenaga kerja', variant: 'destructive' });
      return;
    }
    setLaborRates(laborRates.filter(r => r.id !== id));
    setHasChanges(true);
  };

  const handleLaborRateChange = (id: string, field: keyof LaborRate, value: string | number) => {
    setLaborRates(laborRates.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validate
    const validOverheads = overheads.filter(o => o.name.trim() !== '');
    const validLaborRates = laborRates.filter(r => r.name.trim() !== '' && r.wagePerHour > 0);

    if (validLaborRates.length === 0) {
      toast({ title: 'Error', description: 'Minimal harus ada satu tarif tenaga kerja yang valid', variant: 'destructive' });
      return;
    }

    try {
      // Get current overheads from DB
      const currentOverheads = await getOverheads();
      const currentIds = currentOverheads.map(o => o.id);
      const validIds = validOverheads.map(o => o.id);

      // Delete removed overheads
      for (const id of currentIds) {
        if (!validIds.includes(id)) {
          await deleteOverhead(id);
        }
      }

      // Add or update overheads
      for (const overhead of validOverheads) {
        if (currentIds.includes(overhead.id)) {
          await updateOverhead(overhead.id, overhead);
        } else {
          await addOverhead({ name: overhead.name, amount: overhead.amount, allocationType: overhead.allocationType });
        }
      }

      // Save labor rates
      await saveLaborRates(validLaborRates);
      
      await loadData();
      setHasChanges(false);
      
      toast({ title: 'Berhasil', description: 'Pengaturan berhasil disimpan' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: 'Error', description: 'Gagal menyimpan pengaturan', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pengaturan"
        description="Konfigurasi biaya overhead dan tarif tenaga kerja"
      >
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overhead Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Biaya Overhead</CardTitle>
                <CardDescription>Biaya tetap yang dialokasikan ke setiap produk</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddOverhead}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {overheads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada biaya overhead. Klik "Tambah" untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-4">
                {overheads.map((overhead) => (
                  <div key={overhead.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-xs">Nama</Label>
                        <Input
                          value={overhead.name}
                          onChange={(e) => handleOverheadChange(overhead.id, 'name', e.target.value)}
                          placeholder="Contoh: Listrik & Gas"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveOverhead(overhead.id)}
                        className="mt-5"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Jumlah (Rp)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={overhead.amount}
                          onChange={(e) => handleOverheadChange(overhead.id, 'amount', Number(e.target.value))}
                          className="input-currency"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Metode Alokasi</Label>
                        <Select
                          value={overhead.allocationType}
                          onValueChange={(value) => handleOverheadChange(overhead.id, 'allocationType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Per Bulan (bagi rata)</SelectItem>
                            <SelectItem value="per_unit">Per Unit</SelectItem>
                            <SelectItem value="percentage">Persentase HPP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overhead.allocationType === 'fixed' && `${formatCurrency(overhead.amount)}/bulan, dibagi ke produksi bulanan`}
                      {overhead.allocationType === 'per_unit' && `${formatCurrency(overhead.amount)} per unit produk`}
                      {overhead.allocationType === 'percentage' && `${overhead.amount}% dari biaya bahan + tenaga kerja`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Labor Rate Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Tarif Tenaga Kerja</CardTitle>
                <CardDescription>Upah per jam untuk kalkulasi biaya tenaga kerja</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddLaborRate}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {laborRates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada tarif. Klik "Tambah" untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-4">
                {laborRates.map((rate) => (
                  <div key={rate.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-xs">Nama/Posisi</Label>
                        <Input
                          value={rate.name}
                          onChange={(e) => handleLaborRateChange(rate.id, 'name', e.target.value)}
                          placeholder="Contoh: Baker"
                        />
                      </div>
                      <div className="w-40">
                        <Label className="text-xs">Upah/Jam (Rp)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={rate.wagePerHour}
                          onChange={(e) => handleLaborRateChange(rate.id, 'wagePerHour', Number(e.target.value))}
                          className="input-currency"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveLaborRate(rate.id)}
                        className="mt-5"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatCurrency(rate.wagePerHour)}/jam = {formatCurrency(rate.wagePerHour / 60)}/menit
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-accent" />
              Informasi Pengaturan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Metode Alokasi Overhead</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li><strong>Per Bulan:</strong> Biaya bulanan dibagi rata ke estimasi produksi bulanan</li>
                  <li><strong>Per Unit:</strong> Biaya langsung ditambahkan per unit produk</li>
                  <li><strong>Persentase:</strong> Persentase dari total biaya bahan + tenaga kerja</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Kalkulasi Biaya Tenaga Kerja</h4>
                <p className="text-sm text-muted-foreground">
                  Biaya tenaga kerja dihitung berdasarkan waktu produksi per unit (dalam menit) 
                  dikalikan dengan tarif per menit. Tarif default yang digunakan adalah tarif pertama dalam daftar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

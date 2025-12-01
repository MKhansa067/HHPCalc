import * as XLSX from 'xlsx';
import type { HPPResult, Sale, ForecastResult } from '@/types';
import { formatCurrency, formatNumber } from './hpp-calculator';

interface ExportData {
  hpp: HPPResult;
  sales: Sale[];
  forecast?: ForecastResult;
  period: { start: Date; end: Date };
}

export const exportToExcel = (data: ExportData): void => {
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Summary
  const summaryData = [
    ['LAPORAN HPP - ' + data.hpp.productName],
    [''],
    ['Tanggal Kalkulasi', new Date(data.hpp.computedAt).toLocaleDateString('id-ID')],
    ['Periode', `${data.period.start.toLocaleDateString('id-ID')} - ${data.period.end.toLocaleDateString('id-ID')}`],
    [''],
    ['RINGKASAN BIAYA'],
    ['Total Biaya Bahan', data.hpp.breakdown.materialsTotal],
    ['Biaya Tenaga Kerja', data.hpp.breakdown.laborCost],
    ['Biaya Overhead', data.hpp.breakdown.overheadCost],
    [''],
    ['HPP per Unit', data.hpp.breakdown.hppPerUnit],
    ['Harga Jual Rekomendasi', data.hpp.suggestedPrice],
    ['Target Margin', `${data.hpp.marginPercent}%`],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
  
  // Sheet 2: Material Details
  const materialHeaders = ['Nama Bahan', 'Jumlah per Unit', 'Satuan', 'Harga per Satuan', 'Total Biaya'];
  const materialRows = data.hpp.breakdown.materialDetails.map(m => [
    m.name,
    m.quantity,
    m.unit,
    m.pricePerUnit,
    m.total,
  ]);
  
  const materialData = [materialHeaders, ...materialRows];
  const materialSheet = XLSX.utils.aoa_to_sheet(materialData);
  materialSheet['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(workbook, materialSheet, 'Detail Bahan');
  
  // Sheet 3: Labor & Overhead
  const overheadData = [
    ['BIAYA TENAGA KERJA & OVERHEAD'],
    [''],
    ['Biaya Tenaga Kerja', data.hpp.breakdown.laborCost],
    ['Biaya Overhead', data.hpp.breakdown.overheadCost],
    [''],
    ['Total Biaya Tidak Langsung', data.hpp.breakdown.laborCost + data.hpp.breakdown.overheadCost],
  ];
  
  const overheadSheet = XLSX.utils.aoa_to_sheet(overheadData);
  XLSX.utils.book_append_sheet(workbook, overheadSheet, 'Tenaga Kerja & Overhead');
  
  // Sheet 4: Sales History
  if (data.sales.length > 0) {
    const salesHeaders = ['Tanggal', 'Jumlah', 'Harga per Unit', 'Total'];
    const salesRows = data.sales.map(s => [
      new Date(s.soldAt).toLocaleDateString('id-ID'),
      s.quantity,
      s.unitPrice,
      s.quantity * s.unitPrice,
    ]);
    
    const salesData = [salesHeaders, ...salesRows];
    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    salesSheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Riwayat Penjualan');
  }
  
  // Sheet 5: Forecast
  if (data.forecast) {
    const forecastHeaders = ['Tanggal', 'Prediksi Penjualan'];
    const forecastRows = data.forecast.dailyForecast.map(f => [
      new Date(f.date).toLocaleDateString('id-ID'),
      f.quantity,
    ]);
    
    const forecastSummary = [
      ['PREDIKSI PENJUALAN'],
      [''],
      ['Total Prediksi ' + data.forecast.horizon + ' Hari', data.forecast.totalForecast],
      ['Rata-rata Penjualan Harian', Math.round(data.forecast.averageDailySales)],
      ['Stok Saat Ini', data.forecast.currentStock],
      ['Rekomendasi Restock', data.forecast.recommendedRestock],
      ['Tren', data.forecast.trend === 'up' ? 'Naik' : data.forecast.trend === 'down' ? 'Turun' : 'Stabil'],
      [''],
      ...forecastRows,
    ];
    
    const forecastData = [...forecastSummary.slice(0, 8), forecastHeaders, ...forecastRows];
    const forecastSheet = XLSX.utils.aoa_to_sheet(forecastData);
    forecastSheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Prediksi');
  }
  
  // Generate file name
  const fileName = `HPP_${data.hpp.productName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Download file
  XLSX.writeFile(workbook, fileName);
};

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'pack';

export interface Material {
  id: string;
  name: string;
  unit: Unit;
  pricePerUnit: number;
  stockAmount: number;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  yieldPerBatch: number;
  ingredients: ProductIngredient[];
  laborMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductIngredient {
  id: string;
  materialId: string;
  quantity: number;
}

export interface Overhead {
  id: string;
  name: string;
  amount: number;
  allocationType: 'fixed' | 'per_unit' | 'percentage';
}

export interface LaborRate {
  id: string;
  name: string;
  wagePerHour: number;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  soldAt: Date;
}

export interface HPPResult {
  productId: string;
  productName: string;
  computedAt: Date;
  breakdown: {
    materialsTotal: number;
    materialDetails: { name: string; quantity: number; unit: Unit; pricePerUnit: number; total: number }[];
    laborCost: number;
    overheadCost: number;
    hppPerUnit: number;
  };
  suggestedPrice: number;
  marginPercent: number;
}

export interface ForecastResult {
  productId: string;
  productName: string;
  horizon: number;
  dailyForecast: { date: string; quantity: number }[];
  totalForecast: number;
  currentStock: number;
  recommendedRestock: number;
  averageDailySales: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalMaterials: number;
  totalSales: number;
  totalRevenue: number;
  averageHPP: number;
  averageMargin: number;
}

import { v4 as uuidv4 } from 'uuid';
import type { Material, Product, Overhead, LaborRate, Sale, Unit } from '@/types';

// Local storage keys
const STORAGE_KEYS = {
  materials: 'hpp_materials',
  products: 'hpp_products',
  overheads: 'hpp_overheads',
  laborRates: 'hpp_labor_rates',
  sales: 'hpp_sales',
};

// Helper functions
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

// Seed data for demo
const seedMaterials: Material[] = [
  { id: uuidv4(), name: 'Tepung Terigu', unit: 'kg', pricePerUnit: 12000, stockAmount: 50, updatedAt: new Date() },
  { id: uuidv4(), name: 'Gula Pasir', unit: 'kg', pricePerUnit: 15000, stockAmount: 30, updatedAt: new Date() },
  { id: uuidv4(), name: 'Telur', unit: 'pcs', pricePerUnit: 2500, stockAmount: 200, updatedAt: new Date() },
  { id: uuidv4(), name: 'Mentega', unit: 'g', pricePerUnit: 80, stockAmount: 5000, updatedAt: new Date() },
  { id: uuidv4(), name: 'Susu UHT', unit: 'ml', pricePerUnit: 20, stockAmount: 10000, updatedAt: new Date() },
  { id: uuidv4(), name: 'Cokelat Bubuk', unit: 'g', pricePerUnit: 150, stockAmount: 2000, updatedAt: new Date() },
  { id: uuidv4(), name: 'Vanili', unit: 'g', pricePerUnit: 500, stockAmount: 500, updatedAt: new Date() },
  { id: uuidv4(), name: 'Baking Powder', unit: 'g', pricePerUnit: 100, stockAmount: 1000, updatedAt: new Date() },
];

const seedOverheads: Overhead[] = [
  { id: uuidv4(), name: 'Listrik & Gas', amount: 500000, allocationType: 'fixed' },
  { id: uuidv4(), name: 'Sewa Tempat', amount: 2000000, allocationType: 'fixed' },
  { id: uuidv4(), name: 'Packaging', amount: 500, allocationType: 'per_unit' },
];

const seedLaborRates: LaborRate[] = [
  { id: uuidv4(), name: 'Baker', wagePerHour: 25000 },
  { id: uuidv4(), name: 'Helper', wagePerHour: 15000 },
];

// Materials API
export const getMaterials = (): Material[] => {
  const materials = loadFromStorage<Material[]>(STORAGE_KEYS.materials, []);
  if (materials.length === 0) {
    saveMaterials(seedMaterials);
    return seedMaterials;
  }
  return materials;
};

export const saveMaterials = (materials: Material[]): void => {
  saveToStorage(STORAGE_KEYS.materials, materials);
};

export const addMaterial = (material: Omit<Material, 'id' | 'updatedAt'>): Material => {
  const materials = getMaterials();
  const newMaterial: Material = {
    ...material,
    id: uuidv4(),
    updatedAt: new Date(),
  };
  saveMaterials([...materials, newMaterial]);
  return newMaterial;
};

export const updateMaterial = (id: string, updates: Partial<Material>): Material | null => {
  const materials = getMaterials();
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  materials[index] = { ...materials[index], ...updates, updatedAt: new Date() };
  saveMaterials(materials);
  return materials[index];
};

export const deleteMaterial = (id: string): boolean => {
  const materials = getMaterials();
  const filtered = materials.filter(m => m.id !== id);
  if (filtered.length === materials.length) return false;
  saveMaterials(filtered);
  return true;
};

// Seed products
const createSeedProducts = (materials: Material[]): Product[] => {
  const tepung = materials.find(m => m.name === 'Tepung Terigu');
  const gula = materials.find(m => m.name === 'Gula Pasir');
  const telur = materials.find(m => m.name === 'Telur');
  const mentega = materials.find(m => m.name === 'Mentega');
  const susu = materials.find(m => m.name === 'Susu UHT');
  const cokelat = materials.find(m => m.name === 'Cokelat Bubuk');
  const vanili = materials.find(m => m.name === 'Vanili');
  const bakingPowder = materials.find(m => m.name === 'Baking Powder');

  if (!tepung || !gula || !telur || !mentega || !susu) return [];

  return [
    {
      id: uuidv4(),
      name: 'Brownies Coklat',
      description: 'Brownies coklat premium dengan topping almond',
      yieldPerBatch: 12,
      laborMinutes: 45,
      ingredients: [
        { id: uuidv4(), materialId: tepung.id, quantity: 250 }, // 250g tepung
        { id: uuidv4(), materialId: gula.id, quantity: 200 }, // 200g gula (0.2kg)
        { id: uuidv4(), materialId: telur.id, quantity: 4 }, // 4 telur
        { id: uuidv4(), materialId: mentega.id, quantity: 150 }, // 150g mentega
        { id: uuidv4(), materialId: cokelat?.id || '', quantity: 100 }, // 100g cokelat
      ].filter(i => i.materialId),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Kue Bolu Vanilla',
      description: 'Kue bolu lembut dengan aroma vanilla',
      yieldPerBatch: 8,
      laborMinutes: 60,
      ingredients: [
        { id: uuidv4(), materialId: tepung.id, quantity: 300 },
        { id: uuidv4(), materialId: gula.id, quantity: 250 },
        { id: uuidv4(), materialId: telur.id, quantity: 5 },
        { id: uuidv4(), materialId: mentega.id, quantity: 200 },
        { id: uuidv4(), materialId: susu.id, quantity: 200 },
        { id: uuidv4(), materialId: vanili?.id || '', quantity: 5 },
        { id: uuidv4(), materialId: bakingPowder?.id || '', quantity: 10 },
      ].filter(i => i.materialId),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Cookies Choco Chip',
      description: 'Cookies renyah dengan choco chip',
      yieldPerBatch: 24,
      laborMinutes: 30,
      ingredients: [
        { id: uuidv4(), materialId: tepung.id, quantity: 200 },
        { id: uuidv4(), materialId: gula.id, quantity: 100 },
        { id: uuidv4(), materialId: telur.id, quantity: 2 },
        { id: uuidv4(), materialId: mentega.id, quantity: 120 },
        { id: uuidv4(), materialId: cokelat?.id || '', quantity: 50 },
      ].filter(i => i.materialId),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

// Products API
export const getProducts = (): Product[] => {
  const products = loadFromStorage<Product[]>(STORAGE_KEYS.products, []);
  if (products.length === 0) {
    const materials = getMaterials();
    const seedProducts = createSeedProducts(materials);
    if (seedProducts.length > 0) {
      saveProducts(seedProducts);
      return seedProducts;
    }
  }
  return products;
};

export const saveProducts = (products: Product[]): void => {
  saveToStorage(STORAGE_KEYS.products, products);
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  saveProducts([...products, newProduct]);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates, updatedAt: new Date() };
  saveProducts(products);
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
};

// Overheads API
export const getOverheads = (): Overhead[] => {
  const overheads = loadFromStorage<Overhead[]>(STORAGE_KEYS.overheads, []);
  if (overheads.length === 0) {
    saveOverheads(seedOverheads);
    return seedOverheads;
  }
  return overheads;
};

export const saveOverheads = (overheads: Overhead[]): void => {
  saveToStorage(STORAGE_KEYS.overheads, overheads);
};

export const addOverhead = (overhead: Omit<Overhead, 'id'>): Overhead => {
  const overheads = getOverheads();
  const newOverhead: Overhead = { ...overhead, id: uuidv4() };
  saveOverheads([...overheads, newOverhead]);
  return newOverhead;
};

export const updateOverhead = (id: string, updates: Partial<Overhead>): Overhead | null => {
  const overheads = getOverheads();
  const index = overheads.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  overheads[index] = { ...overheads[index], ...updates };
  saveOverheads(overheads);
  return overheads[index];
};

export const deleteOverhead = (id: string): boolean => {
  const overheads = getOverheads();
  const filtered = overheads.filter(o => o.id !== id);
  if (filtered.length === overheads.length) return false;
  saveOverheads(filtered);
  return true;
};

// Labor Rates API
export const getLaborRates = (): LaborRate[] => {
  const rates = loadFromStorage<LaborRate[]>(STORAGE_KEYS.laborRates, []);
  if (rates.length === 0) {
    saveLaborRates(seedLaborRates);
    return seedLaborRates;
  }
  return rates;
};

export const saveLaborRates = (rates: LaborRate[]): void => {
  saveToStorage(STORAGE_KEYS.laborRates, rates);
};

// Sales API
export const getSales = (): Sale[] => {
  return loadFromStorage<Sale[]>(STORAGE_KEYS.sales, []);
};

export const saveSales = (sales: Sale[]): void => {
  saveToStorage(STORAGE_KEYS.sales, sales);
};

export const addSale = (sale: Omit<Sale, 'id'>): Sale => {
  const sales = getSales();
  const newSale: Sale = { ...sale, id: uuidv4() };
  saveSales([...sales, newSale]);
  return newSale;
};

export const deleteSale = (id: string): boolean => {
  const sales = getSales();
  const filtered = sales.filter(s => s.id !== id);
  if (filtered.length === sales.length) return false;
  saveSales(filtered);
  return true;
};

// Generate demo sales data
export const generateDemoSales = (products: Product[]): void => {
  if (products.length === 0) return;
  
  const sales: Sale[] = [];
  const now = new Date();
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    products.forEach(product => {
      // Random sales between 0-15 per day with some weekly pattern
      const dayOfWeek = date.getDay();
      const baseQty = dayOfWeek === 0 || dayOfWeek === 6 ? 8 : 5;
      const qty = Math.floor(Math.random() * 10) + baseQty;
      
      if (qty > 0) {
        sales.push({
          id: uuidv4(),
          productId: product.id,
          quantity: qty,
          unitPrice: Math.floor(Math.random() * 5000) + 15000,
          soldAt: date,
        });
      }
    });
  }
  
  saveSales(sales);
};

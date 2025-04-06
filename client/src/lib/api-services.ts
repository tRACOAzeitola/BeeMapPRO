import { queryClient, apiRequest } from "./queryClient";
import type { 
  Apiary, InsertApiary, 
  Hive, InsertHive,
  InventoryItem, InsertInventoryItem,
  FloraType, InsertFloraType 
} from "@shared/schema";

// Apiary services
export const apiaryService = {
  getAll: async (): Promise<Apiary[]> => {
    const res = await fetch('/api/apiaries', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch apiaries');
    return res.json();
  },
  
  getById: async (id: number): Promise<Apiary> => {
    const res = await fetch(`/api/apiaries/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch apiary ${id}`);
    return res.json();
  },
  
  create: async (data: InsertApiary): Promise<Apiary> => {
    const res = await apiRequest('POST', '/api/apiaries', data);
    const newApiary = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/apiaries'] });
    return newApiary;
  },
  
  update: async (id: number, data: Partial<InsertApiary>): Promise<Apiary> => {
    const res = await apiRequest('PUT', `/api/apiaries/${id}`, data);
    const updatedApiary = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/apiaries'] });
    queryClient.invalidateQueries({ queryKey: ['/api/apiaries', id] });
    return updatedApiary;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/apiaries/${id}`);
    queryClient.invalidateQueries({ queryKey: ['/api/apiaries'] });
  }
};

// Hive services
export const hiveService = {
  getAll: async (apiaryId?: number): Promise<Hive[]> => {
    const url = apiaryId ? `/api/apiaries/${apiaryId}/hives` : '/api/hives';
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch hives');
    return res.json();
  },
  
  getById: async (id: number): Promise<Hive> => {
    const res = await fetch(`/api/hives/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch hive ${id}`);
    return res.json();
  },
  
  create: async (data: InsertHive): Promise<Hive> => {
    const res = await apiRequest('POST', '/api/hives', data);
    const newHive = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/hives'] });
    queryClient.invalidateQueries({ queryKey: ['/api/apiaries', data.apiaryId, 'hives'] });
    return newHive;
  },
  
  update: async (id: number, data: Partial<InsertHive>): Promise<Hive> => {
    const res = await apiRequest('PUT', `/api/hives/${id}`, data);
    const updatedHive = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/hives'] });
    queryClient.invalidateQueries({ queryKey: ['/api/hives', id] });
    if (data.apiaryId) {
      queryClient.invalidateQueries({ queryKey: ['/api/apiaries', data.apiaryId, 'hives'] });
    }
    return updatedHive;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/hives/${id}`);
    queryClient.invalidateQueries({ queryKey: ['/api/hives'] });
  }
};

// Inventory services
export const inventoryService = {
  getAll: async (apiaryId?: number): Promise<InventoryItem[]> => {
    const url = apiaryId ? `/api/inventory?apiaryId=${apiaryId}` : '/api/inventory';
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch inventory items');
    return res.json();
  },
  
  getById: async (id: number): Promise<InventoryItem> => {
    const res = await fetch(`/api/inventory/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch inventory item ${id}`);
    return res.json();
  },
  
  create: async (data: InsertInventoryItem): Promise<InventoryItem> => {
    const res = await apiRequest('POST', '/api/inventory', data);
    const newItem = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    return newItem;
  },
  
  update: async (id: number, data: Partial<InsertInventoryItem>): Promise<InventoryItem> => {
    const res = await apiRequest('PUT', `/api/inventory/${id}`, data);
    const updatedItem = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    queryClient.invalidateQueries({ queryKey: ['/api/inventory', id] });
    return updatedItem;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/inventory/${id}`);
    queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
  }
};

// Flora type services
export const floraService = {
  getAll: async (): Promise<FloraType[]> => {
    const res = await fetch('/api/flora-types', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch flora types');
    return res.json();
  },
  
  getById: async (id: number): Promise<FloraType> => {
    const res = await fetch(`/api/flora-types/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch flora type ${id}`);
    return res.json();
  },
  
  create: async (data: InsertFloraType): Promise<FloraType> => {
    const res = await apiRequest('POST', '/api/flora-types', data);
    const newFloraType = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/flora-types'] });
    return newFloraType;
  },
  
  update: async (id: number, data: Partial<InsertFloraType>): Promise<FloraType> => {
    const res = await apiRequest('PUT', `/api/flora-types/${id}`, data);
    const updatedFloraType = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/flora-types'] });
    queryClient.invalidateQueries({ queryKey: ['/api/flora-types', id] });
    return updatedFloraType;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/flora-types/${id}`);
    queryClient.invalidateQueries({ queryKey: ['/api/flora-types'] });
  }
};

// Dashboard services
export const dashboardService = {
  getData: async (): Promise<any> => {
    const res = await fetch('/api/dashboard', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  }
};

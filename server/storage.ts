import {
  users, type User, type InsertUser,
  apiaries, type Apiary, type InsertApiary,
  hives, type Hive, type InsertHive,
  inventoryItems, type InventoryItem, type InsertInventoryItem,
  weatherData, type WeatherData, type InsertWeatherData,
  floraTypes, type FloraType, type InsertFloraType
} from "@shared/schema";

export interface IStorage {
  // User methods (from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Apiary methods
  getApiaries(): Promise<Apiary[]>;
  getApiary(id: number): Promise<Apiary | undefined>;
  createApiary(apiary: InsertApiary): Promise<Apiary>;
  updateApiary(id: number, apiary: Partial<InsertApiary>): Promise<Apiary | undefined>;
  deleteApiary(id: number): Promise<boolean>;

  // Hive methods
  getHives(apiaryId?: number): Promise<Hive[]>;
  getHive(id: number): Promise<Hive | undefined>;
  getHivesByApiary(apiaryId: number): Promise<Hive[]>;
  createHive(hive: InsertHive): Promise<Hive>;
  updateHive(id: number, hive: Partial<InsertHive>): Promise<Hive | undefined>;
  deleteHive(id: number): Promise<boolean>;

  // Inventory methods
  getInventoryItems(apiaryId?: number): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;

  // Weather data methods
  getWeatherData(apiaryId: number): Promise<WeatherData | undefined>;
  getWeatherDataHistory(apiaryId: number): Promise<WeatherData[]>;
  saveWeatherData(data: InsertWeatherData): Promise<WeatherData>;

  // Flora types methods
  getFloraTypes(): Promise<FloraType[]>;
  getFloraType(id: number): Promise<FloraType | undefined>;
  createFloraType(floraType: InsertFloraType): Promise<FloraType>;
  updateFloraType(id: number, floraType: Partial<InsertFloraType>): Promise<FloraType | undefined>;
  deleteFloraType(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiaries: Map<number, Apiary>;
  private hives: Map<number, Hive>;
  private inventoryItems: Map<number, InventoryItem>;
  private weatherDataRecords: Map<number, WeatherData>;
  private floraTypeRecords: Map<number, FloraType>;
  
  private userCurrentId: number;
  private apiaryCurrentId: number;
  private hiveCurrentId: number;
  private inventoryItemCurrentId: number;
  private weatherDataCurrentId: number;
  private floraTypeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.apiaries = new Map();
    this.hives = new Map();
    this.inventoryItems = new Map();
    this.weatherDataRecords = new Map();
    this.floraTypeRecords = new Map();
    
    this.userCurrentId = 1;
    this.apiaryCurrentId = 1;
    this.hiveCurrentId = 1;
    this.inventoryItemCurrentId = 1;
    this.weatherDataCurrentId = 1;
    this.floraTypeCurrentId = 1;

    // Add initial sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample flora types
    const floraTypes: InsertFloraType[] = [
      { name: 'Rosmaninho', bloomingSeason: 'Spring', nectarQuality: 'High' },
      { name: 'Tomilho', bloomingSeason: 'Summer', nectarQuality: 'Medium' },
      { name: 'Urze', bloomingSeason: 'Fall', nectarQuality: 'High' },
      { name: 'Alecrim', bloomingSeason: 'Spring', nectarQuality: 'Medium' },
    ];
    
    floraTypes.forEach(flora => {
      this.createFloraType(flora);
    });

    // Sample apiaries
    const apiaries: InsertApiary[] = [
      { 
        name: 'Apiário Lousã', 
        location: 'Serra da Lousã', 
        coordinates: '40.1021, -8.2266', 
        floraTypes: ['Rosmaninho', 'Tomilho'], 
        floraDensity: 'Alta densidade'
      },
      { 
        name: 'Apiário Coimbra Sul', 
        location: 'Coimbra', 
        coordinates: '40.2033, -8.4103', 
        floraTypes: ['Urze', 'Alecrim'], 
        floraDensity: 'Média densidade'
      },
      { 
        name: 'Apiário Figueira', 
        location: 'Figueira da Foz', 
        coordinates: '40.1506, -8.8587', 
        floraTypes: ['Rosmaninho'], 
        floraDensity: 'Alta densidade'
      }
    ];

    const createdApiaries: Apiary[] = [];
    apiaries.forEach(apiary => {
      const created = this.createApiary(apiary);
      createdApiaries.push(created);
    });

    // Sample hives
    for (const apiary of createdApiaries) {
      // First apiary: 24 hives (20 good, 4 weak)
      if (apiary.id === 1) {
        for (let i = 1; i <= 24; i++) {
          this.createHive({
            apiaryId: apiary.id,
            name: `Colmeia ${i}`,
            status: i <= 20 ? 'good' : 'weak',
            notes: '',
            lastInspectionDate: new Date()
          });
        }
      }
      // Second apiary: 18 hives (12 good, 4 weak, 2 dead)
      else if (apiary.id === 2) {
        for (let i = 1; i <= 18; i++) {
          let status = 'good';
          if (i > 12 && i <= 16) status = 'weak';
          if (i > 16) status = 'dead';
          
          this.createHive({
            apiaryId: apiary.id,
            name: `Colmeia ${i}`,
            status,
            notes: '',
            lastInspectionDate: new Date()
          });
        }
      }
      // Third apiary: 12 hives (all good)
      else if (apiary.id === 3) {
        for (let i = 1; i <= 12; i++) {
          this.createHive({
            apiaryId: apiary.id,
            name: `Colmeia ${i}`,
            status: 'good',
            notes: '',
            lastInspectionDate: new Date()
          });
        }
      }
    }

    // Sample inventory items
    const inventoryItems: InsertInventoryItem[] = [
      { apiaryId: 1, name: 'Quadros', category: 'Equipamento', quantity: 50, notes: 'Quadros Langstroth novos' },
      { apiaryId: 1, name: 'Alimentadores', category: 'Equipamento', quantity: 10, notes: 'Tipo boardman' },
      { apiaryId: 2, name: 'Fumigadores', category: 'Ferramenta', quantity: 2, notes: 'Um precisa de manutenção' },
      { apiaryId: 3, name: 'Fatos de Apicultor', category: 'Proteção', quantity: 3, notes: 'Tamanho L' }
    ];
    
    inventoryItems.forEach(item => {
      this.createInventoryItem(item);
    });

    // Sample weather data
    const weatherData: InsertWeatherData[] = [
      { 
        apiaryId: 1, 
        date: new Date(), 
        temperature: 24, 
        humidity: 30, 
        conditions: 'Ensolarado', 
        isGoodForInspection: true,
        forecast: {
          days: [
            { day: 'Qua', conditions: 'Nublado', temperature: 22 },
            { day: 'Qui', conditions: 'Ensolarado', temperature: 25 },
            { day: 'Sex', conditions: 'Chuvoso', temperature: 19 }
          ]
        }
      }
    ];
    
    weatherData.forEach(data => {
      this.saveWeatherData(data);
    });
  }

  // User methods (from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Apiary methods
  async getApiaries(): Promise<Apiary[]> {
    return Array.from(this.apiaries.values());
  }

  async getApiary(id: number): Promise<Apiary | undefined> {
    return this.apiaries.get(id);
  }

  async createApiary(insertApiary: InsertApiary): Promise<Apiary> {
    const id = this.apiaryCurrentId++;
    const apiary: Apiary = { 
      ...insertApiary, 
      id, 
      createdAt: new Date() 
    };
    this.apiaries.set(id, apiary);
    return apiary;
  }

  async updateApiary(id: number, updates: Partial<InsertApiary>): Promise<Apiary | undefined> {
    const apiary = this.apiaries.get(id);
    if (!apiary) return undefined;

    const updatedApiary = { ...apiary, ...updates };
    this.apiaries.set(id, updatedApiary);
    return updatedApiary;
  }

  async deleteApiary(id: number): Promise<boolean> {
    return this.apiaries.delete(id);
  }

  // Hive methods
  async getHives(apiaryId?: number): Promise<Hive[]> {
    const hives = Array.from(this.hives.values());
    if (apiaryId) {
      return hives.filter(hive => hive.apiaryId === apiaryId);
    }
    return hives;
  }

  async getHive(id: number): Promise<Hive | undefined> {
    return this.hives.get(id);
  }

  async getHivesByApiary(apiaryId: number): Promise<Hive[]> {
    return Array.from(this.hives.values()).filter(
      hive => hive.apiaryId === apiaryId
    );
  }

  async createHive(insertHive: InsertHive): Promise<Hive> {
    const id = this.hiveCurrentId++;
    const hive: Hive = { ...insertHive, id };
    this.hives.set(id, hive);
    return hive;
  }

  async updateHive(id: number, updates: Partial<InsertHive>): Promise<Hive | undefined> {
    const hive = this.hives.get(id);
    if (!hive) return undefined;

    const updatedHive = { ...hive, ...updates };
    this.hives.set(id, updatedHive);
    return updatedHive;
  }

  async deleteHive(id: number): Promise<boolean> {
    return this.hives.delete(id);
  }

  // Inventory methods
  async getInventoryItems(apiaryId?: number): Promise<InventoryItem[]> {
    const items = Array.from(this.inventoryItems.values());
    if (apiaryId) {
      return items.filter(item => item.apiaryId === apiaryId);
    }
    return items;
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemCurrentId++;
    const item: InventoryItem = { ...insertItem, id };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  // Weather data methods
  async getWeatherData(apiaryId: number): Promise<WeatherData | undefined> {
    // Get the most recent weather data for the specified apiary
    const records = Array.from(this.weatherDataRecords.values())
      .filter(record => record.apiaryId === apiaryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return records.length > 0 ? records[0] : undefined;
  }

  async getWeatherDataHistory(apiaryId: number): Promise<WeatherData[]> {
    return Array.from(this.weatherDataRecords.values())
      .filter(record => record.apiaryId === apiaryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async saveWeatherData(insertData: InsertWeatherData): Promise<WeatherData> {
    const id = this.weatherDataCurrentId++;
    const data: WeatherData = { ...insertData, id };
    this.weatherDataRecords.set(id, data);
    return data;
  }

  // Flora types methods
  async getFloraTypes(): Promise<FloraType[]> {
    return Array.from(this.floraTypeRecords.values());
  }

  async getFloraType(id: number): Promise<FloraType | undefined> {
    return this.floraTypeRecords.get(id);
  }

  async createFloraType(insertFloraType: InsertFloraType): Promise<FloraType> {
    const id = this.floraTypeCurrentId++;
    const floraType: FloraType = { ...insertFloraType, id };
    this.floraTypeRecords.set(id, floraType);
    return floraType;
  }

  async updateFloraType(id: number, updates: Partial<InsertFloraType>): Promise<FloraType | undefined> {
    const floraType = this.floraTypeRecords.get(id);
    if (!floraType) return undefined;

    const updatedFloraType = { ...floraType, ...updates };
    this.floraTypeRecords.set(id, updatedFloraType);
    return updatedFloraType;
  }

  async deleteFloraType(id: number): Promise<boolean> {
    return this.floraTypeRecords.delete(id);
  }
}

export const storage = new MemStorage();

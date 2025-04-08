import {
  type User, type InsertUser,
  type Apiary, type InsertApiary,
  type Hive, type InsertHive,
  type InventoryItem, type InsertInventoryItem,
  type WeatherData, type InsertWeatherData,
  type FloraType, type InsertFloraType
} from "@shared/schema";
import { IStorage } from "./storage";

// In-memory storage for development
export class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private apiaries: Apiary[] = [];
  private hives: Hive[] = [];
  private inventoryItems: InventoryItem[] = [];
  private weatherData: WeatherData[] = [];
  private floraTypes: FloraType[] = [];
  private nextIds = {
    user: 1,
    apiary: 1,
    hive: 1,
    inventoryItem: 1,
    weatherData: 1,
    floraType: 1
  };

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = { ...insertUser, id: this.nextIds.user++ };
    this.users.push(user);
    return user;
  }

  // Apiary methods
  async getApiaries(): Promise<Apiary[]> {
    return [...this.apiaries];
  }

  async getApiary(id: number): Promise<Apiary | undefined> {
    return this.apiaries.find(a => a.id === id);
  }

  async createApiary(insertApiary: InsertApiary): Promise<Apiary> {
    const apiary = { 
      ...insertApiary, 
      id: this.nextIds.apiary++,
      createdAt: new Date() 
    } as Apiary;
    this.apiaries.push(apiary);
    return apiary;
  }

  async updateApiary(id: number, updates: Partial<InsertApiary>): Promise<Apiary | undefined> {
    const index = this.apiaries.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    const updated = { ...this.apiaries[index], ...updates };
    this.apiaries[index] = updated;
    return updated;
  }

  async deleteApiary(id: number): Promise<boolean> {
    const initialLength = this.apiaries.length;
    this.apiaries = this.apiaries.filter(a => a.id !== id);
    return initialLength !== this.apiaries.length;
  }

  // Hive methods
  async getHives(apiaryId?: number): Promise<Hive[]> {
    if (apiaryId) {
      return this.hives.filter(h => h.apiaryId === apiaryId);
    }
    return [...this.hives];
  }

  async getHive(id: number): Promise<Hive | undefined> {
    return this.hives.find(h => h.id === id);
  }

  async getHivesByApiary(apiaryId: number): Promise<Hive[]> {
    return this.hives.filter(h => h.apiaryId === apiaryId);
  }

  async createHive(insertHive: InsertHive): Promise<Hive> {
    const hive = { ...insertHive, id: this.nextIds.hive++ } as Hive;
    this.hives.push(hive);
    return hive;
  }

  async updateHive(id: number, updates: Partial<InsertHive>): Promise<Hive | undefined> {
    const index = this.hives.findIndex(h => h.id === id);
    if (index === -1) return undefined;
    
    const updated = { ...this.hives[index], ...updates };
    this.hives[index] = updated;
    return updated;
  }

  async deleteHive(id: number): Promise<boolean> {
    const initialLength = this.hives.length;
    this.hives = this.hives.filter(h => h.id !== id);
    return initialLength !== this.hives.length;
  }

  // Inventory methods
  async getInventoryItems(apiaryId?: number): Promise<InventoryItem[]> {
    if (apiaryId) {
      return this.inventoryItems.filter(i => i.apiaryId === apiaryId);
    }
    return [...this.inventoryItems];
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.find(i => i.id === id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const item = { ...insertItem, id: this.nextIds.inventoryItem++ } as InventoryItem;
    this.inventoryItems.push(item);
    return item;
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const index = this.inventoryItems.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    
    const updated = { ...this.inventoryItems[index], ...updates };
    this.inventoryItems[index] = updated;
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const initialLength = this.inventoryItems.length;
    this.inventoryItems = this.inventoryItems.filter(i => i.id !== id);
    return initialLength !== this.inventoryItems.length;
  }

  // Weather data methods
  async getWeatherData(apiaryId: number): Promise<WeatherData | undefined> {
    const relevantData = this.weatherData
      .filter(w => w.apiaryId === apiaryId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return relevantData[0];
  }

  async getWeatherDataHistory(apiaryId: number): Promise<WeatherData[]> {
    return this.weatherData
      .filter(w => w.apiaryId === apiaryId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async saveWeatherData(insertData: InsertWeatherData): Promise<WeatherData> {
    const data = { 
      ...insertData, 
      id: this.nextIds.weatherData++,
      date: insertData.date || new Date()
    } as WeatherData;
    
    this.weatherData.push(data);
    return data;
  }

  // Flora types methods
  async getFloraTypes(): Promise<FloraType[]> {
    return [...this.floraTypes];
  }

  async getFloraType(id: number): Promise<FloraType | undefined> {
    return this.floraTypes.find(f => f.id === id);
  }

  async createFloraType(insertFloraType: InsertFloraType): Promise<FloraType> {
    const floraType = { ...insertFloraType, id: this.nextIds.floraType++ } as FloraType;
    this.floraTypes.push(floraType);
    return floraType;
  }

  async updateFloraType(id: number, updates: Partial<InsertFloraType>): Promise<FloraType | undefined> {
    const index = this.floraTypes.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    
    const updated = { ...this.floraTypes[index], ...updates };
    this.floraTypes[index] = updated;
    return updated;
  }

  async deleteFloraType(id: number): Promise<boolean> {
    const initialLength = this.floraTypes.length;
    this.floraTypes = this.floraTypes.filter(f => f.id !== id);
    return initialLength !== this.floraTypes.length;
  }

  // Helper method to seed initial data
  async seedInitialData() {
    // Only seed if no data exists
    if (this.floraTypes.length > 0) {
      console.log("Database already contains data, skipping seed");
      return;
    }

    // Sample flora types
    const floraTypesList: InsertFloraType[] = [
      { name: 'Rosmaninho', bloomingSeason: 'Spring', nectarQuality: 'High' },
      { name: 'Tomilho', bloomingSeason: 'Summer', nectarQuality: 'Medium' },
      { name: 'Urze', bloomingSeason: 'Fall', nectarQuality: 'High' },
      { name: 'Alecrim', bloomingSeason: 'Spring', nectarQuality: 'Medium' },
    ];
    
    const createdFloraTypes = await Promise.all(
      floraTypesList.map(flora => this.createFloraType(flora))
    );

    // Sample apiaries
    const apiariesList: InsertApiary[] = [
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

    const createdApiaries = await Promise.all(
      apiariesList.map(apiary => this.createApiary(apiary))
    );

    // Sample hives
    for (const apiary of createdApiaries) {
      // First apiary: 24 hives (20 good, 4 weak)
      if (apiary.id === 1) {
        await Promise.all(
          Array.from({ length: 24 }, (_, i) => 
            this.createHive({
              apiaryId: apiary.id,
              name: `Colmeia ${i + 1}`,
              status: i < 20 ? 'good' : 'weak',
              notes: '',
              lastInspectionDate: new Date()
            })
          )
        );
      }
      // Second apiary: 18 hives (12 good, 4 weak, 2 dead)
      else if (apiary.id === 2) {
        await Promise.all(
          Array.from({ length: 18 }, (_, i) => {
            let status = 'good';
            if (i >= 12 && i < 16) status = 'weak';
            if (i >= 16) status = 'dead';
            
            return this.createHive({
              apiaryId: apiary.id,
              name: `Colmeia ${i + 1}`,
              status,
              notes: '',
              lastInspectionDate: new Date()
            });
          })
        );
      }
      // Third apiary: 12 hives (all good)
      else if (apiary.id === 3) {
        await Promise.all(
          Array.from({ length: 12 }, (_, i) => 
            this.createHive({
              apiaryId: apiary.id,
              name: `Colmeia ${i + 1}`,
              status: 'good',
              notes: '',
              lastInspectionDate: new Date()
            })
          )
        );
      }
    }

    // Sample inventory items
    const inventoryItemsList: InsertInventoryItem[] = [
      { apiaryId: 1, name: 'Quadros', category: 'Equipamento', quantity: 50, notes: 'Quadros Langstroth novos' },
      { apiaryId: 1, name: 'Alimentadores', category: 'Equipamento', quantity: 10, notes: 'Tipo boardman' },
      { apiaryId: 2, name: 'Fumigadores', category: 'Ferramenta', quantity: 2, notes: 'Um precisa de manutenção' },
      { apiaryId: 3, name: 'Fatos de Apicultor', category: 'Proteção', quantity: 3, notes: 'Tamanho L' }
    ];
    
    await Promise.all(
      inventoryItemsList.map(item => this.createInventoryItem(item))
    );

    // Sample weather data
    const weatherDataList: InsertWeatherData[] = [
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
    
    await Promise.all(
      weatherDataList.map(data => this.saveWeatherData(data))
    );

    console.log("In-memory database seeded successfully");
  }
} 
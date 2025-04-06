import {
  users, type User, type InsertUser,
  apiaries, type Apiary, type InsertApiary,
  hives, type Hive, type InsertHive,
  inventoryItems, type InventoryItem, type InsertInventoryItem,
  weatherData, type WeatherData, type InsertWeatherData,
  floraTypes, type FloraType, type InsertFloraType
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User methods (from original)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Apiary methods
  async getApiaries(): Promise<Apiary[]> {
    return await db.select().from(apiaries);
  }

  async getApiary(id: number): Promise<Apiary | undefined> {
    const [apiary] = await db.select().from(apiaries).where(eq(apiaries.id, id));
    return apiary;
  }

  async createApiary(insertApiary: InsertApiary): Promise<Apiary> {
    const [apiary] = await db.insert(apiaries).values(insertApiary).returning();
    return apiary;
  }

  async updateApiary(id: number, updates: Partial<InsertApiary>): Promise<Apiary | undefined> {
    const [updatedApiary] = await db
      .update(apiaries)
      .set(updates)
      .where(eq(apiaries.id, id))
      .returning();
    return updatedApiary;
  }

  async deleteApiary(id: number): Promise<boolean> {
    const [deletedApiary] = await db
      .delete(apiaries)
      .where(eq(apiaries.id, id))
      .returning({ id: apiaries.id });
    return !!deletedApiary;
  }

  // Hive methods
  async getHives(apiaryId?: number): Promise<Hive[]> {
    if (apiaryId) {
      return await db.select().from(hives).where(eq(hives.apiaryId, apiaryId));
    }
    return await db.select().from(hives);
  }

  async getHive(id: number): Promise<Hive | undefined> {
    const [hive] = await db.select().from(hives).where(eq(hives.id, id));
    return hive;
  }

  async getHivesByApiary(apiaryId: number): Promise<Hive[]> {
    return await db.select().from(hives).where(eq(hives.apiaryId, apiaryId));
  }

  async createHive(insertHive: InsertHive): Promise<Hive> {
    const [hive] = await db.insert(hives).values(insertHive).returning();
    return hive;
  }

  async updateHive(id: number, updates: Partial<InsertHive>): Promise<Hive | undefined> {
    const [updatedHive] = await db
      .update(hives)
      .set(updates)
      .where(eq(hives.id, id))
      .returning();
    return updatedHive;
  }

  async deleteHive(id: number): Promise<boolean> {
    const [deletedHive] = await db
      .delete(hives)
      .where(eq(hives.id, id))
      .returning({ id: hives.id });
    return !!deletedHive;
  }

  // Inventory methods
  async getInventoryItems(apiaryId?: number): Promise<InventoryItem[]> {
    if (apiaryId) {
      return await db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.apiaryId, apiaryId));
    }
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const [deletedItem] = await db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .returning({ id: inventoryItems.id });
    return !!deletedItem;
  }

  // Weather data methods
  async getWeatherData(apiaryId: number): Promise<WeatherData | undefined> {
    const [latestWeatherData] = await db
      .select()
      .from(weatherData)
      .where(eq(weatherData.apiaryId, apiaryId))
      .orderBy(desc(weatherData.date))
      .limit(1);
    return latestWeatherData;
  }

  async getWeatherDataHistory(apiaryId: number): Promise<WeatherData[]> {
    return await db
      .select()
      .from(weatherData)
      .where(eq(weatherData.apiaryId, apiaryId))
      .orderBy(desc(weatherData.date));
  }

  async saveWeatherData(insertData: InsertWeatherData): Promise<WeatherData> {
    const [data] = await db
      .insert(weatherData)
      .values(insertData)
      .returning();
    return data;
  }

  // Flora types methods
  async getFloraTypes(): Promise<FloraType[]> {
    return await db.select().from(floraTypes);
  }

  async getFloraType(id: number): Promise<FloraType | undefined> {
    const [floraType] = await db
      .select()
      .from(floraTypes)
      .where(eq(floraTypes.id, id));
    return floraType;
  }

  async createFloraType(insertFloraType: InsertFloraType): Promise<FloraType> {
    const [floraType] = await db
      .insert(floraTypes)
      .values(insertFloraType)
      .returning();
    return floraType;
  }

  async updateFloraType(id: number, updates: Partial<InsertFloraType>): Promise<FloraType | undefined> {
    const [updatedFloraType] = await db
      .update(floraTypes)
      .set(updates)
      .where(eq(floraTypes.id, id))
      .returning();
    return updatedFloraType;
  }

  async deleteFloraType(id: number): Promise<boolean> {
    const [deletedFloraType] = await db
      .delete(floraTypes)
      .where(eq(floraTypes.id, id))
      .returning({ id: floraTypes.id });
    return !!deletedFloraType;
  }

  // Helper method to seed initial data
  async seedInitialData() {
    // Check if we already have data in the flora_types table
    const existingFlora = await db.select().from(floraTypes);
    if (existingFlora.length > 0) {
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

    console.log("Database seeded successfully");
  }
}

// Initialize the database storage
export const storage = new DatabaseStorage();

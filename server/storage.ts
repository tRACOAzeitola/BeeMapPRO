import {
  type User, type InsertUser,
  type Apiary, type InsertApiary,
  type Hive, type InsertHive,
  type InventoryItem, type InsertInventoryItem,
  type WeatherData, type InsertWeatherData,
  type FloraType, type InsertFloraType
} from "@shared/schema";
import { db, collections } from "./db";
import { 
  addDoc, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, where, 
  query, orderBy, limit, collection, DocumentData, QueryDocumentSnapshot, 
  SnapshotOptions, Query
} from "firebase/firestore";

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

// Helper function to convert Firestore docs to our types
function convertFirestoreDoc<T>(doc: QueryDocumentSnapshot<DocumentData>): T & { id: number } {
  const data = doc.data() as any;
  return { ...data, id: parseInt(doc.id) };
}

export class DatabaseStorage implements IStorage {
  // User methods (from original)
  async getUser(id: number): Promise<User | undefined> {
    const docRef = doc(collections.users, id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data() as User, id };
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collections.users, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data() as User, id: parseInt(doc.id) };
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Find max ID or start with 1
    const querySnapshot = await getDocs(collections.users);
    const nextId = querySnapshot.empty ? 1 : Math.max(...querySnapshot.docs.map(doc => parseInt(doc.id))) + 1;
    
    await setDoc(doc(collections.users, nextId.toString()), insertUser);
    return { ...insertUser, id: nextId } as User;
  }

  // Apiary methods
  async getApiaries(): Promise<Apiary[]> {
    const querySnapshot = await getDocs(collections.apiaries);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as Apiary, id: parseInt(doc.id) }));
  }

  async getApiary(id: number): Promise<Apiary | undefined> {
    const docRef = doc(collections.apiaries, id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data() as Apiary, id };
    }
    return undefined;
  }

  async createApiary(insertApiary: InsertApiary): Promise<Apiary> {
    // Find max ID or start with 1
    const querySnapshot = await getDocs(collections.apiaries);
    const nextId = querySnapshot.empty ? 1 : Math.max(...querySnapshot.docs.map(doc => parseInt(doc.id))) + 1;
    
    await setDoc(doc(collections.apiaries, nextId.toString()), insertApiary);
    return { ...insertApiary, id: nextId } as Apiary;
  }

  async updateApiary(id: number, updates: Partial<InsertApiary>): Promise<Apiary | undefined> {
    const docRef = doc(collections.apiaries, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return undefined;
    
    await updateDoc(docRef, updates as any);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    return { ...updatedDoc.data() as Apiary, id };
  }

  async deleteApiary(id: number): Promise<boolean> {
    const docRef = doc(collections.apiaries, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    await deleteDoc(docRef);
    return true;
  }

  // Hive methods
  async getHives(apiaryId?: number): Promise<Hive[]> {
    let q: Query<DocumentData, DocumentData> = collections.hives;
    
    if (apiaryId) {
      q = query(collections.hives, where('apiaryId', '==', apiaryId));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as Hive, id: parseInt(doc.id) }));
  }

  async getHive(id: number): Promise<Hive | undefined> {
    const docRef = doc(collections.hives, id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data() as Hive, id };
    }
    return undefined;
  }

  async getHivesByApiary(apiaryId: number): Promise<Hive[]> {
    const q = query(collections.hives, where('apiaryId', '==', apiaryId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as Hive, id: parseInt(doc.id) }));
  }

  async createHive(insertHive: InsertHive): Promise<Hive> {
    // Find max ID or start with 1
    const querySnapshot = await getDocs(collections.hives);
    const nextId = querySnapshot.empty ? 1 : Math.max(...querySnapshot.docs.map(doc => parseInt(doc.id))) + 1;
    
    await setDoc(doc(collections.hives, nextId.toString()), insertHive);
    return { ...insertHive, id: nextId } as Hive;
  }

  async updateHive(id: number, updates: Partial<InsertHive>): Promise<Hive | undefined> {
    const docRef = doc(collections.hives, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return undefined;
    
    await updateDoc(docRef, updates as any);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    return { ...updatedDoc.data() as Hive, id };
  }

  async deleteHive(id: number): Promise<boolean> {
    const docRef = doc(collections.hives, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    await deleteDoc(docRef);
    return true;
  }

  // Inventory methods
  async getInventoryItems(apiaryId?: number): Promise<InventoryItem[]> {
    let q: Query<DocumentData, DocumentData> = collections.inventoryItems;
    
    if (apiaryId) {
      q = query(collections.inventoryItems, where('apiaryId', '==', apiaryId));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as InventoryItem, id: parseInt(doc.id) }));
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const docRef = doc(collections.inventoryItems, id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data() as InventoryItem, id };
    }
    return undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    // Find max ID or start with 1
    const querySnapshot = await getDocs(collections.inventoryItems);
    const nextId = querySnapshot.empty ? 1 : Math.max(...querySnapshot.docs.map(doc => parseInt(doc.id))) + 1;
    
    await setDoc(doc(collections.inventoryItems, nextId.toString()), insertItem);
    return { ...insertItem, id: nextId } as InventoryItem;
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const docRef = doc(collections.inventoryItems, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return undefined;
    
    await updateDoc(docRef, updates as any);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    return { ...updatedDoc.data() as InventoryItem, id };
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const docRef = doc(collections.inventoryItems, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    await deleteDoc(docRef);
    return true;
  }

  // Weather data methods
  async getWeatherData(apiaryId: number): Promise<WeatherData | undefined> {
    const q = query(
      collections.weatherData, 
      where('apiaryId', '==', apiaryId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data() as WeatherData, id: parseInt(doc.id) };
    }
    return undefined;
  }

  async getWeatherDataHistory(apiaryId: number): Promise<WeatherData[]> {
    const q = query(
      collections.weatherData, 
      where('apiaryId', '==', apiaryId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as WeatherData, id: parseInt(doc.id) }));
  }

  async saveWeatherData(insertData: InsertWeatherData): Promise<WeatherData> {
    // Find max ID or start with 1
    const querySnapshot = await getDocs(collections.weatherData);
    const nextId = querySnapshot.empty ? 1 : Math.max(...querySnapshot.docs.map(doc => parseInt(doc.id))) + 1;
    
    await setDoc(doc(collections.weatherData, nextId.toString()), insertData);
    return { ...insertData, id: nextId } as WeatherData;
  }

  // Flora types methods
  async getFloraTypes(): Promise<FloraType[]> {
    const querySnapshot = await getDocs(collections.floraTypes);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as FloraType, id: parseInt(doc.id) }));
  }

  async getFloraType(id: number): Promise<FloraType | undefined> {
    const docRef = doc(collections.floraTypes, id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data() as FloraType, id };
    }
    return undefined;
  }

  async createFloraType(insertFloraType: InsertFloraType): Promise<FloraType> {
    // Find max ID or start with 1
    const querySnapshot = await getDocs(collections.floraTypes);
    const nextId = querySnapshot.empty ? 1 : Math.max(...querySnapshot.docs.map(doc => parseInt(doc.id))) + 1;
    
    await setDoc(doc(collections.floraTypes, nextId.toString()), insertFloraType);
    return { ...insertFloraType, id: nextId } as FloraType;
  }

  async updateFloraType(id: number, updates: Partial<InsertFloraType>): Promise<FloraType | undefined> {
    const docRef = doc(collections.floraTypes, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return undefined;
    
    await updateDoc(docRef, updates as any);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    return { ...updatedDoc.data() as FloraType, id };
  }

  async deleteFloraType(id: number): Promise<boolean> {
    const docRef = doc(collections.floraTypes, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    await deleteDoc(docRef);
    return true;
  }

  // Helper method to seed initial data
  async seedInitialData() {
    // Check if we already have data in the flora_types collection
    const querySnapshot = await getDocs(collections.floraTypes);
    if (!querySnapshot.empty) {
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

// Initialize the storage
import { InMemoryStorage } from "./in-memory-storage";

let storageImpl: IStorage;

// Use in-memory storage for development when no database is available
if (process.env.NODE_ENV === 'development' && !process.env.USE_DATABASE) {
  console.log('Using in-memory storage for development');
  storageImpl = new InMemoryStorage();
} else {
  console.log('Using database storage');
  storageImpl = new DatabaseStorage();
}

export const storage = storageImpl;

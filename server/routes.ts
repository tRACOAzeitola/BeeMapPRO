import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertApiarySchema, 
  insertHiveSchema, 
  insertInventoryItemSchema,
  insertFloraTypeSchema
} from "@shared/schema";
import fetch from "node-fetch";

// Weather API services
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "demo_key";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

async function fetchWeatherData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

async function fetchWeatherForecast(lat: number, lon: number) {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather forecast API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  
  // Apiaries
  app.get("/api/apiaries", async (_req: Request, res: Response) => {
    try {
      const apiaries = await storage.getApiaries();
      res.json(apiaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch apiaries" });
    }
  });
  
  app.get("/api/apiaries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const apiary = await storage.getApiary(id);
      if (!apiary) {
        return res.status(404).json({ message: "Apiary not found" });
      }
      
      res.json(apiary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch apiary" });
    }
  });
  
  app.post("/api/apiaries", async (req: Request, res: Response) => {
    try {
      const result = insertApiarySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid apiary data", errors: result.error.format() });
      }
      
      const apiary = await storage.createApiary(result.data);
      res.status(201).json(apiary);
    } catch (error) {
      res.status(500).json({ message: "Failed to create apiary" });
    }
  });
  
  app.put("/api/apiaries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const result = insertApiarySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid apiary data", errors: result.error.format() });
      }
      
      const updatedApiary = await storage.updateApiary(id, result.data);
      if (!updatedApiary) {
        return res.status(404).json({ message: "Apiary not found" });
      }
      
      res.json(updatedApiary);
    } catch (error) {
      res.status(500).json({ message: "Failed to update apiary" });
    }
  });
  
  app.delete("/api/apiaries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const deleted = await storage.deleteApiary(id);
      if (!deleted) {
        return res.status(404).json({ message: "Apiary not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete apiary" });
    }
  });
  
  // Hives
  app.get("/api/hives", async (req: Request, res: Response) => {
    try {
      const apiaryId = req.query.apiaryId ? parseInt(req.query.apiaryId as string) : undefined;
      
      if (req.query.apiaryId && isNaN(apiaryId!)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const hives = await storage.getHives(apiaryId);
      res.json(hives);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hives" });
    }
  });
  
  app.get("/api/hives/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hive ID" });
      }
      
      const hive = await storage.getHive(id);
      if (!hive) {
        return res.status(404).json({ message: "Hive not found" });
      }
      
      res.json(hive);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hive" });
    }
  });
  
  app.get("/api/apiaries/:apiaryId/hives", async (req: Request, res: Response) => {
    try {
      const apiaryId = parseInt(req.params.apiaryId);
      if (isNaN(apiaryId)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const hives = await storage.getHivesByApiary(apiaryId);
      res.json(hives);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hives for apiary" });
    }
  });
  
  app.post("/api/hives", async (req: Request, res: Response) => {
    try {
      const result = insertHiveSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid hive data", errors: result.error.format() });
      }
      
      // Validate that apiary exists
      const apiary = await storage.getApiary(result.data.apiaryId);
      if (!apiary) {
        return res.status(400).json({ message: "Apiary does not exist" });
      }
      
      const hive = await storage.createHive(result.data);
      res.status(201).json(hive);
    } catch (error) {
      res.status(500).json({ message: "Failed to create hive" });
    }
  });
  
  app.put("/api/hives/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hive ID" });
      }
      
      const result = insertHiveSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid hive data", errors: result.error.format() });
      }
      
      // If apiaryId is being updated, validate that the apiary exists
      if (result.data.apiaryId) {
        const apiary = await storage.getApiary(result.data.apiaryId);
        if (!apiary) {
          return res.status(400).json({ message: "Apiary does not exist" });
        }
      }
      
      const updatedHive = await storage.updateHive(id, result.data);
      if (!updatedHive) {
        return res.status(404).json({ message: "Hive not found" });
      }
      
      res.json(updatedHive);
    } catch (error) {
      res.status(500).json({ message: "Failed to update hive" });
    }
  });
  
  app.delete("/api/hives/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hive ID" });
      }
      
      const deleted = await storage.deleteHive(id);
      if (!deleted) {
        return res.status(404).json({ message: "Hive not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hive" });
    }
  });
  
  // Inventory items
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      const apiaryId = req.query.apiaryId ? parseInt(req.query.apiaryId as string) : undefined;
      
      if (req.query.apiaryId && isNaN(apiaryId!)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const items = await storage.getInventoryItems(apiaryId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });
  
  app.get("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inventory item ID" });
      }
      
      const item = await storage.getInventoryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });
  
  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      const result = insertInventoryItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: result.error.format() });
      }
      
      // Validate that apiary exists
      const apiary = await storage.getApiary(result.data.apiaryId);
      if (!apiary) {
        return res.status(400).json({ message: "Apiary does not exist" });
      }
      
      const item = await storage.createInventoryItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });
  
  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inventory item ID" });
      }
      
      const result = insertInventoryItemSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: result.error.format() });
      }
      
      // If apiaryId is being updated, validate that the apiary exists
      if (result.data.apiaryId) {
        const apiary = await storage.getApiary(result.data.apiaryId);
        if (!apiary) {
          return res.status(400).json({ message: "Apiary does not exist" });
        }
      }
      
      const updatedItem = await storage.updateInventoryItem(id, result.data);
      if (!updatedItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });
  
  app.delete("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inventory item ID" });
      }
      
      const deleted = await storage.deleteInventoryItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });
  
  // Flora types
  app.get("/api/flora-types", async (_req: Request, res: Response) => {
    try {
      const floraTypes = await storage.getFloraTypes();
      res.json(floraTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flora types" });
    }
  });
  
  app.get("/api/flora-types/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flora type ID" });
      }
      
      const floraType = await storage.getFloraType(id);
      if (!floraType) {
        return res.status(404).json({ message: "Flora type not found" });
      }
      
      res.json(floraType);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flora type" });
    }
  });
  
  app.post("/api/flora-types", async (req: Request, res: Response) => {
    try {
      const result = insertFloraTypeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid flora type data", errors: result.error.format() });
      }
      
      const floraType = await storage.createFloraType(result.data);
      res.status(201).json(floraType);
    } catch (error) {
      res.status(500).json({ message: "Failed to create flora type" });
    }
  });
  
  app.put("/api/flora-types/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flora type ID" });
      }
      
      const result = insertFloraTypeSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid flora type data", errors: result.error.format() });
      }
      
      const updatedFloraType = await storage.updateFloraType(id, result.data);
      if (!updatedFloraType) {
        return res.status(404).json({ message: "Flora type not found" });
      }
      
      res.json(updatedFloraType);
    } catch (error) {
      res.status(500).json({ message: "Failed to update flora type" });
    }
  });
  
  app.delete("/api/flora-types/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flora type ID" });
      }
      
      const deleted = await storage.deleteFloraType(id);
      if (!deleted) {
        return res.status(404).json({ message: "Flora type not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete flora type" });
    }
  });
  
  // Weather data
  app.get("/api/weather/:apiaryId", async (req: Request, res: Response) => {
    try {
      const apiaryId = parseInt(req.params.apiaryId);
      if (isNaN(apiaryId)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const apiary = await storage.getApiary(apiaryId);
      if (!apiary) {
        return res.status(404).json({ message: "Apiary not found" });
      }
      
      // First check if we have cached weather data
      const cachedWeather = await storage.getWeatherData(apiaryId);
      
      // If we have recent data (less than 1 hour old), return it
      if (cachedWeather && new Date().getTime() - new Date(cachedWeather.date).getTime() < 3600000) {
        return res.json(cachedWeather);
      }
      
      // Otherwise fetch new data
      try {
        const [lat, lon] = apiary.coordinates.split(',').map(coord => parseFloat(coord.trim()));
        
        // Fetch current weather
        const weatherData = await fetchWeatherData(lat, lon);
        const forecastData = await fetchWeatherForecast(lat, lon);
        
        // Process forecast data to get next 3 days
        const dailyForecasts = forecastData.list
          .filter((_: any, index: number) => index % 8 === 0)
          .slice(0, 3)
          .map((item: any, index: number) => {
            const date = new Date();
            date.setDate(date.getDate() + index + 1);
            const day = date.toLocaleDateString('pt-PT', { weekday: 'short' });
            
            return {
              day,
              conditions: item.weather[0].main,
              temperature: Math.round(item.main.temp)
            };
          });
        
        // Create weather data object
        const newWeatherData = {
          apiaryId,
          date: new Date(),
          temperature: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          conditions: weatherData.weather[0].main,
          isGoodForInspection: isGoodForInspection(weatherData),
          forecast: {
            days: dailyForecasts
          }
        };
        
        // Save to storage
        const savedWeather = await storage.saveWeatherData(newWeatherData);
        res.json(savedWeather);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // If we have any cached data, return it even if it's old
        if (cachedWeather) {
          return res.json(cachedWeather);
        }
        
        throw error;
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });
  
  app.get("/api/weather/:apiaryId/history", async (req: Request, res: Response) => {
    try {
      const apiaryId = parseInt(req.params.apiaryId);
      if (isNaN(apiaryId)) {
        return res.status(400).json({ message: "Invalid apiary ID" });
      }
      
      const weatherHistory = await storage.getWeatherDataHistory(apiaryId);
      res.json(weatherHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather history" });
    }
  });
  
  // Dashboard data
  app.get("/api/dashboard", async (_req: Request, res: Response) => {
    try {
      const apiaries = await storage.getApiaries();
      const hives = await storage.getHives();
      
      // Count hives by status
      const goodHives = hives.filter(hive => hive.status === 'good').length;
      const weakHives = hives.filter(hive => hive.status === 'weak').length;
      const deadHives = hives.filter(hive => hive.status === 'dead').length;
      const totalHives = hives.length;
      
      // Calculate health rate
      const healthRate = totalHives > 0 ? Math.round((goodHives / totalHives) * 100) : 0;
      
      // Count alerts (weak + dead hives)
      const alerts = weakHives + deadHives;
      
      const dashboardData = {
        apiaryCount: apiaries.length,
        hiveCount: totalHives,
        healthRate,
        alertCount: alerts,
        hiveStatus: {
          good: goodHives,
          weak: weakHives,
          dead: deadHives
        }
      };
      
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Flora detection endpoint
  app.post("/api/flora/detect", async (req: Request, res: Response) => {
    try {
      const { image_data } = req.body;
      
      if (!image_data) {
        return res.status(400).json({ 
          success: false, 
          error: "No image data provided" 
        });
      }
      
      // In a production environment, this would make a request to the Python service
      // For now, we'll return a simple response to demonstrate the UI functionality
      
      // This is a simulation of processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a sample response
      res.json({
        success: true,
        image_preview: image_data, // Use the same image for demonstration
        stats: {
          rosemary_coverage_percent: Math.random() * 30, // Random coverage between 0-30%
          class_distribution: {
            "0": 10000, // Background
            "1": Math.floor(Math.random() * 2000), // Rosemary
            "2": Math.floor(Math.random() * 5000)  // Other vegetation
          }
        },
        metadata: {
          image_size: [256, 256, 3],
          ndvi_range: [-0.2, 0.8]
        }
      });
    } catch (error) {
      console.error("Error in flora detection:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to process image for flora detection" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to determine if conditions are good for inspection
function isGoodForInspection(weatherData: any): boolean {
  // Good conditions: temperature > 20°C, no rain, not too windy
  const goodTemperature = weatherData.main.temp > 20;
  const noRain = !['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherData.weather[0].main);
  const notWindy = weatherData.wind?.speed < 5; // wind speed in m/s
  
  return goodTemperature && noRain && notWindy;
}

import { pgTable, text, serial, integer, jsonb, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Apiaries table
export const apiaries = pgTable("apiaries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  coordinates: text("coordinates").notNull(),
  floraTypes: text("flora_types").array(),
  floraDensity: text("flora_density"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApiarySchema = createInsertSchema(apiaries).omit({
  id: true,
  createdAt: true,
});

// Hives table
export const hives = pgTable("hives", {
  id: serial("id").primaryKey(),
  apiaryId: integer("apiary_id").notNull().references(() => apiaries.id),
  name: text("name").notNull(),
  status: text("status").notNull(), // 'good', 'weak', 'dead'
  notes: text("notes"),
  lastInspectionDate: timestamp("last_inspection_date"),
});

export const insertHiveSchema = createInsertSchema(hives).omit({
  id: true,
});

// Inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  apiaryId: integer("apiary_id").notNull().references(() => apiaries.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
});

// Weather data table
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  apiaryId: integer("apiary_id").notNull().references(() => apiaries.id),
  date: timestamp("date").defaultNow().notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  conditions: text("conditions").notNull(),
  isGoodForInspection: boolean("is_good_for_inspection").notNull(),
  forecast: jsonb("forecast"),
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
});

// Flora types table
export const floraTypes = pgTable("flora_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  bloomingSeason: text("blooming_season").notNull(),
  nectarQuality: text("nectar_quality").notNull(),
});

export const insertFloraTypeSchema = createInsertSchema(floraTypes).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Apiary = typeof apiaries.$inferSelect;
export type InsertApiary = z.infer<typeof insertApiarySchema>;

export type Hive = typeof hives.$inferSelect;
export type InsertHive = z.infer<typeof insertHiveSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;

export type FloraType = typeof floraTypes.$inferSelect;
export type InsertFloraType = z.infer<typeof insertFloraTypeSchema>;

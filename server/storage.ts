import { randomUUID } from "crypto";

type User = {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
};

type InsertUser = Omit<User, "id" | "createdAt">;

type GlucoseReading = {
  id: string;
  userId: string;
  value: number;
  unit: "mg/dL" | "mmol/L";
  context: "fasting" | "before_meal" | "after_meal" | "bedtime" | "other";
  notes?: string;
  recordedAt: Date;
};

type InsertGlucoseReading = Omit<GlucoseReading, "id">;

type Meal = {
  id: string;
  userId: string;
  description: string;
  carbs?: number;
  calories?: number;
  notes?: string;
  recordedAt: Date;
};

type InsertMeal = Omit<Meal, "id">;

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Glucose readings
  getReadings(userId: string): Promise<GlucoseReading[]>;
  getReading(id: string): Promise<GlucoseReading | undefined>;
  createReading(reading: InsertGlucoseReading): Promise<GlucoseReading>;
  updateReading(id: string, data: Partial<InsertGlucoseReading>): Promise<GlucoseReading | undefined>;
  deleteReading(id: string): Promise<boolean>;

  // Meals
  getMeals(userId: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  deleteMeal(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private readings: Map<string, GlucoseReading>;
  private meals: Map<string, Meal>;

  constructor() {
    this.users = new Map();
    this.readings = new Map();
    this.meals = new Map();
  }

  // Users

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: randomUUID(), createdAt: new Date() };
    this.users.set(user.id, user);
    return user;
  }

  // Glucose readings

  async getReadings(userId: string): Promise<GlucoseReading[]> {
    return Array.from(this.readings.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }

  async getReading(id: string): Promise<GlucoseReading | undefined> {
    return this.readings.get(id);
  }

  async createReading(insertReading: InsertGlucoseReading): Promise<GlucoseReading> {
    const reading: GlucoseReading = { ...insertReading, id: randomUUID() };
    this.readings.set(reading.id, reading);
    return reading;
  }

  async updateReading(
    id: string,
    data: Partial<InsertGlucoseReading>,
  ): Promise<GlucoseReading | undefined> {
    const existing = this.readings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.readings.set(id, updated);
    return updated;
  }

  async deleteReading(id: string): Promise<boolean> {
    return this.readings.delete(id);
  }

  // Meals

  async getMeals(userId: string): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter((m) => m.userId === userId)
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const meal: Meal = { ...insertMeal, id: randomUUID() };
    this.meals.set(meal.id, meal);
    return meal;
  }

  async deleteMeal(id: string): Promise<boolean> {
    return this.meals.delete(id);
  }
}

export const storage = new MemStorage();

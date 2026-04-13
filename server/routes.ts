import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";

// Minimal auth helper — replace with a real session/JWT solution
function getUserId(req: Request): string | null {
  return (req.headers["x-user-id"] as string) ?? null;
}

function requireUserId(req: Request, res: Response): string | null {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return userId;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {

  // --- Users ---

  app.post("/api/users", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }
    // TODO: hash password with bcrypt before storing
    const user = await storage.createUser({ username, password });
    return res.status(201).json({ id: user.id, username: user.username });
  });

  // --- Glucose Readings ---

  app.get("/api/readings", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const readings = await storage.getReadings(userId);
    return res.json(readings);
  });

  app.post("/api/readings", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { value, unit, context, notes, recordedAt } = req.body;
    if (value == null || !unit || !context) {
      return res.status(400).json({ message: "value, unit, and context are required" });
    }

    const reading = await storage.createReading({
      userId,
      value: Number(value),
      unit,
      context,
      notes,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });
    return res.status(201).json(reading);
  });

  app.put("/api/readings/:id", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const existing = await storage.getReading(req.params.id);
    if (!existing) return res.status(404).json({ message: "Reading not found" });
    if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const updated = await storage.updateReading(req.params.id, req.body);
    return res.json(updated);
  });

  app.delete("/api/readings/:id", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const existing = await storage.getReading(req.params.id);
    if (!existing) return res.status(404).json({ message: "Reading not found" });
    if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteReading(req.params.id);
    return res.status(204).send();
  });

  // --- Meals ---

  app.get("/api/meals", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const meals = await storage.getMeals(userId);
    return res.json(meals);
  });

  app.post("/api/meals", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { description, carbs, calories, notes, recordedAt } = req.body;
    if (!description) {
      return res.status(400).json({ message: "description is required" });
    }

    const meal = await storage.createMeal({
      userId,
      description,
      carbs: carbs != null ? Number(carbs) : undefined,
      calories: calories != null ? Number(calories) : undefined,
      notes,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });
    return res.status(201).json(meal);
  });

  app.delete("/api/meals/:id", async (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId) return;

    // Note: getMeal by id not in interface yet — add if needed, or filter from getMeals
    const meals = await storage.getMeals(userId);
    const meal = meals.find((m) => m.id === req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    await storage.deleteMeal(req.params.id);
    return res.status(204).send();
  });

  return httpServer;
}

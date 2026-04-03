import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryCourtRepository } from "../court.js";
import type { Court } from "@shared/types/court.js";

const seedCourts: Court[] = [
  {
    id: "c1", name: "Indoor Arena", address: "100 Main St",
    lat: 40.71, lng: -74.0, type: "indoor", surface: "hardwood",
    amenities: ["lights"], photos: [],
    pricePerPlayerPerHour: 8, rating: 4.5, reviewCount: 10,
  },
  {
    id: "c2", name: "Outdoor Park", address: "200 Park Ave",
    lat: 40.72, lng: -73.99, type: "outdoor", surface: "asphalt",
    amenities: [], photos: [],
    pricePerPlayerPerHour: 5, rating: 3.8, reviewCount: 5,
  },
];

describe("InMemoryCourtRepository", () => {
  let repo: InMemoryCourtRepository;

  beforeEach(() => {
    repo = new InMemoryCourtRepository(seedCourts);
  });

  it("returns all courts with empty params", () => {
    expect(repo.findAll({})).toHaveLength(2);
  });

  it("filters by type", () => {
    const result = repo.findAll({ type: "indoor" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c1");
  });

  it("filters by query (name search)", () => {
    const result = repo.findAll({ query: "park" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c2");
  });

  it("filters by bounds", () => {
    const result = repo.findAll({
      bounds: { north: 40.715, south: 40.705, east: -73.99, west: -74.01 },
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c1");
  });

  it("finds court by id", () => {
    expect(repo.findById("c1")?.name).toBe("Indoor Arena");
    expect(repo.findById("nonexistent")).toBeUndefined();
  });

  it("updates rating", () => {
    repo.updateRating("c1", 4.8, 12);
    const court = repo.findById("c1");
    expect(court?.rating).toBe(4.8);
    expect(court?.reviewCount).toBe(12);
  });
});

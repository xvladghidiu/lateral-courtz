import type { Court } from "@shared/types/court.js";
import type { CourtSearchParams, ICourtRepository } from "./types.js";

export class InMemoryCourtRepository implements ICourtRepository {
  private courts: Court[];

  constructor(seedData: Court[]) {
    this.courts = structuredClone(seedData);
  }

  findAll(params: CourtSearchParams): Court[] {
    let results = this.courts;

    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q),
      );
    }

    if (params.type) {
      results = results.filter((c) => c.type === params.type);
    }

    if (params.surface) {
      results = results.filter((c) => c.surface === params.surface);
    }

    if (params.bounds) {
      const { north, south, east, west } = params.bounds;
      results = results.filter(
        (c) => c.lat <= north && c.lat >= south && c.lng <= east && c.lng >= west,
      );
    }

    return results;
  }

  findById(id: string): Court | undefined {
    return this.courts.find((c) => c.id === id);
  }

  updateRating(id: string, rating: number, reviewCount: number): void {
    const court = this.courts.find((c) => c.id === id);
    if (!court) return;
    court.rating = rating;
    court.reviewCount = reviewCount;
  }
}

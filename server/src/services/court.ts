import type { Court } from "@shared/types/court.js";
import type { CourtSearchParams, ICourtRepository } from "../repositories/types.js";

export class CourtService {
  constructor(private courtRepo: ICourtRepository) {}

  search(params: CourtSearchParams): Court[] {
    return this.courtRepo.findAll(params);
  }

  getById(id: string): Court {
    const court = this.courtRepo.findById(id);
    if (!court) throw new Error("Court not found");
    return court;
  }
}

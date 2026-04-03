export type CourtType = "indoor" | "outdoor";
export type SurfaceType = "hardwood" | "asphalt" | "rubber";

export interface Court {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: CourtType;
  surface: SurfaceType;
  amenities: string[];
  photos: string[];
  pricePerPlayerPerHour: number;
  rating: number;
  reviewCount: number;
}

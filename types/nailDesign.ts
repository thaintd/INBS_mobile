import type { Service } from "@/types/service";
export interface nailDesign {
  Name: string;
  TrendScore: number;
  Description: string;
  AverageRating: number;
  ID: string;
  CreatedAt: string;
  LastModifiedAt: string;
}

export interface Media {
  ImageUrl: string;
}

export interface DesignWithMedia {
  ID: string;
  Medias: Media[];
}

export interface NailDesignID {
  ID: string;
  Name: string;
  Description: string;
  TrendScore: number;
  Medias: Media[];
  Preferences: Preferences[];
  NailDesigns: NailDesign[];
}

export interface NailDesign {
  ID: string;
  ImageUrl: string;
  NailPosition: number;
  NailDesignServices: NailDesignServices[];
}

export interface Preferences {
  CustomerId: string;
  DesignId: string;
  ID: string;
  PreferenceId: number;
  PreferenceType: string;
}

export interface NailDesignServices {
  ID: string;
  ServiceId: string;
  Service: Service[];
}

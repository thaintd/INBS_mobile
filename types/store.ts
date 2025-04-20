export interface Store {
  Address: string;
  Description: string;
  ImageUrl: string;
  Status: string;
  AverageRating: number;
  ID: string;
  ArtistStores: ArtistStores[];
}

export interface ArtistStores {
  WorkingDate: string;
  StartTime: string;
  EndTime: string;
  Artist: Artist;
}
export interface Artist {
  ID: string;
  YearsOfExperience: number;
  AverageRating: number;
  Level: number;
}

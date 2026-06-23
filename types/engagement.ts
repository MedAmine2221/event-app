export interface BandReview {
  id?: string;
  bandId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PastryReview {
  id?: string;
  pastryId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}
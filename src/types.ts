export interface UserProfile {
  uid: string;
  email: string;
  totalClicks: number;
  createdAt: string;
}

export interface Link {
  id: string;
  originalUrl: string;
  shortId: string;
  userId: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  label?: string;
}

export interface Click {
  id: string;
  linkId: string;
  timestamp: string;
  country: string;
  device: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserNode {
  name: string;
  email: string;
  location: string;
  coordinates?: Coordinates;
  x_account?: string;
  linkedin_url?: string;
  highlights?: string[];
  summary?: string;
  profile_image_url?: string;
  anonymous: boolean;
  skills?: string[];
  interests?: string[];
  team_status?: string;
}

export interface UsersResponse {
  users: UserNode[];
  total: number;
  message?: string;
}

export type Partner = {
  id: number;
  image: string;
  name: string;
  twitter?: string;
  website?: string;
  linkedin?: string;
  type?: string;
};

export type Node = {
  long: number;
  lat: number;
  value: number;
  type?: string;
  userData?: UserNode;
  isNew?: boolean;
};
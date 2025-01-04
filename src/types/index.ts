export type UserNode = {
  name: string;
  email?: string;
  twitter?: string;
  latitude: number;
  longitude: number;
  type: string;
  registrationTime: string;
  status: string;
  location?: string;
  timeline?: {
    event: string;
    timestamp: string;
    status?: string;
    updatedBy?: string;
  }[];
};

export type Partner = {
  id: number;
  image: string;
  name: string;
  twitter?: string;
};

export type Node = {
  long: number;
  lat: number;
  value: number;
  type?: string;
  userData?: UserNode;
  isNew?: boolean;
};
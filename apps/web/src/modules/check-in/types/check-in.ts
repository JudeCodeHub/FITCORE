export interface ICheckIn {
  id: string;
  userId: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ICheckInRecord {
  id: string;
  userId: string;
  timestamp: string;
}

export interface ICheckInResult {
  checkIn: {
    id: string;
    userId: string;
    timestamp: string;
  };
  user: {
    id: string;
    name: string;
    role: string;
  };
}

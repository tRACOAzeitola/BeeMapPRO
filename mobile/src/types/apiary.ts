export enum HiveStatus {
  GOOD = 'good',      // 1 pedra ao meio
  STRONG = 'strong',  // 2 pedras ao meio
  WEAK = 'weak',      // 1 pedra à esquerda
  DEAD = 'dead'       // 1 pau ao meio
}

export interface HiveCounts {
  [HiveStatus.GOOD]: number;
  [HiveStatus.STRONG]: number;
  [HiveStatus.WEAK]: number;
  [HiveStatus.DEAD]: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface Apiary {
  id: string;
  name: string;
  location: Location;
  hiveCounts: HiveCounts;
  lastSync: string;
  pendingChanges: boolean;
  notes?: string;
}

export interface ApiaryUpdate {
  id: string;
  hiveCounts: Partial<HiveCounts>;
  timestamp: string;
}

export interface SyncStatus {
  lastSync: string;
  isPending: boolean;
  error?: string;
}

export interface OfflineChange {
  id: string;
  type: 'UPDATE_HIVE_COUNTS';
  data: ApiaryUpdate;
  timestamp: string;
  retryCount: number;
} 
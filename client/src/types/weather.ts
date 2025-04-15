export interface ForecastDay {
  day: string;
  temperature: number;
  conditions: string;
}

export interface Weather {
  temperature?: number;
  conditions?: string;
  humidity?: number;
  forecast?: {
    forecastDays: ForecastDay[];
  };
} 
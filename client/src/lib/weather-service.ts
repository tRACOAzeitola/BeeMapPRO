import { type WeatherData } from "@shared/schema";

export const fetchWeatherForLocation = async (
  coordinates: string
): Promise<WeatherData | null> => {
  try {
    // Extract coordinates
    const [lat, lon] = coordinates.split(",").map((coord) => parseFloat(coord.trim()));
    
    if (isNaN(lat) || isNaN(lon)) {
      console.error("Invalid coordinates format:", coordinates);
      return null;
    }

    // Find the closest apiary ID
    const apiaryId = await getClosestApiaryId(lat, lon);
    
    if (!apiaryId) {
      console.error("Could not determine apiary ID for coordinates:", coordinates);
      return null;
    }

    // Fetch weather data from our API
    const response = await fetch(`/api/weather/${apiaryId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

// Helper function to find the closest apiary ID to given coordinates
const getClosestApiaryId = async (lat: number, lon: number): Promise<number | null> => {
  try {
    // Fetch all apiaries
    const response = await fetch("/api/apiaries", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch apiaries: ${response.statusText}`);
    }

    const apiaries = await response.json();

    if (!apiaries || apiaries.length === 0) {
      return null;
    }

    // Find the closest apiary based on coordinates
    let closestApiary = null;
    let closestDistance = Infinity;

    for (const apiary of apiaries) {
      const [apiaryLat, apiaryLon] = apiary.coordinates
        .split(",")
        .map((coord: string) => parseFloat(coord.trim()));

      if (isNaN(apiaryLat) || isNaN(apiaryLon)) {
        continue;
      }

      // Calculate distance using Haversine formula
      const distance = calculateDistance(lat, lon, apiaryLat, apiaryLon);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestApiary = apiary;
      }
    }

    return closestApiary ? closestApiary.id : apiaries[0].id;
  } catch (error) {
    console.error("Error finding closest apiary:", error);
    return null;
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

// Get weather forecast for the next several days
export const getWeatherForecast = async (
  coordinates: string,
  days: number = 3
): Promise<any> => {
  try {
    // This would typically call a forecast API endpoint
    // For now, we'll use the mock data that's returned from our backend
    const weatherData = await fetchWeatherForLocation(coordinates);
    
    if (!weatherData || !weatherData.forecast || !weatherData.forecast.days) {
      return null;
    }
    
    return weatherData.forecast.days.slice(0, days);
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return null;
  }
};

// Get weather icon based on conditions
export const getWeatherIcon = (conditions: string): string => {
  const condition = conditions.toLowerCase();
  
  if (condition.includes("clear") || condition.includes("sunny")) {
    return "sun";
  } else if (condition.includes("cloud")) {
    return "cloud";
  } else if (condition.includes("rain") || condition.includes("drizzle")) {
    return "cloud-rain";
  } else if (condition.includes("snow")) {
    return "cloud-snow";
  } else if (condition.includes("thunder")) {
    return "cloud-lightning";
  } else if (condition.includes("fog") || condition.includes("mist")) {
    return "cloud-fog";
  } else {
    return "sun";
  }
};

// Check if weather is suitable for beekeeping activities
export const isWeatherSuitableForBeekeeping = (weather: WeatherData): boolean => {
  // Good conditions: temperature > 15°C, no rain, not too windy
  const goodTemperature = weather.temperature > 15;
  const noRain = !weather.conditions.toLowerCase().includes("rain");
  
  return goodTemperature && noRain;
};

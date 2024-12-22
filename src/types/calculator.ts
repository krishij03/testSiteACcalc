// City temperature data
export interface CityTemperature {
  dbt: number;  // Dry Bulb Temperature (°F)
  wbt: number;  // Wet Bulb Temperature (°F)
}

export type CustomizationLevel = 'low' | 'medium' | 'high';
export type RoofType = 'insulated' | 'uninsulated';

export const CITY_TEMPERATURES: Record<string, CityTemperature> = {
  'Ahmedabad': { dbt: 110, wbt: 78 },
  'Mumbai': { dbt: 95, wbt: 83 },
  'Pune': { dbt: 104, wbt: 76 },
  'Jabalpur': { dbt: 108, wbt: 75 }
};

// Updated Heat transfer coefficients
export const U_FACTORS = {
  wall: 0.33,    // BTU/hr-ft²-°F
  roof_insulated: 0.13,    // BTU/hr-ft²-°F
  roof_uninsulated: 0.46,  // BTU/hr-ft²-°F
  window: 1.13,  // BTU/hr-ft²-°F
  door: 0.16     // BTU/hr-ft²-°F
};

// Safety factors
export const SAFETY_FACTORS = {
  correction: 9,
  coilBypass: 0.12,
  ductLeakage: 0.02,  // 2%
  fanHeat: 0.05,      // 5%
  heatLoad: 0.03      // 3%
};

// Constants
export const CONSTANTS = {
  sensibleHeat: 1.08,    // BTU/hr-CFM-°F
  latentHeat: 0.68,      // BTU/hr-CFM-grains/lb
  btuConversion: 3.412,  // W to BTU/hr
  tonConversion: 12000,  // BTU/hr per ton
  cfmPerPerson: 10,
  defaultACH: 0.42,
  personHeatGain: 600,   // BTU/hr
  defaultLightingLoad: 1.2, // W/ft²
  wallWeight: 60,        // lb/ft²
  roofSunExposed: 40,    // lb/ft²
  roofShaded: 16,        // lb/ft²
  humidityRatio: 82      // grains/lb at 55% RH, WBT=61°F
};

// Updated Appliance data
export const APPLIANCES = [
  { name: 'LED Bulb', wattage: 10 },
  { name: 'Fridge', wattage: 150 },
  { name: 'Oven', wattage: 2000 },
  { name: 'Computer', wattage: 300 },
  { name: 'Fan', wattage: 75 }
];

// Input interfaces
export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

export interface WindowDoorDetails {
  windowCount: number;
  windowArea: number;
  doorCount: number;
  doorArea: number;
}

export interface ApplianceCount {
  [key: string]: number;
}

export interface CalculatorInputs {
  // Low Level
  customizationLevel: CustomizationLevel;
  roomDimensions: RoomDimensions;
  city: string;
  indoorTemp: number;
  relativeHumidity: number;
  roofType: RoofType;

  // Medium Level
  windowDoorDetails?: WindowDoorDetails;
  occupants?: number;
  airChangesPerHour?: number;
  isRoofSunExposed?: boolean;

  // High Level
  appliances?: ApplianceCount;
  lightingLoad?: number;
}

export const DEFAULT_VALUES = {
  // Low Level
  roomDimensions: {
    length: 15,
    width: 12,
    height: 10
  },
  city: 'Mumbai',
  indoorTemp: 75,
  relativeHumidity: 55,
  roofType: 'uninsulated' as RoofType,

  // Medium Level
  windowDoorDetails: {
    windowCount: 2,
    windowArea: 15,
    doorCount: 1,
    doorArea: 20
  },
  occupants: 3,
  airChangesPerHour: CONSTANTS.defaultACH,
  isRoofSunExposed: true,

  // High Level
  lightingLoad: CONSTANTS.defaultLightingLoad,
  appliances: {
    'LED Bulb': 4,
    'Fan': 2
  }
}; 

export interface CityData {
  db: number;  // Dry Bulb Temperature
  wb: number;  // Wet Bulb Temperature
  drange: number;
  rh: number;  // Relative Humidity %
  dp: number;  // Dew Point
  grPerLb: number;  // Grains per Pound
}

export const CITY_DATA: Record<string, CityData> = {
  'New Delhi': { db: 104, wb: 80, drange: 24, rh: 40, dp: 73, grPerLb: 62 },
  'Mumbai': { db: 92, wb: 86, drange: 6, rh: 85, dp: 83, grPerLb: 82 },
  'Bengaluru': { db: 86, wb: 74, drange: 12, rh: 60, dp: 68, grPerLb: 50 },
  'Kolkata': { db: 95, wb: 88, drange: 7, rh: 75, dp: 85, grPerLb: 78 },
  'Chennai': { db: 100, wb: 91, drange: 9, rh: 70, dp: 86, grPerLb: 84 },
  'Hyderabad': { db: 95, wb: 82, drange: 13, rh: 55, dp: 76, grPerLb: 67 },
  'Ahmedabad': { db: 108, wb: 84, drange: 24, rh: 35, dp: 71, grPerLb: 58 },
  'Pune': { db: 90, wb: 76, drange: 14, rh: 50, dp: 72, grPerLb: 54 },
  'Jaipur': { db: 106, wb: 80, drange: 26, rh: 30, dp: 70, grPerLb: 55 },
  'Lucknow': { db: 102, wb: 78, drange: 24, rh: 40, dp: 72, grPerLb: 60 }
};

export const HEAT_FACTORS = {
  PERSON_SENSIBLE_HEAT: 255,
  PERSON_LATENT_HEAT: 245,
  EQUIPMENT_HEAT_FACTOR: 3410,
  DUCT_GAIN: 0.02,  // 2%
  FAN_HEAT_GAIN: 0.05,  // 5%
  SAFETY_FACTOR: 0.03,  // 3%
  VENTILATION_FACTOR: 0.42,
  SENSIBLE_CONSTANT: 1.08,
  LATENT_CONSTANT: 0.68,
  BYPASS_FACTOR: 0.12,
  TON_CONVERSION: 12000
}; 
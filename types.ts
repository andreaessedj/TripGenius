// Fix: Define and export the necessary types for the application.
// This file was previously empty, causing "not a module" errors.

/**
 * Represents a single destination entry in the form.
 */
export interface DestinationEntry {
  id: number;
  name: string;
  days: string;
}

/**
 * Represents a single activity within a day's plan.
 */
export interface Activity {
  timeOfDay: 'Mattina' | 'Pomeriggio' | 'Sera';
  name: string;
  description: string;
  latitude?: number;
  longitude?: number;
  estimatedCost?: string;
  ticketLink?: string;
  category?: 'Attrazione Storica' | 'Museo' | 'Parco' | 'Ristorante' | 'Shopping' | 'Punto Panoramico' | 'Altro';
  estimatedVisitDuration?: string;
  startTime?: string;
}

/**
 * Represents the plan for a single day of the trip.
 */
export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  weatherAdvice?: string;
}

/**
 * Represents the entire itinerary, which is an array of daily plans.
 */
export type ItineraryPlan = DayPlan[];

/**
 * Represents a unique local experience suggestion.
 */
export interface LocalExperience {
  category: 'Cibo' | 'Arte & Cultura' | 'Avventura' | 'Shopping' | 'Benessere';
  title: string;
  description: string;
}

export type LocalExperiences = LocalExperience[];


/**
 * Represents a single item to pack.
 */
export interface PackingItem {
    item: string;
    notes?: string;
}

/**
 * Represents the packing list, categorized.
 */
export type PackingList = Record<string, PackingItem[]>;

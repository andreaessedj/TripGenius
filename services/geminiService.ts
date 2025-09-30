// Fix: Implement the Gemini service to generate travel itineraries.
// This file was malformed and is now correctly implemented.

import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryPlan, LocalExperiences, Activity, DayPlan } from '../types';

// The Gemini API key is expected to be set as an environment variable.
// The user has been instructed that this is handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Defines the JSON schema for the expected itinerary plan, WITHOUT images.
const itinerarySchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: {
          type: Type.NUMBER,
          description: "Il numero del giorno, partendo da 1."
        },
        title: {
          type: Type.STRING,
          description: "Un titolo accattivante per la giornata, es. 'Esplorazione del centro storico'."
        },
        activities: {
          type: Type.ARRAY,
          description: "Un elenco di attività per la giornata.",
          items: {
            type: Type.OBJECT,
            properties: {
              timeOfDay: {
                type: Type.STRING,
                description: "La parte della giornata per l'attività.",
                enum: ['Mattina', 'Pomeriggio', 'Sera']
              },
              name: {
                type: Type.STRING,
                description: "Il nome dell'attrazione o dell'attività, es. 'Colosseo'."
              },
              description: {
                type: Type.STRING,
                description: "Una breve descrizione dell'attività (1-2 frasi)."
              },
              latitude: {
                type: Type.NUMBER,
                description: "La coordinata di latitudine dell'attrazione (opzionale)."
              },
              longitude: {
                type: Type.NUMBER,
                description: "La coordinata di longitudine dell'attrazione (opzionale)."
              },
              estimatedCost: {
                  type: Type.STRING,
                  description: "Il costo stimato del biglietto d'ingresso, es. '€18' o 'Gratuito'. Se sconosciuto, ometti."
              },
              ticketLink: {
                  type: Type.STRING,
                  description: "Il link per l'acquisto dei biglietti. Se l'attività è a pagamento, DEVE essere un link di affiliazione GetYourGuide. Se è gratuita, ometti."
              },
              category: {
                  type: Type.STRING,
                  description: "La categoria dell'attività.",
                  enum: ['Attrazione Storica', 'Museo', 'Parco', 'Ristorante', 'Shopping', 'Punto Panoramico', 'Altro']
              },
              estimatedVisitDuration: {
                  type: Type.STRING,
                  description: "La durata stimata della visita, es. '1 ora', '90 minuti', '2.5 ore'. Sii realistico."
              }
            },
            required: ['timeOfDay', 'name', 'description']
          }
        }
      },
      required: ['day', 'title', 'activities']
    }
  };

// Defines the JSON schema for local experiences.
const experiencesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            category: {
                type: Type.STRING,
                description: "La categoria dell'esperienza.",
                enum: ['Cibo', 'Arte & Cultura', 'Avventura', 'Shopping', 'Benessere']
            },
            title: {
                type: Type.STRING,
                description: "Un titolo breve e accattivante per l'esperienza."
            },
            description: {
                type: Type.STRING,
                description: "Una breve descrizione dell'esperienza (1-2 frasi), che la renda unica e locale."
            }
        },
        required: ['category', 'title', 'description']
    }
};

/**
 * Helper to parse a duration string (e.g., "1 ora", "90 minuti") into total minutes.
 * @param durationStr The duration string from the AI.
 * @returns Total minutes as a number.
 */
const parseDurationToMinutes = (durationStr?: string): number => {
    if (!durationStr) return 60; // Default to 1 hour if not provided

    const hoursMatch = durationStr.match(/(\d+(\.\d+)?)\s*or[ea]/);
    const minutesMatch = durationStr.match(/(\d+)\s*min/);

    let totalMinutes = 0;
    if (hoursMatch) {
        totalMinutes += parseFloat(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1], 10);
    }
    
    // If no specific unit found but it's just a number, assume minutes.
    if (totalMinutes === 0 && /^\d+$/.test(durationStr)) {
        return parseInt(durationStr, 10);
    }

    // Default to 60 minutes if parsing fails or result is 0
    return totalMinutes > 0 ? totalMinutes : 60;
}

/**
 * Helper to format total minutes from midnight into a "HH:mm" time string.
 * @param totalMinutes The total minutes from midnight.
 * @returns A formatted time string.
 */
const formatMinutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

const TRAVEL_BUFFER_MINUTES = 20;

/**
 * Processes the raw itinerary to add a calculated daily schedule.
 * @param itinerary The itinerary plan from the AI.
 * @returns The itinerary enriched with start times for each activity.
 */
const processItineraryWithSchedule = (itinerary: ItineraryPlan): ItineraryPlan => {
    return itinerary.map((dayPlan: DayPlan) => {
        let currentTime = 9 * 60; // Start the day at 09:00

        const morningActivities = dayPlan.activities.filter(a => a.timeOfDay === 'Mattina');
        const afternoonActivities = dayPlan.activities.filter(a => a.timeOfDay === 'Pomeriggio');
        const eveningActivities = dayPlan.activities.filter(a => a.timeOfDay === 'Sera');

        const scheduledActivities: Activity[] = [];

        // Schedule Morning
        morningActivities.forEach(activity => {
            activity.startTime = formatMinutesToTime(currentTime);
            scheduledActivities.push(activity);
            const duration = parseDurationToMinutes(activity.estimatedVisitDuration);
            currentTime += duration + TRAVEL_BUFFER_MINUTES;
        });

        // Schedule Lunch & Afternoon
        // Ensure lunch starts between 12:30 and 13:30
        if (currentTime < 12.5 * 60) {
            currentTime = 12.5 * 60;
        } else if (currentTime > 13.5 * 60) {
            // If morning activities went long, push lunch to the next 15-minute interval
            currentTime = Math.ceil(currentTime / 15) * 15;
        }

        afternoonActivities.forEach(activity => {
            activity.startTime = formatMinutesToTime(currentTime);
            scheduledActivities.push(activity);
            const duration = parseDurationToMinutes(activity.estimatedVisitDuration);
            currentTime += duration + TRAVEL_BUFFER_MINUTES;
        });

        // Schedule Evening
        currentTime = 19 * 60; // Reset for evening activities at 19:00
        eveningActivities.forEach(activity => {
            activity.startTime = formatMinutesToTime(currentTime);
            scheduledActivities.push(activity);
            const duration = parseDurationToMinutes(activity.estimatedVisitDuration);
            currentTime += duration + TRAVEL_BUFFER_MINUTES;
        });
        
        // Ensure activities are sorted by their new calculated start time
        scheduledActivities.sort((a, b) => {
            if (!a.startTime || !b.startTime) return 0;
            return a.startTime.localeCompare(b.startTime);
        });

        return { ...dayPlan, activities: scheduledActivities };
    });
};


/**
 * Generates a travel itinerary.
 * @param destination The travel destination.
 * @param days The number of days for the trip.
 * @param intensity The desired pace of the tour.
 * @returns A promise that resolves to an ItineraryPlan.
 */
export const generateItinerary = async (destination: string, days: number, intensity: 'leggero' | 'medio' | 'intenso'): Promise<ItineraryPlan> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Crea un itinerario di viaggio dettagliato e ottimizzato per ${days} giorni a ${destination}, con un'intensità del tour '${intensity}'.

      L'intensità del tour determina il numero di attività giornaliere:
      - 'leggero': Un ritmo rilassato (es. 1 Mattina, 1 Pomeriggio, 1 Sera).
      - 'medio': Un buon equilibrio (es. 2 Mattina, 1 Pomeriggio, 1 Sera).
      - 'intenso': Un ritmo serrato (es. 2 Mattina, 2 Pomeriggio, 1 Sera).

      Per la struttura della giornata, segui queste regole in modo rigoroso:
      - La prima visita del 'Mattina' deve iniziare tra le 8:30 e le 9:00.
      - La prima attività del 'Pomeriggio' dovrebbe essere sempre un 'Ristorante' per una pausa pranzo di circa 1 ora (tra le 12:30 e le 13:30).
      - Le visite del 'Pomeriggio' continuano dopo pranzo fino alle 18:00.
      - Le attività della 'Sera' si svolgono tra le 19:00 e le 23:00, e di solito includono la cena.

      Per ogni giorno, fornisci un titolo e un elenco di attività per mattina, pomeriggio e sera.
      Per OGNI attività, includi:
      1. Nome del luogo/attività.
      2. Breve descrizione (max 2 frasi).
      3. Categoria: 'Attrazione Storica', 'Museo', 'Parco', 'Ristorante', 'Shopping', 'Punto Panoramico', 'Altro'.
      4. Durata stimata della visita (es. "1 ora", "90 minuti"). Sii realistico.
      5. Coordinate di latitudine e longitudine, se possibile.
      6. Costo di ingresso stimato (es. "€25" o "Gratuito").
      7. 'ticketLink': Questa è la regola PIÙ IMPORTANTE. Segui attentamente queste istruzioni:
         a. Controlla se l'attività ha un costo (se 'estimatedCost' NON è 'Gratuito').
         b. Se l'attività è a pagamento, DEVI generare un link di affiliazione per GetYourGuide. Il link DEVE seguire questo formato esatto: 'https://www.getyourguide.it/s/?q=[NOME_ATTRAZIONE], [DESTINAZIONE]&partner_id=VHSL1EX&cmp=share_to_earn'.
         c. Sostituisci '[NOME_ATTRAZIONE]' con il nome dell'attività e '[DESTINAZIONE]' con la città fornita (${destination}). Assicurati che gli spazi siano gestiti correttamente per l'URL.
         d. Se l'attività è gratuita ('estimatedCost' è 'Gratuito' o non specificato), DEVI OMETTERE completamente il campo 'ticketLink'.
      
      Rispondi esclusivamente con l'array JSON, senza testo introduttivo, conclusivo o formattazione markdown.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: itinerarySchema, 
            },
        });
        
        const text = response.text;
        if (!text) throw new Error("Received an empty response from the AI model.");
        
        const itinerary = JSON.parse(text) as ItineraryPlan;
        const scheduledItinerary = processItineraryWithSchedule(itinerary);
        return scheduledItinerary;

    } catch (error) {
        console.error("Error generating itinerary with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Impossibile comunicare con il servizio AI: ${error.message}`);
        }
        throw new Error("Si è verificato un errore sconosciuto durante la generazione dell'itinerario.");
    }
};

/**
 * Generates local experience suggestions using the Gemini API.
 * @param destination The travel destination.
 * @returns A promise that resolves to a LocalExperiences array.
 */
export const generateLocalExperiences = async (destination: string): Promise<LocalExperiences> => {
    const model = 'gemini-2.5-flash';
  
    const prompt = `
      Suggerisci 5 esperienze locali uniche e autentiche per un turista a ${destination}.
      Evita le attrazioni turistiche più comuni e concentrati su attività come tour culinari, lezioni di artigianato locale, spettacoli culturali, mercati nascosti o escursioni uniche nella natura circostante.
      Per ogni suggerimento, fornisci una categoria, un titolo e una breve descrizione.
      Rispondi solo con l'array JSON, senza testo introduttivo, conclusivo o markdown.
    `;
  
    try {
      const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: experiencesSchema,
          },
      });
      
      const text = response.text;
      
      if (!text) {
        throw new Error("Received an empty response from the AI model for local experiences.");
      }
  
      const experiences = JSON.parse(text) as LocalExperiences;
      return experiences;
  
    // Fix: Add curly braces to the catch block to correctly handle errors.
    } catch (error) {
      console.error("Error generating local experiences with Gemini:", error);
      if (error instanceof Error) {
          throw new Error(`Impossibile comunicare con il servizio AI per le esperienze locali: ${error.message}`);
      }
      throw new Error("Si è verificato un errore sconosciuto durante la generazione delle esperienze locali.");
    }
  };
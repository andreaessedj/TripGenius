import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryPlan, LocalExperiences, Activity, DayPlan, PackingList } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const activitySchemaProperties = {
  timeOfDay: { type: Type.STRING, enum: ['Mattina', 'Pomeriggio', 'Sera'] },
  name: { type: Type.STRING, description: "Il nome dell'attrazione o attività." },
  description: { type: Type.STRING, description: "Una breve descrizione dell'attività (1-2 frasi)." },
  address: { type: Type.STRING, description: "L'indirizzo completo e preciso del luogo, inclusi via e numero civico." },
  latitude: { type: Type.NUMBER, description: "La coordinata di latitudine (opzionale)." },
  longitude: { type: Type.NUMBER, description: "La coordinata di longitudine (opzionale)." },
  estimatedCost: { type: Type.STRING, description: "Costo stimato, es. '€18' o 'Gratuito'." },
  ticketLink: { type: Type.STRING, description: "Link di affiliazione GetYourGuide se l'attività è a pagamento." },
  category: { type: Type.STRING, enum: ['Attrazione Storica', 'Museo', 'Parco', 'Ristorante', 'Shopping', 'Punto Panoramico', 'Altro'] },
  estimatedVisitDuration: { type: Type.STRING, description: "Durata stimata della visita, es. '1 ora'." },
  travelToNext: {
      type: Type.OBJECT,
      description: "Stima della distanza e durata a piedi per raggiungere la PROSSIMA attività. Ometti per l'ultima attività della giornata.",
      properties: {
          distance: { type: Type.STRING, description: "Distanza, es. '1.2 km'." },
          duration: { type: Type.STRING, description: "Durata, es. '15 min'." }
      }
  }
};

const itinerarySchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.NUMBER, description: "Il numero del giorno, partendo da 1." },
        title: { type: Type.STRING, description: "Un titolo accattivante per la giornata." },
        weatherAdvice: { type: Type.STRING, description: "Un breve consiglio sul meteo basato sulla stagione e sulla località, suggerendo abbigliamento o un piano B." },
        activities: {
          type: Type.ARRAY,
          description: "Un elenco di attività per la giornata.",
          items: {
            type: Type.OBJECT,
            properties: activitySchemaProperties,
            required: ['timeOfDay', 'name', 'description', 'address', 'category']
          }
        }
      },
      required: ['day', 'title', 'activities', 'weatherAdvice']
    }
};

const alternativesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: activitySchemaProperties,
        required: ['timeOfDay', 'name', 'description', 'address', 'category']
    }
};

const experiencesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            category: { type: Type.STRING, enum: ['Cibo', 'Arte & Cultura', 'Avventura', 'Shopping', 'Benessere'] },
            title: { type: Type.STRING, description: "Titolo breve e accattivante." },
            description: { type: Type.STRING, description: "Breve descrizione (1-2 frasi)." }
        },
        required: ['category', 'title', 'description']
    }
};

const packingListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: "Il nome della categoria (es. 'Abbigliamento', 'Documenti')." },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING, description: "Il nome dell'oggetto da mettere in valigia." },
            notes: { type: Type.STRING, description: "Una nota breve e facoltativa (es. 'Impermeabile')." }
          },
          required: ["item"]
        }
      }
    },
    required: ['category', 'items']
  }
};


const parseDurationToMinutes = (durationStr?: string): number => {
    if (!durationStr) return 60; 
    const hoursMatch = durationStr.match(/(\d+(\.\d+)?)\s*or[ea]/);
    const minutesMatch = durationStr.match(/(\d+)\s*min/);
    let totalMinutes = 0;
    if (hoursMatch) totalMinutes += parseFloat(hoursMatch[1]) * 60;
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1], 10);
    if (totalMinutes === 0 && /^\d+$/.test(durationStr)) return parseInt(durationStr, 10);
    return totalMinutes > 0 ? totalMinutes : 60;
}

const formatMinutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

const TRAVEL_BUFFER_MINUTES = 20;

const processItineraryWithSchedule = (itinerary: DayPlan[]): ItineraryPlan => {
    return itinerary.map((dayPlan: DayPlan) => {
        let currentTime = 9 * 60; // Start at 09:00
        const morningActivities = dayPlan.activities.filter(a => a.timeOfDay === 'Mattina');
        const afternoonActivities = dayPlan.activities.filter(a => a.timeOfDay === 'Pomeriggio');
        const eveningActivities = dayPlan.activities.filter(a => a.timeOfDay === 'Sera');
        const scheduledActivities: Activity[] = [];

        const scheduleBlock = (activities: Omit<Activity, 'id' | 'status'>[]) => {
            activities.forEach(activity => {
                const fullActivity = { 
                    ...activity, 
                    id: crypto.randomUUID(), 
                    status: 'active' as const,
                    startTime: formatMinutesToTime(currentTime)
                };
                scheduledActivities.push(fullActivity);
                currentTime += parseDurationToMinutes(activity.estimatedVisitDuration) + (activity.travelToNext ? parseDurationToMinutes(activity.travelToNext.duration) : TRAVEL_BUFFER_MINUTES);
            });
        };

        scheduleBlock(morningActivities);
        
        currentTime = Math.max(currentTime, 13 * 60); // Lunch break, start afternoon at 13:00 earliest
        
        scheduleBlock(afternoonActivities);
        
        currentTime = Math.max(currentTime, 19 * 60); // Dinner break, start evening at 19:00 earliest
        
        scheduleBlock(eveningActivities);
        
        scheduledActivities.sort((a, b) => (a.startTime && b.startTime) ? a.startTime.localeCompare(b.startTime) : 0);
        return { ...dayPlan, activities: scheduledActivities };
    });
};

export const generateItinerary = async (destination: string, days: number, intensity: 'leggero' | 'medio' | 'intenso', budget: 'economico' | 'medio' | 'lusso', interests: string[]): Promise<ItineraryPlan> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Crea un itinerario di viaggio dettagliato per ${days} giorni a ${destination}.
      Il viaggio deve avere un'intensità '${intensity}' e un budget '${budget}'.
      Gli interessi principali del viaggiatore sono: ${interests.join(', ') || 'generali'}.

      Regole di personalizzazione:
      - Intensità: 'leggero' (poche attività, rilassato), 'medio' (equilibrio), 'intenso' (serrato).
      - Budget: 'economico' (privilegia attività gratuite, street food), 'medio' (mix di attività a pagamento e gratuite), 'lusso' (esperienze premium, ristoranti rinomati).
      - Interessi: Adatta le attività agli interessi forniti. Se l'interesse è 'Cibo', includi più esperienze culinarie.
      
      **Regola FONDAMENTALE per i Ristoranti**: Quando suggerisci un ristorante specifico con categoria 'Ristorante', DEVI basarti su informazioni verificate e recenti per assicurarti che sia attualmente aperto e operativo. Se non sei sicuro al 100% o non trovi un locale specifico adatto, NON inventare un nome. Invece, crea un'attività generica ma evocativa. Esempi:
      - Per il pranzo, usa 'name': "Pausa Pranzo Tipica", 'description': "Goditi un pranzo rilassante in un'osteria o trattoria locale a tua scelta per assaporare i sapori autentici della regione."
      - Per la cena, usa 'name': "Cena con Atmosfera", 'description': "Scegli un ristorante che ti ispira nella zona per una cena memorabile, magari con una vista particolare o un'atmosfera unica."
      Per queste attività generiche, imposta 'address' con il nome del quartiere (es. "Quartiere Trastevere") e non includere 'latitude' e 'longitude'.

      Per ogni giorno, fornisci:
      1. 'title': Un titolo accattivante.
      2. 'weatherAdvice': Un breve consiglio sul meteo (es. "Porta un ombrello per possibili acquazzoni pomeridiani").
      3. 'activities': Un elenco di attività.
      
      Per OGNI attività, includi OBBLIGATORIAMENTE:
      - 'timeOfDay', 'name', 'description', 'address' (indirizzo completo e preciso), 'category', 'estimatedVisitDuration', 'latitude', 'longitude', 'estimatedCost'.
      - 'travelToNext': Per ogni attività, tranne l'ultima della giornata, fornisci una stima della distanza e durata del viaggio a piedi per raggiungere l'attività successiva.
      - 'ticketLink': IMPORTANTE. Se 'estimatedCost' non è 'Gratuito', DEVI generare un link di affiliazione GetYourGuide nel formato: 'https://www.getyourguide.it/s/?q=[NOME_ATTRAZIONE], [DESTINAZIONE]&partner_id=VHSL1EX&cmp=share_to_earn'. Altrimenti, ometti il campo.
      
      Struttura della giornata:
      - 'Mattina': Inizio 8:30-9:00.
      - 'Pomeriggio': Inizia con un 'Ristorante' per pranzo (12:30-13:30).
      - 'Sera': Cena e attività serali (dopo le 19:00).

      Rispondi esclusivamente con l'array JSON, senza testo introduttivo, conclusivo o markdown.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: itinerarySchema },
        });
        
        const text = response.text;
        if (!text) throw new Error("Received an empty response from the AI model.");
        
        const itinerary = JSON.parse(text) as DayPlan[];
        return processItineraryWithSchedule(itinerary);

    } catch (error) {
        console.error("Error generating itinerary with Gemini:", error);
        throw new Error(`Impossibile comunicare con il servizio AI: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateAlternativeActivities = async (destination: string, activityToReplace: Activity, context: { interests: string[], budget: string }): Promise<Activity[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        A ${destination}, suggerisci 3 attività alternative a "${activityToReplace.name}" (${activityToReplace.description}).
        Il momento della giornata è '${activityToReplace.timeOfDay}'.
        Gli interessi del viaggiatore sono: ${context.interests.join(', ')}.
        Il budget è '${context.budget}'.
        Le alternative devono essere pertinenti e nelle vicinanze, se possibile.

        **Regola FONDAMENTALE per i Ristoranti**: Se l'attività da rimpiazzare è un 'Ristorante', quando suggerisci un ristorante specifico DEVI basarti su informazioni verificate e recenti. Se non sei sicuro, fornisci un suggerimento generico (es. 'name': "Ristorante Alternativo", 'description': "Un altro ottimo ristorante in zona a tua scelta, per provare sapori diversi."). In questo caso, imposta 'address' con il nome del quartiere e non includere 'latitude' e 'longitude'.

        Per ogni alternativa, fornisci tutti i dettagli necessari: 'timeOfDay', 'name', 'description', 'address', 'category', 'estimatedVisitDuration', 'latitude', 'longitude', 'estimatedCost' e 'ticketLink' (se applicabile, usando il formato partner GetYourGuide 'partner_id=VHSL1EX').
        Rispondi solo con un array JSON di 3 oggetti attività. Non includere 'travelToNext'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: alternativesSchema },
        });
        const text = response.text;
        if (!text) throw new Error("Received an empty response for alternatives.");
        
        // Add id and status to the generated alternatives
        const activities = JSON.parse(text) as Omit<Activity, 'id' | 'status'>[];
        return activities.map(act => ({
            ...act,
            id: crypto.randomUUID(),
            status: 'active' as const
        }));

    } catch (error) {
        console.error("Error generating alternative activities:", error);
        throw new Error(`Impossibile generare alternative: ${error instanceof Error ? error.message : String(error)}`);
    }
};


export const generateLocalExperiences = async (destination: string): Promise<LocalExperiences> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Suggerisci 5 esperienze locali uniche e autentiche per un turista a ${destination}. Evita le attrazioni più comuni. Concentrati su attività come tour culinari, lezioni di artigianato, mercati nascosti. Per ogni suggerimento, fornisci una categoria, un titolo e una breve descrizione. Rispondi solo con l'array JSON.`;
  
    try {
      const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: experiencesSchema },
      });
      
      const text = response.text;
      if (!text) throw new Error("Received an empty response for local experiences.");
  
      return JSON.parse(text) as LocalExperiences;
  
    } catch (error) {
      console.error("Error generating local experiences with Gemini:", error);
      throw new Error(`Impossibile comunicare con il servizio AI per le esperienze locali: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generatePackingList = async (destination: string, duration: number, itinerary: ItineraryPlan): Promise<PackingList> => {
    const model = 'gemini-2.5-flash';
    const activitiesSummary = itinerary.flatMap(day => day.activities.map(act => act.category)).join(', ');
    
    const prompt = `
      Crea una lista di cose da mettere in valigia (packing list) per un viaggio di ${duration} giorni a ${destination}.
      Considera che le attività pianificate includono: ${activitiesSummary}.
      Basa i suggerimenti sull'abbigliamento sul clima tipico della destinazione.
      Organizza la lista in un array di categorie. Ogni oggetto nell'array deve avere una chiave "category" (es. 'Abbigliamento') e una chiave "items" che è un array di oggetti. Ogni oggetto item deve avere una chiave "item" e una chiave opzionale "notes".
      Le categorie dovrebbero essere logiche, come 'Abbigliamento', 'Documenti', 'Elettronica', 'Articoli da toeletta', e 'Extra'.
      Rispondi solo con l'array JSON, senza testo introduttivo, conclusivo o markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: packingListSchema },
        });
        const text = response.text;
        if (!text) throw new Error("Received an empty response for packing list.");
        return JSON.parse(text) as PackingList;
    } catch (error) {
        console.error("Error generating packing list:", error);
        throw new Error(`Impossibile generare la lista bagaglio: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateDestinationImage = async (destination: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Un'illustrazione digitale artistica e vibrante di ${destination}. Stile: acquerello e inchiostro, sognante, colorato.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Nessuna immagine generata.");
        }
    } catch (error) {
        console.error("Error generating destination image:", error);
        // Do not throw an error to the user, just log it. The UI has a fallback.
        return "";
    }
};
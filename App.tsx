import React, { useState, useCallback, useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ItineraryPlan, LocalExperiences, DestinationEntry, PackingList } from './types';
import { generateItinerary, generateLocalExperiences, generatePackingList, generateDestinationImage } from './services/geminiService';
import Header from './components/Header';
import ItineraryCard from './components/ItineraryCard';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import Welcome from './components/Welcome';
import LocalExperiencesComponent from './components/LocalExperiences';
import HotelSearch from './components/HotelSearch';
import PackingListComponent from './components/PackingListComponent';


interface ItineraryResult {
  destinationName: string;
  plan: ItineraryPlan;
}

const ALL_INTERESTS = ['Arte e Cultura', 'Cibo e Vino', 'Avventura all\'aperto', 'Storia', 'Shopping', 'Vita Notturna', 'Rilassamento', 'Natura e Paesaggi'];

const App: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationEntry[]>([{ id: 1, name: '', days: '3' }]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [intensity, setIntensity] = useState<'leggero' | 'medio' | 'intenso'>('medio');
  const [budget, setBudget] = useState<'economico' | 'medio' | 'lusso'>('medio');
  const [interests, setInterests] = useState<string[]>([]);
  
  const [itineraries, setItineraries] = useState<ItineraryResult[] | null>(null);
  const [localExperiences, setLocalExperiences] = useState<LocalExperiences | null>(null);
  const [packingList, setPackingList] = useState<PackingList | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
  
  const debounceTimeoutRef = useRef<number | null>(null);
  const firstDestination = useMemo(() => destinations[0], [destinations]);

  const handleDestinationChange = (index: number, field: keyof Omit<DestinationEntry, 'id'>, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    setDestinations(newDestinations);

    if (index === 0 && field === 'name') {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = window.setTimeout(() => {
            if (value.trim().length > 3) { // Only generate if the name is somewhat substantial
                generateDestinationImage(value)
                    .then(imageUrl => setHeaderImageUrl(imageUrl))
                    .catch(err => console.error("Failed to generate destination image:", err));
            }
        }, 800); // Debounce for 800ms
    }
  };

  const addDestination = () => {
    setDestinations([...destinations, { id: Date.now(), name: '', days: '2' }]);
  };

  const removeDestination = (id: number) => {
    setDestinations(destinations.filter(d => d.id !== id));
  };

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
        prev.includes(interest) 
            ? prev.filter(i => i !== interest)
            : [...prev, interest]
    );
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!destinations.every(d => d.name && parseInt(d.days, 10) > 0)) {
      setError('Inserisci una destinazione e un numero di giorni validi per ogni tappa.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setItineraries(null);
    setLocalExperiences(null);
    setPackingList(null);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      const allItineraries: ItineraryResult[] = [];
      let fullGeneratedPlan: ItineraryPlan = [];
      for (const dest of destinations) {
        const numDays = parseInt(dest.days, 10);
        const generatedPlan = await generateItinerary(dest.name, numDays, intensity, budget, interests);
        allItineraries.push({ destinationName: dest.name, plan: generatedPlan });
        fullGeneratedPlan = [...fullGeneratedPlan, ...generatedPlan];
        await sleep(1200);
      }
      setItineraries(allItineraries);
      
      if(firstDestination?.name) {
          setIsLoadingExperiences(true); // Re-use this state for all secondary calls
          try {
            const totalDays = destinations.reduce((acc, curr) => acc + parseInt(curr.days, 10), 0);
            const [experiences, generatedPackingList] = await Promise.all([
                generateLocalExperiences(firstDestination.name),
                generatePackingList(firstDestination.name, totalDays, fullGeneratedPlan)
            ]);
            setLocalExperiences(experiences);
            setPackingList(generatedPackingList);
          } catch (err) {
            console.error("Impossibile caricare le esperienze locali o la lista bagaglio:", err);
            setError("Non è stato possibile caricare alcuni suggerimenti aggiuntivi.");
          } finally {
            setIsLoadingExperiences(false);
          }
      }

    } catch (err) {
        console.error("Errore durante la generazione dell'itinerario:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            setError("Il servizio è momentaneamente sovraccarico. Riprova tra qualche istante.");
        } else {
            setError("Impossibile generare l'itinerario. Controlla la tua chiave API e riprova.");
        }
    } finally {
      setIsLoading(false);
    }
  }, [destinations, intensity, budget, interests, firstDestination]);
  

  const handleDownloadPdf = async () => {
    const itineraryElement = document.getElementById('itinerary-content');
    if (!itineraryElement || isDownloadingPdf) return;

    setIsDownloadingPdf(true);
    try {
        const canvas = await html2canvas(itineraryElement, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new (jsPDF as any)({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`itinerario-${firstDestination.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Errore durante la generazione del PDF:", error);
        setError("Impossibile generare il PDF. Riprova.");
    } finally {
        setIsDownloadingPdf(false);
    }
};

const handleShare = async () => {
    if (!itineraries) return;

    const summary = `Ecco il mio itinerario di viaggio per ${itineraries.map(i => i.destinationName).join(', ')}:\n\n` +
      itineraries.map(({ destinationName: dest, plan }) => {
        const destSummary = `--- ${dest} ---\n` + plan.map(dayPlan => {
            const activitiesSummary = dayPlan.activities
              .map(activity => `- ${activity.timeOfDay}: ${activity.name} - ${activity.description}`)
              .join('\n');
            return `Giorno ${dayPlan.day}: ${dayPlan.title}\n${activitiesSummary}`;
          }).join('\n\n');
        return destSummary;
      }).join('\n\n\n');

    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500); // Reset after 2.5 seconds
    } catch (err) {
      console.error('Impossibile copiare il testo: ', err);
      setError("Impossibile copiare l'itinerario negli appunti.");
    }
  };

  const hotelCheckOutDate = useMemo(() => {
    if (!startDate || !firstDestination?.days) return '';
    try {
      const duration = parseInt(firstDestination.days, 10);
      if (isNaN(duration) || duration <= 0) return '';
      
      const parts = startDate.split('-').map(p => parseInt(p, 10));
      const checkInDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      
      checkInDate.setUTCDate(checkInDate.getUTCDate() + duration);
      
      return checkInDate.toISOString().split('T')[0];
    } catch (e) {
      console.error("Error calculating checkout date:", e);
      return '';
    }
  }, [startDate, firstDestination]);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header imageUrl={headerImageUrl} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 max-w-3xl mx-auto -mt-20 z-10 relative border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Pianifica la Tua Prossima Avventura</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Personalizza ogni dettaglio e lascia che l'IA crei il viaggio perfetto per te.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {destinations.map((dest, index) => (
                    <div key={dest.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="md:col-span-2">
                             <label htmlFor={`destination-${dest.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destinazione {index + 1}</label>
                             <div className="relative">
                                <i className="fa-solid fa-map-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input id={`destination-${dest.id}`} type="text" value={dest.name} onChange={(e) => handleDestinationChange(index, 'name', e.target.value)} placeholder="es. Roma, Italia" className="w-full pl-10 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"/>
                             </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-grow">
                                <label htmlFor={`days-${dest.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giorni</label>
                                <div className="relative">
                                    <i className="fa-solid fa-calendar-day absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input id={`days-${dest.id}`} type="number" value={dest.days} onChange={(e) => handleDestinationChange(index, 'days', e.target.value)} min="1" max="14" placeholder="es. 3" className="w-full pl-10 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"/>
                                </div>
                            </div>
                            {destinations.length > 1 && (
                                <button type="button" onClick={() => removeDestination(dest.id)} className="mt-6 p-2 h-11 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition" title="Rimuovi destinazione">
                                    <i className="fa-solid fa-trash-can"></i>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                 <button type="button" onClick={addDestination} className="w-full text-indigo-600 dark:text-indigo-400 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                    <i className="fa-solid fa-plus"></i>Aggiungi Tappa
                </button>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data di Inizio</label>
                  <input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget di Viaggio</label>
                     <div className="grid grid-cols-3 gap-2">
                        {(['economico', 'medio', 'lusso'] as const).map((level) => {
                            const icons = { economico: 'fa-seedling', medio: 'fa-euro-sign', lusso: 'fa-gem' };
                            const labels = { economico: 'Eco', medio: 'Medio', lusso: 'Lusso' };
                            return (
                                <button type="button" key={level} onClick={() => setBudget(level)} className={`p-2 rounded-lg border-2 text-center transition-all duration-200 flex items-center justify-center gap-2 ${ budget === level ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-400' }`}>
                                    <i className={`fa-solid ${icons[level]} text-md ${budget === level ? 'text-indigo-500' : 'text-gray-500'}`}></i>
                                    <span className={`font-semibold text-sm ${budget === level ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{labels[level]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Intensità del Tour</label>
              <div className="grid grid-cols-3 gap-3">
                  {(['leggero', 'medio', 'intenso'] as const).map((level) => {
                      const icons = { leggero: 'fa-person-walking', medio: 'fa-person-running', intenso: 'fa-person-hiking' };
                      const labels = { leggero: 'Leggero', medio: 'Medio', intenso: 'Intenso' };
                      return (
                          <button type="button" key={level} onClick={() => setIntensity(level)} className={`p-3 rounded-lg border-2 text-center transition-all duration-200 flex flex-col items-center gap-2 ${ intensity === level ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-400' }`}>
                              <i className={`fa-solid ${icons[level]} text-xl ${intensity === level ? 'text-indigo-500' : 'text-gray-500'}`}></i>
                              <span className={`font-semibold text-sm ${intensity === level ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{labels[level]}</span>
                          </button>
                      );
                  })}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I Tuoi Interessi</label>
              <div className="flex flex-wrap gap-2">
                {ALL_INTERESTS.map(interest => (
                    <button type="button" key={interest} onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${ interests.includes(interest) ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-gray-800' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        {interest}
                    </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              {isLoading ? 'Generazione in corso...' : 'Crea il Mio Itinerario'}
            </button>
          </form>
        </section>

        <section className="mt-12 max-w-4xl mx-auto">
          {isLoading && <LoadingSpinner />}
          {error && <div className="text-center bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">{error}</div>}
          {!isLoading && !error && !itineraries && <Welcome />}
          {itineraries && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                  <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">Il Tuo Viaggio Personalizzato</h2>
                  <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
                    <button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                      <i className="fa-solid fa-file-arrow-down"></i>
                      {isDownloadingPdf ? 'Download...' : 'Scarica PDF'}
                    </button>
                    <button onClick={handleShare} disabled={isCopied} className="bg-sky-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                      <i className={`fa-solid ${isCopied ? 'fa-check' : 'fa-arrow-up-from-bracket'}`}></i>
                      {isCopied ? 'Copiato!' : 'Condividi'}
                    </button>
                  </div>
              </div>
              <div className="space-y-12" id="itinerary-content">
                {itineraries.map(({ destinationName, plan }, index) => (
                  <div key={`${destinationName}-${index}`}>
                    <h3 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-indigo-500 pb-2">
                      Itinerario per {destinationName}
                    </h3>
                    <div className="space-y-8">
                      {plan.map((dayPlan) => (
                        <ItineraryCard key={`${destinationName}-${index}-${dayPlan.day}`} dayPlan={dayPlan} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {packingList && <PackingListComponent packingList={packingList} />}

          {itineraries && !isLoading && firstDestination?.name && (
            <section className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Attività ed Esperienze Consigliate</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Prenota tour e biglietti per le attrazioni più famose e salta la fila!</p>
              </div>
              <iframe
                  key={`gyg-iframe-${firstDestination.name}`}
                  title={`Attività GetYourGuide per ${firstDestination.name.split(',')[0].trim()}`}
                  src={`https://widget.getyourguide.com/default/activities.frame?localeCode=it-IT&widget=activities&numberOfItems=3&partnerId=VHSL1EX&q=${encodeURIComponent(firstDestination.name.split(',')[0].trim())}`}
                  className="w-full h-[400px] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                  frameBorder="0"
              ></iframe>
            </section>
          )}

          {itineraries && !isLoading && firstDestination?.name && hotelCheckOutDate && (
            <HotelSearch 
              destination={firstDestination.name}
              checkIn={startDate}
              checkOut={hotelCheckOutDate}
            />
          )}

          {isLoadingExperiences && (
            <div className="text-center mt-8 flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400">Sto cercando esperienze uniche e consigli...</p>
            </div>
          )}

          {localExperiences && (
              <LocalExperiencesComponent experiences={localExperiences} />
          )}

        </section>
      </main>
      <Footer />
    </div>
  );
};

export default App;

import React, { useState } from 'react';

interface HotelSearchProps {
  destination: string;
  checkIn: string;
  checkOut: string;
}

const HotelSearch: React.FC<HotelSearchProps> = ({ destination, checkIn, checkOut }) => {
  const [adults, setAdults] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // URL di base per la ricerca. Usare la radice del sito (/) invece di /hotels
    // è più affidabile per avviare una nuova ricerca con parametri.
    const baseUrl = 'https://search.hotellook.com/';
    
    // Il marcatore di affiliazione per garantire il tracciamento.
    const marker = '466446.y4wNeIOw';
    
    // Estrae il nome della città dalla stringa di destinazione (es. "Roma, Italia" -> "Roma").
    const city = destination.split(',')[0].trim();

    // Costruisce l'URL finale con i parametri di ricerca corretti.
    const searchParams = new URLSearchParams({
      destination: city,
      checkIn: checkIn,
      checkOut: checkOut,
      adults: adults.toString(),
      marker: marker,
      language: 'it',
      currency: 'eur'
    });
    
    const finalUrl = `${baseUrl}?${searchParams.toString()}`;
    
    // Apre il link di affiliazione in una nuova scheda.
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
      } catch (e) {
          return dateString;
      }
  }

  return (
    <section className="mt-12">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
        <div className="text-4xl text-indigo-400 mb-4">
          <i className="fa-solid fa-bed"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hai bisogno di un Hotel a {destination.split(',')[0]}?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
            Abbiamo pre-impostato le date per la tua prima tappa. Modifica il numero di persone e trova l'alloggio perfetto!
        </p>
        <div className="flex justify-center items-center gap-4 mb-6 text-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-in</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-300">{formatDate(checkIn)}</p>
            </div>
            <i className="fa-solid fa-arrow-right text-gray-400"></i>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-out</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-300">{formatDate(checkOut)}</p>
            </div>
        </div>
        <form onSubmit={handleSearch} className="max-w-xs mx-auto space-y-4">
          <div>
            <label htmlFor="adults" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">Numero di Persone</label>
            <input
              id="adults"
              type="number"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value, 10))}
              min="1"
              max="10"
              required
              className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-search"></i>
            Cerca Hotel
          </button>
        </form>
      </div>
    </section>
  );
};

export default HotelSearch;

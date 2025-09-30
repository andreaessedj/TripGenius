import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Sto generando il tuo itinerario personalizzato...",
  "Consulto le guide locali per i migliori consigli...",
  "Preparo le valigie virtuali...",
  "Traccio il percorso sulla mappa...",
  "Cerco le gemme nascoste...",
  "Quasi pronto! Sto mettendo a punto i dettagli..."
];

const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(MESSAGES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = MESSAGES.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % MESSAGES.length;
        return MESSAGES[nextIndex];
      });
    }, 2500); // Cambia messaggio ogni 2.5 secondi

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 transition-opacity duration-500">{message}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Potrebbe volerci un momento.</p>
    </div>
  );
};

export default LoadingSpinner;

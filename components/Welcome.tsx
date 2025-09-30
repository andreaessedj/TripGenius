import React from 'react';

const Welcome: React.FC = () => {
  return (
    <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="text-6xl text-indigo-400 mb-4">
        <i className="fa-solid fa-suitcase-rolling"></i>
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Pronto per un'Avventura?</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Compila il modulo qui sopra per ottenere un piano di viaggio su misura. Lascia che la nostra AI sia il tuo pianificatore di viaggio personale e scopri le gemme nascoste della tua prossima vacanza.
      </p>
    </div>
  );
};

export default Welcome;
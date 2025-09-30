import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Sto generando il tuo itinerario personalizzato...</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Potrebbe volerci un momento.</p>
    </div>
  );
};

export default LoadingSpinner;
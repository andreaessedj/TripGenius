import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 py-6">
      <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} TripGenius. Tutti i diritti riservati.</p>
        <p className="text-sm mt-1">Realizzato con l'AI per l'esploratore moderno.</p>
      </div>
    </footer>
  );
};

export default Footer;
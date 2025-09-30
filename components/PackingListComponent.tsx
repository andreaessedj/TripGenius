import React from 'react';
import { PackingList, PackingItem } from '../types';

interface PackingListComponentProps {
  packingList: PackingList;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Abbigliamento': 'fa-shirt',
  'Documenti': 'fa-id-card',
  'Elettronica': 'fa-bolt',
  'Articoli da toeletta': 'fa-pump-soap',
  'Salute e Sicurezza': 'fa-kit-medical',
  'Extra': 'fa-box-open',
  'Varie': 'fa-box-open'
};

const PackingListComponent: React.FC<PackingListComponentProps> = ({ packingList }) => {
  if (!packingList || Object.keys(packingList).length === 0) return null;

  return (
    <section className="mt-12 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cosa Mettere in Valigia</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Una checklist personalizzata per non dimenticare nulla!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fix: Use Object.keys to iterate over the packingList.
            This helps TypeScript correctly infer the type of `packingList[category]` as `PackingItem[]`,
            resolving the "Property 'map' does not exist on type 'unknown'" error. */}
        {Object.keys(packingList).map((category) => (
          <div key={category} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-300 mb-4 flex items-center gap-3">
              <i className={`fa-solid ${CATEGORY_ICONS[category] || 'fa-suitcase'}`}></i>
              {category}
            </h3>
            <ul className="space-y-3">
              {packingList[category].map(({ item, notes }: PackingItem) => (
                <li key={item} className="flex items-start">
                  <i className="fa-regular fa-square-check text-green-500 mt-1 mr-3"></i>
                  <div>
                    <span className="text-gray-800 dark:text-gray-200">{item}</span>
                    {notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">({notes})</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PackingListComponent;

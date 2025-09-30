import React from 'react';
import { Activity } from '../types';

interface AttractionCardProps {
  activity: Activity;
}

const CategoryIcon: React.FC<{ category: Activity['category'] }> = ({ category }) => {
    const iconMapping = {
      'Attrazione Storica': 'fa-landmark',
      'Museo': 'fa-building-columns',
      'Parco': 'fa-tree',
      'Ristorante': 'fa-utensils',
      'Shopping': 'fa-bag-shopping',
      'Punto Panoramico': 'fa-camera-retro',
      'Altro': 'fa-location-dot'
    };
    const colorMapping = {
        'Attrazione Storica': 'text-amber-600',
        'Museo': 'text-purple-600',
        'Parco': 'text-green-600',
        'Ristorante': 'text-orange-600',
        'Shopping': 'text-pink-600',
        'Punto Panoramico': 'text-sky-600',
        'Altro': 'text-gray-600'
    };
    const iconClass = category ? iconMapping[category] : 'fa-location-dot';
    const colorClass = category ? colorMapping[category] : 'text-gray-600';

    return <i className={`fa-solid ${iconClass} ${colorClass}`} title={category}></i>;
};


const AttractionCard: React.FC<AttractionCardProps> = ({ activity }) => {
    return (
      <div className="relative mb-10 pl-10">
        {/* Timeline Dot */}
        <div className="absolute -left-[calc(0.75rem+1px)] top-0 w-6 h-6 bg-white dark:bg-gray-800 flex items-center justify-center rounded-full ring-4 ring-indigo-500">
            <CategoryIcon category={activity.category} />
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex-grow">{activity.name}</h4>

            {activity.startTime && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 my-2">
                  <div className="flex items-center gap-2" title="Orario di inizio previsto">
                      <i className="fa-regular fa-clock w-4 text-center"></i>
                      <span><strong>{activity.startTime}</strong></span>
                  </div>
                  {activity.estimatedVisitDuration && (
                      <div className="flex items-center gap-2" title="Durata stimata della visita">
                          <i className="fa-solid fa-hourglass-half w-4 text-center"></i>
                          <span>{activity.estimatedVisitDuration}</span>
                      </div>
                  )}
              </div>
            )}
  
            <p className="text-gray-600 dark:text-gray-400 flex-grow mb-4 min-h-[40px]">{activity.description}</p>
            
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex flex-wrap items-center justify-between gap-4">
              {activity.estimatedCost ? (
                  <div className="flex items-center gap-2 text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                      <i className="fa-solid fa-money-bill-wave"></i>
                      <span>{activity.estimatedCost}</span>
                  </div>
              ) : <div /> /* Placeholder for alignment */}
              {activity.ticketLink && (
                   <a
                      href={activity.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 flex items-center gap-2"
                  >
                      <i className="fa-solid fa-ticket"></i>
                      Compra Biglietti
                  </a>
              )}
            </div>
         </div>
      </div>
    );
  };
  
  export default AttractionCard;

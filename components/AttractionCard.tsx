import React from 'react';
import { Activity } from '../types';

interface AttractionCardProps {
  activity: Activity;
  onOptionsClick: () => void;
}

const AttractionCard: React.FC<AttractionCardProps> = ({ activity, onOptionsClick }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 relative">
            <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex-grow pr-8">{activity.name}</h4>
                <button 
                    onClick={onOptionsClick}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full h-8 w-8 flex items-center justify-center transition"
                    aria-label="Opzioni attività"
                    title="Modifica o rimuovi attività"
                >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>


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
  
            <p className="text-gray-600 dark:text-gray-400 flex-grow mb-3 min-h-[40px]">{activity.description}</p>

            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2 mb-4">
                <i className="fa-solid fa-location-dot mt-1"></i>
                <span>{activity.address}</span>
            </div>
            
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
    );
  };
  
  export default AttractionCard;
import React from 'react';
import { Activity } from '../types';

interface AttractionCardProps {
  activity: Activity;
}

const TimeOfDayIcon: React.FC<{ timeOfDay: Activity['timeOfDay'] }> = ({ timeOfDay }) => {
  switch (timeOfDay) {
    case 'Mattina':
      return <i className="fa-solid fa-sun text-yellow-500" title="Mattina"></i>;
    case 'Pomeriggio':
      return <i className="fa-solid fa-cloud-sun text-orange-500" title="Pomeriggio"></i>;
    case 'Sera':
      return <i className="fa-solid fa-moon text-indigo-400" title="Sera"></i>;
    default:
      return null;
  }
};


const AttractionCard: React.FC<AttractionCardProps> = ({ activity }) => {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                  <TimeOfDayIcon timeOfDay={activity.timeOfDay} />
              </div>
              <h4 className="font-bold text-xl text-gray-800 dark:text-gray-100 flex-grow">{activity.name}</h4>
            </div>

            {activity.startTime && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-3 ml-11">
                  <div className="flex items-center gap-2" title="Orario di inizio previsto">
                      <i className="fa-solid fa-clock w-4 text-center"></i>
                      <span>Inizio: <strong>{activity.startTime}</strong></span>
                  </div>
                  {activity.estimatedVisitDuration && (
                      <div className="flex items-center gap-2" title="Durata stimata della visita">
                          <i className="fa-solid fa-hourglass-half w-4 text-center"></i>
                          <span>Durata: <strong>{activity.estimatedVisitDuration}</strong></span>
                      </div>
                  )}
              </div>
            )}
  
            <p className="text-gray-600 dark:text-gray-400 flex-grow mb-4 min-h-[40px] pl-11">{activity.description}</p>
            
            <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
              {activity.estimatedCost ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <i className="fa-solid fa-euro-sign text-green-500"></i>
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
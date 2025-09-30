import React, { useMemo, useState } from 'react';
import { DayPlan } from '../types';
import AttractionCard from './AttractionCard';
import WalkingMap from './WalkingMap';

interface ItineraryCardProps {
  dayPlan: DayPlan;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ dayPlan }) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  const hasMapData = useMemo(() => {
    return dayPlan.activities.filter(a => typeof a.latitude === 'number' && typeof a.longitude === 'number').length > 1;
  }, [dayPlan.activities]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 bg-indigo-500 text-white w-20 h-20 rounded-xl flex flex-col items-center justify-center shadow-md">
            <span className="text-sm font-semibold tracking-wider">GIORNO</span>
            <span className="text-4xl font-bold">{dayPlan.day}</span>
        </div>
        <div className="flex-grow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dayPlan.title}</h3>
            {dayPlan.weatherAdvice && (
                <div className="mt-2 flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                    <i className="fa-solid fa-cloud-sun-rain"></i>
                    <p>{dayPlan.weatherAdvice}</p>
                </div>
            )}
        </div>
      </div>
      <div className="p-6">
        <div className="relative border-l-2 border-indigo-200 dark:border-indigo-700 ml-4 sm:ml-6">
            {dayPlan.activities.map((activity, index) => (
              <AttractionCard key={index} activity={activity} />
            ))}
        </div>
        
        {hasMapData && (
          <div className="mt-6 text-center">
             <button
              onClick={() => setIsMapVisible(!isMapVisible)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 mx-auto"
            >
              <i className={`fa-solid ${isMapVisible ? 'fa-map-location-dot' : 'fa-map'}`}></i>
              {isMapVisible ? 'Nascondi Mappa' : 'Mostra Mappa Itinerario'}
            </button>
          </div>
        )}

        {isMapVisible && hasMapData && (
          <div className="mt-4 animate-fade-in">
            <WalkingMap activities={dayPlan.activities} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryCard;

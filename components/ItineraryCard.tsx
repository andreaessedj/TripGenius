import React, { useMemo, useState } from 'react';
import { DayPlan } from '../types';
import AttractionCard from './AttractionCard';
import WalkingMap from './WalkingMap';

interface ItineraryCardProps {
  dayPlan: DayPlan;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ dayPlan }) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  // Memoize the check for locations to avoid recalculating on every render
  const hasMapData = useMemo(() => {
    return dayPlan.activities.filter(a => typeof a.latitude === 'number' && typeof a.longitude === 'number').length > 1;
  }, [dayPlan.activities]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-2xl">
      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-4">
        <div className="flex-shrink-0 bg-indigo-500 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md">
            <span className="text-xs font-semibold tracking-wider">GIORNO</span>
            <span className="text-3xl font-bold">{dayPlan.day}</span>
        </div>
        <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dayPlan.title}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
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
          <WalkingMap activities={dayPlan.activities} />
        )}
      </div>
    </div>
  );
};

export default ItineraryCard;
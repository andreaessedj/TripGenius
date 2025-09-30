import React, { useMemo, useState } from 'react';
import { DayPlan, Activity } from '../types';
import AttractionCard from './AttractionCard';
import WalkingMap from './WalkingMap';

interface ItineraryCardProps {
  dayPlan: DayPlan;
  onActivityOptionsClick: (activity: Activity) => void;
}

const CategoryIcon: React.FC<{ category: Activity['category'] }> = ({ category }) => {
    const iconMapping = {
      'Attrazione Storica': 'fa-landmark', 'Museo': 'fa-building-columns',
      'Parco': 'fa-tree', 'Ristorante': 'fa-utensils', 'Shopping': 'fa-bag-shopping',
      'Punto Panoramico': 'fa-camera-retro', 'Altro': 'fa-location-dot'
    };
    const colorMapping = {
        'Attrazione Storica': 'text-amber-600', 'Museo': 'text-purple-600', 'Parco': 'text-green-600',
        'Ristorante': 'text-orange-600', 'Shopping': 'text-pink-600', 'Punto Panoramico': 'text-sky-600',
        'Altro': 'text-gray-600'
    };
    const iconClass = category ? iconMapping[category] : 'fa-location-dot';
    const colorClass = category ? colorMapping[category] : 'text-gray-600';
    return <i className={`fa-solid ${iconClass} ${colorClass}`} title={category}></i>;
};

const ItineraryCard: React.FC<ItineraryCardProps> = ({ dayPlan, onActivityOptionsClick }) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  const activeActivities = useMemo(() => dayPlan.activities.filter(a => a.status === 'active'), [dayPlan.activities]);
  
  const hasMapData = useMemo(() => {
    return activeActivities.filter(a => typeof a.latitude === 'number' && typeof a.longitude === 'number').length > 1;
  }, [activeActivities]);

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
            {activeActivities.map((activity, index) => (
              <div key={activity.id} className="relative mb-8 pl-10">
                {/* Timeline Dot */}
                <div className="absolute -left-[calc(0.75rem+1px)] top-0 w-6 h-6 bg-white dark:bg-gray-800 flex items-center justify-center rounded-full ring-4 ring-indigo-500">
                    <CategoryIcon category={activity.category} />
                </div>
                
                {/* Travel Info on Timeline */}
                {index < activeActivities.length - 1 && activity.travelToNext && (
                    <div className="absolute top-8 -left-[22px] w-12 h-24 flex justify-center" aria-hidden="true">
                       <div className="text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-1 rounded-md shadow">
                           <i className="fa-solid fa-person-walking"></i>
                           <div className="font-semibold">{activity.travelToNext.duration}</div>
                           <div className="text-[10px]">({activity.travelToNext.distance})</div>
                       </div>
                    </div>
                )}

                <AttractionCard 
                  activity={activity} 
                  onOptionsClick={() => onActivityOptionsClick(activity)}
                />
              </div>
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
            <WalkingMap activities={activeActivities} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryCard;
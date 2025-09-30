import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Activity } from '../types';

// Declare Leaflet's global variable `L` to satisfy TypeScript
declare const L: any;

interface WalkingMapProps {
  activities: Activity[];
}

// Optimization: Define icon creation function and instances outside the component.
// This prevents them from being recreated on every re-render, improving performance.
const createIcon = (color: 'green' | 'red' | 'blue') => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const startIcon = createIcon('green');
const endIcon = createIcon('red');
const viaIcon = createIcon('blue');


const WalkingMap: React.FC<WalkingMapProps> = ({ activities }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // To hold the map instance
  const controlRef = useRef<any>(null); // To hold the routing control instance

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Memoize locations with valid coordinates from ACTIVE activities
  const locations = useMemo(() => 
    activities.filter(a => a.status === 'active' && typeof a.latitude === 'number' && typeof a.longitude === 'number'),
    [activities]
  );
  
  // Memoize the unique categories available from the locations
  const availableCategories = useMemo(() => 
    [...new Set(locations.map(loc => loc.category).filter(Boolean))] as string[],
    [locations]
  );

  // Memoize filtered locations based on selected categories
  const filteredLocations = useMemo(() => {
    if (selectedCategories.length === 0) {
      return locations; // Show all if no filter is active
    }
    return locations.filter(loc => loc.category && selectedCategories.includes(loc.category));
  }, [locations, selectedCategories]);

  // Use a ref to provide the share control with up-to-date location data, avoiding stale closures.
  const filteredLocationsRef = useRef(filteredLocations);
  useEffect(() => {
    filteredLocationsRef.current = filteredLocations;
  }, [filteredLocations]);


  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Effect to initialize the map and its static controls (runs only once)
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add Print control
      if (L.easyPrint) {
        L.easyPrint({ title: 'Stampa Mappa', position: 'topleft' }).addTo(map);
      }

      // Add Share control
      const ShareControl = L.Control.extend({
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          const btn = L.DomUtil.create('a', 'leaflet-bar-part', container);
          btn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
          btn.href = '#';
          btn.title = 'Condividi Percorso su Google Maps';
          L.DomEvent.on(btn, 'click', L.DomEvent.stop).on(btn, 'click', () => {
              // Correctly use the ref to get the currently displayed (filtered) locations.
              const waypointsToShare = filteredLocationsRef.current;

              if (waypointsToShare.length < 2) {
                  // Don't generate a link if there aren't enough points for a route.
                  return;
              }
              
              const origin = `${waypointsToShare[0].latitude},${waypointsToShare[0].longitude}`;
              const destination = `${waypointsToShare[waypointsToShare.length - 1].latitude},${waypointsToShare[waypointsToShare.length - 1].longitude}`;
              const intermediate = waypointsToShare.slice(1, -1).map(loc => `${loc.latitude},${loc.longitude}`).join('|');
              let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=${origin}&destination=${destination}`;
              if (intermediate) googleMapsUrl += `&waypoints=${intermediate}`;
              window.open(googleMapsUrl, '_blank');
          });
          return container;
        }
      });
      new ShareControl({ position: 'topleft' }).addTo(map);
    }
    
    // Cleanup function to remove map on component unmount
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to update the route when filtered locations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    // Always clear the previous routing control to ensure the map updates correctly.
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }
    
    // Only draw a route if there are at least two points.
    if (filteredLocations.length > 1) {
      const waypoints = filteredLocations.map(loc => L.latLng(loc.latitude!, loc.longitude!));
      
      const routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: (i: number, waypoint: any, n: number) => {
            const loc = filteredLocations[i];
            const icon = i === 0 ? startIcon : (i === n - 1 ? endIcon : viaIcon);
            return L.marker(waypoint.latLng, { icon }).bindPopup(`<b>${loc.name}</b>`);
        },
        router: L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1`, profile: 'foot' }),
      }).addTo(map);

      controlRef.current = routingControl;
    }

  }, [filteredLocations]); // This effect re-runs whenever the filter selection changes.


  if (locations.length < 2) {
    return null; // Don't render the map component if not enough valid locations exist for a route
  }

  return (
    <div className="mt-4">
        {availableCategories.length > 0 && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">Filtra Punti di Interesse:</h4>
                <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => (
                        <button 
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition ${
                                selectedCategories.includes(category)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                    {selectedCategories.length > 0 && (
                        <button
                            onClick={() => setSelectedCategories([])}
                            className="px-3 py-1 text-sm font-medium rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                        >
                            <i className="fa-solid fa-times mr-1"></i>
                            Reset
                        </button>
                    )}
                </div>
            </div>
        )}
        <div ref={mapContainerRef} style={{ height: '400px', width: '100%', borderRadius: '8px' }} />
    </div>
  );
};

export default WalkingMap;
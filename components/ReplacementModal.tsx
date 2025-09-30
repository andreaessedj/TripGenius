import React from 'react';
import { Activity } from '../types';

interface ReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToReplace: Activity;
  alternatives: Activity[];
  isLoading: boolean;
  onConfirmRemove: (activityId: string) => void;
  onConfirmReplace: (originalActivityId: string, newActivity: Activity) => void;
}

const ReplacementModal: React.FC<ReplacementModalProps> = ({
  isOpen, onClose, activityToReplace, alternatives, isLoading, onConfirmRemove, onConfirmReplace
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Modifica Tappa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Stai modificando:</p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{activityToReplace.name}</p>
          </div>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Suggerimenti Alternativi:</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-3 text-gray-600 dark:text-gray-400">Cerco alternative...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alternatives.map(alt => (
                <div key={alt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex justify-between items-center gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{alt.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{alt.description}</p>
                  </div>
                  <button
                    onClick={() => onConfirmReplace(activityToReplace.id, alt)}
                    className="bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-indigo-700 transition text-sm flex-shrink-0"
                  >
                    Sostituisci
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button 
                onClick={() => onConfirmRemove(activityToReplace.id)}
                className="w-full sm:w-auto text-red-600 dark:text-red-400 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-trash-can"></i>
                Rimuovi questa tappa
            </button>
            <button 
                onClick={onClose}
                className="w-full sm:w-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
                Annulla
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ReplacementModal;
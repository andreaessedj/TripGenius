import React from 'react';
import { LocalExperience } from '../types';

interface LocalExperiencesProps {
  experiences: LocalExperience[];
}

const CategoryIcon: React.FC<{ category: LocalExperience['category'] }> = ({ category }) => {
  switch (category) {
    case 'Cibo':
      return <i className="fa-solid fa-utensils text-orange-500" title="Cibo"></i>;
    case 'Arte & Cultura':
      return <i className="fa-solid fa-palette text-purple-500" title="Arte & Cultura"></i>;
    case 'Avventura':
      return <i className="fa-solid fa-person-hiking text-green-500" title="Avventura"></i>;
    case 'Shopping':
        return <i className="fa-solid fa-bag-shopping text-pink-500" title="Shopping"></i>;
    case 'Benessere':
        return <i className="fa-solid fa-spa text-teal-500" title="Benessere"></i>;
    default:
      return <i className="fa-solid fa-star text-yellow-500"></i>;
  }
};

const LocalExperiencesComponent: React.FC<LocalExperiencesProps> = ({ experiences }) => {
  if (!experiences || experiences.length === 0) return null;
    
  return (
    <section className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Esperienze Locali Uniche</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Immergiti nella cultura locale con questi suggerimenti speciali.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {experiences.map((exp, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4 transition-transform transform hover:scale-105">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-gray-700 text-2xl">
                 <CategoryIcon category={exp.category} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{exp.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocalExperiencesComponent;

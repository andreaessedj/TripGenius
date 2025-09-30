import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-cover bg-center h-64 md:h-80 relative" style={{ backgroundImage: "url('https://picsum.photos/1600/600?random=1&grayscale&blur=2')" }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
        <div className="flex items-center gap-4">
          <i className="fa-solid fa-earth-americas text-5xl md:text-6xl text-indigo-300"></i>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">TripGenius</h1>
        </div>
        <p className="mt-4 text-lg md:text-xl max-w-2xl text-gray-200">
            Il tuo genio dei viaggi personali.
        </p>
      </div>
    </header>
  );
};

export default Header;
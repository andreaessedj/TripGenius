import React from 'react';

interface HeaderProps {
  imageUrl: string | null;
}

const Header: React.FC<HeaderProps> = ({ imageUrl }) => {
  const headerStyle: React.CSSProperties = {
    backgroundImage: `url('${imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1635&q=80'}')`,
    transition: 'background-image 1s ease-in-out',
  };

  return (
    <header className="bg-cover bg-center h-64 md:h-80 relative" style={headerStyle}>
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

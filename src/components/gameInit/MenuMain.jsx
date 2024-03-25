const MenuMain = ({ handleCurrentView }) => {
  const handleSinglePlayerClick = () => {
    handleCurrentView('dillemaBox');
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <input type="text" placeholder="Enter Your Name" className="mb-5" />
      <div className="flex">
        <button 
          className="bg-gray-800 text-white font-bold mx-4 py-3 px-6 rounded 
          border border-transparent hover:border-blue-500 transition duration-300" 
          onClick={handleSinglePlayerClick}>Single Player</button>
        <button className="bg-gray-800 text-white font-bold mx-4 py-3 px-6 rounded">
          Multiplayer</button>
      </div>
    </div>
  );
};

export default MenuMain;
// TODO: convert this to a peoper boilerplate component with prop types
const MenuMain = () => {
  return (
    <div className="flex items-center justify-center h-screen">
        <button className="font-mono bg-gray-900 text-white font-bold mx-4 py-3 px-6 border-4 border-purple-500  border border-transparent hover:border-blue-500 transition duration-300"
          >Single Player</button>
        <button className="font-mono bg-gray-900 text-white font-bold mx-4 py-3 px-6 border-4 border-purple-500">
          Multiplayer</button>
    </div>
  );
};

export default MenuMain;
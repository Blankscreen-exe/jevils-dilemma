import { Link } from "react-router-dom";

const MenuMain = () => {

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <input type="text" placeholder="Enter Your Name" className="mb-5" />
      <div className="flex">
        <Link to="/dilemma-box"
          className="bg-gray-800 text-white font-bold mx-4 py-3 px-6 rounded 
          border border-transparent hover:border-blue-500 transition duration-300" 
          >Single Player</Link>
        <button className="bg-gray-800 text-white font-bold mx-4 py-3 px-6 rounded">
          Multiplayer</button>
      </div>
    </div>
  );
};

export default MenuMain;
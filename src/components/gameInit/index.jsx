import MenuMain from "./MenuMain.jsx"

const GameInit = ({ handleCurrentView }) => {
  return (
    <div className="gameInit">
      <MenuMain handleCurrentView={handleCurrentView} />
    </div>
  );
};

export default GameInit;
import React from "react";
import "./index.css";

function Home() {
  const handleGameOptionsRedirect = () => {
    window.location.href = "/select";
  };

  return (
    <div className="game-container">
      <section className="welcome-banner">
        <h1 className="game-title">Welcome to the game!</h1>
      </section>
      <section className="game-description">
        <h2 className="description-title">About Game</h2>
        <p className="game-info">
          {/* TODO: change the text */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          ultrices lacus eget ultricies molestie. Vivamus finibus nulla nec ante
          rutrum, vitae commodo felis volutpat. Pellentesque habitant morbi
          tristique senectus et netus et malesuada fames ac turpis egestas.
          Aliquam erat volutpat. Nam scelerisque mauris et elementum semper.
          Proin orci nulla, bibendum vel facilisis aliquam, sagittis et odio.
          Suspendisse malesuada quis nisl et bibendum.
        </p>
      </section>
      <section className="start-game">
        <button onClick={handleGameOptionsRedirect} className="start-button">
          Start Game
        </button>
      </section>
    </div>
  );
}

export default Home;
